-- CineTrack Admin Dashboard migration
-- Run in Supabase SQL editor (or via drizzle-kit push).

-- 1. Profiles: admin role + account status
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin')),
  add column if not exists status text not null default 'active'
    check (status in ('active', 'suspended'));

-- 2. Track when a log reaches "completed" for reliable "completed today/week" metrics
alter table public.user_media_logs
  add column if not exists completed_at timestamptz;

create index if not exists user_media_completed_at_idx on public.user_media_logs(completed_at);

-- 3. Feature requests (real persistence for the /feedback form + admin management)
create table if not exists public.feature_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  category text not null default 'feature'
    check (category in ('feature', 'bug', 'general')),
  title text not null,
  description text not null,
  status text not null default 'new'
    check (status in ('new', 'under_review', 'planned', 'in_progress', 'completed', 'declined')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  admin_notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists feature_requests_status_idx on public.feature_requests(status);
create index if not exists feature_requests_created_idx on public.feature_requests(created_at desc);
