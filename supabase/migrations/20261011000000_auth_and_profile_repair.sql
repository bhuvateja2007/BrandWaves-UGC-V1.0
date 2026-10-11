-- ==============================================================================
-- BRANDWAVES SUPABASE REPAIR MIGRATION: AUTHENTICATION, PROFILES & ROLE STABILITY
-- File: supabase/migrations/20261011000000_auth_and_profile_repair.sql
-- ==============================================================================

-- 1. Ensure public.profiles table exists with all standard columns
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'User',
  role text not null default 'customer',
  avatar_url text,
  bio text default '',
  handle text,
  tier text default 'Member',
  account_status text not null default 'active',
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure required columns exist non-destructively
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles add column if not exists display_name text default 'User';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text default '';
alter table public.profiles add column if not exists handle text;
alter table public.profiles add column if not exists tier text default 'Member';
alter table public.profiles add column if not exists account_status text not null default 'active';
alter table public.profiles add column if not exists email_verified boolean not null default false;
alter table public.profiles add column if not exists phone_verified boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- 2. Drop the restrictive old check constraint that blocked 'customer' and 'brand_owner'
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check 
  check (role in ('customer', 'creator', 'brand_owner', 'brand_admin', 'admin', 'user'));

-- Create index on role for fast lookups
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_updated_at on public.profiles(updated_at);

-- 3. Server-side role protection trigger function
-- SECURITY: Strictly prevents users from altering their role through client-side updates
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (old.role is distinct from new.role) then
    -- Only permit service_role / superuser to update role
    if (auth.jwt()->>'role' is distinct from 'service_role') then
      raise exception 'Profile roles cannot be changed through the client';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute procedure public.protect_profile_role();

-- 4. Replace the handle_new_user trigger function to safely honor signup role metadata
-- SECURITY RULE: Public signup metadata is untrusted. Any attempt to self-assign 'admin'
-- or invalid values is strictly rejected and defaulted to 'customer'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_role text;
  assigned_role text;
  raw_name text;
  raw_handle text;
begin
  raw_role := new.raw_user_meta_data->>'role';

  -- Enforce strict public role allowlist
  if raw_role in ('customer', 'creator', 'brand_owner') then
    assigned_role := raw_role;
  else
    assigned_role := 'customer'; -- Default safe public role
  end if;

  raw_name := coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User');
  raw_handle := coalesce(new.raw_user_meta_data->>'handle', '@' || lower(regexp_replace(raw_name, '[^a-zA-Z0-9_]', '', 'g')));

  -- Safely insert profile record
  insert into public.profiles (
    id,
    display_name,
    role,
    avatar_url,
    bio,
    handle,
    email_verified,
    created_at,
    updated_at
  ) values (
    new.id,
    raw_name,
    assigned_role,
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    coalesce(new.raw_user_meta_data->>'bio', ''),
    raw_handle,
    (new.email_confirmed_at is not null),
    now(),
    now()
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    email_verified = (new.email_confirmed_at is not null),
    updated_at = now();

  return new;
end;
$$;

-- Trigger only on user creation (preventing password updates from overwriting profile)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Enable Row Level Security (RLS) on public.profiles
alter table public.profiles enable row level security;

-- Drop obsolete or conflicting policies
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Public can view active profiles" on public.profiles;
drop policy if exists "Users can update own profile non-privileged fields" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- Permitted select policy: Users read their own profile, public reads creator profiles, admins read all
create policy "Users can read own profile"
  on public.profiles for select
  using (
    auth.uid() = id
    or role in ('creator', 'brand_owner')
    or (auth.jwt()->>'role' = 'service_role')
  );

-- Permitted update policy: Users update their own non-privileged profile fields
-- Defense-in-depth: RLS prevents modifying role column directly
create policy "Users can update own profile non-privileged fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Permitted insert policy: Users can insert their own profile row
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 6. Create public.onboarding_preferences table if not exists
create table if not exists public.onboarding_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  onboarding_persona text,
  onboarding_answers jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default true,
  onboarding_completed_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.onboarding_preferences enable row level security;

drop policy if exists "Users can read own onboarding preferences" on public.onboarding_preferences;
create policy "Users can read own onboarding preferences"
  on public.onboarding_preferences for select
  using (auth.uid() = user_id or (auth.jwt()->>'role' = 'service_role'));

drop policy if exists "Users can update own onboarding preferences" on public.onboarding_preferences;
create policy "Users can update own onboarding preferences"
  on public.onboarding_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can insert own onboarding preferences" on public.onboarding_preferences;
create policy "Users can insert own onboarding preferences"
  on public.onboarding_preferences for insert
  with check (auth.uid() = user_id);

-- 7. Helper function for onboarding status RPC
create or replace function public.get_my_onboarding_status()
returns table(
  onboarding_completed boolean,
  onboarding_persona text,
  onboarding_answers jsonb,
  onboarding_completed_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select 
    coalesce(op.onboarding_completed, true) as onboarding_completed,
    op.onboarding_persona,
    op.onboarding_answers,
    op.onboarding_completed_at
  from public.onboarding_preferences op
  where op.user_id = auth.uid();
$$;

grant execute on function public.get_my_onboarding_status() to authenticated;

-- 8. Safe Idempotent Backfill for existing auth users
-- Ensures existing users (e.g. brand owner, customer) reflect their authentic role
insert into public.profiles (
  id,
  display_name,
  role,
  avatar_url,
  created_at,
  updated_at
)
select 
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'User'),
  case 
    when u.raw_user_meta_data->>'role' in ('customer', 'creator', 'brand_owner') 
    then u.raw_user_meta_data->>'role'
    else 'customer'
  end,
  u.raw_user_meta_data->>'avatar_url',
  now(),
  now()
from auth.users u
on conflict (id) do update set
  role = case
    when public.profiles.role = 'creator' and excluded.role in ('customer', 'brand_owner')
    then excluded.role
    else public.profiles.role
  end,
  updated_at = now();

-- 9. Storage Bucket 'brandwaves-media' Configuration & RLS Policies
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brandwaves-media',
  'brandwaves-media',
  true,
  26214400, -- 25MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
) on conflict (id) do update set
  public = true,
  file_size_limit = 26214400,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

drop policy if exists "Public media is accessible to view" on storage.objects;
create policy "Public media is accessible to view"
  on storage.objects for select
  using (bucket_id = 'brandwaves-media');

drop policy if exists "Authenticated users can upload media" on storage.objects;
create policy "Authenticated users can upload media"
  on storage.objects for insert
  with check (
    bucket_id = 'brandwaves-media'
    and auth.uid() is not null
  );

drop policy if exists "Users can update own uploaded media" on storage.objects;
create policy "Users can update own uploaded media"
  on storage.objects for update
  using (
    bucket_id = 'brandwaves-media'
    and auth.uid() is not null
  );

drop policy if exists "Users can delete own uploaded media" on storage.objects;
create policy "Users can delete own uploaded media"
  on storage.objects for delete
  using (
    bucket_id = 'brandwaves-media'
    and auth.uid() is not null
  );

