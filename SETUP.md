# Setup runbook

Everything needed to take the codebase to a running app. Each provider needs
its own account — none of this can be done for you, because it all sits behind
login + billing + email verification. Budget ~30 minutes.

Order matters: **Supabase first** (auth works without any other key), then the
AI/transcription keys, then Stripe last.

---

## 1. Supabase (auth + database) — required

1. Create a project at <https://supabase.com/dashboard>. Pick a region near you.
2. **Database → SQL Editor → New query.** Paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql) and **Run**. This creates every
   table with RLS and the signup trigger. (Equivalent to running the four files
   in `supabase/migrations/` in order.)
3. **Authentication → Email Templates → "Magic Link".** Make sure the body
   contains the token, e.g. `Your login code is {{ .Token }}`, so users receive
   a 6-digit code (the login screen asks for a code, not a magic-link click).
4. **Project Settings → API.** Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only — never ship to the browser)

At this point signup/login and the dashboard work. Everything below unlocks a
milestone.

## 2. Research + model keys (M1 dossier, M3 follow-ups) — required for dossiers

- **Anthropic** — <https://console.anthropic.com> → API Keys → `ANTHROPIC_API_KEY`.
  (Powers Sonnet 5 dossier/follow-ups and Haiku triage.)
- **Tavily** — <https://app.tavily.com> → `TAVILY_API_KEY`. Has a free tier.

## 3. Deepgram (M2 live transcription) — required for live sessions

- <https://console.deepgram.com> → API Keys → `DEEPGRAM_API_KEY`. Free credit
  on signup. The browser never sees this key — the server mints a 60-second
  token per connection.

## 4. Stripe (M5 billing) — optional until you want to charge

1. <https://dashboard.stripe.com> (test mode is fine). Secret key →
   `STRIPE_SECRET_KEY`.
2. **Products** → create a recurring Price (e.g. £19/mo). Copy the **Price ID**
   (`price_…`) → `STRIPE_PRO_PRICE_ID`.
3. **Developers → Webhooks** → add an endpoint at
   `https://<your-domain>/api/stripe/webhook`, subscribe to
   `checkout.session.completed` and `customer.subscription.*`. Signing secret →
   `STRIPE_WEBHOOK_SECRET`.
   - Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

---

## 5. Wire up env + run

```bash
cp .env.example .env.local     # then fill in the values from steps 1–4
npm install
npm run dev                    # http://localhost:3000
```

Set the same variables in Vercel (Project → Settings → Environment Variables)
for the deployed app, plus `NEXT_PUBLIC_SITE_URL=https://<your-domain>` so
Stripe redirects resolve.

---

## Dev sign-in (skip the login email while testing)

To exercise the app without waiting on an OTP email, enable the dev sign-in.
It logs you into a **real, seeded test user** (granted Pro), so RLS still
applies — it only skips the email step, not the backend. It requires the
Supabase env above.

Set these (locally in `.env.local`, or in Vercel), then redeploy:

```
ALLOW_DEV_LOGIN=true              # server gate — the route 404s without it
NEXT_PUBLIC_ALLOW_DEV_LOGIN=true  # shows the button on /login
# DEV_LOGIN_EMAIL / DEV_LOGIN_PASSWORD — optional; sensible defaults otherwise
```

A "Skip auth · sign in as test user" button then appears on `/login`. First
click provisions the test user (and its `profiles` row via the signup trigger).

> ⚠️ **Never enable these on a deployment with real users** — it's an
> auth bypass. Leave both unset in real production.

## 6. Acceptance checks (the PRD's gates)

- **M0** — sign up, confirm a `profiles` row exists. Cross-user isolation:
  create two users; in the SQL editor, `set role authenticated;` won't mimic a
  user, so test via the app — user A can never load user B's dossier URL (RLS
  returns 404). RLS is on every table (`select relname, relrowsecurity from
  pg_class where relname in ('profiles','guests','dossiers','sources','angles',
  'sessions','transcript_segments','suggestions');` — all `t`).
- **M1** — add a real guest with a link → a summary and 10 angles appear, every
  specific angle shows a source, failures surface inline.
- **M2** — start a session, share the call tab with **Share tab audio** ticked →
  a ~10-min call transcribes with host/guest labels.
- **M3** — during the call, ≥1 genuinely askable, cited suggestion appears per
  ~2 minutes; Asked/Dismiss persist.
- **M4** — End & recap → transcript + suggestion log saved, editable show-notes
  draft generated.
- **M5** — as a free user, hit the 3-interview wall → inline upgrade → Stripe
  checkout → `plan` flips to `pro` on the webhook.

MVP done = one real interview end-to-end with ≥1 asked suggestion.
