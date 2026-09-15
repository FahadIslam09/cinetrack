-- CineTrack Distributed Rate Limiting Migration
-- Run in Supabase SQL editor or via drizzle-kit push

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  reset_at timestamptz not null
);

create index if not exists rate_limits_reset_at_idx on public.rate_limits (reset_at);

-- Enable Row Level Security (RLS)
-- Server-side Drizzle connects directly via DATABASE_URL; no anon/authenticated PostgREST policies are granted.
alter table public.rate_limits enable row level security;
