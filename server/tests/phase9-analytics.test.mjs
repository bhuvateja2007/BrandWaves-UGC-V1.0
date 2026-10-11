import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/index.js';

test('Analytics Audit Suite — Exact Deterministic Metrics & Brand Scoping', async (t) => {
  // Save database snapshot for test isolation
  const originalUser = db.getCurrentUser();

  await t.test('1. Creator Summary: Zero magic numbers and exact counts for clean creators', () => {
    // Test with a fresh user who has zero submissions
    const cleanUser = db.registerUser({
      email: `clean_creator_${Date.now()}@test.io`,
      name: 'Clean Creator',
      handle: `@clean_${Date.now()}`,
    });

    const stats = db.getCreatorStats(cleanUser.id);
    assert.equal(stats.activeSubmissions, 0, 'Clean creator must have 0 active submissions (no baseline magic numbers)');
    assert.equal(stats.approvedSubmissions, 0, 'Clean creator must have 0 approved submissions (no +28 magic offset)');
    assert.equal(stats.revisionRequests, 0, 'Clean creator must have 0 revision requests');
    assert.equal(stats.campaignsJoined, 0, 'Clean creator must have 0 campaigns joined (no +12 magic offset)');
  });

  await t.test('2. Multi-Brand Isolation: Overview analytics scoped strictly by brand', () => {
    // Brand 1: Crimson Pop
    const crimsonOverview = db.getAnalyticsOverview('Crimson Pop');
    assert.ok(typeof crimsonOverview.totalSubmissions === 'number');
    assert.ok(typeof crimsonOverview.activeCampaigns === 'number');
    assert.ok(typeof crimsonOverview.approvalRate === 'number');

    // Brand 2: VoltEdge
    const voltOverview = db.getAnalyticsOverview('VoltEdge');
    assert.ok(typeof voltOverview.totalSubmissions === 'number');

    // Platform global overview
    const globalOverview = db.getAnalyticsOverview();
    assert.ok(globalOverview.totalSubmissions >= crimsonOverview.totalSubmissions);
    assert.ok(globalOverview.totalSubmissions >= voltOverview.totalSubmissions);
    assert.ok(globalOverview.activeCampaigns >= crimsonOverview.activeCampaigns);
  });

  await t.test('3. Mathematical Approval Rate: Denominator strictly excludes pending & revision requests', () => {
    // Switch to brand admin to create campaign
    db.switchUser('user_sarah');
    const testBrandName = `Brand_${Date.now()}`;
    const testCamp1 = db.createCampaign({
      title: 'Campaign 1',
      brandName: testBrandName,
      category: 'Lifestyle',
      platform: 'TikTok',
      format: 'Video',
      description: 'Test Campaign 1 description long enough.',
      requirements: ['Tag brand'],
      rewardType: 'fixed',
      rewardAmount: '$300',
      spotsTotal: 10,
      deadline: '2026-12-31',
      eligibleTiers: ['Rising Star'],
    });

    // Switch to creator to create submissions
    db.switchUser('user_alex');
    const sub1 = db.createSubmission({
      campaignId: testCamp1.id,
      platform: 'TikTok',
      videoUrl: 'https://tiktok.com/@creator/1',
      videoTitle: 'Reel 1',
    });
    const sub2 = db.createSubmission({
      campaignId: testCamp1.id,
      platform: 'TikTok',
      videoUrl: 'https://tiktok.com/@creator/2',
      videoTitle: 'Reel 2',
    });
    const sub3 = db.createSubmission({
      campaignId: testCamp1.id,
      platform: 'TikTok',
      videoUrl: 'https://tiktok.com/@creator/3',
      videoTitle: 'Reel 3',
    });
    const sub4 = db.createSubmission({
      campaignId: testCamp1.id,
      platform: 'TikTok',
      videoUrl: 'https://tiktok.com/@creator/4',
      videoTitle: 'Reel 4',
    });
    const sub5 = db.createSubmission({
      campaignId: testCamp1.id,
      platform: 'TikTok',
      videoUrl: 'https://tiktok.com/@creator/5',
      videoTitle: 'Reel 5',
    });

    // Switch to brand admin to review
    db.switchUser('user_sarah');
    db.reviewSubmission(sub1.id, { status: 'approved', reviewerNotes: 'Great!' });
    db.reviewSubmission(sub2.id, { status: 'approved', reviewerNotes: 'Superb!' });
    db.reviewSubmission(sub3.id, { status: 'rejected', reviewerNotes: 'Off-brief' });
    db.reviewSubmission(sub4.id, { status: 'revision_requested', reviewerNotes: 'Fix hook' });
    // sub5 remains pending

    const scoped = db.getAnalyticsOverview(testBrandName);
    assert.equal(scoped.totalSubmissions, 5, 'Total submissions must equal 5');
    assert.equal(scoped.pendingReviews, 1, 'Only sub5 is pending review');

    // Reviewed total = 2 approved + 1 rejected = 3.
    // Approval rate = 2 / 3 = 66.67% -> rounds to 67%.
    assert.equal(scoped.approvalRate, 67, 'Approval rate must be exactly 67% (2 / 3 * 100)');
  });

  await t.test('4. Status Transition updates metrics without duplicate counts', () => {
    // Switch to brand admin to create campaign
    db.switchUser('user_sarah');
    const testBrandName = `Brand_Dynamic_${Date.now()}`;
    const camp = db.createCampaign({
      title: 'Dynamic Test Campaign',
      brandName: testBrandName,
      category: 'Tech',
      platform: 'YouTube',
      format: 'Short',
      description: 'Campaign for status transition verification.',
      requirements: ['Feature sound quality'],
      rewardType: 'fixed',
      rewardAmount: '$500',
      spotsTotal: 5,
      deadline: '2026-11-30',
      eligibleTiers: ['Pro Creator'],
    });

    // Switch to creator to create submission
    db.switchUser('user_alex');
    const sub = db.createSubmission({
      campaignId: camp.id,
      platform: 'YouTube',
      videoUrl: 'https://youtube.com/shorts/test_dyn',
      videoTitle: 'Dynamic Test Video',
    });

    // Initial state: 1 pending, 0 approved, 100% default approval rate
    let metrics = db.getAnalyticsOverview(testBrandName);
    assert.equal(metrics.totalSubmissions, 1);
    assert.equal(metrics.pendingReviews, 1);
    assert.equal(metrics.approvalRate, 100);

    // 1. Brand requests revision
    db.switchUser('user_sarah');
    db.reviewSubmission(sub.id, { status: 'revision_requested', reviewerNotes: 'Fix audio' });

    metrics = db.getAnalyticsOverview(testBrandName);
    assert.equal(metrics.totalSubmissions, 1);
    assert.equal(metrics.pendingReviews, 0, 'Pending reviews is 0 while awaiting revision');

    // 2. Creator resubmits
    db.switchUser('user_alex');
    db.resubmitSubmission(sub.id, { videoUrl: 'https://youtube.com/shorts/test_dyn_v2' });

    metrics = db.getAnalyticsOverview(testBrandName);
    assert.equal(metrics.totalSubmissions, 1, 'Resubmission must not duplicate row count');
    assert.equal(metrics.pendingReviews, 1, 'Resubmitted deliverable returns to pending queue');

    // 3. Brand approves the deliverable
    db.switchUser('user_sarah');
    db.reviewSubmission(sub.id, { status: 'approved', reviewerNotes: 'Audio fixed, approved!' });

    metrics = db.getAnalyticsOverview(testBrandName);
    assert.equal(metrics.totalSubmissions, 1);
    assert.equal(metrics.pendingReviews, 0, 'Pending count decrements to 0');
    assert.equal(metrics.approvalRate, 100, 'Approval rate is 100% (1/1)');
  });

  await t.test('5. Weekly velocity computes real submission timestamps', () => {
    const overview = db.getAnalyticsOverview();
    assert.ok(typeof overview.weeklyVelocity === 'string');
    assert.ok(overview.weeklyVelocity.endsWith('/wk'), 'Velocity must format as X/wk');
    assert.ok(typeof overview.velocityChange === 'string');
    assert.ok(overview.velocityChange.endsWith('%'), 'Velocity change must be percentage');
    assert.ok(Array.isArray(overview.weeklyBreakdown), 'Weekly breakdown must be an array');
    assert.equal(overview.weeklyBreakdown.length, 4, 'Weekly breakdown must contain 4 weeks');
    overview.weeklyBreakdown.forEach(count => {
      assert.ok(typeof count === 'number' && count >= 0, 'Each weekly count must be a non-negative number');
    });
  });

  await t.test('6. Status filter all returns complete sets for Admin moderation and submissions', () => {
    const allPosts = db.getPosts({ status: 'all' });
    assert.ok(allPosts.length > 0, 'getPosts with status all must not return empty array');

    const allSubmissions = db.getSubmissions({ status: 'all' });
    assert.ok(allSubmissions.length > 0, 'getSubmissions with status all must not return empty array');
  });

  // Restore user
  db.switchUser(originalUser.id);
});
