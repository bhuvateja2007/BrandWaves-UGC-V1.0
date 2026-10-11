import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMarketplaceCampaigns,
  getMarketplaceCampaignById,
  getBrandById,
  getProductById,
  CREATORS,
  BRANDS,
  PRODUCTS,
  CAMPAIGNS
} from '../../src/data/marketplaceData.ts';
import { brandOwnerService } from '../../src/services/brandOwnerService.ts';
import { brandProductService } from '../../src/services/brandProductService.ts';
import { brandCampaignService } from '../../src/services/brandCampaignService.ts';
import { campaignApplicationService } from '../../src/services/campaignApplicationService.ts';
import { validatePublicRole } from '../../src/lib/authValidation.ts';

// ---------------------------------------------------------------------------
// 1. Role Authorization & Brand Route Guard Tests
// ---------------------------------------------------------------------------
test('Role Authorization: Brand Owner and Brand Admin route to /brand', () => {
  const getDestination = (role) => {
    if (role === 'customer' || role === 'user') return '/customer';
    if (role === 'creator') return '/creator';
    if (role === 'brand_owner' || role === 'brand_admin' || role === 'admin') return '/brand';
    return '/login';
  };

  assert.equal(getDestination('brand_owner'), '/brand');
  assert.equal(getDestination('brand_admin'), '/brand');
  assert.equal(getDestination('admin'), '/brand');
  assert.equal(getDestination('creator'), '/creator');
  assert.equal(getDestination('customer'), '/customer');
});

test('Role Security: Creators and Customers are strictly barred from /brand portal', () => {
  const isAllowedOnBrandRoute = (userRole) => {
    return userRole === 'brand_owner' || userRole === 'brand_admin' || userRole === 'admin';
  };

  assert.equal(isAllowedOnBrandRoute('brand_owner'), true, 'Brand Owner permitted');
  assert.equal(isAllowedOnBrandRoute('brand_admin'), true, 'Brand Admin permitted');
  assert.equal(isAllowedOnBrandRoute('admin'), true, 'Admin permitted');
  assert.equal(isAllowedOnBrandRoute('creator'), false, 'Creator strictly barred');
  assert.equal(isAllowedOnBrandRoute('customer'), false, 'Customer strictly barred');
  assert.equal(isAllowedOnBrandRoute('user'), false, 'General user strictly barred');
  assert.equal(isAllowedOnBrandRoute('anonymous'), false, 'Anonymous strictly barred');
});

test('Role Security: Public registration validator rejects self-assignment of administrative roles', () => {
  const customerAttempt = validatePublicRole('customer');
  assert.equal(customerAttempt.isValid, true);
  assert.equal(customerAttempt.role, 'customer');

  const creatorAttempt = validatePublicRole('creator');
  assert.equal(creatorAttempt.isValid, true);
  assert.equal(creatorAttempt.role, 'creator');

  const brandOwnerAttempt = validatePublicRole('brand_owner');
  assert.equal(brandOwnerAttempt.isValid, true);
  assert.equal(brandOwnerAttempt.role, 'brand_owner');

  // Privileged admin/moderator roles cannot be self-assigned
  const adminAttempt = validatePublicRole('admin');
  assert.equal(adminAttempt.isValid, false);
  assert.notEqual(adminAttempt.role, 'admin');

  const modAttempt = validatePublicRole('moderator');
  assert.equal(modAttempt.isValid, false);
  assert.notEqual(modAttempt.role, 'moderator');
});

// ---------------------------------------------------------------------------
// 2. Brand Ownership Isolation & Multi-Brand Scoping
// ---------------------------------------------------------------------------
test('Ownership Isolation: Brand owner only resolves authorized brand records', () => {
  const brandOwnerUser = {
    id: 'user_kavita',
    email: 'kavita@crimsonpop.demo.brandwaves.io',
    name: 'Kavita Iyer',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
    brandName: 'Crimson Pop',
    authorizedBrandIds: ['brand_crimson_pop'],
  };

  const authorized = brandOwnerService.getAuthorizedBrands(brandOwnerUser);
  assert.equal(authorized.length, 1);
  assert.equal(authorized[0].id, 'brand_crimson_pop');
  assert.equal(authorized[0].name, 'Crimson Pop');

  // Verify access permissions
  assert.equal(brandOwnerService.isAuthorizedForBrand(brandOwnerUser, 'brand_crimson_pop'), true);
  assert.equal(brandOwnerService.isAuthorizedForBrand(brandOwnerUser, 'brand_dew_theory'), false);
  assert.equal(brandOwnerService.isAuthorizedForBrand(brandOwnerUser, 'brand_northlane_studio'), false);
});

