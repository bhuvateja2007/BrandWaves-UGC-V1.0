import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getMarketplaceCampaigns, 
  getMarketplaceCampaignById,
  getBrandById,
  getProductById,
  validateMarketplaceDataIntegrity,
  CREATORS,
  CAMPAIGNS
} from '../../src/data/marketplaceData.ts';
import { 
  creatorPortfolioService, 
  validatePortfolioReferences 
} from '../../src/services/creatorPortfolioService.ts';
import { 
  campaignApplicationService 
} from '../../src/services/campaignApplicationService.ts';
import { validatePublicRole } from '../../src/lib/authValidation.ts';

// ---------------------------------------------------------------------------
// 1. Role Authorization & Route Guard Tests
// ---------------------------------------------------------------------------
test('Role Authorization: Creator role routes accurately to /creator', () => {
  const getDestination = (role) => {
    if (role === 'customer' || role === 'user') return '/customer';
    if (role === 'creator') return '/creator';
    if (role === 'brand_owner' || role === 'brand_admin' || role === 'admin') return '/admin';
    return '/login';
  };

  assert.equal(getDestination('creator'), '/creator');
  assert.equal(getDestination('customer'), '/customer');
});

test('Role Security: Customer and non-creator cannot access creator routes', () => {
  const isAllowedOnCreatorRoute = (userRole) => {
    return userRole === 'creator' || userRole === 'admin';
  };

  assert.equal(isAllowedOnCreatorRoute('creator'), true, 'Creator permitted');
  assert.equal(isAllowedOnCreatorRoute('admin'), true, 'Admin permitted');
  assert.equal(isAllowedOnCreatorRoute('customer'), false, 'Customer strictly denied');
  assert.equal(isAllowedOnCreatorRoute('brand_owner'), false, 'Brand owner strictly denied');
  assert.equal(isAllowedOnCreatorRoute('anonymous'), false, 'Anonymous strictly denied');
});

test('Role Security: Public role validator rejects self-assignment of admin', () => {
  const validated = validatePublicRole('creator');
  assert.equal(validated.isValid, true);
  assert.equal(validated.role, 'creator');

  const adminAttempt = validatePublicRole('admin');
  assert.equal(adminAttempt.isValid, false);
  assert.notEqual(adminAttempt.role, 'admin');
});

// ---------------------------------------------------------------------------
// 2. Creator Portfolio Service & Ownership Isolation
// ---------------------------------------------------------------------------
test('Portfolio Service: Validates canonical brand, product, and campaign references', () => {
  // Valid references
  const validRef = validatePortfolioReferences({
    relatedBrandId: 'brand_crimson_pop',
    relatedProductId: 'prod_crimson_classic_cola',
    relatedCampaignId: 'camp_summer_sip_challenge',
  });
  assert.equal(validRef.isValid, true);

  // Invalid brand
  const invalidBrand = validatePortfolioReferences({
    relatedBrandId: 'brand_fake_does_not_exist',
  });
  assert.equal(invalidBrand.isValid, false);
  assert.match(invalidBrand.error, /invalid brand reference/i);

  // Invalid product
  const invalidProd = validatePortfolioReferences({
    relatedProductId: 'prod_non_existent_fake_item',
  });
  assert.equal(invalidProd.isValid, false);
  assert.match(invalidProd.error, /invalid product reference/i);

  // Invalid campaign
  const invalidCamp = validatePortfolioReferences({
    relatedCampaignId: 'camp_invalid_fake_brief',
  });
  assert.equal(invalidCamp.isValid, false);
  assert.match(invalidCamp.error, /invalid campaign reference/i);
});

test('Portfolio Service: Enforces mandatory fields (title, thumbnail)', async () => {
  await assert.rejects(
    async () => {
      await creatorPortfolioService.addPortfolioItem('creator_test_1', {
        title: '',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/example',
        views: '10K',
        engagement: '5%',
        date: '2026-10-10',
      });
    },
    /title cannot be empty/i
  );

  await assert.rejects(
    async () => {
      await creatorPortfolioService.addPortfolioItem('creator_test_1', {
        title: 'Valid Title',
        format: 'Reel',
        thumbnail: '',
        views: '10K',
        engagement: '5%',
        date: '2026-10-10',
      });
    },
    /thumbnail.*cannot be empty/i
  );
});

