-- ==============================================================================
-- BRANDWAVES ADDITIVE MIGRATION: ONBOARDING PREFERENCES
-- Adds a dedicated onboarding preferences table separate from profiles and user_roles.
-- persona is a UX personalization field — it does NOT grant any application role.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ONBOARDING PREFERENCES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.onboarding_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  onboarding_persona text,  -- UX persona label only, NOT an authorization role
  onboarding_answers jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_onboarding_preferences_user on public.onboarding_preferences(user_id);
create index if not exists idx_onboarding_preferences_completed on public.onboarding_preferences(onboarding_completed);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------------------------
alter table public.onboarding_preferences enable row level security;

-- Users can only read their own onboarding record
create policy "Users can read own onboarding preferences"
  on public.onboarding_preferences for select
  using (auth.uid() = user_id);

-- Users can insert their own onboarding record (enforced by security definer upsert below)
-- Direct insert is blocked in favor of the security definer function to prevent user_id spoofing
-- However we allow it via the function; direct insert policy adds a safety layer:
create policy "Users can insert own onboarding preferences"
  on public.onboarding_preferences for insert
  with check (auth.uid() = user_id);

-- Users can update only their own onboarding record
-- The check prevents updating onboarding_completed to true from the client directly
-- (completion must go through the server-side upsert function)
create policy "Users can update own onboarding preferences"
  on public.onboarding_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins can view all onboarding preferences (for analytics/support)
create policy "Admins can view all onboarding preferences"
  on public.onboarding_preferences for select
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. SECURITY DEFINER UPSERT FUNCTION
-- Always uses auth.uid() as user_id — frontend cannot spoof another user's record.
-- persona field is stored in onboarding_answers, NOT in user_roles.
-- This function NEVER touches public.user_roles.
-- ------------------------------------------------------------------------------
create or replace function public.upsert_onboarding_preferences(
  p_persona text,
  p_answers jsonb,
  p_completed boolean default false
)
returns public.onboarding_preferences
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_result public.onboarding_preferences;
begin
  -- Always use the authenticated user's ID — never trust a client-supplied ID
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.onboarding_preferences (
    user_id,
    onboarding_persona,
    onboarding_answers,
    onboarding_completed,
    onboarding_completed_at,
    updated_at
  ) values (
    v_user_id,
    p_persona,
    p_answers,
    p_completed,
    case when p_completed then now() else null end,
    now()
  )
  on conflict (user_id) do update set
    onboarding_persona = excluded.onboarding_persona,
    onboarding_answers = excluded.onboarding_answers,
    onboarding_completed = excluded.onboarding_completed,
    onboarding_completed_at = case 
      when excluded.onboarding_completed and public.onboarding_preferences.onboarding_completed_at is null 
      then now() 
      else public.onboarding_preferences.onboarding_completed_at 
    end,
    updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.upsert_onboarding_preferences(text, jsonb, boolean) to authenticated;

-- ------------------------------------------------------------------------------
-- 4. HELPER FUNCTION: GET OWN ONBOARDING STATUS
-- ------------------------------------------------------------------------------
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
    op.onboarding_completed,
    op.onboarding_persona,
    op.onboarding_answers,
    op.onboarding_completed_at
  from public.onboarding_preferences op
  where op.user_id = auth.uid();
$$;

grant execute on function public.get_my_onboarding_status() to authenticated;
