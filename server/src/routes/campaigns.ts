import { Router } from 'express';
import { db } from '../db/index.js';

export const campaignsRouter = Router();

// GET /api/campaigns - List campaigns with filtering
campaignsRouter.get('/', (req, res) => {
  const { category, platform, status } = req.query as { category?: string; platform?: string; status?: string };
  const campaigns = db.getCampaigns({ category, platform, status });
  res.json({ success: true, count: campaigns.length, campaigns });
});

// GET /api/campaigns/:id - Get campaign details
campaignsRouter.get('/:id', (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }
  res.json({ success: true, campaign });
});

// POST /api/campaigns - Create a new campaign (or draft)
campaignsRouter.post('/', (req, res) => {
  const currentUser = db.getCurrentUser();
  const isAuthorized = currentUser.role === 'brand_owner' || currentUser.role === 'brand_admin' || currentUser.role === 'admin';
  if (!isAuthorized) {
    return res.status(403).json({ success: false, error: 'Forbidden: Only Brand Owners and Administrators can create campaigns' });
  }

  const {
    title,
    brandName,
    category,
    platform,
    format,
    description,
    requirements,
    rewardType,
    rewardAmount,
    spotsTotal,
    deadline,
    status = 'active',
    eligibleTiers = ['Elite Partner', 'Verified Pro'],
  } = req.body;

  if (!title || !category || !platform) {
    return res.status(400).json({ success: false, error: 'Missing required campaign fields (title, category, platform)' });
  }

  // Cross-brand access check: Brand owners can only create campaigns for their authorized brand
  if (currentUser.role !== 'admin' && currentUser.brandName) {
    const targetBrand = brandName || currentUser.brandName;
    if (targetBrand.toLowerCase() !== currentUser.brandName.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Forbidden: You cannot create campaigns for another brand' });
    }
  }

  try {
    const newCamp = db.createCampaign({
      title,
      brandName: brandName || currentUser.brandName || 'BrandWaves Partner',
      brandLogo: currentUser.avatar,
      category,
      platform,
      format: format || '9:16 Video',
      description: description || '',
      requirements: Array.isArray(requirements) ? requirements : ['High resolution video', 'Include product mention'],
      rewardType: rewardType || 'fixed',
      rewardAmount: rewardAmount || '$500 Fixed',
      spotsTotal: Number(spotsTotal) || 15,
      deadline: deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: status === 'draft' ? 'draft' : 'active',
      eligibleTiers,
    });

    res.status(201).json({ success: true, campaign: newCamp });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/campaigns/:id - Update campaign (publish, pause, edit)
campaignsRouter.put('/:id', (req, res) => {
  const currentUser = db.getCurrentUser();
  const isAuthorized = currentUser.role === 'brand_owner' || currentUser.role === 'brand_admin' || currentUser.role === 'admin';
  if (!isAuthorized) {
    return res.status(403).json({ success: false, error: 'Forbidden: Only Brand Owners and Administrators can edit campaigns' });
  }

  const existing = db.getCampaignById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  // Cross-brand access check: If user is not admin, cannot edit another brand's campaign
  if (currentUser.role !== 'admin' && currentUser.brandName) {
    if (existing.brandName.toLowerCase() !== currentUser.brandName.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'Forbidden: You cannot edit campaigns belonging to another brand' });
    }
  }

  try {
    const updated = db.updateCampaign(req.params.id, req.body);
    res.json({ success: true, campaign: updated });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});
