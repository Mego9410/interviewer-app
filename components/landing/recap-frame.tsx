import { Check, FileText, X } from "lucide-react";

/** "Publish" mockup — browser-framed recap with show notes + suggestion log. */
export function RecapFrame() {
  return (
    <div className="studio relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]">
      {/* browser chrome */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-black/30 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="flex-1 truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[10px] text-muted-foreground">
          thesecondquestion.app/session/jane-doe/recap
        </span>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[1.3fr_1fr]">
        {/* show notes editor */}
        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
          <p className="mb-3 inline-flex items-center gap-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <FileText className="size-3 text-signal" /> Show notes · draft
          </p>
          <div className="space-y-2 font-mono text-[11px] leading-relaxed text-foreground/85">
            <p className="text-signal"># Jane Doe — scaling, and the case against team size</p>
            <p>Jane joins to talk about scaling Acme to 200 people and why she now argues most teams grow too fast.</p>
            <p className="text-foreground/70">- The second year nearly broke the company</p>
            <p className="text-foreground/70">- &ldquo;Remote past fifty&rdquo; came from watching autonomy collapse</p>
            <p className="text-foreground/70">
              - Changed her mind on org charts
              <span className="ml-0.5 inline-block h-3 w-[6px] animate-pulse bg-signal/70 align-middle" />
            </p>
          </div>
        </div>

        {/* suggestion log */}
        <div>
          <p className="mb-3 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Questions you asked
          </p>
          <ul className="space-y-2.5 text-[12px] leading-snug">
            <li className="flex gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-ok" />
              <span>What actually started failing first?</span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-ok" />
              <span>Is fifty the line where hiring outran process?</span>
            </li>
            <li className="flex gap-2 text-muted-foreground">
              <X className="mt-0.5 size-3.5 shrink-0" />
              <span>Do you regret the pace?</span>
            </li>
          </ul>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            2 asked · 1 dismissed
          </p>
        </div>
      </div>
    </div>
  );
}
