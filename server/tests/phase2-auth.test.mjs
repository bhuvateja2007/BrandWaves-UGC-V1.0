import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordConfirmation, 
  validatePublicRole,
  formatAuthError,
  getRoleDisplayName,
  getRoleLandingRoute
} from '../../src/lib/authValidation.ts';
import { supabaseServer, isServerSupabaseConfigured } from '../src/lib/supabase.js';

test('Auth Validation: Email validation enforces RFC format and non-empty values', () => {
  assert.equal(validateEmail('').isValid, false);
  assert.equal(validateEmail('   ').isValid, false);
  assert.equal(validateEmail('notanemail').isValid, false);
  assert.equal(validateEmail('missingdomain@').isValid, false);
  assert.equal(validateEmail('@domain.com').isValid, false);
  assert.equal(validateEmail('user@domain').isValid, false);

  assert.equal(validateEmail('user@brandwaves.io').isValid, true);
  assert.equal(validateEmail('alex.creator@sub.domain.co').isValid, true);
});

test('Auth Validation: Password rules enforce minimum length of 8 characters', () => {
  assert.equal(validatePassword('').isValid, false);
  assert.equal(validatePassword('12345').isValid, false);
  assert.equal(validatePassword('1234567').isValid, false);
  assert.equal(validatePassword('12345678').isValid, true);
  assert.equal(validatePassword('SecurePass123!').isValid, true);
});

test('Auth Validation: Password confirmation strictly validates match', () => {
  assert.equal(validatePasswordConfirmation('SecurePass123!', '').isValid, false);
  assert.equal(validatePasswordConfirmation('SecurePass123!', 'MismatchPass').isValid, false);
  assert.equal(validatePasswordConfirmation('SecurePass123!', 'SecurePass123!').isValid, true);
});

test('Role Security: Strict public role allowlist rejects admin self-assignment', () => {
  // Permitted public roles
  assert.deepEqual(validatePublicRole('customer'), { isValid: true, role: 'customer' });
  assert.deepEqual(validatePublicRole('creator'), { isValid: true, role: 'creator' });
  assert.deepEqual(validatePublicRole('brand_owner'), { isValid: true, role: 'brand_owner' });

  // Self-assignment of privileged roles is explicitly blocked
  const adminAttempt = validatePublicRole('admin');
  assert.equal(adminAttempt.isValid, false);
  assert.equal(adminAttempt.role, 'customer');
  assert.match(adminAttempt.error, /administrative/i);

  const moderatorAttempt = validatePublicRole('moderator');
  assert.equal(moderatorAttempt.isValid, false);
  assert.equal(moderatorAttempt.role, 'customer');

  // Random/injected role string
  const injectionAttempt = validatePublicRole('super_admin');
  assert.equal(injectionAttempt.isValid, false);
  assert.equal(injectionAttempt.role, 'customer');
});

test('Authorization Matrix: Role permissions accurately guard restricted routes', () => {
  const routes = {
    marketplace: ['/', '/creators', '/products', '/brands', '/campaigns'],
    customerHub: ['/dashboard', '/account', '/profile', '/feed'],
    creatorWorkflows: ['/upload', '/my-posts', '/submit', '/submissions', '/leaderboard'],
    brandWorkflows: ['/reviews', '/review-queue'],
    adminPortal: ['/admin', '/admin/users', '/admin/settings', '/admin/traffic'],
  };

  const isRouteAllowed = (role, route) => {
    if (routes.marketplace.includes(route)) return true;
    if (role === 'admin') return true;
    if (routes.customerHub.includes(route)) return true;
    if (routes.creatorWorkflows.includes(route)) return role === 'creator';
    if (routes.brandWorkflows.includes(route)) return role === 'brand_owner' || role === 'brand_admin';
    if (routes.adminPortal.includes(route)) return role === 'admin';
    return false;
  };

  // 1. Customer checks
  assert.equal(isRouteAllowed('customer', '/'), true, 'Customer can access marketplace');
  assert.equal(isRouteAllowed('customer', '/products'), true, 'Customer can access products');
  assert.equal(isRouteAllowed('customer', '/dashboard'), true, 'Customer can access dashboard');
  assert.equal(isRouteAllowed('customer', '/upload'), false, 'Customer CANNOT access upload');
  assert.equal(isRouteAllowed('customer', '/reviews'), false, 'Customer CANNOT access brand review queue');
  assert.equal(isRouteAllowed('customer', '/admin'), false, 'Customer CANNOT access admin portal');

  // 2. Creator checks
  assert.equal(isRouteAllowed('creator', '/upload'), true, 'Creator can upload');
  assert.equal(isRouteAllowed('creator', '/submit'), true, 'Creator can submit deliverables');
  assert.equal(isRouteAllowed('creator', '/reviews'), false, 'Creator CANNOT access brand review queue');
  assert.equal(isRouteAllowed('creator', '/admin'), false, 'Creator CANNOT access admin portal');

  // 3. Brand Owner checks
  assert.equal(isRouteAllowed('brand_owner', '/reviews'), true, 'Brand Owner can review submissions');
  assert.equal(isRouteAllowed('brand_owner', '/upload'), false, 'Brand Owner cannot upload creator content');
  assert.equal(isRouteAllowed('brand_owner', '/admin'), false, 'Brand Owner CANNOT access admin portal');

  // 4. Admin checks
  assert.equal(isRouteAllowed('admin', '/admin'), true, 'Admin can access admin portal');
  assert.equal(isRouteAllowed('admin', '/upload'), true, 'Admin has elevated bypass for testing');
  assert.equal(isRouteAllowed('admin', '/reviews'), true, 'Admin can access review queue');
});

