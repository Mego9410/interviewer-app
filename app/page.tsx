import Link from "next/link";
import { ArrowRight, Check, ExternalLink, X } from "lucide-react";

import { Wordmark } from "@/components/wordmark";
import { WaveformStrip } from "@/components/waveform-strip";
import { createClient } from "@/lib/supabase/server";
import { FREE_INTERVIEW_LIMIT, PRO_PRICE_LABEL } from "@/lib/plan";

const TICKER = [
  "No fact, no claim",
  "Every suggestion cited",
  "Your screen only",
  "Audio never touches our servers",
  "Transcripts auto-expire",
];

const TRACKS = [
  {
    n: "01",
    title: "Prep",
    meta: "BEFORE THE CALL",
    body: "Add a guest — a name and a few links. We research public sources into a grounded dossier: who they are, what they're known for, and ten rarely-asked angles. Each one cited.",
  },
  {
    n: "02",
    title: "Record",
    meta: "DURING",
    body: "Start a session just before you hit record. The transcript runs live in your browser, and the moment your guest says something worth chasing, the follow-up appears — with its source.",
  },
  {
    n: "03",
    title: "Publish",
    meta: "AFTER",
    body: "End the session for the recap: full transcript, every question you asked, and a show-notes draft ready to edit.",
  },
] as const;

function Ticker() {
  const items = TICKER.map((t, i) => (
    <span
      key={i}
      className="flex items-center gap-12 pr-12 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-signal"
    >
      {t}
      <span aria-hidden="true" className="text-signal/40">
        ●
      </span>
    </span>
  ));
  return (
    <div className="marquee border-y border-signal/20 py-3" aria-hidden="true">
      <div className="marquee-track">
        <div className="flex">{items}</div>
        <div className="flex">{items}</div>
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
    : { href: "/login", label: "Start free" };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ======================= SIDE A — the studio ======================= */}
      <div className="studio grain relative">
        {/* Nav */}
        <header className="relative z-10">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Wordmark />
            <div className="flex items-center gap-5">
              <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
                Side A · 33:05
              </span>
              {!user && (
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
              )}
              <Link
                href={cta.href}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-signal px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
              >
                {cta.label}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Hero — the two voices */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 sm:pt-24">
          <p className="mb-8 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-signal">
            <span className="size-2 animate-pulse rounded-full bg-live" />
            Live interview copilot
          </p>

          <h1 className="max-w-5xl">
            <span className="block font-display text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.95] tracking-[-0.03em]">
              Everyone asks the first&nbsp;question.
            </span>
            <span className="mt-3 block font-serif text-[clamp(3.2rem,9.5vw,8rem)] italic leading-[0.95] tracking-[-0.01em] text-signal">
              You&rsquo;ll ask the second.
            </span>
          </h1>

          <div className="mt-12 flex max-w-xl flex-col gap-6 sm:mt-16">
            <p className="text-lg leading-relaxed text-muted-foreground">
              The Second Question researches your guest before the call, then
              listens live and hands you the follow-up only you could ask —
              every suggestion tied to a cited source.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Free for {FREE_INTERVIEW_LIMIT} interviews a month · No card
              required
            </p>
          </div>
        </section>

        {/* The moment — oversized transcript + the arriving question */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-8 pt-20 sm:pt-28">
          <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <figure className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-4 -top-14 select-none font-serif text-[10rem] italic leading-none text-signal/25 sm:-left-10"
              >
                &ldquo;
              </span>
              <blockquote className="relative font-serif text-[clamp(1.7rem,3.4vw,2.6rem)] italic leading-[1.2]">
                Honestly, the second year nearly broke us — we hired too fast
                and the process just didn&rsquo;t exist yet.
              </blockquote>
              <figcaption className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className="text-signal">Guest</span> · 00:14:27 ·
                transcribed live
              </figcaption>
            </figure>

            {/* The suggestion card — a physical object dropped on the desk */}
            <aside
              className="relative -rotate-1 rounded-2xl border border-signal/40 bg-card p-6 shadow-[8px_8px_0_hsl(var(--signal)/0.25)]"
              aria-label="Example suggested follow-up"
            >
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-signal">
                Suggested follow-up · 0.8s later
              </p>
              <p className="font-serif text-2xl italic leading-snug">
                Your essay said remote-first breaks past fifty people — is that
                the line where hiring outran process?
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-signal">
                <ExternalLink className="size-3" />
                Personal blog — &ldquo;Remote past fifty&rdquo;
              </p>
              <div className="mt-5 flex gap-2" aria-hidden="true">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground">
                  <Check className="size-3" /> Asked
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                  <X className="size-3" /> Dismiss
                </span>
              </div>
            </aside>
          </div>
        </section>

        {/* Waveform floor */}
        <WaveformStrip className="relative z-10 mt-10 w-full px-2" bars={140} />
      </div>

      {/* Ticker */}
      <div className="studio">
        <Ticker />
      </div>

      {/* ======================= SIDE B — paper ======================= */}
      <div className="paper">
        {/* Tracklist */}
        <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.75rem)] font-bold tracking-[-0.02em]">
              How a session runs
            </h2>
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
              Tracklist
            </span>
          </div>

          <ol>
            {TRACKS.map((t) => (
              <li
                key={t.n}
                className="group grid gap-4 border-t py-10 sm:grid-cols-[7rem_1fr_1.6fr] sm:gap-8"
              >
                <span className="font-display text-5xl font-bold leading-none text-signal/90 transition-transform group-hover:translate-x-1 sm:text-6xl">
                  {t.n}
                </span>
                <div>
                  <h3 className="font-serif text-3xl italic leading-none">
                    {t.title}
                  </h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {t.meta}
                  </p>
                </div>
                <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                  {t.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="border-t" />
        </section>

        {/* Trust — typographic, no cards */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Built to be trusted{" "}
            <em className="font-serif font-normal italic text-signal">
              mid&#8209;sentence.
            </em>
          </h2>
          <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {[
              {
                label: "Grounded",
                body: "Every suggestion shows the source it came from — or says plainly that it's built on what your guest just said. No fact, no claim.",
              },
              {
                label: "Discreet",
                body: "Suggestions never appear in the shared frame. Your guest sees a great interviewer, not a teleprompter.",
              },
              {
                label: "Private",
                body: "Audio streams from your browser straight to transcription — it never passes through our servers — and transcripts auto-expire.",
              },
            ].map((p) => (
              <div key={p.label} className="border-t pt-5">
                <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-signal">
                  {p.label}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ======================= OUTRO — back to the studio ======================= */}
      <div className="studio grain relative">
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-24 text-center sm:pt-32">
          <p className="font-serif text-[clamp(2.4rem,6vw,5rem)] italic leading-[1.05]">
            Ready to ask{" "}
            <span className="text-signal">better questions?</span>
          </p>
          <p className="mx-auto mt-6 max-w-md text-muted-foreground">
            {FREE_INTERVIEW_LIMIT} interviews a month free — then{" "}
            {PRO_PRICE_LABEL} for unlimited.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href={cta.href}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-signal px-7 text-[15px] font-semibold text-background transition-transform hover:-translate-y-0.5"
            >
              {cta.label}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <WaveformStrip className="relative z-10 mt-16 w-full px-2" bars={140} />

        <footer className="relative z-10 border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
            <Wordmark className="opacity-80" />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              REC <span className="text-live">●</span> Ask better second
              questions
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
