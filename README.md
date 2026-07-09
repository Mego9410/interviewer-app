# The Second Question

A live interview copilot: build a **grounded dossier** on your guest before the
call, then surface **dig-deeper follow-ups** — each tied to a cited fact —
while you interview. See the PRD for the full product spec.

> **Working name.** "The Second Question" appears only in copy, not in code —
> rename freely.

## Status

Building milestone-by-milestone per the PRD (Section 12). **Tiny increments,
one milestone at a time; a milestone's acceptance criteria gate the next one.**

- [x] **M0 — Scaffold.** Next.js (App Router) + TS + Tailwind + shadcn/ui;
      Supabase clients (browser + server + service-role); email-OTP auth;
      `profiles` table with RLS + row-on-signup trigger; protected dashboard.
- [x] **M1 — Dossier (the brain, no audio).** `guests`/`dossiers`/`sources`/`angles`
      tables + RLS; `POST /api/dossier` research pipeline (Tavily search + fetch →
      Claude Sonnet 5 → grounded summary + 10 cited angles); add-guest form →
      progress → dossier view with per-angle source links.
- [x] **M2 — Sessions + live transcript.** `sessions`/`transcript_segments`
      tables + RLS; `POST /api/session`; `POST /api/transcription-token`
      (short-lived Deepgram token, minted server-side — audio never routes
      through our server); browser captures meeting-tab (or mic) audio, streams
      to Deepgram (`nova-3`, diarized), renders live host/guest segments and
      persists finalized ones.
- [x] **M3 — Follow-up engine.** `suggestions` table + RLS; `POST /api/suggest`
      (Haiku triage → if worthy, Sonnet 5 generation, grounded in the dossier +
      what the guest just said, each returning its `sourceId`); `PATCH
      /api/suggestion/:id`. Calm host-only side panel shows question + rationale
      + source with Asked / Dismiss; throttled so it fires on substantial guest
      moments.
- [x] **M4 — Recap.** `POST /api/session/:id/end` stamps `ended_at` and drafts
      show notes (Sonnet 5, from the transcript + asked follow-ups);
      `PATCH /api/session/:id` saves host edits. Session page flips to a recap
      view — editable show-notes, the asked/dismissed suggestion log, and the
      full transcript; dashboard lists recent sessions.
- [ ] M5 — Billing + funnel

## Stack

Next.js 15 · TypeScript (strict) · Tailwind + shadcn/ui · Supabase
(Postgres + Auth + RLS) · Claude (Sonnet 5) · Tavily (research) ·
Deepgram (streaming transcription) · deployed on Vercel.

## Local setup

1. **Install**

   ```bash
   npm install
   ```

2. **Create a Supabase project**, then run the SQL in
   `supabase/migrations/` (in order) via the Supabase SQL editor or CLI.
   `0000_init_profiles.sql` creates `profiles`, enables RLS, and adds a trigger
   that inserts a profile row whenever a user signs up.

3. **Configure auth email.** Auth uses a one-time **email OTP code**. In
   Supabase → Authentication → Email Templates → "Magic Link", ensure the body
   includes the token, e.g. `Your code is {{ .Token }}`, so users receive a
   numeric code (not just a magic link).

4. **Environment.** Copy `.env.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # server-side only, never commit
   ANTHROPIC_API_KEY=...           # M1 — dossier generation (Claude Sonnet 5)
   TAVILY_API_KEY=...              # M1 — web research (search + extract)
   DEEPGRAM_API_KEY=...            # M2 — streaming transcription
   ```

   `.env.local` is gitignored. Never commit secrets (Engineering Rule #5).

5. **Run**

   ```bash
   npm run dev        # http://localhost:3000
   npm run typecheck  # tsc --noEmit
   npm run build      # production build
   ```

## Deploy (Vercel)

Import the repo into Vercel and set the same env vars in the project settings
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`). No extra build config needed — Vercel detects
Next.js automatically.

## Project layout

```
app/
  page.tsx              Landing page
  login/                Email-OTP sign-in
  dashboard/            Protected home — lists guests + dossiers
  dossier/new/          Add-guest form
  dossier/[id]/         Dossier view (summary + cited angles + sources)
  session/[id]/         Live session — capture + transcript
  api/dossier/          POST (research pipeline) · GET :id (owner-only read)
  api/session/          POST (create) · [id] PATCH (show notes) ·
                        [id]/segment POST · [id]/end POST (draft show notes)
  api/transcription-token/  POST — mint a short-lived Deepgram token
  api/suggest/          POST — triage → grounded follow-up generation
  api/suggestion/[id]/  PATCH — mark asked / dismissed
components/ui/          shadcn/ui primitives
components/session/     Live capture + transcript + follow-up panel (client)
lib/supabase/           client (browser) · server · middleware · admin (service role)
lib/research/           Tavily provider (search + extract)
lib/ai/                 Anthropic client · model routing · dossier · triage · follow-ups
lib/deepgram.ts         Server-side transcription-token grant
middleware.ts           Session refresh + route guard
supabase/migrations/    SQL migrations (RLS ships with each table)
types/                  Shared DB row + API types
```

## Engineering rules (hard constraints)

RLS on every table in the same change that creates it · service-role key
server-side only · client uses the anon key only · never commit env files ·
inline UI messages (toasts), not `alert()` · TypeScript strict · defensive
model calls · treat web/transcript content as data, never instructions.