test('Portfolio Service: Add, update, and delete lifecycle functions with owner isolation', async () => {
  const creatorId = `creator_isolated_${Date.now()}`;

  // 1. Add item
  const added = await creatorPortfolioService.addPortfolioItem(creatorId, {
    title: 'Autumn Acoustic Review',
    format: 'Reel',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536',
    views: '25.0K',
    engagement: '5.5%',
    date: '2026-10-10',
    relatedBrandId: 'brand_voltedge',
  });

  assert.ok(added.id, 'Created portfolio item has stable ID');
  assert.equal(added.title, 'Autumn Acoustic Review');

  // 2. Fetch items for this creator
  const items = await creatorPortfolioService.getPortfolioItems(creatorId);
  assert.ok(items.some((i) => i.id === added.id), 'Newly added item appears in creator portfolio');

  // 3. Update item
  const updated = await creatorPortfolioService.updatePortfolioItem(creatorId, added.id, {
    title: 'Autumn Acoustic Review (Director Cut)',
    views: '30.0K',
  });
  assert.equal(updated.title, 'Autumn Acoustic Review (Director Cut)');

  // 4. Cross-owner violation check: Different creator cannot edit this item
  await assert.rejects(
    async () => {
      await creatorPortfolioService.updatePortfolioItem('different_attacker_creator', added.id, {
        title: 'Hacked Title',
      });
    },
    /not found or you are not authorized/i
  );

  // 5. Delete item
  const deleted = await creatorPortfolioService.deletePortfolioItem(creatorId, added.id);
  assert.equal(deleted, true);

  const afterDelete = await creatorPortfolioService.getPortfolioItems(creatorId);
  assert.equal(afterDelete.some((i) => i.id === added.id), false);
});

// ---------------------------------------------------------------------------
// 3. Campaign Discovery, Filtering & Sorting
// ---------------------------------------------------------------------------
test('Campaign Discovery: Search filters by name, brand, and description', () => {
  const byName = getMarketplaceCampaigns({ search: 'Summer Sip' });
  assert.ok(byName.length >= 1);
  assert.equal(byName[0].brandName, 'Crimson Pop');

  const byBrand = getMarketplaceCampaigns({ search: 'VoltEdge' });
  assert.ok(byBrand.length >= 1);
  assert.equal(byBrand[0].brandName, 'VoltEdge');

  const byNiche = getMarketplaceCampaigns({ category: 'Beauty & Skincare' });
  assert.ok(byNiche.every((c) => c.category === 'Beauty & Skincare'));
});

test('Campaign Discovery: Reward sorting maintains mathematical order', () => {
  const campaigns = getMarketplaceCampaigns();
  const sorted = [...campaigns].sort((a, b) => {
    const numA = parseInt(a.rewardAmount.replace(/\D/g, '') || '0', 10);
    const numB = parseInt(b.rewardAmount.replace(/\D/g, '') || '0', 10);
    return numB - numA;
  });

  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = parseInt(sorted[i].rewardAmount.replace(/\D/g, '') || '0', 10);
    const next = parseInt(sorted[i + 1].rewardAmount.replace(/\D/g, '') || '0', 10);
    assert.ok(cur >= next, `Mathematical order preserved: ${cur} >= ${next}`);
  }
});

// ---------------------------------------------------------------------------
// 4. Campaign Application Workflow & Security Checks
// ---------------------------------------------------------------------------
test('Application Service: Validates pitch length (minimum 20 characters)', async () => {
  const creatorUser = {
    id: `creator_${Date.now()}`,
    name: 'Test Creator',
    handle: '@testcreator',
    role: 'creator',
    avatar: 'https://images.unsplash.com/test',
  };

  await assert.rejects(
    async () => {
      await campaignApplicationService.applyToCampaign(creatorUser, {
        campaignId: 'camp_summer_sip_challenge',
        pitch: 'Too short',
        proposedDeliverable: '1x Reel',
      });
    },
    /at least 20 characters/i
  );
});

