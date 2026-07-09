"use client";

import { useCallback, useRef, useState } from "react";
import { DeepgramClient } from "@deepgram/sdk";
import { Loader2, Mic, MonitorSpeaker, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Speaker, TranscriptionTokenResponse } from "@/types";

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
  const [status, setStatus] = useState<Status>("idle");
  const [source, setSource] = useState<CaptureSource>("tab");
  const [lines, setLines] = useState<Line[]>([]);
  const [interim, setInterim] = useState("");

  const socketRef = useRef<ListenSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
          </>
        )}

        {status === "ended" && (
          <span className="text-sm text-muted-foreground">Session stopped.</span>
        )}
      </div>

      {source === "tab" && status === "idle" && (
        <p className="text-xs text-muted-foreground">
          You&apos;ll be asked to pick the call tab — be sure to enable{" "}
          <strong>Share tab audio</strong> so both sides are captured.
        </p>
      )}

      <div className="min-h-[200px] rounded-lg border bg-muted/30 p-4">
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
    </div>
  );
}
