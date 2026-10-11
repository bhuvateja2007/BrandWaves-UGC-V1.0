import { Router } from 'express';
import { db } from '../db/index.js';
import { evaluateSubmission } from '../services/smartReviewEngine.js';
import { CAMPAIGNS } from '../../../src/data/marketplaceData';

export const submissionsRouter = Router();

// GET /api/submissions - List submissions with filtering
submissionsRouter.get('/', (req, res) => {
  const { status, platform, creatorId, campaignId } = req.query as {
    status?: string;
    platform?: string;
    creatorId?: string;
    campaignId?: string;
  };

  const submissions = db.getSubmissions({ status, platform, creatorId, campaignId });
  res.json({ success: true, count: submissions.length, submissions });
});

// GET /api/submissions/creator - Get submissions for the authenticated creator
submissionsRouter.get('/creator', (req, res) => {
  const currentUser = db.getCurrentUser();
  const { status, platform } = req.query as { status?: string; platform?: string };
  const submissions = db.getSubmissions({ status, platform, creatorId: currentUser.id });
  res.json({ success: true, count: submissions.length, submissions });
});

// GET /api/submissions/:id - Get submission details with ownership enforcement
submissionsRouter.get('/:id', (req, res) => {
  const currentUser = db.getCurrentUser();
  const sub = db.getSubmissionById(req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, error: 'Submission not found' });
  }

  // Security Rule: Creators can access only their own submissions
  if (currentUser.role === 'creator' && sub.creatorId !== currentUser.id) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: You can access only your own permitted submissions',
    });
  }

  // Security Rule: Brand Owners can view submissions only for their authorized brand
  if (
    (currentUser.role === 'brand_owner' || currentUser.role === 'brand_admin') &&
    currentUser.brandName
  ) {
    if (sub.brandName.toLowerCase() !== currentUser.brandName.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot access submissions belonging to another brand',
      });
    }
  }

  res.json({ success: true, submission: sub });
});

// POST /api/submissions - Create a new submission (Creator)
submissionsRouter.post('/', (req, res) => {
  const currentUser = db.getCurrentUser();
  if (currentUser.role !== 'creator') {
    return res.status(403).json({ success: false, error: 'Only Creators can submit deliverables' });
  }

  const {
    campaignId,
    platform,
    videoUrl,
    videoTitle,
    thumbnail,
    duration,
    caption,
    tags,
  } = req.body;

  if (!campaignId || !videoUrl || !videoTitle) {
    return res.status(400).json({ success: false, error: 'campaignId, videoUrl, and videoTitle are required' });
  }

  // Validate URL format
  if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
    return res.status(400).json({ success: false, error: 'videoUrl must be a valid HTTP/HTTPS URL' });
  }

  try {
    const newSub = db.createSubmission({
      campaignId,
      platform: platform || 'TikTok',
      videoUrl,
      videoTitle,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1483721074577-83a378a49459?auto=format&fit=crop&w=600&q=80',
      duration: duration || '0:30',
      caption: caption || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({ success: true, submission: newSub });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/submissions/:id/smart-review - Run Structured Smart Submission Review
submissionsRouter.post('/:id/smart-review', async (req, res) => {
  const currentUser = db.getCurrentUser();
  const isAuthorized =
    currentUser.role === 'brand_owner' ||
    currentUser.role === 'brand_admin' ||
    currentUser.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only Brand Owners and Administrators can execute smart submission reviews',
    });
  }

  const sub = db.getSubmissionById(req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, error: 'Submission not found' });
  }

  // Cross-brand access check
  if (currentUser.role !== 'admin' && currentUser.brandName) {
    if (sub.brandName.toLowerCase() !== currentUser.brandName.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot evaluate deliverables belonging to another brand',
      });
    }
  }

  // Resolve Campaign Brief
  let campaign = db.getCampaign(sub.campaignId);
  if (!campaign) {
    campaign = CAMPAIGNS.find((c) => c.id === sub.campaignId) as any;
  }

  if (!campaign) {
    return res.status(404).json({
      success: false,
      error: 'Target campaign brief not found for this deliverable',
    });
  }

  try {
    const smartReview = await evaluateSubmission(sub, campaign);
    db.saveSubmissionSmartReview(sub.id, smartReview);
    res.json({ success: true, smartReview });
  } catch (err: any) {
    console.error('[SubmissionsRouter] Smart review error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to complete smart review evaluation',
    });
  }
});

// PUT /api/submissions/:id/review - Review submission (Brand Admin / Brand Owner)
submissionsRouter.put('/:id/review', (req, res) => {
  const currentUser = db.getCurrentUser();
  const isAuthorized =
    currentUser.role === 'brand_owner' ||
    currentUser.role === 'brand_admin' ||
    currentUser.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only Brand Owners and Administrators can review submissions',
    });
  }

  const sub = db.getSubmissionById(req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, error: 'Submission not found' });
  }

  // Rule: Creators cannot review or approve their own submissions
  if (sub.creatorId === currentUser.id) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Creators cannot review or approve their own submissions',
    });
  }

  // Cross-brand access check: If not platform admin, reviewer must own the submission's brand
  if (currentUser.role !== 'admin' && currentUser.brandName) {
    if (sub.brandName.toLowerCase() !== currentUser.brandName.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You cannot review submissions belonging to another brand',
      });
    }
  }

  const { status, reviewerNotes, smartReview } = req.body;
  if (!status || !['approved', 'revision_requested', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be approved, revision_requested, or rejected',
    });
  }

  try {
    const reviewed = db.reviewSubmission(req.params.id, {
      status,
      reviewerNotes: reviewerNotes || `Submission marked as ${status} by ${currentUser.name}.`,
      smartReview,
    });
    res.json({ success: true, submission: reviewed });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/submissions/:id/resubmit - Resubmit revision (Creator)
submissionsRouter.put('/:id/resubmit', (req, res) => {
  const currentUser = db.getCurrentUser();
  const sub = db.getSubmissionById(req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, error: 'Submission not found' });
  }

  if (sub.creatorId !== currentUser.id) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: You can only resubmit your own deliverables',
    });
  }

  if (sub.status !== 'revision_requested' && sub.status !== 'rejected') {
    return res.status(400).json({
      success: false,
      error: `Deliverable is not eligible for resubmission. Current status is '${sub.status}'.`,
    });
  }

  const { videoUrl, caption, videoTitle } = req.body;
  if (!videoUrl || (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://'))) {
    return res.status(400).json({
      success: false,
      error: 'A valid http/https video URL is required for revision submission',
    });
  }

  try {
    const resubmitted = db.resubmitSubmission(req.params.id, { videoUrl, caption, videoTitle });
    res.json({ success: true, submission: resubmitted });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
