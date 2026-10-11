import { Router } from 'express';
import { db } from '../db/index.js';
import { aiProvider } from '../services/aiProvider.js';
import { matchCreatorsForCampaign } from '../services/creatorMatchmakerEngine.js';
import { CREATORS, CAMPAIGNS, BRANDS } from '../../../src/data/marketplaceData';
import { MarketplaceCampaign, Brand } from '../../../src/types/marketplace';

export const aiRouter = Router();

// GET /api/ai/status - Check configured AI provider status
aiRouter.get('/status', (req, res) => {
  const status = aiProvider.getStatus();
  res.json({ success: true, status });
});

// POST /api/ai/match-creators - AI Creator Matchmaker
aiRouter.post('/match-creators', async (req, res) => {
  const currentUser = db.getCurrentUser();
  const isAuthorizedRole =
    currentUser.role === 'brand_owner' ||
    currentUser.role === 'brand_admin' ||
    currentUser.role === 'admin';

  if (!isAuthorizedRole) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only Brand Owners and Administrators can access the AI Creator Matchmaker',
    });
  }

  const { campaignId, campaign: clientCampaign, brandId, filters } = req.body;

  if (!brandId) {
    return res.status(400).json({ success: false, error: 'brandId is required' });
  }

  // Cross-brand access check
  if (currentUser.role !== 'admin' && currentUser.brandName) {
    const brandRecord = BRANDS.find((b) => b.id === brandId);
    const targetBrandName = brandRecord ? brandRecord.name : brandId;
    if (targetBrandName.toLowerCase() !== currentUser.brandName.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot request creator matching for another brand',
      });
    }
  }

  // Resolve target campaign
  let targetCampaign: MarketplaceCampaign | undefined;

  if (campaignId) {
    targetCampaign = CAMPAIGNS.find((c) => c.id === campaignId);
    if (!targetCampaign) {
      // Fallback: check if client provided campaign data with matching ID
      if (clientCampaign && clientCampaign.id === campaignId) {
        targetCampaign = clientCampaign;
      }
    }
  } else if (clientCampaign) {
    targetCampaign = clientCampaign;
  }

  if (!targetCampaign) {
    return res.status(404).json({
      success: false,
      error: 'Campaign brief not found. Please provide a valid campaignId or campaign object.',
    });
  }

  // Verify campaign belongs to brand
  if (targetCampaign.brandId !== brandId && currentUser.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: The selected campaign does not belong to your authorized brand',
    });
  }

  try {
    const recommendations = await matchCreatorsForCampaign(targetCampaign, CREATORS, filters);
    const aiStatus = aiProvider.getStatus();

    res.json({
      success: true,
      campaignId: targetCampaign.id,
      campaignTitle: targetCampaign.title,
      count: recommendations.length,
      recommendations,
      aiStatus,
    });
  } catch (err: any) {
    console.error('[AIRouter] Matchmaker evaluation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to evaluate creator matches' });
  }
});

// POST /api/ai/generate-brief - AI Campaign Copilot
aiRouter.post('/generate-brief', async (req, res) => {
  const currentUser = db.getCurrentUser();
  const isAuthorizedRole =
    currentUser.role === 'brand_owner' ||
    currentUser.role === 'brand_admin' ||
    currentUser.role === 'admin';

  if (!isAuthorizedRole) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only Brand Owners and Administrators can use the AI Campaign Copilot',
    });
  }

  const {
    brandId,
    brandName,
    productName,
    productDescription,
    objective,
    targetAudience,
    category,
    preferredPlatform,
    format,
    desiredDeliverables,
    tone,
    compensation,
    restrictions,
    timelineDays,
  } = req.body;

  if (!brandId) {
    return res.status(400).json({ success: false, error: 'brandId is required' });
  }
  if (!objective || objective.trim().length < 5) {
    return res.status(400).json({
      success: false,
      error: 'Campaign objective is required (minimum 5 characters)',
    });
  }
  if (!category) {
    return res.status(400).json({ success: false, error: 'category is required' });
  }

  // Cross-brand access check
  if (currentUser.role !== 'admin' && currentUser.brandName) {
    const brandRecord = BRANDS.find((b) => b.id === brandId);
    const targetBrandName = brandName || (brandRecord ? brandRecord.name : brandId);
    if (targetBrandName.toLowerCase() !== currentUser.brandName.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot generate campaign briefs for another brand',
      });
    }
  }

  try {
    const resolvedBrand = BRANDS.find((b) => b.id === brandId);
    const finalBrandName = brandName || resolvedBrand?.name || 'Brand';

    const draft = await aiProvider.generateCampaignBrief({
      brandName: finalBrandName,
      brandCategory: resolvedBrand?.category,
      productName,
      productDescription,
      objective,
      targetAudience,
      category,
      preferredPlatform,
      format,
      desiredDeliverables,
      tone,
      compensation,
      restrictions,
      timelineDays,
    });

    const aiStatus = aiProvider.getStatus();

    res.json({
      success: true,
      draft,
      aiStatus,
    });
  } catch (err: any) {
    console.error('[AIRouter] Copilot brief generation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to generate campaign brief' });
  }
});
