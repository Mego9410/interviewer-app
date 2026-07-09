-- The Second Question — full schema (M0–M3).
-- One-shot paste for the Supabase SQL editor. Equivalent to running every
-- file in supabase/migrations/ in order. Safe to re-run (idempotent).

-- ============================================================
-- supabase/migrations/0000_init_profiles.sql
-- ============================================================
-- M0 — profiles (1:1 with auth.users), RLS, and row-on-signup trigger.
-- Engineering Rule #3: RLS ships in the same change that creates the table.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free',              -- 'free' | 'pro'
  interviews_used_this_period int not null default 0,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- Row Level Security ---------------------------------------------------------
alter table public.profiles enable row level security;

-- A user can only read/write their own profile row.
-- profiles keys on id (= auth.uid()), not a denormalized user_id.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row on signup ---------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- supabase/migrations/0001_dossier.sql
-- ============================================================
-- M1 — the dossier brain: guests, dossiers, sources, angles.
-- Every table ships with RLS in the same migration (Engineering Rule #3).
-- user_id is denormalized onto every table so the RLS policy stays simple/fast.

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  links jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  status text not null default 'pending',      -- 'pending' | 'ready' | 'failed'
  summary text,
  error text,
  model_used text,
  created_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  url text not null,
  title text,
  snippet text not null,
  retrieved_at timestamptz not null default now()
);

create table if not exists public.angles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  question text not null,
  rationale text,
  category text
);

create index if not exists guests_user_id_idx on public.guests(user_id);
create index if not exists dossiers_guest_id_idx on public.dossiers(guest_id);
create index if not exists sources_dossier_id_idx on public.sources(dossier_id);
create index if not exists angles_dossier_id_idx on public.angles(dossier_id);

-- Row Level Security ---------------------------------------------------------
alter table public.guests enable row level security;
alter table public.dossiers enable row level security;
alter table public.sources enable row level security;
alter table public.angles enable row level security;

drop policy if exists "own rows" on public.guests;
create policy "own rows" on public.guests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.dossiers;
create policy "own rows" on public.dossiers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.sources;
create policy "own rows" on public.sources
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.angles;
create policy "own rows" on public.angles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- supabase/migrations/0002_sessions.sql
-- ============================================================
-- M2 — live sessions + transcript. RLS ships with each table (Rule #3).

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  status text not null default 'active',        -- 'active' | 'ended'
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  show_notes text
);

create table if not exists public.transcript_segments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  speaker text,                                 -- 'host' | 'guest' | null
  text text not null,
  ts_start numeric,
  ts_end numeric,
  created_at timestamptz not null default now()
);

create index if not exists sessions_guest_id_idx on public.sessions(guest_id);
create index if not exists transcript_segments_session_id_idx
  on public.transcript_segments(session_id);

alter table public.sessions enable row level security;
alter table public.transcript_segments enable row level security;

drop policy if exists "own rows" on public.sessions;
create policy "own rows" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.transcript_segments;
create policy "own rows" on public.transcript_segments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- supabase/migrations/0003_suggestions.sql
-- ============================================================
-- M3 — live follow-up suggestions. RLS ships with the table (Rule #3).

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  segment_id uuid references public.transcript_segments(id) on delete set null,
  source_id uuid references public.sources(id) on delete set null,
  question text not null,
  rationale text,
  status text not null default 'suggested',  -- 'suggested' | 'asked' | 'dismissed'
  created_at timestamptz not null default now()
);

create index if not exists suggestions_session_id_idx
  on public.suggestions(session_id);

alter table public.suggestions enable row level security;

drop policy if exists "own rows" on public.suggestions;
create policy "own rows" on public.suggestions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

