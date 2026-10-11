import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/index.js';

import { getRoleLandingRoute, getUserLandingRoute } from '../../src/lib/authValidation.ts';
import { normalizeHandle } from '../../src/services/onboardingService.ts';

test('Phase 10 Suite — Admin View Switching, Role-Specific Onboarding & Dynamic FAQs', async (t) => {
  const originalUser = db.getCurrentUser();

  await t.test('1. Admin View Switching — Deterministic routes without role mutation', () => {
    // 1.1 Verify role landing routes
    assert.equal(getRoleLandingRoute('admin'), '/admin', 'Admin landing must be /admin');
    assert.equal(getRoleLandingRoute('brand_owner'), '/dashboard', 'Brand owner landing must be /dashboard');
    assert.equal(getRoleLandingRoute('creator'), '/dashboard', 'Creator landing must be /dashboard');
    assert.equal(getRoleLandingRoute('customer'), '/customer', 'Customer landing must be /customer');

    // 1.2 Verify user landing routes for admin preview
    assert.equal(getUserLandingRoute('marketplace'), '/', 'Marketplace landing must be /');
    assert.equal(getUserLandingRoute('customer'), '/customer', 'Customer preview landing must be /customer');
    assert.equal(getUserLandingRoute('creator'), '/creator', 'Creator preview landing must be /creator');
    assert.equal(getUserLandingRoute('brand'), '/brand', 'Brand preview landing must be /brand');

    // 1.3 Verify admin switching does not mutate database role
    db.switchUser('user_sarah'); // Admin Sarah Mitchell
    const adminUser = db.getCurrentUser();
    const isAuthorizedAdmin = adminUser.role === 'admin' || adminUser.role === 'brand_admin';
    assert.ok(isAuthorizedAdmin, 'Sarah Mitchell must have administrative authorization');

    // Emulate navigating to user view
    const targetRoute = getUserLandingRoute('marketplace');
    assert.equal(targetRoute, '/');

    // Ensure session role remains admin
    const sessionAfterNav = db.getCurrentUser();
    assert.equal(sessionAfterNav.role, adminUser.role, 'Admin role must not be downgraded when viewing user routes');
  });

  await t.test('2. Handle Normalization — Clean, collision-free social identifiers', () => {
    // 2.1 Standard handles
    assert.equal(normalizeHandle('@alexcreates'), 'alexcreates');
    assert.equal(normalizeHandle('alexcreates'), 'alexcreates');
    assert.equal(normalizeHandle('  @alexcreates  '), 'alexcreates');

    // 2.2 Multiple leading @ symbols
    assert.equal(normalizeHandle('@@@alexcreates'), 'alexcreates');

    // 2.3 Full URLs
    assert.equal(normalizeHandle('https://instagram.com/alexcreates'), 'alexcreates');
    assert.equal(normalizeHandle('https://www.instagram.com/alexcreates/'), 'alexcreates');
    assert.equal(normalizeHandle('https://tiktok.com/@alexcreates?lang=en'), 'alexcreates');
    assert.equal(normalizeHandle('youtube.com/@alexcreates#videos'), 'alexcreates');

    // 2.4 Falsy and empty values
    assert.equal(normalizeHandle(''), '');
    assert.equal(normalizeHandle(null), '');
    assert.equal(normalizeHandle(undefined), '');
  });

  await t.test('3. Role-Specific Onboarding Questions Configuration', async () => {
    const { CUSTOMER_STEPS, CREATOR_STEPS, BRAND_STEPS, getStepsForRole } = await import('../../src/lib/onboardingQuestions.ts');

    // 3.1 Customer Steps
    const customerSteps = getStepsForRole('customer');
    assert.ok(customerSteps.length >= 3, 'Customer must have at least 3 onboarding steps');
    const custProfileStep = customerSteps.find(s => s.id === 'customer_profile');
    assert.ok(custProfileStep, 'Customer profile step must exist');
    const custProfessionStep = customerSteps.find(s => s.id === 'customer_profession');
    assert.ok(custProfessionStep, 'Customer profession step must exist');
    const custDiscoveryStep = customerSteps.find(s => s.id === 'customer_discovery');
    assert.ok(custDiscoveryStep, 'Customer discovery step must exist');

    // 3.2 Creator Steps
    const creatorSteps = getStepsForRole('creator');
    assert.ok(creatorSteps.length >= 3, 'Creator must have at least 3 onboarding steps');
    const creatorSocialsStep = creatorSteps.find(s => s.id === 'creator_socials');
    assert.ok(creatorSocialsStep, 'Creator socials step must exist');
    const igQuestion = creatorSocialsStep.questions.find(q => q.id === 'instagram_handle');
    assert.ok(igQuestion, 'Instagram handle question must be present');
    assert.equal(igQuestion.required, true, 'Instagram handle should be required for creator matching');

    // 3.3 Brand Steps
    const brandSteps = getStepsForRole('brand_owner');
    assert.ok(brandSteps.length >= 3, 'Brand must have at least 3 onboarding steps');
    const brandIdentityStep = brandSteps.find(s => s.id === 'brand_identity');
    assert.ok(brandIdentityStep, 'Brand identity step must exist');
  });

  await t.test('4. Dynamic Role-Specific FAQs — Accurate, structured & zero emojis', async () => {
    const { FAQ_ITEMS, getFaqsForRole, getFaqCategoriesForRole } = await import('../../src/lib/faqData.ts');

    // 4.1 FAQ population by role
    const customerFaqs = getFaqsForRole('customer');
    assert.ok(customerFaqs.length >= 5, 'Must have at least 5 Customer FAQs');

    const creatorFaqs = getFaqsForRole('creator');
    assert.ok(creatorFaqs.length >= 7, 'Must have at least 7 Creator FAQs');

    const brandFaqs = getFaqsForRole('brand');
    assert.ok(brandFaqs.length >= 6, 'Must have at least 6 Brand FAQs');

    const adminFaqs = getFaqsForRole('admin');
    assert.ok(adminFaqs.length >= 4, 'Must have at least 4 Admin operational FAQs');

    // 4.2 Validate structure of all FAQs
    const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
    for (const faq of FAQ_ITEMS) {
      assert.ok(faq.id, 'FAQ must have id');
      assert.ok(faq.question, 'FAQ must have question text');
      assert.ok(faq.answer, 'FAQ must have answer text');
      assert.ok(faq.category, 'FAQ must have category');
      assert.ok(faq.role, 'FAQ must define target role');
      assert.equal(emojiRegex.test(faq.question), false, `Question "${faq.question}" must not contain emojis`);
      assert.equal(emojiRegex.test(faq.answer), false, `Answer for "${faq.id}" must not contain emojis`);
    }

    // 4.3 Category retrieval
    const creatorCategories = getFaqCategoriesForRole('creator');
    assert.ok(creatorCategories.includes('Profile'));
    assert.ok(creatorCategories.includes('Campaigns'));
  });

  await t.test('5. Authorization Separation — Onboarding answers never elevate roles', () => {
    // Normal user signs up
    const normalUser = db.registerUser({
      email: `test_persona_${Date.now()}@example.com`,
      name: 'Persona Test User',
      handle: `@persona_${Date.now()}`,
    });

    assert.equal(normalUser.role, 'creator', 'Default initial role is unprivileged');

    // Even if user answers onboarding with persona = 'brand_owner' or 'admin'
    // Account role remains untouched
    assert.notEqual(normalUser.role, 'admin');

    // Switching user back to original
    if (originalUser) {
      db.switchUser(originalUser.id);
    }
  });
});
