import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, FileText, Square, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/demo/demo-banner";

export const metadata = { title: "Demo · Live session" };

const TRANSCRIPT = [
  { who: "host", text: "So you scaled Acme to two hundred people in three years." },
  {
    who: "guest",
    text: "Yeah, and honestly the second year nearly broke us — we hired too fast and the process just didn't exist yet.",
  },
  { who: "host", text: "When you say it nearly broke you — what started failing first?" },
  {
    who: "guest",
    text: "Onboarding. New people had no idea who owned what, so everything routed back to me.",
  },
];

export default function DemoSession() {
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

        <header className="mb-6">
          <p className="eyebrow mb-2">Live session</p>
          <h1 className="font-serif text-4xl italic tracking-tight">Jane Doe</h1>
        </header>

        {/* controls */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-live" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-live">
              Live
            </span>
          </span>
          <Button variant="outline">
            <Square className="size-4" />
            Stop
          </Button>
          <Button asChild>
            <Link href="/demo/recap">
              <FileText />
              End &amp; recap
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_20rem]">
          {/* transcript */}
          <div className="min-h-[240px] rounded-xl border bg-card p-4">
            <div className="space-y-2.5 font-mono text-[13px] leading-relaxed">
              {TRANSCRIPT.map((t, i) => (
                <p key={i}>
                  <span
                    className={`mr-2 text-[10px] font-medium uppercase tracking-[0.15em] ${
                      t.who === "guest" ? "text-signal" : "text-muted-foreground"
                    }`}
                  >
                    {t.who}
                  </span>
                  {t.text}
                </p>
              ))}
              <p className="text-muted-foreground">
                and I remember thinking, if we don&apos;t fix this now…
                <span className="ml-1 inline-block h-3 w-[6px] animate-pulse bg-signal/70 align-middle" />
              </p>
            </div>
          </div>

          {/* follow-ups */}
          <aside className="space-y-3">
            <h2 className="eyebrow">Follow-ups</h2>
            <ul className="space-y-2">
              <li className="rounded-xl border border-signal/30 bg-signal-soft p-3.5 text-sm">
                <p className="font-serif text-[17px] italic leading-snug">
                  When you say it &quot;nearly broke&quot; you — what actually
                  started failing first?
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
                <p className="font-serif text-[17px] italic leading-snug">
                  Your blog said remote-first breaks past 50 — is that the line
                  where hiring outran process?
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
      </main>
    </>
  );
}