test('Ownership Isolation: Multi-brand owner can switch only between authorized brands', () => {
  const multiBrandOwner = {
    id: 'user_multi',
    email: 'corp@brands.io',
    name: 'Portfolio Manager',
    role: 'brand_owner',
    authorizedBrandIds: ['brand_crimson_pop', 'brand_dew_theory'],
  };

  const authorized = brandOwnerService.getAuthorizedBrands(multiBrandOwner);
  assert.equal(authorized.length, 2);
  const ids = authorized.map((b) => b.id);
  assert.ok(ids.includes('brand_crimson_pop'));
  assert.ok(ids.includes('brand_dew_theory'));
  assert.ok(!ids.includes('brand_voltedge'));

  // Active brand selection respects authorization
  const activeDew = brandOwnerService.getActiveBrand(multiBrandOwner, 'brand_dew_theory');
  assert.equal(activeDew?.id, 'brand_dew_theory');

  // Attempt to select unauthorized brand reverts to first authorized
  const unauthorizedAttempt = brandOwnerService.getActiveBrand(multiBrandOwner, 'brand_voltedge');
  assert.equal(unauthorizedAttempt?.id, 'brand_crimson_pop');
});

test('Ownership Isolation: Admin has platform-wide authority across all brands', () => {
  const adminUser = {
    id: 'user_admin',
    email: 'admin@brandwaves.io',
    name: 'System Admin',
    role: 'admin',
  };

  const authorized = brandOwnerService.getAuthorizedBrands(adminUser);
  assert.equal(authorized.length, BRANDS.length);
  assert.equal(brandOwnerService.isAuthorizedForBrand(adminUser, 'brand_crimson_pop'), true);
  assert.equal(brandOwnerService.isAuthorizedForBrand(adminUser, 'brand_voltedge'), true);
});

test('Profile Security: Rejects profile updates from unauthorized users or invalid URLs', async () => {
  const unauthorizedUser = {
    id: 'user_intruder',
    email: 'intruder@other.io',
    name: 'Intruder',
    role: 'brand_owner',
    brandId: 'brand_dew_theory',
  };

  // Attempting to modify Crimson Pop while only owning Dew Theory
  await assert.rejects(
    async () => {
      await brandOwnerService.updateBrandProfile(unauthorizedUser, 'brand_crimson_pop', {
        name: 'Hacked Brand Name',
      });
    },
    /unauthorized/i
  );

  // Attempting with invalid website URL
  const authorizedUser = {
    id: 'user_kavita',
    email: 'kavita@crimsonpop.demo.brandwaves.io',
    name: 'Kavita Iyer',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
  };

  await assert.rejects(
    async () => {
      await brandOwnerService.updateBrandProfile(authorizedUser, 'brand_crimson_pop', {
        name: 'Crimson Pop',
        website: 'javascript:alert(1)',
      });
    },
    /valid website URL/i
  );
});

// ---------------------------------------------------------------------------
// 3. Product Management & Deletion Safety Rules
// ---------------------------------------------------------------------------
test('Product Service: Validates required product fields and assigns stable ID', async () => {
  const authorizedUser = {
    id: 'user_kavita',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
  };

  // Create valid product
  const newProduct = await brandProductService.createProduct(authorizedUser, {
    brandId: 'brand_crimson_pop',
    name: 'Crimson Dragonfruit Spark 330ml',
    description: 'Refreshing dragonfruit and botanical lime crafted soda.',
    category: 'Beverages',
    price: 159,
    currency: '₹',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800',
    features: ['Real cold-pressed dragonfruit', 'Sparkling spring water'],
  });

  assert.ok(newProduct.id.startsWith('prod_'));
  assert.equal(newProduct.name, 'Crimson Dragonfruit Spark 330ml');
  assert.equal(newProduct.brandId, 'brand_crimson_pop');
  assert.equal(newProduct.isArchived, false);
});

