import { ExternalLink, Globe } from "lucide-react";

/** Dossier product mockup — briefing + cited angles. Decorative. */
export function DossierPanel() {
  return (
    <div className="studio relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between border-b border-white/5 bg-black/30 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Dossier · Jane Doe
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ok">
          <span className="size-1.5 rounded-full bg-ok" />
          Ready
        </span>
      </div>

      <div className="p-5">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Briefing
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
          Founder and essayist. Scaled Acme from a two-person prototype to a
          200-person company; widely shared writing on remote work and org
          design. Currently: a new book, and a contrarian argument about team
          size.
        </p>

        <p className="mb-2.5 mt-5 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Rarely-asked angles
        </p>
        <div className="space-y-2.5">
          {[
            {
              q: "You've called year two your hardest — what broke first, people or process?",
              s: "TechCrunch — Founder interview",
            },
            {
              q: "Your essay argued remote-first only works past 50 people. Where did that number come from?",
              s: "Personal blog — 'Remote past fifty'",
            },
          ].map((a, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/5 bg-black/20 p-3"
            >
              <p className="font-serif text-[14px] italic leading-snug">
                {a.q}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-signal">
                <ExternalLink className="size-2.5" />
                {a.s}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <Globe className="size-3 text-signal" />
          6 sources fetched · 10 angles drafted · every claim cited
        </p>
      </div>
    </div>
  );
}
