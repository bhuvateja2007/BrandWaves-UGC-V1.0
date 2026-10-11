-- ==============================================================================
-- BRANDWAVES PRODUCTION SUPABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Hackathon: TyCity | Project: BrandWaves
-- ==============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  handle text unique not null,
  avatar_url text,
  bio text,
  tier text default 'Rising Star',
  account_status text not null default 'active' check (account_status in ('active', 'suspended', 'restricted')),
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for handle lookup
create index if not exists idx_profiles_handle on public.profiles(handle);
create index if not exists idx_profiles_status on public.profiles(account_status);

-- ------------------------------------------------------------------------------
-- 2. USER ROLES TABLE & SECURITY DEFINER HELPERS
-- ------------------------------------------------------------------------------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'moderator', 'brand_admin', 'creator', 'user')),
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_user_roles_role on public.user_roles(role);

-- Security Definer function to check roles without exposing table to client manipulation
create or replace function public.has_role(target_user_id uuid, check_role text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = target_user_id and role = check_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin');
$$;

create or replace function public.is_brand_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.has_role(auth.uid(), 'brand_admin') or public.has_role(auth.uid(), 'admin');
$$;

-- ------------------------------------------------------------------------------
-- 3. CAMPAIGNS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.campaigns (
  id text primary key default ('camp_' || substr(md5(random()::text), 1, 12)),
  owner_id uuid references auth.users(id) on delete set null,
  title text not null,
  brand_name text not null,
  brand_logo text,
  category text not null,
  platform text not null default 'TikTok',
  format text not null default '9:16 Vertical Video',
  description text not null,
  requirements jsonb not null default '[]'::jsonb,
  reward_type text not null default 'fixed' check (reward_type in ('fixed', 'rev_share', 'gifted_product')),
  reward_amount text not null,
  spots_total int not null default 10,
  spots_filled int not null default 0,
  deadline timestamptz not null,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'completed')),
  eligible_tiers jsonb not null default '["Elite Partner", "Verified Pro", "Rising Star"]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_campaigns_status on public.campaigns(status);
create index if not exists idx_campaigns_category on public.campaigns(category);
create index if not exists idx_campaigns_deadline on public.campaigns(deadline);

-- ------------------------------------------------------------------------------
-- 4. POSTS (COMMUNITY UGC FEED) TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  caption text,
  category text not null default 'General',
  media_storage_path text,
  media_url text not null,
  media_type text not null default 'video' check (media_type in ('image', 'video')),
  campaign_id text references public.campaigns(id) on delete set null,
  publication_status text not null default 'published' check (publication_status in ('published', 'draft', 'unpublished', 'moderated')),
  visibility text not null default 'public' check (visibility in ('public', 'private', 'restricted')),
  views_count int not null default 0,
  likes_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_author on public.posts(author_id);
create index if not exists idx_posts_pub_status on public.posts(publication_status);
create index if not exists idx_posts_visibility on public.posts(visibility);
create index if not exists idx_posts_created on public.posts(created_at desc);

-- ------------------------------------------------------------------------------
-- 5. SUBMISSIONS (BRAND CAMPAIGN REVIEW QUEUE) TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.submissions (
  id text primary key default ('sub_' || substr(md5(random()::text), 1, 12)),
  campaign_id text not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete cascade,
  platform text not null default 'TikTok',
  video_title text not null,
  video_url text not null,
  media_storage_path text,
  thumbnail text,
  duration text default '0:45',
  caption text,
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'revision_requested', 'rejected')),
  reviewer_notes text,
  reviewer_id uuid references auth.users(id) on delete set null,
  reviewer_name text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_submissions_creator on public.submissions(creator_id);
create index if not exists idx_submissions_campaign on public.submissions(campaign_id);
create index if not exists idx_submissions_status on public.submissions(status);
create index if not exists idx_submissions_created on public.submissions(created_at desc);

-- ------------------------------------------------------------------------------
-- 6. REPORTS TABLE (CONTENT & USER REPORTING)
-- ------------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'submission', 'user')),
  target_id text not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  action_taken text,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_reports_target on public.reports(target_type, target_id);

-- ------------------------------------------------------------------------------
-- 7. MODERATION ACTIONS (AUDIT LOGS) TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'submission', 'user', 'campaign')),
  target_id text not null,
  action text not null check (action in ('unpublish', 'republish', 'suspend_user', 'reinstate_user', 'approve_submission', 'reject_submission', 'request_revision', 'delete_post')),
  reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_moderation_actions_created on public.moderation_actions(created_at desc);

-- ------------------------------------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'approval', 'revision', 'submission', 'system')),
  read boolean not null default false,
  action_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_read on public.notifications(user_id, read);

-- ------------------------------------------------------------------------------
-- 9. USER REGISTRATION TRIGGER
-- ------------------------------------------------------------------------------
-- Automatically creates a public.profiles row and assigns default 'creator' role when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_name text;
  raw_handle text;
