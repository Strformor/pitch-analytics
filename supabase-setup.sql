-- Run this in your Supabase SQL Editor
create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  players jsonb not null,
  label text,
  created_at timestamptz default now()
);

-- Add defender + goalkeeper metric columns to player tables
alter table players_2526 add column if not exists fouls_committed integer;
alter table players_2526 add column if not exists challenges_won  integer;
alter table players_2526 add column if not exists key_passes      integer;
alter table players_2526 add column if not exists shots_saved     integer;
alter table players_2526 add column if not exists pass_accuracy   numeric;
alter table players_2526 add column if not exists clean_sheets    integer;

alter table players_2425 add column if not exists fouls_committed integer;
alter table players_2425 add column if not exists challenges_won  integer;
alter table players_2425 add column if not exists key_passes      integer;
alter table players_2425 add column if not exists shots_saved     integer;
alter table players_2425 add column if not exists pass_accuracy   numeric;
alter table players_2425 add column if not exists clean_sheets    integer;

-- Allow anonymous reads and inserts (public sharing)
alter table snapshots enable row level security;

create policy "anyone can insert" on snapshots
  for insert with check (true);

create policy "anyone can read" on snapshots
  for select using (true);
