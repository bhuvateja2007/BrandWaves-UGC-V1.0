-- ==============================================================================
-- BRANDWAVES MIGRATION: USER ONBOARDING TABLE, ROLE PROTECTION & AUTH REPAIR
-- File: supabase/migrations/20261012100000_user_onboarding_and_auth_repair.sql
-- ==============================================================================
-- Non-destructive, idempotent migration.
-- Preserves existing profile records, campaigns, applications, and reviews.
-- Strictly maintains Row Level Security (RLS) across all tables.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER ONBOARDING TABLE
-- Stores multi-step persona, progress steps, and questionnaire answers per user.
-- ------------------------------------------------------------------------------
create table if not exists public.user_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  persona text not null default 'customer',
  answers jsonb not null default '{}'::jsonb,
  onboarding_status text not null default 'in_progress' check (onboarding_status in ('in_progress', 'completed', 'abandoned')),
  current_step integer not null default 1,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices for efficient lookup
create index if not exists idx_user_onboarding_persona on public.user_onboarding(persona);
create index if not exists idx_user_onboarding_status on public.user_onboarding(onboarding_status);
create index if not exists idx_user_onboarding_completed_at on public.user_onboarding(completed_at);

-- Enable RLS
alter table public.user_onboarding enable row level security;

-- Policy: Authenticated users can read only their own onboarding answers
drop policy if exists "user_onboarding_select_own" on public.user_onboarding;
create policy "user_onboarding_select_own"
  on public.user_onboarding for select
  using (auth.uid() = user_id or (auth.jwt()->>'role' = 'service_role'));

-- Policy: Authenticated users can insert their own onboarding record
drop policy if exists "user_onboarding_insert_own" on public.user_onboarding;
create policy "user_onboarding_insert_own"
  on public.user_onboarding for insert
  with check (auth.uid() = user_id);

-- Policy: Authenticated users can update only their own onboarding record
drop policy if exists "user_onboarding_update_own" on public.user_onboarding;
create policy "user_onboarding_update_own"
  on public.user_onboarding for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Platform administrators can view onboarding progress for operational auditing
drop policy if exists "user_onboarding_admin_select" on public.user_onboarding;
create policy "user_onboarding_admin_select"
  on public.user_onboarding for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 2. ROLE INTEGRITY & PRIVILEGE ELEVATION DEFENSE
-- ------------------------------------------------------------------------------
-- Ensure prevent_unauthorized_role_change exists and is enforced
create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (old.role is distinct from new.role) then
    -- Strictly prohibit client-side role modifications
    if (auth.jwt()->>'role' is distinct from 'service_role') then
      raise exception 'Profile roles cannot be modified through the client';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_unauthorized_role_change on public.profiles;
create trigger prevent_unauthorized_role_change
  before update on public.profiles
  for each row execute procedure public.prevent_unauthorized_role_change();

-- ------------------------------------------------------------------------------
-- 3. IDEMPOTENT NEW USER TRIGGER WITH METADATA SANITIZATION
-- Prevents self-promotion to admin, sets safe display_name, seeds user_onboarding
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
  raw_role := new.raw_user_meta_data->>'role';

  -- Enforce strict public role allowlist
  -- Brand applicants are initialized safely as brand_owner with pending status
  if raw_role in ('customer', 'creator', 'brand_owner') then
    assigned_role := raw_role;
  else
    assigned_role := 'customer'; -- Default safe public fallback
  end if;

  -- Safe fallback for missing or blank display names
  raw_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1),
    'User'
  );

  -- Safe social handle derived from display name or email prefix
  raw_handle := coalesce(
    nullif(trim(new.raw_user_meta_data->>'handle'), ''),
    '@' || lower(regexp_replace(raw_name, '[^a-zA-Z0-9_]', '', 'g'))
  );

  -- Idempotently insert into public.profiles
  insert into public.profiles (
    id,
    display_name,
    role,
    avatar_url,
    bio,
    handle,
    account_status,
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
    case when assigned_role = 'brand_owner' then 'pending' else 'active' end,
    (new.email_confirmed_at is not null),
    now(),
    now()
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    email_verified = (new.email_confirmed_at is not null),
    updated_at = now();

  -- Seed initial user_onboarding progress row
  insert into public.user_onboarding (
    user_id,
    persona,
    answers,
    onboarding_status,
    current_step,
    created_at,
    updated_at
  ) values (
    new.id,
    assigned_role,
    '{}'::jsonb,
    'in_progress',
    1,
    now(),
    now()
  )
  on conflict (user_id) do update set
    persona = excluded.persona,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. NON-RECURSIVE PROFILE POLICIES
-- Review and ensure policies are strictly non-recursive
-- ------------------------------------------------------------------------------
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (
    auth.uid() = id
    or role in ('creator', 'brand_owner')
    or (auth.jwt()->>'role' = 'service_role')
  );

drop policy if exists "Users can update own profile non-privileged fields" on public.profiles;
create policy "Users can update own profile non-privileged fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 5. IDEMPOTENT BACKFILL OF USER_ONBOARDING
-- Ensures existing users have a corresponding user_onboarding row
-- ------------------------------------------------------------------------------
insert into public.user_onboarding (
  user_id,
  persona,
  answers,
  onboarding_status,
  current_step,
  completed_at,
  created_at,
  updated_at
)
select 
  p.id,
  case 
    when p.role in ('creator', 'brand_owner', 'customer') then p.role 
    else 'customer' 
  end,
  '{}'::jsonb,
  case when p.onboarding_completed then 'completed' else 'in_progress' end,
  1,
  p.onboarding_completed_at,
  now(),
  now()
from public.profiles p
on conflict (user_id) do nothing;
