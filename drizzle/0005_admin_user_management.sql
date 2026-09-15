-- CineTrack Admin User Management Migration: 0005_admin_user_management.sql

-- 1. Extend profiles table status constraint to include 'banned'
alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('active', 'suspended', 'banned'));

-- 2. Add moderation reason and status tracking columns to profiles
alter table public.profiles
  add column if not exists status_reason text,
  add column if not exists status_updated_at timestamptz,
  add column if not exists status_updated_by uuid references public.profiles(id) on delete set null;

-- 3. Create admin audit log table
create table if not exists public.admin_audit_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('suspend_user', 'restore_user', 'ban_user', 'unban_user', 'role_change')),
  reason text,
  metadata jsonb,
  created_at timestamptz default now() not null
);

create index if not exists admin_audit_logs_target_idx on public.admin_audit_logs(target_user_id);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs(created_at desc);

-- 4. Enable Row Level Security on admin_audit_logs
alter table public.admin_audit_logs enable row level security;