begin
  raw_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));
  raw_handle := coalesce(new.raw_user_meta_data->>'handle', '@' || lower(regexp_replace(raw_name, '[^a-zA-Z0-9_]', '', 'g')));

  -- Insert profile
  insert into public.profiles (
    id,
    display_name,
    handle,
    avatar_url,
    tier,
    account_status,
    email_verified,
    created_at,
    updated_at
  ) values (
    new.id,
    raw_name,
    raw_handle,
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
    'Rising Star',
    'active',
    (new.email_confirmed_at is not null),
    now(),
    now()
  ) on conflict (id) do update set
    email_verified = (new.email_confirmed_at is not null),
    updated_at = now();

  -- Assign default role 'creator'
  insert into public.user_roles (user_id, role)
  values (new.id, 'creator')
  on conflict do nothing;

  return new;
end;
$$;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS across ALL tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.campaigns enable row level security;
alter table public.posts enable row level security;
alter table public.submissions enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.notifications enable row level security;

-- PROFILES POLICIES
-- Anyone can view active public profiles
create policy "Public can view active profiles"
  on public.profiles for select
  using (account_status = 'active');

-- Users can update only their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and account_status = 'active');

-- Admins can view and update all profiles
create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin());

-- USER ROLES POLICIES
-- Users can only read their own role assignment
create policy "Users can read own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Only admins can manage roles
create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.is_admin());

-- CAMPAIGNS POLICIES
-- Public can view active campaigns
create policy "Public can view active campaigns"
  on public.campaigns for select
  using (status = 'active' or public.is_brand_admin());

-- Brand Admins and Admins can create and update campaigns
create policy "Brand Admins can create campaigns"
  on public.campaigns for insert
  with check (public.is_brand_admin());

create policy "Brand Admins can update own campaigns"
  on public.campaigns for update
  using (public.is_brand_admin());

-- POSTS (COMMUNITY FEED) POLICIES
-- Public can view published and public posts
create policy "Public can view published posts"
  on public.posts for select
  using (
    (publication_status = 'published' and visibility = 'public')
    or auth.uid() = author_id
    or public.is_admin()
  );

-- Authenticated users can insert posts as themselves
create policy "Users can create posts as themselves"
  on public.posts for insert
  with check (
    auth.uid() is not null 
    and auth.uid() = author_id
  );

-- Users can update or delete their own posts (unless unpublish-moderated by admin)
create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = author_id and publication_status != 'moderated')
  with check (auth.uid() = author_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- Admins can update or delete any post
create policy "Admins can moderate any post"
  on public.posts for all
  using (public.is_admin());

-- SUBMISSIONS POLICIES
-- Creators can view only their own submissions; Brand Admins / Admins view all
create policy "View submissions access"
  on public.submissions for select
  using (
    auth.uid() = creator_id 
    or public.is_brand_admin()
  );

-- Creators can insert their own submissions
create policy "Creators can insert own submissions"
  on public.submissions for insert
  with check (
    auth.uid() is not null 
    and auth.uid() = creator_id
  );

-- Creators can update own submissions when resubmitting (revision_requested -> pending)
create policy "Creators can resubmit"
  on public.submissions for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

-- Reviewers / Brand Admins can update submission review status
create policy "Brand Admins can review submissions"
  on public.submissions for update
  using (public.is_brand_admin());

-- REPORTS POLICIES
-- Users can submit reports
create policy "Users can insert reports"
  on public.reports for insert
  with check (auth.uid() is not null and auth.uid() = reporter_id);

-- Only admins can view and resolve reports
create policy "Admins can view and manage reports"
  on public.reports for all
  using (public.is_admin());

-- MODERATION ACTIONS POLICIES
-- Only admins can view or insert audit records
create policy "Admins can view moderation actions"
  on public.moderation_actions for select
  using (public.is_admin());

create policy "Admins can insert moderation actions"
  on public.moderation_actions for insert
  with check (public.is_admin());

-- NOTIFICATIONS POLICIES
-- Users can read and update only their own notifications
create policy "Users manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 11. STORAGE BUCKET CREATION & POLICIES (brandwaves-media)
-- ------------------------------------------------------------------------------
-- Storage bucket for community UGC and campaign deliverables
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brandwaves-media',
  'brandwaves-media',
  true,
  26214400, -- 25MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
) on conflict (id) do update set
  file_size_limit = 26214400,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

-- Storage RLS policies
create policy "Public media is accessible to view"
  on storage.objects for select
  using (bucket_id = 'brandwaves-media');

create policy "Authenticated users can upload to their user folder"
  on storage.objects for insert
  with check (
    bucket_id = 'brandwaves-media'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = ('user-' || auth.uid()::text)
  );

create policy "Users can delete own uploaded media"
  on storage.objects for delete
  using (
    bucket_id = 'brandwaves-media'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = ('user-' || auth.uid()::text)
  );

create policy "Admins can manage all storage media"
  on storage.objects for all
  using (
    bucket_id = 'brandwaves-media'
    and public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 12. REALTIME REPLICATION ENABLEMENT
-- ------------------------------------------------------------------------------
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.submissions;
alter publication supabase_realtime add table public.notifications;
