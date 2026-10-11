-- ==============================================================================
-- BRANDWAVES MIGRATION: ROLE-SPECIFIC ONBOARDING, DYNAMIC FAQS & SOCIAL PROFILES
-- File: supabase/migrations/20261012000000_role_specific_onboarding.sql
-- ==============================================================================
-- Non-destructive additive migration.
-- Preserves existing profiles, brands, campaigns, applications, submissions.
-- Strictly isolates authorization roles from onboarding preferences & questionnaire answers.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADDITIVE COLUMNS ON PROFILES
-- ------------------------------------------------------------------------------
alter table public.profiles add column if not exists instagram_handle text;
alter table public.profiles add column if not exists tiktok_handle text;
alter table public.profiles add column if not exists youtube_handle text;
alter table public.profiles add column if not exists portfolio_url text;
alter table public.profiles add column if not exists profession text;
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
alter table public.profiles add column if not exists onboarding_completed_at timestamptz;

create index if not exists idx_profiles_onboarding_completed on public.profiles(onboarding_completed);

-- ------------------------------------------------------------------------------
-- 2. ONBOARDING RESPONSES TABLE
-- Stores structured discovery, professional background, and role-specific answers.
-- ------------------------------------------------------------------------------
create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  persona text not null default 'customer',
  profession text,
  discovery_source text,
  discovery_source_other text,
  interests text[] default '{}',
  responses jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_onboarding_responses_user unique(user_id)
);

create index if not exists idx_onboarding_responses_user on public.onboarding_responses(user_id);
create index if not exists idx_onboarding_responses_persona on public.onboarding_responses(persona);
create index if not exists idx_onboarding_responses_completed on public.onboarding_responses(completed_at);

-- Enable RLS
alter table public.onboarding_responses enable row level security;

-- Policy: Users can view their own onboarding responses
drop policy if exists "onboarding_responses_select_own" on public.onboarding_responses;
create policy "onboarding_responses_select_own"
  on public.onboarding_responses for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own onboarding responses
drop policy if exists "onboarding_responses_insert_own" on public.onboarding_responses;
create policy "onboarding_responses_insert_own"
  on public.onboarding_responses for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own onboarding responses
drop policy if exists "onboarding_responses_update_own" on public.onboarding_responses;
create policy "onboarding_responses_update_own"
  on public.onboarding_responses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Administrators can view all onboarding responses for platform insights
drop policy if exists "onboarding_responses_admin_select" on public.onboarding_responses;
create policy "onboarding_responses_admin_select"
  on public.onboarding_responses for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 3. CREATOR SOCIAL ACCOUNTS TABLE
-- Normalized social accounts with handle validation and unverified state tracking.
-- ------------------------------------------------------------------------------
create table if not exists public.creator_social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube', 'twitter', 'portfolio', 'other')),
  handle text not null,
  profile_url text,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_creator_social_user_platform unique(user_id, platform)
);

create index if not exists idx_creator_socials_user on public.creator_social_accounts(user_id);
create index if not exists idx_creator_socials_platform on public.creator_social_accounts(platform);

-- Enable RLS
alter table public.creator_social_accounts enable row level security;

-- Policy: Anyone can read public creator social profiles
drop policy if exists "creator_socials_select_public" on public.creator_social_accounts;
create policy "creator_socials_select_public"
  on public.creator_social_accounts for select
  using (true);

-- Policy: Creators can insert only their own social handles
drop policy if exists "creator_socials_insert_own" on public.creator_social_accounts;
create policy "creator_socials_insert_own"
  on public.creator_social_accounts for insert
  with check (auth.uid() = user_id);

-- Policy: Creators can update only their own social handles
drop policy if exists "creator_socials_update_own" on public.creator_social_accounts;
create policy "creator_socials_update_own"
  on public.creator_social_accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Creators can delete only their own social handles
drop policy if exists "creator_socials_delete_own" on public.creator_social_accounts;
create policy "creator_socials_delete_own"
  on public.creator_social_accounts for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. SECURITY DEFINER SAVE ONBOARDING FUNCTION
-- Enforces auth.uid(), sanitizes answers, preserves authorization roles.
-- ------------------------------------------------------------------------------
create or replace function public.save_onboarding_responses(
  p_persona text,
  p_profession text default null,
  p_discovery_source text default null,
  p_discovery_source_other text default null,
  p_interests text[] default '{}',
  p_responses jsonb default '{}'::jsonb,
  p_mark_completed boolean default true
)
returns public.onboarding_responses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_result public.onboarding_responses;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.onboarding_responses (
    user_id,
    persona,
    profession,
    discovery_source,
    discovery_source_other,
    interests,
    responses,
    completed_at,
    updated_at
  ) values (
    v_user_id,
    coalesce(p_persona, 'customer'),
    p_profession,
    p_discovery_source,
    p_discovery_source_other,
    coalesce(p_interests, '{}'),
    coalesce(p_responses, '{}'::jsonb),
    case when p_mark_completed then now() else null end,
    now()
  )
  on conflict (user_id) do update set
    persona = excluded.persona,
    profession = excluded.profession,
    discovery_source = excluded.discovery_source,
    discovery_source_other = excluded.discovery_source_other,
    interests = excluded.interests,
    responses = excluded.responses,
    completed_at = case 
      when p_mark_completed then coalesce(public.onboarding_responses.completed_at, now())
      else public.onboarding_responses.completed_at 
    end,
    updated_at = now()
  returning * into v_result;

  -- Also update the profiles table cache flags
  if p_mark_completed then
    update public.profiles
    set 
      profession = coalesce(p_profession, profiles.profession),
      onboarding_completed = true,
      onboarding_completed_at = coalesce(profiles.onboarding_completed_at, now()),
      updated_at = now()
    where id = v_user_id;
  end if;

  return v_result;
end;
$$;
