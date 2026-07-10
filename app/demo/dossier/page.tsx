import Link from "next/link";
import { ArrowLeft, ExternalLink, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DemoBanner } from "@/components/demo/demo-banner";

export const metadata = { title: "Demo · Dossier" };

const ANGLES = [
  {
    q: "You've called year two your hardest — what broke first, people or process?",
    r: "Ties a public 'hardest year' remark to a concrete failure mode.",
    source: "TechCrunch — Founder interview",
  },
  {
    q: "Your essay argued remote-first only works past 50 people. Where did that number come from?",
    r: "Presses a specific, quotable claim from their own writing.",
    source: "Personal blog — 'Remote past fifty'",
  },
  {
    q: "You mention 'clarity of ownership' a lot — what does that look like on day one for a new hire?",
    r: "Turns a repeated phrase into a concrete, answerable question.",
    source: "Podcast — The Org Design Show",
  },
  {
    q: "What's a belief about your field you've quietly changed your mind on?",
    r: null,
    source: null,
  },
];

const SOURCES = [
  "TechCrunch — Founder interview",
  "Personal blog — 'Remote past fifty'",
  "Podcast — The Org Design Show",
  "Company about page",
];

export default function DemoDossier() {
  return (
    <>
      <DemoBanner />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link href="/demo">
            <ArrowLeft />
            Dashboard
          </Link>
        </Button>

        <header className="mb-8 flex items-start justify-between gap-4">
          <h1 className="font-serif text-4xl italic tracking-tight">Jane Doe</h1>
          <Button asChild>
            <Link href="/demo/session">
              <Radio />
              Start live session
            </Link>
          </Button>
        </header>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-display">Briefing</CardTitle>
            <CardDescription>Grounded in {SOURCES.length} sources</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            Jane Doe is a founder and essayist known for scaling Acme from a
            two-person prototype to a 200-person company, and for a widely-shared
            body of writing on remote work and org design. Recent activity
            centres on a new book and a contrarian argument about team size and
            autonomy.
          </CardContent>
        </Card>

        <section className="mb-8">
          <h2 className="eyebrow mb-4">Angles</h2>
          <ol className="space-y-3">
            {ANGLES.map((a, i) => (
              <li key={i}>
                <Card>
                  <CardContent className="space-y-2 py-4">
                    <p className="font-serif text-lg italic leading-snug">
                      {a.q}
                    </p>
                    {a.r && (
                      <p className="text-sm text-muted-foreground">{a.r}</p>
                    )}
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

        <section>
          <h2 className="eyebrow mb-4">Sources</h2>
          <ul className="space-y-2">
            {SOURCES.map((s) => (
              <li key={s}>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-signal">
                  <ExternalLink className="size-3 shrink-0" />
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
