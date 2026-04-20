-- Run this in your Supabase SQL Editor
create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  players jsonb not null,
  label text,
  created_at timestamptz default now()
);

-- Allow anonymous reads and inserts (public sharing)
alter table snapshots enable row level security;

create policy "anyone can insert" on snapshots
  for insert with check (true);

create policy "anyone can read" on snapshots
  for select using (true);
