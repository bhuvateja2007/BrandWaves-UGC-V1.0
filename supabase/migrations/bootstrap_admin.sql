-- ==============================================================================
-- BRANDWAVES SECURE ADMIN BOOTSTRAP SCRIPT
-- Run this in the Supabase SQL Editor to grant admin role to a designated operator.
-- Replace 'operator@brandwaves.io' with your actual registered administrator email.
-- ==============================================================================

do $$
declare
  target_email text := 'admin@brandwaves.io'; -- Replace with your operator email
  target_user_id uuid;
begin
  -- Lookup target user id from auth.users
  select id into target_user_id from auth.users where email = target_email;

  if target_user_id is null then
    raise notice 'User with email % not found. Please register this account first.', target_email;
  else
    -- Assign admin role
    insert into public.user_roles (user_id, role)
    values (target_user_id, 'admin')
    on conflict (user_id, role) do nothing;

    -- Also assign brand_admin role for dual portal testing
    insert into public.user_roles (user_id, role)
    values (target_user_id, 'brand_admin')
    on conflict (user_id, role) do nothing;

    -- Update profile tier to Senior Strategist / Admin
    update public.profiles
    set tier = 'Platform Administrator',
        account_status = 'active',
        email_verified = true,
        updated_at = now()
    where id = target_user_id;

    raise notice 'Successfully granted admin permissions to user % (ID: %)', target_email, target_user_id;
  end if;
end;
$$;
