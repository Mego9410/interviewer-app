# Pricing & usage-limits plan

Tiered pricing with metered usage limits, sized so every paid tier stays
gross-margin-positive even at its cap. The tier config lives in
[`lib/plan.ts`](lib/plan.ts) (`PLANS`); this doc is the rationale + rollout.

Prices in GBP (USD ≈ ×1.27). All numbers are estimates — validate against real
usage after launch.

---

## 1. What an interview actually costs (COGS)

Per completed interview = 1 dossier + 1 live session (transcription + triage +
follow-ups + show notes). Grounded in the model/service rates
([Deepgram $0.0077/min](https://deepgram.com/pricing), Claude Sonnet 5 $3/$15
per 1M, Haiku 4.5 $1/$5, [Tavily](https://docs.tavily.com/documentation/api-credits)
~free under 1,000 credits/mo).

| Interview length | COGS today | COGS optimised¹ |
|---|---|---|
| 30 min | ~£0.65 | **~£0.40** |
| 45 min | ~£1.00 | **~£0.55** |
| 60 min | ~£1.40 | **~£0.70** |
| 90 min | ~£2.00 | **~£1.00** |
| + each dossier | ~£0.05 | ~£0.05 |

Transcription is per-minute and becomes the dominant cost once the models are
optimised — which is **why length must be a metered limit**, not just interview
count.

¹ **Optimised assumes two cheap code changes** (see §7): prompt-cache the live
follow-up calls, and disable "thinking" on the live/structured calls. They cut
the LLM portion ~60–75%. **This plan is priced on the optimised numbers — do
these first.** On today's costs, subtract ~10–15 points from every margin below.

---

## 2. The tiers

| | **Free** | **Creator** | **Pro** | **Studio** |
|---|---|---|---|---|
| Price / mo | £0 | **£19** | **£49** | **£129** |
| Interviews / mo | 2 | 6 | 20 | 60 (pooled) |
| Max length / interview | 30 min | 60 min | 90 min | 120 min |
| Dossiers / mo | 5 | 30 | 100 | 300 |
| Seats | 1 | 1 | 1 | 3 |
| Over quota | hard stop → upgrade | £3 / interview | £2.50 / interview | £2 / interview |
| Annual (2 mo free) | — | £190/yr | £490/yr | £1,290/yr |

**Margin at the plan cap** (worst case, optimised COGS):

| Tier | Max COGS at cap | Gross margin at cap | Typical margin² |
|---|---|---|---|
| Creator £19 | 6×£0.70 + 30×£0.05 ≈ **£5.7** | **~70%** | ~85% |
| Pro £49 | 20×£1.00 + 100×£0.05 ≈ **£25** | **~49%** | ~80% |
| Studio £129 | 60×£1.10 + 300×£0.05 ≈ **£81** | **~37%** | ~70% |

² Typical = a user at ~40–50% of their cap, which is where most land.

**The overage rate is the real safety net.** It's set at ~3–4× COGS, so a heavy
user is *more* profitable per interview than a light one — the cap margin is a
floor you rarely hit, not the expected outcome. Pro's 49%-at-cap is acceptable
because (a) almost nobody maxes 20 interviews, and (b) those who do pay overage
above it. If you'd rather lift the floor, drop Pro to 15 interviews (→ ~61%).

**Free tier is a marketing cost, not a product.** A maxed free user costs
~£1/mo (2 × 30-min + 5 dossiers). That's your CAC line — keep it small.

---

## 3. What we meter (and why the current build is exposed)

Three dimensions, because three different things cost money:

| Dimension | Cost driver | Status today |
|---|---|---|
| **Interviews / mo** | transcription + live models | ✅ metered (`interviews_used_this_period`) |
| **Interview length** | transcription is per-minute | ❌ **not capped** — a 3-hour session is uncapped cost |
| **Dossiers / mo** | web search + dossier model | ❌ **not metered** — free users can run unlimited dossiers |

The last two are the current leaks. The whole point of this plan is to close
them.

---

## 4. Guardrails & UX

- **Hard stop on Free**, metered **overage** on paid. Never block a paid user
  mid-recording — let them run over and bill it; block only *starting* a new
  interview once past cap + overage isn't enabled.
- **Length cap**: warn in-session at cap − 5 min; auto-stop capture at the cap
  (transcript + recap still saved). This is the single biggest cost control.
- **80% alerts**: notify on any dimension at 80% (in-app + email) with an
  upgrade CTA — drives conversion and prevents surprise walls.
- **Dossier cap**: block "New dossier" at quota with an inline upgrade message
  (mirrors the existing session wall).
- **Annual = 2 months free** to pull cash forward and cut churn.

---

## 5. Unit economics sanity check

- **Free → Creator**: Creator at typical use ≈ £3 COGS → ~£16 contribution.
  One conversion pays for ~16 maxed free users.
- **Break-even on infra** (Vercel/Supabase fixed ~£40–60/mo at small scale):
  ~4 Creator or ~2 Pro subscribers.
- **The old "£19 unlimited" was the trap**: a single power user doing 30×60-min
  interviews would have cost ~£21 COGS on optimised rates (more today) — i.e.
  underwater on their own. Quotas + overage remove that tail risk entirely.

---

## 6. Implementation plan

Mapped to the existing code. None of this is built yet beyond the interview
counter; this is the roadmap.

**Schema** (`profiles`, new migration):
```sql
alter table profiles
  add column dossiers_used_this_period int not null default 0,
  add column minutes_used_this_period  int not null default 0,
  add column period_start timestamptz not null default now();
-- plan: extend 'free'|'pro' → 'free'|'creator'|'pro'|'studio'
```

**Enforcement points** (all read `planFor(profile.plan)` from `lib/plan.ts`):
1. `POST /api/session` — block when `interviews_used ≥ plan.interviews` and
   overage disabled; else allow + (later) record an overage usage event.
2. Live session — pass `plan.maxInterviewMinutes` to `LiveTranscript`; stop
   capture at the cap; on `POST /api/session/:id/end`, compute real minutes from
   the segments' `ts_end` and add to `minutes_used_this_period`.
3. `POST /api/dossier` — block when `dossiers_used ≥ plan.dossiers`; else
   increment (currently unmetered — **the priority fix**).
4. **Monthly reset** — the existing `TODO(oliver)`: a scheduled job (Supabase
   cron / Vercel Cron) resets the three `*_used_this_period` counters when
   `now() - period_start ≥ 1 month`.

**Billing (Stripe)**:
- One recurring Price per paid tier × interval → env vars
  `STRIPE_PRICE_CREATOR|PRO|STUDIO` (+ `_ANNUAL`); `PLANS[x].stripePriceEnv`
  already points at these.
- Webhook maps the subscription's price → `plan` on `profiles` (extend the
  existing `/api/stripe/webhook`).
- **Overage v1**: skip metered billing — hard-cap paid tiers too and upsell the
  next tier. **v2**: Stripe usage-based billing (report interview usage records)
  for true overage.

**UI**: generalise the dashboard usage meter to three bars (interviews /
dossiers / minutes); pricing page with the four-column table above.

Suggested order: (1) optimise COGS §7 → (2) meter dossiers + length cap →
(3) Stripe tiers + webhook mapping → (4) monthly-reset cron → (5) overage v2.

---

## 7. Prerequisite: cut COGS first (~£30 of code)

Do these before launch — the whole plan is priced on them:
1. **Prompt-cache the live follow-up calls.** Each suggestion re-sends the full
   dossier + sources (~4,400 tokens, ~25×/interview). Anthropic prompt caching
   drops repeated input ~90% on cache reads → ~halves the dominant line item.
2. **Disable adaptive thinking on the live + structured calls**
   (`thinking: {type: "disabled"}` in triage, follow-up, show-notes). Cuts
   output tokens *and* latency (helps the ~2–3s target). Keep thinking on for
   the dossier, where quality matters.

Together these take a 45-min interview from ~£1.00 → ~£0.55.

---

## 8. Open decisions

- Final price points (£19 / £49 / £129 are the recommendation; test £15/£45).
- Pro interview count: 20 (thinner cap margin) vs 15 (safer floor).
- Overage v1 hard-cap-and-upsell vs building metered billing on day one.
- Whether the Free tier is 2 interviews (recommended) or stays at today's 3.
