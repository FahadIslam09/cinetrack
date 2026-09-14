-- CineTrack Notifications & Review Reactions Migration

-- 1. Review Reactions table
create table if not exists public.review_reactions (
  id uuid default gen_random_uuid() primary key,
  review_id uuid not null references public.user_media_logs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'like',
  created_at timestamptz default now() not null
);

create unique index if not exists review_reactions_user_unique_idx on public.review_reactions(review_id, user_id, type);
create index if not exists review_reactions_review_idx on public.review_reactions(review_id);

-- 2. User Notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz default now() not null
);

create index if not exists notifications_user_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(user_id, is_read);
create index if not exists notifications_created_idx on public.notifications(created_at desc);

-- 3. Row Level Security
alter table public.review_reactions enable row level security;
alter table public.notifications enable row level security;

-- Review Reactions policies
drop policy if exists "Public review reactions viewable" on public.review_reactions;
drop policy if exists "Authenticated users can insert reactions" on public.review_reactions;
drop policy if exists "Users can delete own reactions" on public.review_reactions;

create policy "Public review reactions viewable"
  on public.review_reactions
  for select
  using (true);

create policy "Authenticated users can insert reactions"
  on public.review_reactions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on public.review_reactions
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Notifications policies
drop policy if exists "Users can view own notifications" on public.notifications;
drop policy if exists "Users can update own notifications" on public.notifications;
drop policy if exists "Authenticated users can insert notifications" on public.notifications;

create policy "Users can view own notifications"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Authenticated users can insert notifications"
  on public.notifications
  for insert
  to authenticated
  with check (auth.uid() = actor_id);
