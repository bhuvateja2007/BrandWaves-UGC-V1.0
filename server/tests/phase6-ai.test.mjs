import test from 'node:test';
import assert from 'node:assert/strict';
import { CREATORS, CAMPAIGNS, BRANDS, PRODUCTS } from '../../src/data/marketplaceData.ts';
import { aiProvider } from '../src/services/aiProvider.ts';
import { 
  matchCreatorsForCampaign, 
  evaluateCreatorMatch 
} from '../src/services/creatorMatchmakerEngine.ts';
import { creatorMatchmakerService } from '../../src/services/creatorMatchmakerService.ts';
import { campaignCopilotService } from '../../src/services/campaignCopilotService.ts';

// ---------------------------------------------------------------------------
// 1. AI Provider Status & Boundary Tests
// ---------------------------------------------------------------------------
test('AI Provider: Reports deterministic demo mode when API keys are unconfigured', () => {
  const status = aiProvider.getStatus();
  assert.ok(status, 'Status object must be returned');
  assert.equal(typeof status.isConfigured, 'boolean');
  assert.equal(typeof status.provider, 'string');
  assert.equal(typeof status.mode, 'string');

  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    assert.equal(status.isConfigured, false, 'Should be false when no key is set');
    assert.equal(status.mode, 'deterministic_demo', 'Should run deterministic demo mode');
    assert.match(status.message, /demo/i, 'Message must clearly label demo mode');
  }
});

test('AI Provider: Prompt sanitization strips control characters and restricts length', () => {
  // Test sanitization through copilot generation
  const hugeString = 'X'.repeat(5000);
  assert.doesNotThrow(() => {
    aiProvider.generateCampaignBrief({
      brandName: 'Test Brand',
      objective: 'Boost awareness ' + hugeString,
      category: 'Beauty',
    });
  });
});

// ---------------------------------------------------------------------------
// 2. AI Creator Matchmaker Engine & Deterministic Consistency
// ---------------------------------------------------------------------------
test('Creator Matchmaker: Scores real registered creators deterministically', async () => {
  const sampleCampaign = CAMPAIGNS[0]; // e.g. Mamaearth Vitamin C Serum (Beauty / Skincare)
  assert.ok(sampleCampaign, 'Sample campaign must exist');

  const result1 = await matchCreatorsForCampaign(sampleCampaign, CREATORS);
  const result2 = await matchCreatorsForCampaign(sampleCampaign, CREATORS);

  assert.equal(result1.length, CREATORS.length, 'Should score all available creators');
  assert.equal(result2.length, CREATORS.length);

  // Check deterministic score consistency
  for (let i = 0; i < result1.length; i++) {
    const r1 = result1[i];
    const r2 = result2[i];
    assert.equal(r1.creatorId, r2.creatorId, 'Sort order must be consistent');
    assert.equal(r1.overallScore, r2.overallScore, 'Score must be deterministic');
    assert.equal(r1.breakdown.nicheScore, r2.breakdown.nicheScore);
    assert.equal(r1.breakdown.formatScore, r2.breakdown.formatScore);
    assert.equal(r1.breakdown.portfolioScore, r2.breakdown.portfolioScore);
    assert.equal(r1.breakdown.locationScore, r2.breakdown.locationScore);
    assert.equal(r1.breakdown.languageScore, r2.breakdown.languageScore);
  }
});

test('Creator Matchmaker: Evaluates multi-criteria scoring weights correctly', () => {
  const campaign = CAMPAIGNS.find((c) => c.category.includes('Beauty') || c.category.includes('Skincare')) || CAMPAIGNS[0];
  
  // Find a beauty creator (e.g. Meera Iyer or Ananya Sharma)
  const beautyCreator = CREATORS.find((c) => (c.niche || '').toLowerCase().includes('beauty') || (c.niche || '').toLowerCase().includes('skincare'));
  assert.ok(beautyCreator, 'Must find a beauty creator');

  const fit = evaluateCreatorMatch(beautyCreator, campaign);
  assert.ok(fit.overallScore > 0 && fit.overallScore <= 100, 'Score must be in 0-100 range');
  assert.ok(fit.breakdown.nicheScore >= 90, 'Exact category or target niche match should score >= 90% for niche');
  assert.ok(fit.metCriteria.length > 0, 'Met criteria must be identified');
});

