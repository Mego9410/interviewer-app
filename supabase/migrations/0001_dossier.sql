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
