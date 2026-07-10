import Link from "next/link";
import { ArrowRight, FileSearch, Radio, Sparkles } from "lucide-react";

import { Wordmark } from "@/components/wordmark";
import { WaveformStrip } from "@/components/waveform-strip";
import { CallWindow } from "@/components/landing/call-window";
import { DossierPanel } from "@/components/landing/dossier-panel";
import { FollowupFlow } from "@/components/landing/followup-flow";
import { RecapFrame } from "@/components/landing/recap-frame";
import { createClient } from "@/lib/supabase/server";
import { FREE_INTERVIEW_LIMIT, PRO_PRICE_LABEL } from "@/lib/plan";

const AUDIENCES = [
  "Podcasters",
  "Journalists",
  "Founders",
  "Researchers",
  "Recruiters",
  "Coaches",
];

function CtaButton({
  href,
  children,
  size = "md",
}: {
  href: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-signal font-semibold text-background transition-transform hover:-translate-y-0.5 ${
        size === "lg" ? "h-12 px-7 text-[15px]" : "h-10 px-5 text-sm"
      }`}
    >
      {children}
      <ArrowRight className="size-4" />
    </Link>
  );
}

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-signal">
      <span className="text-signal/50">{n}</span>
      {children}
    </p>
  );
}

export default async function Home() {
  // Resilient to a not-yet-configured backend: render the logged-out landing
  // rather than 500 if Supabase env vars are missing.
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // env not set — treat as logged out
  }

  const cta = user
    ? { href: "/dashboard", label: "Open your dashboard" }
    : { href: "/login", label: "Start free" };

  return (
    <div className="studio grain relative min-h-screen">
      {/* ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(60%_50%_at_50%_-5%,hsl(var(--signal)/0.12),transparent_70%)]"
      />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Wordmark />
          <div className="flex items-center gap-5">
            {!user && (
              <Link
                href="/login"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </Link>
            )}
            <CtaButton href={cta.href}>{cta.label}</CtaButton>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ============ HERO ============ */}
        <section className="mx-auto max-w-6xl px-6 pt-16 text-center sm:pt-24">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-signal/25 bg-signal-soft px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
            <span className="size-1.5 animate-pulse rounded-full bg-live" />
            Live interview copilot
          </p>

          <h1 className="mx-auto max-w-4xl">
            <span className="block font-display text-[clamp(2.7rem,7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              Everyone asks the first question.
            </span>
            <span className="mt-2 block font-serif text-[clamp(2.9rem,7.5vw,6rem)] italic leading-[0.98] text-signal">
              You&rsquo;ll ask the second.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Research your guest into a grounded dossier, then get cited,
            dig-deeper follow-ups on your screen while you record. All in one
            flow.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4">
            <CtaButton href={cta.href} size="lg">
              {cta.label}
            </CtaButton>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Free for {FREE_INTERVIEW_LIMIT} interviews a month · No card
            </p>
          </div>

          {/* The money shot */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            {/* floating chips */}
            <div
              aria-hidden="true"
              className="absolute -left-3 top-16 z-20 hidden -rotate-3 rounded-xl border border-signal/30 bg-card px-3.5 py-2.5 shadow-lg lg:block"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-signal">
                Cited · verifiable
              </p>
              <p className="mt-0.5 font-serif text-sm italic">No fact, no claim</p>
            </div>
            <div
              aria-hidden="true"
              className="absolute -right-4 bottom-24 z-20 hidden rotate-3 rounded-xl border border-white/10 bg-card px-3.5 py-2.5 shadow-lg lg:block"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                Latency
              </p>
              <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-signal">
                ~2s
              </p>
            </div>
            <CallWindow />
          </div>
        </section>

        {/* ============ AUDIENCE STRIP ============ */}
        <section className="mx-auto mt-20 max-w-6xl px-6">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            For anyone whose job is a great conversation
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {AUDIENCES.map((a) => (
              <span
                key={a}
                className="font-serif text-xl italic text-foreground/50"
              >
                {a}
              </span>
            ))}
          </div>
          <WaveformStrip className="mt-12 w-full opacity-70" bars={140} />
        </section>

        {/* ============ FEATURE 1 — PREP ============ */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel n="01">
                <FileSearch className="size-3.5" /> Prep
              </SectionLabel>
              <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.02em]">
                A dossier that&rsquo;s{" "}
                <span className="font-serif font-normal italic text-signal">
                  actually done its homework.
                </span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Add a name and a few links. We run the open web, pull the
                relevant pages, and write a briefing plus ten rarely-asked
                angles — each one linked to the source it came from, so you can
                trust it on air.
              </p>
            </div>
            <DossierPanel />
          </div>
        </section>

        {/* ============ FEATURE 2 — RECORD ============ */}
        <section className="border-t border-white/5 bg-black/20">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="lg:order-2">
                <SectionLabel n="02">
                  <Radio className="size-3.5" /> Record
                </SectionLabel>
                <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.02em]">
                  The follow-up arrives{" "}
                  <span className="font-serif font-normal italic text-signal">
                    mid-sentence.
                  </span>
                </h2>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  We transcribe the call live in your browser and listen for the
                  moment worth chasing. When it comes, the question appears on
                  your screen — never in the shared frame — with the fact it
                  leans on. Ask it, or dismiss it.
                </p>
              </div>
              <div className="lg:order-1">
                <FollowupFlow />
              </div>
            </div>
          </div>
        </section>

        {/* ============ FEATURE 3 — PUBLISH ============ */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel n="03">
                <Sparkles className="size-3.5" /> Publish
              </SectionLabel>
              <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.02em]">
                End the session,{" "}
                <span className="font-serif font-normal italic text-signal">
                  keep the record.
                </span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                On end, you get the full transcript, a log of every question you
                actually asked, and a show-notes draft written from the
                conversation — ready to edit and ship.
              </p>
            </div>
            <RecapFrame />
          </div>
        </section>

        {/* ============ TRUST ============ */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="max-w-3xl font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em]">
              Built to be trusted{" "}
              <span className="font-serif font-normal italic text-signal">
                mid&#8209;sentence.
              </span>
            </h2>
            <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-3">
              {[
                {
                  label: "Grounded",
                  body: "Every suggestion shows its source — or says plainly it's built on what your guest just said. No fact, no claim.",
                },
                {
                  label: "Discreet",
                  body: "Suggestions stay on your screen. Your guest sees a great interviewer, not a teleprompter.",
                },
                {
                  label: "Private",
                  body: "Audio streams from your browser straight to transcription — never through our servers — and transcripts auto-expire.",
                },
              ].map((p) => (
                <div key={p.label} className="border-t border-white/10 pt-5">
                  <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-signal">
                    {p.label}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="relative border-t border-white/5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_100%,hsl(var(--signal)/0.12),transparent_70%)]"
          />
          <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-24 text-center">
            <p className="font-serif text-[clamp(2.4rem,6vw,5rem)] italic leading-[1.05]">
              Your studio&rsquo;s ready{" "}
              <span className="text-signal">when you are.</span>
            </p>
            <p className="mx-auto mt-6 max-w-md text-muted-foreground">
              {FREE_INTERVIEW_LIMIT} interviews a month free — then{" "}
              {PRO_PRICE_LABEL} for unlimited.
            </p>
            <div className="mt-10 flex justify-center">
              <CtaButton href={cta.href} size="lg">
                {cta.label}
              </CtaButton>
            </div>
          </div>
          <WaveformStrip className="mt-14 w-full" bars={140} />
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <Wordmark className="opacity-80" />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            REC <span className="text-live">●</span> Ask better second questions
          </p>
        </div>
      </footer>
    </div>
  );
}
