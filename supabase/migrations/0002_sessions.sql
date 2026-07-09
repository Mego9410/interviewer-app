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
