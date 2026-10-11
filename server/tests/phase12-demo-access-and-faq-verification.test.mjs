import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(projectRoot, '.env') });

test('Phase 12: Demo Accounts Configuration & Admin Restriction', () => {
  const demoCompPath = path.join(projectRoot, 'src/components/auth/DemoAccountsSection.tsx');
  const demoContent = fs.readFileSync(demoCompPath, 'utf8');

  // Verify roles
  assert.ok(demoContent.includes("role: 'creator'"), 'Must include creator demo');
  assert.ok(demoContent.includes("role: 'brand_owner'"), 'Must include brand demo');
  assert.ok(demoContent.includes("role: 'customer'"), 'Must include customer demo');
  assert.ok(demoContent.includes("role: 'admin'"), 'Must include admin role representation');

  // Verify credentials presence for public roles
  assert.ok(demoContent.includes('creator@brandwaves.io'), 'Creator demo email must be creator@brandwaves.io');
  assert.ok(demoContent.includes('brand@brandwaves.io'), 'Brand demo email must be brand@brandwaves.io');
  assert.ok(demoContent.includes('customer@brandwaves.io'), 'Customer demo email must be customer@brandwaves.io');
  assert.ok(demoContent.includes('Password123!'), 'Standard demo password must be Password123!');

  // Verify Admin restriction: must have isRestricted: true and NO public password
  assert.ok(demoContent.includes('isRestricted: true'), 'Admin must be marked isRestricted: true');
  assert.ok(
    !demoContent.includes("role: 'admin',\n    roleLabel: 'Platform Administrator',\n    badge: 'Restricted Access',\n    name: 'Governance Operator',\n    handle: '@platform_admin',\n    email: 'admin@brandwaves.io',\n    password:"),
    'Admin account must NOT have a published public password'
  );

  // Verify notice about shared accounts
  assert.ok(demoContent.includes('Shared Sandbox Notice'), 'Must show shared sandbox notice');
});

test('Phase 12: Login Page Demo Account Auto-Fill Integration', () => {
  const loginPagePath = path.join(projectRoot, 'src/pages/auth/AudienceLoginPage.tsx');
  const loginContent = fs.readFileSync(loginPagePath, 'utf8');

  assert.ok(loginContent.includes('<DemoAccountsSection'), 'AudienceLoginPage must render DemoAccountsSection');
  assert.ok(loginContent.includes('handleSelectDemo'), 'Must implement handleSelectDemo');
  assert.ok(loginContent.includes('initialEmail={prefilledCredentials?.email'), 'Must pass initialEmail to login form');
  assert.ok(loginContent.includes('initialPassword={prefilledCredentials?.password'), 'Must pass initialPassword to login form');
});

test('Phase 12: Complete FAQ Coverage for All 9 Required Core Topics', () => {
  const faqDataPath = path.join(projectRoot, 'src/lib/faqData.ts');
  const faqContent = fs.readFileSync(faqDataPath, 'utf8');

  const requiredTopics = [
    { name: 'registration', pattern: 'How does signup work?' },
    { name: 'demo access', pattern: 'How does demo account access work?' },
    { name: 'email confirmation', pattern: 'Why must I confirm my email?' },
    { name: 'password recovery', pattern: 'What if I forget my password?' },
    { name: 'onboarding', pattern: 'How does creator onboarding work?' },
    { name: 'campaign applications', pattern: 'How do campaign applications and submissions work?' },
    { name: 'brand approval', pattern: 'How does brand approval work?' },
    { name: 'privacy', pattern: 'Who can see my profile and onboarding answers?' },
    { name: 'account deletion', pattern: 'How can I request account deletion?' },
  ];

  for (const topic of requiredTopics) {
    assert.ok(
      faqContent.includes(topic.pattern),
      `FAQ data must include answer for topic: ${topic.name} ("${topic.pattern}")`
    );
  }
});

test('Phase 12: Public Navigation Links & Route Declarations for FAQ', () => {
  const appPath = path.join(projectRoot, 'src/App.tsx');
  const headerPath = path.join(projectRoot, 'src/components/layout/Header.tsx');
  const loginPath = path.join(projectRoot, 'src/pages/auth/AudienceLoginPage.tsx');
  const regPath = path.join(projectRoot, 'src/pages/auth/AudienceRegisterPage.tsx');

  const appContent = fs.readFileSync(appPath, 'utf8');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  const loginContent = fs.readFileSync(loginPath, 'utf8');
  const regContent = fs.readFileSync(regPath, 'utf8');

  assert.ok(appContent.includes('path="/faq"'), 'App.tsx must register /faq route');
  assert.ok(headerContent.includes('to="/faq"'), 'Header.tsx must link to /faq');
  assert.ok(loginContent.includes('to="/faq"'), 'AudienceLoginPage must link to /faq');
  assert.ok(regContent.includes('to="/faq"'), 'AudienceRegisterPage must link to /faq');
});

test('Phase 12: Zero Emoji Compliance Verification', () => {
  const srcDir = path.join(projectRoot, 'src');
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  function scan(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        scan(full);
      } else if (/\.(tsx?)$/.test(item.name)) {
        const text = fs.readFileSync(full, 'utf8');
        const match = text.match(emojiRegex);
        assert.equal(match, null, `Forbidden emoji detected in ${full}: ${match ? match[0] : ''}`);
      }
    }
  }

  scan(srcDir);
});

test('Phase 12: Live Supabase Auth Validation for Demo Accounts', async () => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  assert.ok(url && key, 'Supabase URL and Key must be defined');

  const supabase = createClient(url, key);

  // 1. Creator Demo
  const { data: creatorData, error: creatorErr } = await supabase.auth.signInWithPassword({
    email: 'creator@brandwaves.io',
    password: 'Password123!',
  });
  assert.equal(creatorErr, null, 'Creator demo must authenticate without error');
  assert.ok(creatorData?.session, 'Creator demo must establish session');
  await supabase.auth.signOut();

  // 2. Brand Demo
  const { data: brandData, error: brandErr } = await supabase.auth.signInWithPassword({
    email: 'brand@brandwaves.io',
    password: 'Password123!',
  });
  assert.equal(brandErr, null, 'Brand demo must authenticate without error');
  assert.ok(brandData?.session, 'Brand demo must establish session');
  await supabase.auth.signOut();

  // 3. Customer Demo
  const { data: custData, error: custErr } = await supabase.auth.signInWithPassword({
    email: 'customer@brandwaves.io',
    password: 'Password123!',
  });
  assert.equal(custErr, null, 'Customer demo must authenticate without error');
  assert.ok(custData?.session, 'Customer demo must establish session');
  await supabase.auth.signOut();
});