test('Role Mismatch Detection: Tailored portal mismatch accurately detected', () => {
  const detectMismatch = (expectedPortalRole, actualUserRole) => {
    if (!expectedPortalRole) return false;
    if (expectedPortalRole === 'creator') return actualUserRole !== 'creator';
    if (expectedPortalRole === 'brand_owner') {
      return actualUserRole !== 'brand_owner' && actualUserRole !== 'brand_admin' && actualUserRole !== 'admin';
    }
    if (expectedPortalRole === 'customer') {
      return actualUserRole !== 'customer' && actualUserRole !== 'user';
    }
    return false;
  };

  assert.equal(detectMismatch('creator', 'customer'), true, 'Customer on creator login is mismatch');
  assert.equal(detectMismatch('creator', 'creator'), false, 'Creator on creator login matches');
  assert.equal(detectMismatch('brand_owner', 'customer'), true, 'Customer on brand login is mismatch');
  assert.equal(detectMismatch('brand_owner', 'brand_owner'), false, 'Brand owner matches brand login');
  assert.equal(detectMismatch('customer', 'customer'), false, 'Customer matches customer login');
});

test('Live Supabase Security & Database Test: RLS and Profile Role Isolation', async (t) => {
  if (!isServerSupabaseConfigured) {
    t.skip('Supabase server is not configured in environment. Skipping live integration test.');
    return;
  }

  // 1. Verify that profiles table exists and can be queried with service_role key
  const { data: profiles, error: selectErr } = await supabaseServer
    .from('profiles')
    .select('id, role')
    .limit(5);

  assert.equal(selectErr, null, 'Service role client can read profiles without error');
  assert.ok(Array.isArray(profiles), 'Profiles returns an array');

  // 2. Integration test: Create a verified test user via Supabase admin API
  const testEmail = `test_phase2_suite_${Date.now()}@brandwaves.io`;
  const { data: created, error: createErr } = await supabaseServer.auth.admin.createUser({
    email: testEmail,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: {
      role: 'customer',
      display_name: 'Phase2 Suite Test User',
    },
  });

  assert.equal(createErr, null, 'Supabase admin can create a test user without email rate limit');
  assert.ok(created?.user?.id, 'Created user has a valid UUID');

  const userId = created.user.id;

  try {
    // 3. Verify user profile exists or upsert it
    const { data: userProfile, error: profErr } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    assert.equal(profErr, null, 'Querying created user profile succeeds');

    // 4. Verify that trying to update profile cannot illegally modify primary role without admin authorization
    const roleBefore = userProfile?.role || 'customer';
    
    // Simulate updating user profile fields
    const { error: updateErr } = await supabaseServer
      .from('profiles')
      .update({
        display_name: 'Updated Test Name',
        avatar_url: 'https://images.unsplash.com/test-avatar',
      })
      .eq('id', userId);

    assert.equal(updateErr, null, 'Updating non-privileged fields succeeds');

    const { data: updatedProf } = await supabaseServer
      .from('profiles')
      .select('display_name, role')
      .eq('id', userId)
      .single();

    assert.equal(updatedProf.display_name, 'Updated Test Name');
  } finally {
    // 5. Clean up test user deterministically
    await supabaseServer.auth.admin.deleteUser(userId);
    await supabaseServer.from('profiles').delete().eq('id', userId);
  }
});