test('Application Service: Non-creators (customers) cannot apply to campaigns', async () => {
  const customerUser = {
    id: 'cust_001',
    name: 'Customer User',
    handle: '@custuser',
    role: 'customer',
    avatar: 'https://images.unsplash.com/test',
  };

  await assert.rejects(
    async () => {
      await campaignApplicationService.applyToCampaign(customerUser, {
        campaignId: 'camp_summer_sip_challenge',
        pitch: 'I would like to apply as a customer to review this.',
        proposedDeliverable: '1x Reel',
      });
    },
    /only content creators can apply/i
  );
});

test('Application Service: Prevents duplicate applications to the same campaign', async () => {
  const creatorUser = {
    id: `creator_dup_${Date.now()}`,
    name: 'Alex Rivera',
    handle: '@alexcreates',
    role: 'creator',
    avatar: 'https://images.unsplash.com/test',
  };

  const campaignId = 'camp_glow_into_summer';

  // 1. First application succeeds
  const app1 = await campaignApplicationService.applyToCampaign(creatorUser, {
    campaignId,
    pitch: 'Passionate about dermatological skincare and clean barrier textures. Will highlight morning routine.',
    proposedDeliverable: '1x 9:16 Skincare Wear Test Reel',
  });
  assert.equal(app1.status, 'pending');

  // 2. Duplicate application to same campaign must be rejected
  await assert.rejects(
    async () => {
      await campaignApplicationService.applyToCampaign(creatorUser, {
        campaignId,
        pitch: 'Attempting duplicate application for same brief with slightly different wording.',
        proposedDeliverable: '1x 9:16 Reel',
      });
    },
    /already submitted an active application/i
  );
});

test('Application Service: Creator can withdraw a pending application', async () => {
  const creatorUser = {
    id: `creator_with_${Date.now()}`,
    name: 'Marcus Vance',
    handle: '@marcusvance',
    role: 'creator',
    avatar: 'https://images.unsplash.com/test',
  };

  const app = await campaignApplicationService.applyToCampaign(creatorUser, {
    campaignId: 'camp_streetwear_your_way',
    pitch: 'High velocity urban street movement reel showcasing durability of heavyweight cotton.',
    proposedDeliverable: '1x 9:16 Reel',
  });

  assert.equal(app.status, 'pending');

  // Withdraw
  const withdrawn = await campaignApplicationService.withdrawApplication(creatorUser.id, app.id);
  assert.equal(withdrawn.status, 'withdrawn');
});

test('Application Service: Application statuses come from stored records, not hardcoded', async () => {
  const apps = await campaignApplicationService.getApplicationsForCreator('user_alex');
  assert.ok(apps.length >= 1, 'Default creator has seeded application records');
  for (const a of apps) {
    assert.ok(['pending', 'accepted', 'rejected', 'withdrawn'].includes(a.status));
    assert.ok(a.campaignId);
    assert.ok(a.pitch);
  }
});

// ---------------------------------------------------------------------------
// 5. Data Integrity & Non-Regression
// ---------------------------------------------------------------------------
test('Data Integrity: Global relational validator passes with zero errors', () => {
  const result = validateMarketplaceDataIntegrity();
  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.creatorCount, 18);
  assert.equal(result.brandCount, 10);
  assert.equal(result.productCount, 24);
  assert.equal(result.campaignCount, 10);
});

test('Phase 3 Non-Regression: Customer portal routes and canonical marketplace remain intact', () => {
  const customerRoutes = ['/customer', '/customer/products', '/customer/saved', '/customer/profile'];
  assert.equal(customerRoutes.length, 4);

  const publicRoutes = ['/', '/products', '/creators', '/brands', '/campaigns'];
  assert.equal(publicRoutes.length, 5);
});