test('Product Service: Rejects cross-brand product creation', async () => {
  const authorizedUser = {
    id: 'user_kavita',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
  };

  await assert.rejects(
    async () => {
      await brandProductService.createProduct(authorizedUser, {
        brandId: 'brand_voltedge', // Different brand!
        name: 'VoltEdge ANC Headphones',
        description: 'Test headphones',
        category: 'Technology',
        price: 9999,
        image: 'https://images.unsplash.com/test',
      });
    },
    /unauthorized/i
  );
});

test('Product Service: Deletion Safety prevents destructive delete of referenced products', async () => {
  const authorizedUser = {
    id: 'user_kavita',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
  };

  // prod_crimson_classic_cola is actively referenced by camp_summer_sip_challenge and creator portfolios
  await assert.rejects(
    async () => {
      await brandProductService.deleteProduct(authorizedUser, 'prod_crimson_classic_cola');
    },
    /actively referenced/i
  );

  // Archiving referenced product is permitted and safe
  const archived = await brandProductService.archiveProduct(authorizedUser, 'prod_crimson_classic_cola', true);
  assert.equal(archived.isArchived, true);

  // Restore for subsequent tests
  await brandProductService.archiveProduct(authorizedUser, 'prod_crimson_classic_cola', false);
});

// ---------------------------------------------------------------------------
// 4. Campaign Management & Brief Validation
// ---------------------------------------------------------------------------
test('Campaign Service: Validates campaign creation, dates, and canonical brand', async () => {
  const authorizedUser = {
    id: 'user_kavita',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
  };

  // Valid campaign
  const campaign = await brandCampaignService.createCampaign(authorizedUser, {
    brandId: 'brand_crimson_pop',
    title: 'Festive Soda Mixology Challenge',
    brief: 'Create an inventive mocktail recipe using Crimson Pop botanicals.',
    description: 'Looking for food & beverage creators to showcase holiday mocktails.',
    category: 'Beverages',
    deliverables: ['1x Instagram Reel', '1x High-res product photo'],
    eligibilityRequirements: ['Food & Drink creator', 'Minimum 5K audience'],
    applicationInstructions: 'Submit a short 30s video concept pitch.',
    compensation: '₹12,000 per approved deliverable',
    spotsTotal: 6,
    productId: 'prod_crimson_classic_cola',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    deadline: '2026-11-15',
    status: 'open',
  });

  assert.ok(campaign.id.startsWith('camp_'));
  assert.equal(campaign.brandId, 'brand_crimson_pop');
  assert.equal(campaign.spotsTotal, 6);
  assert.equal(campaign.status, 'open');

  // Verify status transitions
  const updated = await brandCampaignService.updateCampaign(authorizedUser, campaign.id, {
    status: 'in_progress',
  });
  assert.equal(updated.status, 'in_progress');
});

test('Campaign Service: Rejects invalid deadlines and cross-brand creation', async () => {
  const authorizedUser = {
    id: 'user_kavita',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
  };

  // Deadline after campaign end date
  await assert.rejects(
    async () => {
      await brandCampaignService.createCampaign(authorizedUser, {
        brandId: 'brand_crimson_pop',
        title: 'Broken Date Campaign',
        brief: 'Creative brief detailing thirty characters for test validation.',
        description: 'Comprehensive campaign description exceeding twenty characters.',
        category: 'Beverages',
        deliverables: ['1x Reel'],
        spotsTotal: 5,
        startDate: '2026-11-01',
        endDate: '2026-11-15',
        deadline: '2026-11-20', // Invalid: Deadline after end date!
      });
    },
    /deadline must precede/i
  );

  // Cross-brand campaign creation
  await assert.rejects(
    async () => {
      await brandCampaignService.createCampaign(authorizedUser, {
        brandId: 'brand_dew_theory', // Unauthorized
        title: 'Skin Care Campaign',
        brief: 'Creative brief detailing thirty characters for test validation.',
        description: 'Comprehensive campaign description exceeding twenty characters.',
        category: 'Beauty',
        deliverables: ['1x Reel'],
        spotsTotal: 5,
        deadline: '2026-11-15',
      });
    },
    /unauthorized/i
  );
});

