-- FamilyBoard schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT where practical.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Family members (kids + optional parent profiles)
-- ---------------------------------------------------------------------------
create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  age int,
  role text not null default 'kid' check (role in ('kid', 'parent')),
  avatar_emoji text not null default '🙂',
  color text not null default '#38bdf8',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Daily schedule template, recurring by day-of-week (0 = Sunday ... 6 = Saturday)
-- ---------------------------------------------------------------------------
create table if not exists schedule_items (
  id uuid primary key default gen_random_uuid(),
  family_member_id uuid not null references family_members(id) on delete cascade,
  days_of_week int[] not null, -- e.g. {1,2,3,4,5} weekdays, {0,6} weekend
  start_time time not null,
  end_time time not null,
  title text not null,
  icon text not null default '⏰',
  category text not null default 'routine'
    check (category in ('routine', 'school', 'meal', 'chore', 'play', 'sleep')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists schedule_items_member_idx on schedule_items(family_member_id);

-- ---------------------------------------------------------------------------
-- Chores (recurring, point-earning)
-- ---------------------------------------------------------------------------
create table if not exists chores (
  id uuid primary key default gen_random_uuid(),
  family_member_id uuid not null references family_members(id) on delete cascade,
  title text not null,
  icon text not null default '🧹',
  points int not null default 5,
  days_of_week int[] not null default '{0,1,2,3,4,5,6}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists chores_member_idx on chores(family_member_id);

-- One row per chore per calendar date it was completed on.
create table if not exists chore_completions (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references chores(id) on delete cascade,
  completion_date date not null,
  completed_at timestamptz not null default now(),
  unique (chore_id, completion_date)
);

create index if not exists chore_completions_date_idx on chore_completions(completion_date);

-- ---------------------------------------------------------------------------
-- Rewards catalog + redemptions (points ledger is derived, not stored)
-- ---------------------------------------------------------------------------
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  family_member_id uuid references family_members(id) on delete cascade, -- null = available to everyone
  title text not null,
  icon text not null default '🎁',
  points_cost int not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references rewards(id) on delete cascade,
  family_member_id uuid not null references family_members(id) on delete cascade,
  points_spent int not null,
  redeemed_at timestamptz not null default now()
);

create index if not exists reward_redemptions_member_idx on reward_redemptions(family_member_id);

-- ---------------------------------------------------------------------------
-- Point balance view: lifetime chore points earned minus rewards redeemed.
-- ---------------------------------------------------------------------------
create or replace view point_balances as
select
  fm.id as family_member_id,
  fm.slug,
  fm.name,
  coalesce(earned.total, 0) - coalesce(spent.total, 0) as balance
from family_members fm
left join (
  select c.family_member_id, sum(c.points) as total
  from chore_completions cc
  join chores c on c.id = cc.chore_id
  group by c.family_member_id
) earned on earned.family_member_id = fm.id
left join (
  select family_member_id, sum(points_spent) as total
  from reward_redemptions
  group by family_member_id
) spent on spent.family_member_id = fm.id;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- This app has no login screen by design (it's meant to run on a shared
-- kitchen-wall tablet). RLS is enabled but left permissive for the anon key
-- so the app works out of the box. If you deploy this somewhere reachable
-- from outside your home network, tighten these policies (e.g. require a
-- Supabase Auth session, or put the deployment behind a private network /
-- basic auth) before relying on it.
-- ---------------------------------------------------------------------------
alter table family_members enable row level security;
alter table schedule_items enable row level security;
alter table chores enable row level security;
alter table chore_completions enable row level security;
alter table rewards enable row level security;
alter table reward_redemptions enable row level security;

drop policy if exists "allow all family_members" on family_members;
create policy "allow all family_members" on family_members for all using (true) with check (true);

drop policy if exists "allow all schedule_items" on schedule_items;
create policy "allow all schedule_items" on schedule_items for all using (true) with check (true);

drop policy if exists "allow all chores" on chores;
create policy "allow all chores" on chores for all using (true) with check (true);

drop policy if exists "allow all chore_completions" on chore_completions;
create policy "allow all chore_completions" on chore_completions for all using (true) with check (true);

drop policy if exists "allow all rewards" on rewards;
create policy "allow all rewards" on rewards for all using (true) with check (true);

drop policy if exists "allow all reward_redemptions" on reward_redemptions;
create policy "allow all reward_redemptions" on reward_redemptions for all using (true) with check (true);

-- Enable realtime on the tables the UI subscribes to for live cross-device sync.
alter publication supabase_realtime add table chore_completions;
alter publication supabase_realtime add table reward_redemptions;
alter publication supabase_realtime add table schedule_items;
alter publication supabase_realtime add table chores;