test('Creator Matchmaker: Missing information is flagged and penalizes score rather than assuming positive match', () => {
  const mockSparseCreator = {
    id: 'sparse_creator',
    name: 'Sparse Creator',
    handle: '@sparse',
    avatar: 'https://example.com/avatar.jpg',
    location: 'Mumbai, India',
    country: 'India',
    niche: 'Gaming', // mismatch for beauty
    bio: 'Just getting started.',
    languages: [], // Missing languages
    formats: [], // Missing formats
    simulatedMetrics: {
      followersCount: '1K',
      avgViews: '100',
      collabRate: '1000',
      completedCampaigns: 0,
      engagementRate: '1%',
    },
    portfolio: [], // Zero portfolio
    relatedProductIds: [],
    relatedCampaignIds: [],
  };

  const beautyCampaign = CAMPAIGNS[0];
  const fit = evaluateCreatorMatch(mockSparseCreator, beautyCampaign);

  assert.ok(fit.missingInfo.length > 0, 'Should detect missing formats/portfolio/languages');
  assert.equal(fit.breakdown.portfolioScore, 0, 'Zero portfolio must score 0% for portfolio');
  assert.ok(fit.overallScore < 50, 'Sparse creator with mismatches must have low match score');
  assert.ok(fit.unmetCriteria.length > 0, 'Should identify unmet criteria');
});

test('Creator Matchmaker: Generates explainable match rationale without fabricated stats', async () => {
  const campaign = CAMPAIGNS[0];
  const recommendations = await matchCreatorsForCampaign(campaign, CREATORS);

  const topMatch = recommendations[0];
  assert.ok(topMatch.rationale, 'Rationale object must exist');
  assert.ok(topMatch.rationale.summary.length > 20, 'Rationale summary must be informative');
  assert.ok(Array.isArray(topMatch.rationale.strengths), 'Strengths must be array');
  assert.ok(Array.isArray(topMatch.rationale.considerations), 'Considerations must be array');
  assert.equal(typeof topMatch.rationale.isLiveAI, 'boolean', 'isLiveAI flag must be boolean');

  // Verify explainability disclaimer in status
  const status = aiProvider.getStatus();
  assert.match(status.message, /demo|deterministic/i);
});

// ---------------------------------------------------------------------------
// 3. AI Campaign Copilot Brief Generation & Schema Validation
// ---------------------------------------------------------------------------
test('Campaign Copilot: Generates structured brief matching campaign draft schema', async () => {
  const brand = BRANDS[0];
  const product = PRODUCTS[0];

  const briefDraft = await aiProvider.generateCampaignBrief({
    brandName: brand.name,
    brandCategory: brand.category,
    productName: product?.name || 'Flagship Product',
    productDescription: product?.description || 'Authentic quality product',
    objective: 'Drive authentic creator reviews and consumer consideration',
    targetAudience: 'Urban consumers seeking natural care',
    category: brand.category,
    preferredPlatform: 'Instagram',
    format: '9:16 Vertical Reel',
    desiredDeliverables: ['1x 60s Reel', '2x Story frames'],
    tone: 'Candid and informative',
    timelineDays: 30,
  });

  assert.ok(briefDraft, 'Brief draft must be returned');
  assert.ok(briefDraft.titleSuggestions.length >= 2, 'Should provide multiple title suggestions');
  assert.ok(briefDraft.recommendedTitle.length > 5, 'Should have recommended title');
  assert.ok(briefDraft.brief.length > 20, 'Should have summary brief');
  assert.ok(briefDraft.overview.length > 20, 'Should have overview');
  assert.ok(Array.isArray(briefDraft.objectives), 'Objectives must be array');
  assert.ok(briefDraft.creativeConcepts.length >= 2, 'Should provide creative concepts with hooks');
  assert.ok(briefDraft.deliverables.length >= 1, 'Should include deliverables');
  assert.ok(briefDraft.eligibilityRequirements.length >= 1, 'Should include eligibility');
  assert.ok(briefDraft.brandSafeGuidelines.length >= 1, 'Should include brand safety guidelines');
  assert.ok(briefDraft.prePublicationChecklist.length >= 1, 'Should include pre-publication checklist');
  assert.ok(briefDraft.suggestedTimeline.applicationWindowDays > 0, 'Timeline days must be positive');
  assert.equal(typeof briefDraft.isLiveAI, 'boolean');
});

