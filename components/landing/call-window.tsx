import {
  Check,
  ExternalLink,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

/** A speaking-activity mini waveform for a participant chip. */
function ChipWave() {
  return (
    <span className="inline-flex h-3 items-center gap-[2px]" aria-hidden="true">
      {[0.4, 0.9, 0.6, 1, 0.5].map((h, i) => (
        <span
          key={i}
          className="wave-bar w-[2px] rounded-full bg-signal"
          style={{ height: `${h * 100}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function Tile({
  initials,
  name,
  role,
  speaking = false,
  muted = false,
  tint,
}: {
  initials: string;
  name: string;
  role: string;
  speaking?: boolean;
  muted?: boolean;
  tint: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-xl border border-white/5",
        speaking && "ring-2 ring-signal/70"
      )}
      style={{ background: tint }}
    >
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_30%,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
      <span className="absolute inset-0 grid place-items-center font-serif text-6xl italic text-white/25">
        {initials}
      </span>
      <span className="absolute left-2.5 bottom-2.5 inline-flex items-center gap-2 rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/80 backdrop-blur">
        {name}
        <span className="text-white/40">·</span>
        <span className={speaking ? "text-signal" : "text-white/50"}>{role}</span>
        {speaking && <ChipWave />}
      </span>
      <span className="absolute right-2.5 top-2.5 rounded-md bg-black/50 p-1.5 text-white/70 backdrop-blur">
        {muted ? <MicOff className="size-3" /> : <Mic className="size-3" />}
      </span>
    </div>
  );
}

function SuggestionCard({
  fresh = false,
  q,
  source,
  sourceIsQuote = false,
}: {
  fresh?: boolean;
  q: string;
  source: string;
  sourceIsQuote?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        fresh
          ? "border-signal/40 bg-signal-soft"
          : "border-border/60 opacity-55"
      )}
    >
      <p className="font-serif text-[13.5px] italic leading-snug">{q}</p>
      <p
        className={cn(
          "mt-1.5 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em]",
          sourceIsQuote ? "text-muted-foreground" : "text-signal"
        )}
      >
        {!sourceIsQuote && <ExternalLink className="size-2.5" />}
        {source}
      </p>
      <div className="mt-2 flex gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]",
            fresh
              ? "bg-primary text-primary-foreground"
              : "text-ok"
          )}
        >
          <Check className="size-2.5" /> Asked
        </span>
        {fresh && (
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            <X className="size-2.5" /> Dismiss
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The hero product mockup — a live session, rendered as real UI.
 * Everything is decorative markup (aria-hidden interactive bits).
 */
export function CallWindow() {
  return (
    <div className="studio relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-black/30 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
          thesecondquestion.app/session/jane-doe
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-live">
          <span className="size-1.5 animate-pulse rounded-full bg-live" />
          Rec 00:14:32
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_240px]">
        {/* Call area */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Tile
              initials="OA"
              name="Oliver"
              role="Host"
              muted
              tint="radial-gradient(120% 120% at 30% 20%, #2E2620 0%, #191410 70%)"
            />
            <Tile
              initials="JD"
              name="Jane Doe"
              role="Guest"
              speaking
              tint="radial-gradient(120% 120% at 70% 20%, #3A2A18 0%, #1C150E 70%)"
            />
          </div>

          {/* Live transcript line */}
          <p className="mt-3 rounded-lg border border-white/5 bg-black/25 px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-foreground/90">
            <span className="mr-2 text-[9px] font-medium uppercase tracking-[0.14em] text-signal">
              Guest
            </span>
            …honestly, the second year nearly broke us — we hired too fast and
            the process just didn&rsquo;t exist yet.
            <span className="ml-1 inline-block h-3 w-[6px] animate-pulse bg-signal/70 align-middle" />
          </p>

          {/* Controls */}
          <div
            className="mt-4 flex items-center justify-center gap-2"
            aria-hidden="true"
          >
            {[Mic, Video, MonitorUp].map((Icon, i) => (
              <span
                key={i}
                className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground/80"
              >
                <Icon className="size-4" />
              </span>
            ))}
            <span className="grid size-9 place-items-center rounded-full bg-live text-white">
              <PhoneOff className="size-4" />
            </span>
          </div>
        </div>

        {/* Follow-ups rail */}
        <aside className="hidden border-l border-white/5 bg-black/20 p-3.5 md:block">
          <p className="mb-3 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Follow-ups <span className="text-signal">· only you see these</span>
          </p>
          <div className="space-y-2.5">
            <SuggestionCard
              fresh
              q="Your essay said remote-first breaks past fifty — is that the line where hiring outran process?"
              source={'Personal blog — "Remote past fifty"'}
            />
            <SuggestionCard
              q="What did the first bad hire teach you about your own interviewing?"
              source="From what they just said"
              sourceIsQuote
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
