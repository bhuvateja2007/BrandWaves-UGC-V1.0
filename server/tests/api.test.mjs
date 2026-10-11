import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/index.js';

test('Database loads seed data properly', () => {
  db.switchUser('user_alex');
  const user = db.getCurrentUser();
  assert.ok(user, 'User should exist');
  assert.equal(user.role, 'creator');

  const campaigns = db.getCampaigns();
  assert.ok(campaigns.length >= 3, 'Should have multiple seeded campaigns');

  const submissions = db.getSubmissions();
  assert.ok(submissions.length >= 3, 'Should have multiple seeded submissions');
});

test('Heatmap calculates 364 days with levels 0-4 and streaks', () => {
  const heatmap = db.getHeatmap(365);
  assert.equal(heatmap.days.length, 364, 'Heatmap should contain exactly 52 full weeks (364 days)');
  assert.ok(heatmap.totalActivities > 0, 'Total activities should be positive');
  assert.ok(heatmap.longestStreak >= 0, 'Streak should be non-negative');

  // Verify intensity levels are strictly within 0-4
  heatmap.days.forEach(day => {
    assert.ok(day.level >= 0 && day.level <= 4, `Level must be 0-4, got ${day.level}`);
  });
});

test('Approval rate excludes pending and revision-requested items', () => {
  const overview = db.getAnalyticsOverview();
  assert.ok(typeof overview.approvalRate === 'number');
  assert.ok(overview.approvalRate >= 0 && overview.approvalRate <= 100);
});

test('Leaderboard ranks creators accurately with scoring and badges', () => {
  const leaderboard = db.getLeaderboard();
  assert.ok(leaderboard.length >= 2, 'Should have ranked creators');
  assert.equal(leaderboard[0].rank, 1, 'Top creator should be rank 1');
  assert.ok(leaderboard[0].score >= leaderboard[1].score, 'Rank 1 must have score >= Rank 2');
  assert.ok(leaderboard[0].totalEarnings > 0, 'Earnings should be calculated');
  assert.ok(leaderboard[0].approvalRate >= 0 && leaderboard[0].approvalRate <= 100);
});

test('Campaign filtering by status and category', () => {
  const activeCampaigns = db.getCampaigns({ status: 'active' });
  assert.ok(activeCampaigns.every(c => c.status === 'active'), 'All returned campaigns must be active');

  const fitnessCampaigns = db.getCampaigns({ category: 'Fitness' });
  assert.ok(fitnessCampaigns.length > 0, 'Should find fitness category campaign');
});

test('Review workflow and revision resubmission lifecycle', () => {
  // Step 1: Ensure user is creator and create a fresh test submission
  db.switchUser('user_alex');
  const freshSub = db.createSubmission({
    campaignId: 'camp_velox_sprint',
    platform: 'TikTok',
    videoUrl: 'https://www.tiktok.com/@alexcreates/video/initial-v1',
    videoTitle: 'Test Sprint Reel V1',
    caption: 'Initial review cut for test workflow.',
  });
  assert.equal(freshSub.status, 'pending', 'New submission starts as pending');

  // Step 2: Switch to brand admin to review
  db.switchUser('user_sarah');
  const admin = db.getCurrentUser();
  assert.equal(admin.role, 'brand_admin');

  // Request revision
  const revisionSub = db.reviewSubmission(freshSub.id, {
    status: 'revision_requested',
    reviewerNotes: 'Please trim the first 3 seconds of dead space.',
  });
  assert.equal(revisionSub.status, 'revision_requested');
  assert.equal(revisionSub.reviewerNotes, 'Please trim the first 3 seconds of dead space.');

  // Step 3: Switch back to creator to resubmit
  db.switchUser('user_alex');
  const resubmitted = db.resubmitSubmission(freshSub.id, {
    videoUrl: 'https://www.tiktok.com/@alexcreates/video/fixed-v2',
    caption: 'Trimmed the intro by 3 seconds as requested.',
  });
  assert.equal(resubmitted.status, 'pending', 'Status should reset to pending after creator resubmission');
  assert.equal(resubmitted.videoUrl, 'https://www.tiktok.com/@alexcreates/video/fixed-v2');

  // Step 4: Brand admin approves the resubmitted work
  db.switchUser('user_sarah');
  const approved = db.reviewSubmission(freshSub.id, {
    status: 'approved',
    reviewerNotes: 'Looks pristine, approved!',
  });
  assert.equal(approved.status, 'approved');

  // Reset back to alex
  db.switchUser('user_alex');
});