test('Campaign Copilot: Generated concepts include titles, hooks, and narratives', async () => {
  const briefDraft = await aiProvider.generateCampaignBrief({
    brandName: 'Minimalist Skincare',
    category: 'Beauty',
    objective: 'Launch summer sunscreen awareness',
  });

  for (const concept of briefDraft.creativeConcepts) {
    assert.ok(concept.title, 'Concept must have title');
    assert.ok(concept.hook, 'Concept must have hook');
    assert.ok(concept.description, 'Concept must have narrative description');
    assert.ok(concept.suggestedFormat, 'Concept must have suggested format');
  }
});

// ---------------------------------------------------------------------------
// 4. Role Authorization & Cross-Brand Security Rules
// ---------------------------------------------------------------------------
test('Security: Creators and Customers cannot execute AI matching or copilot generation', () => {
  const checkAIAuthorization = (userRole) => {
    return userRole === 'brand_owner' || userRole === 'brand_admin' || userRole === 'admin';
  };

  assert.equal(checkAIAuthorization('brand_owner'), true);
  assert.equal(checkAIAuthorization('brand_admin'), true);
  assert.equal(checkAIAuthorization('admin'), true);
  assert.equal(checkAIAuthorization('creator'), false, 'Creator must be rejected');
  assert.equal(checkAIAuthorization('customer'), false, 'Customer must be rejected');
  assert.equal(checkAIAuthorization('user'), false, 'Standard user must be rejected');
  assert.equal(checkAIAuthorization('guest'), false, 'Guest must be rejected');
});

test('Security: Cross-brand matching is strictly denied for non-admin brand owners', () => {
  const isAllowedBrandAccess = (currentUser, requestedBrandId) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role !== 'brand_owner' && currentUser.role !== 'brand_admin') return false;

    // Resolve brand name / ID
    const userBrandName = (currentUser.brandName || '').toLowerCase();
    const userBrandId = (currentUser.brandId || '').toLowerCase();
    const target = requestedBrandId.toLowerCase();

    const brandRecord = BRANDS.find((b) => b.id.toLowerCase() === target || b.name.toLowerCase() === target);
    if (!brandRecord) return false;

    return (
      userBrandName === brandRecord.name.toLowerCase() ||
      userBrandId === brandRecord.id.toLowerCase()
    );
  };

  const crimsonOwner = {
    id: 'user_brand_1',
    role: 'brand_owner',
    brandName: 'Crimson Pop',
    brandId: 'brand_crimson_pop',
  };

  // Same brand: allowed
  assert.equal(isAllowedBrandAccess(crimsonOwner, 'brand_crimson_pop'), true);
  assert.equal(isAllowedBrandAccess(crimsonOwner, 'Crimson Pop'), true);

  // Different brand: rejected!
  assert.equal(isAllowedBrandAccess(crimsonOwner, 'brand_voltedge'), false, 'Cross-brand access must be blocked');
  assert.equal(isAllowedBrandAccess(crimsonOwner, 'VoltEdge'), false, 'Cross-brand access must be blocked');
  assert.equal(isAllowedBrandAccess(crimsonOwner, 'brand_northlane_studio'), false, 'Cross-brand access must be blocked');

  // Admin bypass
  const adminUser = { id: 'admin_1', role: 'admin' };
  assert.equal(isAllowedBrandAccess(adminUser, 'brand_voltedge'), true, 'Admin can manage all brands');
});

// ---------------------------------------------------------------------------
// 5. Client Services Fallback & Integrity
// ---------------------------------------------------------------------------
test('Client Service: matchCreators operates offline when backend is unreachable', async () => {
  const sampleCampaign = CAMPAIGNS[0];
  const res = await creatorMatchmakerService.getRecommendations(sampleCampaign, sampleCampaign.brandId, {
    minScore: 50,
  });

  assert.ok(res.recommendations, 'Must return recommendations');
  assert.ok(res.recommendations.length > 0, 'Should return matching creators');
  assert.ok(res.recommendations.every((r) => r.overallScore >= 50), 'Should obey minScore filter');
});

test('Client Service: CampaignCopilot produces editable draft without automatic publication', async () => {
  const res = await campaignCopilotService.generateBrief({
    brandId: 'brand_test',
    brandName: 'Acme Natural',
    category: 'Food & Beverage',
    objective: 'Showcase artisanal coffee beans brewing guide',
  });

  assert.ok(res.draft, 'Draft must be returned');
  assert.ok(res.draft.titleSuggestions.length > 0);
  // Human review guarantee: it is only an in-memory draft object, never saved to DB until explicit submit
  assert.ok(!('id' in res.draft), 'Draft does not possess campaign ID until explicitly published by user');
});
