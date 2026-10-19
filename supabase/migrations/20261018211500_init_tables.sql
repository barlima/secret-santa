-- Secret Santa: schema, row-level security and the draw.
--
-- Participants sign in through Supabase Auth with a synthetic email
-- (<participant-id>@santa.local). The draw runs inside the database, once,
-- the moment the last participant sets a password.

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(btrim(full_name)) between 1 and 80),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  is_admin boolean not null default false,
  has_password boolean generated always as (auth_user_id is not null) stored,
  created_at timestamptz not null default now()
);

-- Only one admin.
create unique index participants_one_admin on public.participants ((true)) where is_admin;
create unique index participants_full_name_key on public.participants (lower(btrim(full_name)));

create table public.spouse_pairs (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.participants (id) on delete cascade,
  participant_b uuid not null references public.participants (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (participant_a <> participant_b)
);

create unique index spouse_pairs_pair_key
  on public.spouse_pairs (least(participant_a, participant_b), greatest(participant_a, participant_b));
create index spouse_pairs_b_idx on public.spouse_pairs (participant_b);

create type public.draw_status as enum ('pending', 'done', 'failed');

create table public.draw (
  id smallint primary key default 1 check (id = 1),
  status public.draw_status not null default 'pending',
  run_at timestamptz,
  error text -- 'too_few_people' | 'no_valid_assignment'
);

insert into public.draw (id) values (1);

create table public.assignments (
  giver_id uuid primary key references public.participants (id) on delete cascade,
  receiver_id uuid not null unique references public.participants (id) on delete cascade,
  check (giver_id <> receiver_id)
);

alter table public.participants enable row level security;
alter table public.spouse_pairs enable row level security;
alter table public.draw enable row level security;
alter table public.assignments enable row level security;
