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
