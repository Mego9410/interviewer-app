import { Check, ExternalLink, X } from "lucide-react";

/** "Record" mockup — transcript streaming with follow-ups stacking in. */
export function FollowupFlow() {
  return (
    <div className="studio relative overflow-hidden rounded-2xl border border-white/10 p-5 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]">
      {/* transcript stream */}
      <div className="space-y-2 font-mono text-[11.5px] leading-relaxed text-foreground/80">
        <p>
          <span className="mr-2 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Host
          </span>
          You scaled to 200 people in three years.
        </p>
        <p className="text-foreground">
          <span className="mr-2 text-[9px] uppercase tracking-[0.14em] text-signal">
            Guest
          </span>
          The second year nearly broke us — we hired too fast.
          <span className="ml-1 inline-block h-3 w-[6px] animate-pulse bg-signal/70 align-middle" />
        </p>
      </div>

      {/* the follow-up drops in */}
      <div className="relative mt-4 rounded-xl border border-signal/40 bg-signal-soft p-4 shadow-[6px_6px_0_hsl(var(--signal)/0.22)]">
        <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-signal">
          Suggested · 0.8s later
        </p>
        <p className="font-serif text-lg italic leading-snug">
          Your essay said remote-first breaks past fifty — is that the line
          where hiring outran process?
        </p>
        <p className="mt-2.5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-signal">
          <ExternalLink className="size-2.5" />
          Personal blog — &ldquo;Remote past fifty&rdquo;
        </p>
        <div className="mt-3 flex gap-2" aria-hidden="true">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-primary-foreground">
            <Check className="size-3" /> Asked
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <X className="size-3" /> Dismiss
          </span>
        </div>
      </div>

      {/* faded next-up card */}
      <div className="mt-2.5 rounded-xl border border-white/5 bg-black/20 p-4 opacity-50">
        <p className="font-serif text-base italic leading-snug">
          What did the first bad hire teach you about your own interviewing?
        </p>
        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
          From what they just said
        </p>
      </div>
    </div>
  );
}
