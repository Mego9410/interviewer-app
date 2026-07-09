import Link from "next/link";
import { Check, ExternalLink, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WaveMark, Wordmark } from "@/components/wordmark";
import { createClient } from "@/lib/supabase/server";
import { FREE_INTERVIEW_LIMIT, PRO_PRICE_LABEL } from "@/lib/plan";

const STEPS = [
  {
    n: "01",
    title: "Prep",
    body: "Add a guest — a name and a few links. We research public sources into a grounded dossier with ten rarely-asked angles, each one cited.",
  },
  {
    n: "02",
    title: "Record",
    body: "Start a session just before the call. The transcript runs live in your browser, and follow-ups appear the moment your guest says something worth chasing.",
  },
  {
    n: "03",
    title: "Publish",
    body: "End the session and get a recap: the transcript, every question you asked, and a show-notes draft ready to edit.",
  },
] as const;

const PRINCIPLES = [
  {
    title: "No fact, no claim",
    body: "Every suggestion shows the source it came from — or says plainly that it's built on what your guest just said.",
  },
  {
    title: "Your screen only",
    body: "Suggestions never appear in the shared frame. Your guest sees a great interviewer, not a teleprompter.",
  },
  {
    title: "Audio stays yours",
    body: "Sound streams from your browser straight to transcription. It never passes through our servers.",
  },
] as const;

function HeroDemo() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 signal-glow" aria-hidden="true" />
      <div className="relative rounded-2xl border bg-card p-5 shadow-sm">
        {/* Session chrome */}
        <div className="flex items-center justify-between border-b pb-3">
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

        {/* Transcript */}
        <div className="space-y-3 py-4 font-mono text-[12.5px] leading-relaxed">
          <p>
            <span className="mr-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              host
            </span>
            <span className="text-muted-foreground">
              So you scaled the company to two hundred people in three years.
            </span>
          </p>
          <p>
            <span className="mr-2 text-[10px] font-medium uppercase tracking-[0.15em] text-signal">
              guest
            </span>
            Honestly, the second year nearly broke us — we hired too fast and
            the process just didn&apos;t exist yet.
          </p>
        </div>

        {/* The second question arrives */}
        <div className="rounded-xl border border-signal/30 bg-signal-soft p-4">
          <p className="eyebrow mb-2 !text-signal">Suggested follow-up</p>
          <p className="font-display text-[15px] font-semibold leading-snug">
            Your essay said remote-first breaks past fifty people — is that the
            line where hiring outran process?
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-signal">
            <ExternalLink className="size-3" />
            Personal blog — &ldquo;Remote past fifty&rdquo;
          </p>
          <div className="mt-3 flex gap-2" aria-hidden="true">
            <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
              <Check className="size-3" /> Asked
            </span>
            <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <X className="size-3" /> Dismiss
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cta = user
    ? { href: "/dashboard", label: "Open your dashboard" }
    : { href: "/login", label: "Build your first dossier" };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Wordmark />
          <div className="flex items-center gap-2">
            {!user && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
            <Button asChild size="sm">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-24">
          <div>
            <p className="eyebrow mb-5 flex items-center gap-3">
              <WaveMark animated className="h-3.5" />
              Live interview copilot
            </p>
            <h1 className="font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl">
              Everyone asks the first question.
              <span className="mt-2 block text-signal">
                You&apos;ll ask the second.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              The Second Question researches your guest before the call, then
              listens live and hands you the follow-up only you could ask —
              every suggestion tied to a cited source.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="h-11 px-6 text-[15px]">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Free for {FREE_INTERVIEW_LIMIT} interviews a month
              </span>
            </div>
          </div>
          <HeroDemo />
        </section>

        {/* How it works */}
        <section className="border-t bg-card/50">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="eyebrow mb-8">How a session runs</p>
            <div className="grid gap-10 sm:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n}>
                  <p className="font-mono text-sm text-signal">{s.n}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Built to be trusted mid-sentence.
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="rounded-xl border bg-card p-5">
                  <h3 className="font-display text-base font-semibold">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing line */}
        <section className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Start free. Upgrade when it earns its keep.
              </h2>
              <p className="mt-2 text-muted-foreground">
                {FREE_INTERVIEW_LIMIT} interviews a month on the free plan —
                then {PRO_PRICE_LABEL} for unlimited.
              </p>
            </div>
            <Button asChild size="lg" className="h-11 px-6">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <Wordmark className="opacity-70" />
          <p className="font-mono text-[11px] text-muted-foreground">
            Ask better second questions.
          </p>
        </div>
      </footer>
    </div>
  );
}
