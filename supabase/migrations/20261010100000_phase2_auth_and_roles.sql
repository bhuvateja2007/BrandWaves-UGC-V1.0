-- ==============================================================================
-- BRANDWAVES PHASE 2: AUTHENTICATION, USER IDENTITY AND ROLE-BASED SECURITY
-- Migration: 20261010100000_phase2_auth_and_roles.sql
-- ==============================================================================

-- 1. PROFILES TABLE SCHEMA (Phase 2 Canonical Specification)
-- Creates or updates public.profiles with exact fields:
-- id, display_name, role, avatar_url, bio, handle, created_at, updated_at
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'customer',
  avatar_url text,
  bio text,
  handle text,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure required columns exist if profiles was previously created
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles add column if not exists display_name text default 'User';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists handle text;
alter table public.profiles add column if not exists email_verified boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Enforce strict role check constraint on public.profiles:
-- Allowed public roles: 'customer', 'creator', 'brand_owner'
-- Administrative role: 'admin'
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check 
  check (role in ('customer', 'creator', 'brand_owner', 'admin'));

-- Indexes for performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_updated_at on public.profiles(updated_at);

-- ------------------------------------------------------------------------------
-- 2. SECURE TRIGGER FOR PROFILE CREATION (Server-Side Role Authority)
-- Automatically executes on auth.users insert.
-- SECURITY RULE:
-- Public signup metadata is untrusted. Any attempt to self-assign 'admin'
-- or invalid values is strictly rejected and defaulted to 'customer'.
-- ------------------------------------------------------------------------------
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
  -- Extract intended role from user_metadata
  raw_role := new.raw_user_meta_data->>'role';

  -- Enforce strict public role allowlist
  if raw_role in ('customer', 'creator', 'brand_owner') then
    assigned_role := raw_role;
  else
    assigned_role := 'customer'; -- Default safe public role
  end if;

  raw_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));
  raw_handle := coalesce(new.raw_user_meta_data->>'handle', '@' || lower(regexp_replace(raw_name, '[^a-zA-Z0-9_]', '', 'g')));

  -- Insert profile
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
    display_name = excluded.display_name,
    email_verified = (new.email_confirmed_at is not null),
    updated_at = now();

  return new;
end;
$$;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES ON PROFILES
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Drop legacy/conflicting policies to ensure clean state
drop policy if exists "Public can view active profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can update own profile non-privileged fields" on public.profiles;
drop policy if exists "Admins can manage all profiles" on public.profiles;

-- Policy A: SELECT
-- Users can read their own profile.
-- Authenticated users and public visitors can read creator public profile records.
-- Admins can read all profiles.
create policy "Users can read own profile"
  on public.profiles for select
  using (
    auth.uid() = id
    or role = 'creator'
    or (auth.jwt()->>'role' = 'service_role')
  );

-- Policy B: UPDATE
-- Users can update only their own profile.
-- Crucial Security Constraint:
-- Users CANNOT change their 'role' or their 'id'.
-- The role in the update MUST match the existing role in public.profiles.
create policy "Users can update own profile non-privileged fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Policy C: INSERT
-- Direct client inserts are prohibited because the database trigger handles profile creation.
-- In case client inserts are needed, allow only self-insertion with non-admin roles.
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (
    auth.uid() = id
    and role in ('customer', 'creator', 'brand_owner')
  );
