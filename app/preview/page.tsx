import Link from "next/link";
import { Check, ExternalLink, Radio, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionRecap } from "@/components/session/session-recap";
import { Wordmark } from "@/components/wordmark";

// Design preview — the app's signature screens rendered with sample data so
// the UI can be reviewed on localhost with no backend connected. Public route;
// contains no real data and touches no services.

export const metadata = { title: "UI preview — The Second Question" };

function SampleBadge() {
  return (
    <p className="mb-3 inline-block rounded-full bg-signal-soft px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-signal">
      Sample data · nothing connected
    </p>
  );
}

const ANGLES = [
  {
    q: "You've said scaling the team was your hardest year — what specifically broke first, people or process?",
    r: "Ties their public 'hardest year' remark to a concrete failure mode.",
    source: "TechCrunch — Founder interview",
  },
  {
    q: "Your essay argued remote-first only works past 50 people. Where did that number come from?",
    r: "Presses a specific, quotable claim from their own writing.",
    source: "Personal blog — 'Remote past fifty'",
  },
  {
    q: "What's a belief about your field you've quietly changed your mind on?",
    r: "General opener — no specific fact required.",
    source: null,
  },
];

export default function PreviewPage() {
  return (
    <>
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/">
            <Wordmark />
          </Link>
          <span className="eyebrow">UI preview</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-16 px-6 py-12">
        <header>
          <p className="eyebrow mb-2">Signature screens</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            The product, with sample data
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            The real components, no backend required. Connect Supabase and the
            API keys (see SETUP.md) and these screens come alive.
          </p>
        </header>

        {/* 1 — Dossier */}
        <section>
          <SampleBadge />
          <h2 className="eyebrow mb-4">1 · Dossier</h2>
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-3xl font-semibold tracking-tight">
              Jane Doe
            </h3>
            <Button>
              <Radio />
              Start live session
            </Button>
          </div>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="font-display">Briefing</CardTitle>
              <CardDescription>Grounded in 6 sources</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              Jane Doe is a founder and essayist known for scaling Acme from a
              two-person prototype to a 200-person company, and for a
              widely-shared body of writing on remote work and org design.
              Recent activity centres on a new book and a contrarian argument
              about team size and autonomy.
            </CardContent>
          </Card>

          <h3 className="eyebrow mb-3 mt-8">Angles</h3>
          <ol className="space-y-3">
            {ANGLES.map((a, i) => (
              <li key={i}>
                <Card>
                  <CardContent className="space-y-2 py-4">
                    <p className="font-display font-semibold leading-snug">
                      {a.q}
                    </p>
                    <p className="text-sm text-muted-foreground">{a.r}</p>
                    {a.source ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-signal">
                        <ExternalLink className="size-3" />
                        {a.source}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        General opener
                      </span>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        {/* 2 — Live session */}
        <section>
          <SampleBadge />
          <h2 className="eyebrow mb-4">2 · Live session</h2>
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-live" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-live">
                Live
              </span>
            </span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              REC 00:14:32
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_20rem]">
            <div className="min-h-[240px] rounded-xl border bg-card p-4">
              <div className="space-y-2.5 font-mono text-[13px] leading-relaxed">
                <p>
                  <span className="mr-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    host
                  </span>
                  So you scaled Acme to two hundred people in three years.
                </p>
                <p>
                  <span className="mr-2 text-[10px] font-medium uppercase tracking-[0.15em] text-signal">
                    guest
                  </span>
                  Yeah, and honestly the second year nearly broke us — we hired
                  too fast and the process just didn&apos;t exist yet.
                </p>
                <p className="text-muted-foreground">
                  and I remember thinking, if we don&apos;t fix this now…
                </p>
              </div>
            </div>
            <aside className="space-y-3">
              <h4 className="eyebrow">Follow-ups</h4>
              <ul className="space-y-2">
                <li className="rounded-xl border border-signal/30 bg-signal-soft p-3.5 text-sm">
                  <p className="font-display font-semibold leading-snug">
                    When you say it &quot;nearly broke&quot; you — what
                    actually started failing first?
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Presses the specific failure behind a vague admission.
                  </p>
                  <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    From what they just said
                  </span>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="secondary">
                      <Check className="size-3" />
                      Asked
                    </Button>
                    <Button size="sm" variant="ghost">
                      <X className="size-3" />
                      Dismiss
                    </Button>
                  </div>
                </li>
                <li className="rounded-xl border border-signal/30 bg-signal-soft p-3.5 text-sm">
                  <p className="font-display font-semibold leading-snug">
                    Your blog said remote-first breaks past 50 — is that the
                    line where hiring outran process here?
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Ties the moment to a specific claim in their own writing.
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-signal">
                    <ExternalLink className="size-3" />
                    Personal blog — &apos;Remote past fifty&apos;
                  </span>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="secondary">
                      <Check className="size-3" />
                      Asked
                    </Button>
                    <Button size="sm" variant="ghost">
                      <X className="size-3" />
                      Dismiss
                    </Button>
                  </div>
                </li>
              </ul>
            </aside>
          </div>
        </section>

        {/* 3 — Recap (the real component) */}
        <section>
          <SampleBadge />
          <h2 className="eyebrow mb-4">3 · Recap</h2>
          <SessionRecap
            sessionId="preview"
            initialShowNotes={
              "## Jane Doe — Acme, scaling, and the case against team size\n\nJane Doe joins to talk about scaling Acme to 200 people and why she now argues most teams grow too fast.\n\n- The second year nearly broke the company — hiring outran process\n- Her 'remote past fifty' rule came from watching autonomy collapse at scale\n- Changed her mind on org charts: fewer layers, clearer ownership"
            }
            segments={[
              { id: "s1", speaker: "host", text: "So you scaled Acme to two hundred people in three years." },
              { id: "s2", speaker: "guest", text: "Yeah, and honestly the second year nearly broke us — we hired too fast and the process just didn't exist yet." },
              { id: "s3", speaker: "host", text: "When you say it nearly broke you — what started failing first?" },
              { id: "s4", speaker: "guest", text: "Onboarding. New people had no idea who owned what, so everything routed back to me." },
            ]}
            suggestions={[
              { id: "q1", question: "When you say it nearly broke you — what actually started failing first?", status: "asked" },
              { id: "q2", question: "Your blog said remote-first breaks past 50 — is that the line where hiring outran process?", status: "asked" },
              { id: "q3", question: "Do you regret the pace, or was the chaos necessary?", status: "dismissed" },
            ]}
          />
        </section>
      </main>
    </>
  );
}