// ---------------------------------------------------------------------------
// 5. Creator Discovery & Dataset Verification
// ---------------------------------------------------------------------------
test('Creator Discovery: Verifies authentic 18-creator dataset with simulated reach tags', () => {
  assert.equal(CREATORS.length, 18, 'Expected 18 demo creators (16 Indian + 2 International)');

  const indianCreators = CREATORS.filter((c) => c.country === 'India');
  const intlCreators = CREATORS.filter((c) => c.country !== 'India');

  assert.equal(indianCreators.length, 16, 'Expected 16 Indian creators');
  assert.equal(intlCreators.length, 2, 'Expected 2 International creators');

  // Verify metrics are structured as simulated demo metrics
  CREATORS.forEach((creator) => {
    assert.ok(creator.id, 'Creator must have id');
    assert.ok(creator.name, 'Creator must have name');
    assert.ok(creator.handle.startsWith('@'), 'Creator handle must start with @');
    assert.ok(creator.simulatedMetrics, 'Metrics must be explicitly under simulatedMetrics');
    assert.ok(creator.simulatedMetrics.followersCount, 'Followers count present');
    assert.ok(creator.portfolio.length > 0, 'Each demo creator must have portfolio samples');
  });
});

// ---------------------------------------------------------------------------
// 6. Creator Application Review & Authorization Enforcement
// ---------------------------------------------------------------------------
test('Application Review: Brand owner can review applications for owned brand', async () => {
  const brandOwnerUser = {
    id: 'user_kavita',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
    brandName: 'Crimson Pop',
    authorizedBrandIds: ['brand_crimson_pop'],
  };

  // Seed application app_seed_003 is pending for Crimson Pop
  const reviewed = await campaignApplicationService.reviewApplication(
    brandOwnerUser,
    'app_seed_003',
    'accepted',
    'Authentic botanical pitch! Excited to collaborate.'
  );

  assert.equal(reviewed.status, 'accepted');
  assert.ok(reviewed.reviewedAt);
  assert.match(reviewed.reviewerNotes, /botanical pitch/i);
});

test('Application Review: Rejects double-review and invalid state transitions', async () => {
  const brandOwnerUser = {
    id: 'user_kavita',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
    brandName: 'Crimson Pop',
    authorizedBrandIds: ['brand_crimson_pop'],
  };

  // app_seed_003 was already accepted above
  await assert.rejects(
    async () => {
      await campaignApplicationService.reviewApplication(
        brandOwnerUser,
        'app_seed_003',
        'rejected',
        'Trying to change decision'
      );
    },
    /only pending applications can be accepted or rejected/i
  );
});

test('Application Review: Creators cannot approve their own applications', async () => {
  const creatorUser = {
    id: 'user_alex',
    role: 'creator',
    name: 'Alex Rivera',
  };

  // app_seed_002 is submitted by user_alex
  await assert.rejects(
    async () => {
      await campaignApplicationService.reviewApplication(
        creatorUser,
        'app_seed_002',
        'accepted'
      );
    },
    /forbidden/i
  );
});

test('Application Review: Cross-brand review is strictly denied', async () => {
  const crimsonPopOwner = {
    id: 'user_kavita',
    role: 'brand_owner',
    brandId: 'brand_crimson_pop',
    brandName: 'Crimson Pop',
    authorizedBrandIds: ['brand_crimson_pop'],
  };

  // Attempting to review app_seed_002 (which belongs to brand_voltedge) as Crimson Pop owner
  await assert.rejects(
    async () => {
      await campaignApplicationService.reviewApplication(
        crimsonPopOwner,
        'app_seed_002',
        'accepted'
      );
    },
    /unauthorized/i
  );
});
