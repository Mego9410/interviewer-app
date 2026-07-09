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
