"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DeepgramClient } from "@deepgram/sdk";
import {
  Check,
  ExternalLink,
  FileText,
  Loader2,
  Mic,
  MonitorSpeaker,
  Square,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  RecentSegment,
  Speaker,
  SuggestResponse,
  SuggestionWithSource,
  TranscriptionTokenResponse,
} from "@/types";

// Throttle live suggestion calls so we don't fire on every guest utterance.
const SUGGEST_COOLDOWN_MS = 12_000;
const MIN_WORDS_FOR_SUGGEST = 6;

type CaptureSource = "tab" | "mic";
type Status = "idle" | "connecting" | "live" | "ended";

// The live socket type, derived from the client so we avoid deep subpath imports.
type ListenSocket = Awaited<ReturnType<DeepgramClient["listen"]["v1"]["connect"]>>;

interface Line {
  id: string;
  speaker: Speaker | null;
  text: string;
}

function pickMimeType(): string | undefined {
  const candidates = ["audio/webm;codecs=opus", "audio/webm"];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

/** Dominant Deepgram speaker index across a result's words, or null. */
function dominantSpeaker(words: { speaker?: number }[]): number | null {
  const counts = new Map<number, number>();
  for (const w of words) {
    if (typeof w.speaker === "number") {
      counts.set(w.speaker, (counts.get(w.speaker) ?? 0) + 1);
    }
  }
  let best: number | null = null;
  let bestCount = 0;
  for (const [spk, c] of counts) {
    if (c > bestCount) {
      best = spk;
      bestCount = c;
    }
  }
  return best;
}

export function LiveTranscript({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [ending, setEnding] = useState(false);
  const [source, setSource] = useState<CaptureSource>("tab");
  const [lines, setLines] = useState<Line[]>([]);
  const [interim, setInterim] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionWithSource[]>([]);

  const socketRef = useRef<ListenSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Rolling transcript context + throttle bookkeeping for the follow-up engine.
  const recentRef = useRef<RecentSegment[]>([]);
  const lastSuggestRef = useRef<number>(0);
  // TODO(oliver): host/guest mapping assumes the first diarized speaker is the
  // host. Let the host confirm/swap this in-session once we have real calls.
  const firstSpeakerRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
    recorderRef.current = null;
    socketRef.current?.close();
    socketRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const labelFor = useCallback(
    (words: { speaker?: number }[]): Speaker | null => {
      if (source === "mic") return "host"; // mic captures only the host
      const spk = dominantSpeaker(words);
      if (spk === null) return null;
      firstSpeakerRef.current ??= spk;
      return spk === firstSpeakerRef.current ? "host" : "guest";
    },
    [source]
  );

  const persist = useCallback(
    (speaker: Speaker | null, text: string, tsStart: number, tsEnd: number) => {
      // Fire-and-forget — never block live rendering on the write.
      void fetch(`/api/session/${sessionId}/segment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speaker, text, tsStart, tsEnd }),
      }).catch(() => {});
    },
    [sessionId]
  );

  const requestSuggestions = useCallback(async () => {
    lastSuggestRef.current = Date.now();
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          recentSegments: recentRef.current.slice(-8),
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as SuggestResponse;
      if (data.suggestions?.length) {
        // Newest suggestions on top.
        setSuggestions((prev) => [...data.suggestions, ...prev]);
      }
    } catch {
      // Swallow — a missed suggestion should never disrupt the live session.
    }
  }, [sessionId]);

  const updateSuggestion = useCallback(
    async (id: string, status: "asked" | "dismissed") => {
      // Optimistic: reflect immediately, reconcile on failure.
      setSuggestions((prev) =>
        status === "dismissed"
          ? prev.filter((s) => s.id !== id)
          : prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
      try {
        await fetch(`/api/suggestion/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
      } catch {
        toast.error("Could not save — check your connection.");
      }
    },
    []
  );

  async function getStream(): Promise<MediaStream> {
    if (source === "mic") {
      return navigator.mediaDevices.getUserMedia({ audio: true });
    }
    // Tab/meeting audio: the browser requires a video request to expose tab
    // audio. We keep only the audio track and drop the video.
    const display = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    const audioTracks = display.getAudioTracks();
    if (audioTracks.length === 0) {
      display.getTracks().forEach((t) => t.stop());
      throw new Error(
        'No tab audio. Re-share and tick "Share tab audio" in the picker.'
      );
    }
    display.getVideoTracks().forEach((t) => t.stop());
    return new MediaStream(audioTracks);
  }

  async function start() {
    setStatus("connecting");
    firstSpeakerRef.current = null;
    recentRef.current = [];
    lastSuggestRef.current = 0;
    try {
      const tokenRes = await fetch("/api/transcription-token", {
        method: "POST",
      });
      const token = (await tokenRes.json()) as
        | TranscriptionTokenResponse
        | { error: string };
      if (!tokenRes.ok || "error" in token) {
        throw new Error(
          "error" in token ? token.error : "Could not get a transcription token."
        );
      }

      const stream = await getStream();
      streamRef.current = stream;

      const deepgram = new DeepgramClient({ accessToken: token.accessToken });
      const socket = await deepgram.listen.v1.connect({
        model: "nova-3",
        smart_format: "true",
        diarize: "true",
        interim_results: "true",
        utterance_end_ms: 1000,
        Authorization: `Bearer ${token.accessToken}`,
      });
      socketRef.current = socket;

      socket.on("open", () => {
        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        );
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && socketRef.current) {
            socketRef.current.sendMedia(e.data);
          }
        };
        recorder.start(250);
        recorderRef.current = recorder;
        setStatus("live");

        // If the host stops sharing from the browser's own UI, end cleanly.
        stream.getAudioTracks()[0]?.addEventListener("ended", () => stop());
      });

      socket.on("message", (msg) => {
        if (msg.type !== "Results") return;
        const alt = msg.channel.alternatives[0];
        const text = alt?.transcript?.trim();
        if (!text) return;

        if (msg.is_final) {
          const speaker = labelFor(alt.words ?? []);
          setLines((prev) => [
            ...prev,
            { id: crypto.randomUUID(), speaker, text },
          ]);
          setInterim("");
          persist(speaker, text, msg.start, msg.start + msg.duration);

          recentRef.current = [...recentRef.current, { speaker, text }].slice(-8);

          // On a substantial guest moment (throttled), ask for follow-ups.
          const enoughWords = text.split(/\s+/).length >= MIN_WORDS_FOR_SUGGEST;
          const cooled =
            Date.now() - lastSuggestRef.current > SUGGEST_COOLDOWN_MS;
          if (speaker === "guest" && enoughWords && cooled) {
            void requestSuggestions();
          }
        } else {
          setInterim(text);
        }
      });

      socket.on("error", () => {
        toast.error("Transcription connection error.");
      });
      socket.on("close", () => {
        if (status !== "ended") setStatus("ended");
      });
    } catch (err) {
      cleanup();
      setStatus("idle");
      toast.error(
        err instanceof Error ? err.message : "Could not start the session."
      );
    }
  }

  function stop() {
    cleanup();
    setInterim("");
    setStatus("ended");
  }

  async function endAndRecap() {
    setEnding(true);
    cleanup();
    setInterim("");
    setStatus("ended");
    try {
      await fetch(`/api/session/${sessionId}/end`, { method: "POST" });
    } catch {
      toast.error("Could not draft the recap — the session was still ended.");
    }
    // Server re-renders the page as the ended recap view.
    router.refresh();
  }

  const isLive = status === "live";
  const isConnecting = status === "connecting";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {status === "idle" && (
          <>
            <div className="inline-flex rounded-md border p-0.5">
              <button
                type="button"
                onClick={() => setSource("tab")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm",
                  source === "tab"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <MonitorSpeaker className="size-4" />
                Meeting tab
              </button>
              <button
                type="button"
                onClick={() => setSource("mic")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm",
                  source === "mic"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Mic className="size-4" />
                Microphone
              </button>
            </div>
            <Button onClick={start}>Start session</Button>
          </>
        )}

        {(isLive || isConnecting) && (
          <>
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              {isConnecting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="size-2 animate-pulse rounded-full bg-red-500" />
              )}
              {isConnecting ? "Connecting…" : "Live"}
            </span>
            <Button variant="outline" onClick={stop} disabled={isConnecting}>
              <Square className="size-4" />
              Stop
            </Button>
            <Button onClick={endAndRecap} disabled={isConnecting || ending}>
              {ending ? <Loader2 className="animate-spin" /> : <FileText />}
              End &amp; recap
            </Button>
          </>
        )}

        {status === "ended" && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {ending ? "Drafting recap…" : "Session stopped."}
            </span>
            {!ending && (
              <Button onClick={endAndRecap}>
                <FileText />
                End &amp; recap
              </Button>
            )}
          </div>
        )}
      </div>

      {source === "tab" && status === "idle" && (
        <p className="text-xs text-muted-foreground">
          You&apos;ll be asked to pick the call tab — be sure to enable{" "}
          <strong>Share tab audio</strong> so both sides are captured.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_20rem]">
        {/* Transcript */}
        <div className="min-h-[240px] rounded-lg border bg-muted/30 p-4">
          {lines.length === 0 && !interim ? (
            <p className="text-sm text-muted-foreground">
              The live transcript will appear here.
            </p>
          ) : (
            <div className="space-y-2 text-sm leading-relaxed">
              {lines.map((line) => (
                <p key={line.id}>
                  <span
                    className={cn(
                      "mr-2 text-xs font-semibold uppercase tracking-wide",
                      line.speaker === "guest"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {line.speaker ?? "…"}
                  </span>
                  {line.text}
                </p>
              ))}
              {interim && <p className="text-muted-foreground">{interim}</p>}
            </div>
          )}
        </div>

        {/* Follow-up suggestions (host-only side panel) */}
        <aside className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight">Follow-ups</h2>
          {suggestions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Grounded follow-ups appear here as the guest speaks.
            </p>
          ) : (
            <ul className="space-y-2">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className={cn(
                    "rounded-lg border p-3 text-sm",
                    s.status === "asked" && "opacity-60"
                  )}
                >
                  <p className="font-medium">{s.question}</p>
                  {s.rationale && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.rationale}
                    </p>
                  )}
                  {s.source ? (
                    <a
                      href={s.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      {s.source.title ?? s.source.url}
                    </a>
                  ) : (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Based on what the guest just said
                    </span>
                  )}
                  {s.status === "asked" ? (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600">
                      <Check className="size-3" />
                      Asked
                    </p>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateSuggestion(s.id, "asked")}
                      >
                        <Check className="size-3" />
                        Asked
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateSuggestion(s.id, "dismissed")}
                      >
                        <X className="size-3" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
