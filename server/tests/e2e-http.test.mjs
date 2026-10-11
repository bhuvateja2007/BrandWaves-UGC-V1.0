import assert from 'node:assert/strict';

async function testE2E() {
  console.log('Testing BrandWaves Backend & Frontend Endpoints...');

  // 1. Test Backend API Auth
  const authRes = await fetch('http://localhost:3001/api/auth/me');
  assert.equal(authRes.status, 200, 'Backend /api/auth/me should return 200');
  const authData = await authRes.json();
  assert.ok(authData.user, 'Auth should return user');
  console.log('✔ Backend /api/auth/me: OK (User:', authData.user.name, authData.user.role, ')');

  // 2. Test Backend Analytics Overview
  const analyticsRes = await fetch('http://localhost:3001/api/analytics/overview');
  assert.equal(analyticsRes.status, 200);
  const analyticsData = await analyticsRes.json();
  assert.ok(analyticsData.analytics, 'Analytics should be returned');
  assert.ok(typeof analyticsData.analytics.approvalRate === 'number');
  console.log('✔ Backend /api/analytics/overview: OK (Approval Rate:', analyticsData.analytics.approvalRate, '%)');

  // 3. Test Heatmap API (365 days)
  const heatmapRes = await fetch('http://localhost:3001/api/analytics/heatmap?days=365');
  assert.equal(heatmapRes.status, 200);
  const heatmapData = await heatmapRes.json();
  assert.equal(heatmapData.heatmap.days.length, 364, 'Heatmap must have exactly 52 weeks (364 days)');
  console.log('✔ Backend /api/analytics/heatmap (365 days): OK (Total Activities:', heatmapData.heatmap.totalActivities, ')');

  // 4. Test Campaigns API
  const campRes = await fetch('http://localhost:3001/api/campaigns');
  assert.equal(campRes.status, 200);
  const campData = await campRes.json();
  assert.ok(campData.campaigns.length >= 4);
  console.log('✔ Backend /api/campaigns: OK (Found', campData.campaigns.length, 'campaigns)');

  // 5. Test Submissions API
  const subRes = await fetch('http://localhost:3001/api/submissions');
  assert.equal(subRes.status, 200);
  const subData = await subRes.json();
  assert.ok(subData.submissions.length >= 3);
  console.log('✔ Backend /api/submissions: OK (Found', subData.submissions.length, 'submissions)');

  // 6. Test Leaderboard API
  const leadRes = await fetch('http://localhost:3001/api/leaderboard');
  assert.equal(leadRes.status, 200);
  const leadData = await leadRes.json();
  assert.ok(leadData.leaderboard.length >= 2);
  console.log('✔ Backend /api/leaderboard: OK (Rank #1:', leadData.leaderboard[0].name, 'Score:', leadData.leaderboard[0].score, ')');

  // 7. Test Frontend Vite Server HTML delivery
  const viteRes = await fetch('http://localhost:5173/');
  assert.equal(viteRes.status, 200, 'Frontend Vite server should return 200');
  const html = await viteRes.text();
  assert.ok(html.includes('<title>BrandWaves'), 'HTML should contain BrandWaves title');
  assert.ok(html.includes('/src/main.tsx'), 'HTML should include main entrypoint');
  console.log('✔ Frontend Vite Server (http://localhost:5173/): OK (Serving HTML with React entrypoint)');

  // 8. Test Frontend Proxy to Backend (/api/campaigns via localhost:5173)
  const proxyRes = await fetch('http://localhost:5173/api/campaigns');
  assert.equal(proxyRes.status, 200, 'Frontend /api proxy should return 200');
  const proxyData = await proxyRes.json();
  assert.ok(proxyData.campaigns.length >= 4);
  console.log('✔ Frontend Vite /api Proxy: OK (Proxied to backend successfully)');

  console.log('\n🎉 ALL 8/8 END-TO-END HTTP TESTS PASSED PERFECTLY!');
}

testE2E().catch(err => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
