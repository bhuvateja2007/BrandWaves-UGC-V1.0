import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

test('Phase 11: Exact Signup Copy & Feedback States', () => {
  const regFormPath = path.join(projectRoot, 'src/components/auth/RegistrationForm.tsx');
  const regContent = fs.readFileSync(regFormPath, 'utf8');

  // Exact success titles and messages
  assert.ok(
    regContent.includes('Your account was created successfully!'),
    'RegistrationForm must have title "Your account was created successfully!"'
  );
  assert.ok(
    regContent.includes('Your BrandWaves account has been created. You can continue to the next step.'),
    'RegistrationForm must have message "Your BrandWaves account has been created. You can continue to the next step."'
  );

  // Exact confirmation required titles and messages
  assert.ok(
    regContent.includes('Verify your email to continue'),
    'RegistrationForm must have title "Verify your email to continue"'
  );
  assert.ok(
    regContent.includes('Your account registration was accepted. Check your inbox for a confirmation link before signing in.'),
    'RegistrationForm must have message "Your account registration was accepted. Check your inbox for a confirmation link before signing in."'
  );

  // Exact failure title
  assert.ok(
    regContent.includes("Your account wasn't created"),
    'RegistrationForm must have failure header "Your account wasn\'t created"'
  );
});

test('Phase 11: Route Availability in App.tsx', () => {
  const appPath = path.join(projectRoot, 'src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');

  assert.ok(appContent.includes('path="/signup"'), 'App.tsx must define /signup route');
  assert.ok(appContent.includes('path="/login"'), 'App.tsx must define /login route');
  assert.ok(appContent.includes('path="/forgot-password"'), 'App.tsx must define /forgot-password route');
  assert.ok(appContent.includes('path="/onboarding"'), 'App.tsx must define protected /onboarding route');
  assert.ok(appContent.includes('path="/faq"'), 'App.tsx must define public /faq route');
});

test('Phase 11: Header and Navigation Links', () => {
  const headerPath = path.join(projectRoot, 'src/components/layout/Header.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');

  assert.ok(headerContent.includes('to="/signup"'), 'Header must contain Sign Up link to /signup');
  assert.ok(headerContent.includes('to="/login"'), 'Header must contain Sign In link to /login');
  assert.ok(headerContent.includes('to="/faq"'), 'Header must contain FAQ link to /faq');
});

test('Phase 11: Static FAQ Coverage for All 10 Required Items', () => {
  const faqPath = path.join(projectRoot, 'src/lib/faqData.ts');
  const faqContent = fs.readFileSync(faqPath, 'utf8');

  const requiredQuestions = [
    'How does signup work?',
    'Why must I confirm my email?',
    'What if I forget my password?',
    "Why can't I access my dashboard?",
    'How can I update my profile?',
    'How does creator onboarding work?',
    'How does brand approval work?',
    'Where are my onboarding answers saved?',
    'How can I request account deletion?',
    'Who can see my profile and onboarding answers?',
  ];

  for (const q of requiredQuestions) {
    assert.ok(faqContent.includes(q), `FAQ must include question: "${q}"`);
  }
});

test('Phase 11: Zero Emoji Verification across Source Code', () => {
  const srcDir = path.join(projectRoot, 'src');
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(tsx?)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const match = content.match(emojiRegex);
        assert.equal(
          match,
          null,
          `File ${fullPath} contains forbidden emoji: ${match ? match[0] : ''}`
        );
      }
    }
  }

  scanDir(srcDir);
});

test('Phase 11: Database Migration for user_onboarding and Role Protection', () => {
  const migrationPath = path.join(
    projectRoot,
    'supabase/migrations/20261012100000_user_onboarding_and_auth_repair.sql'
  );
  assert.ok(fs.existsSync(migrationPath), 'Migration file must exist');

  const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();

  // Verify user_onboarding table
  assert.ok(sql.includes('create table if not exists public.user_onboarding'), 'Must create public.user_onboarding table');
  assert.ok(sql.includes('references auth.users(id) on delete cascade'), 'user_id must reference auth.users(id) on delete cascade');
  assert.ok(sql.includes('enable row level security'), 'Must enable Row Level Security');

  // Verify protective trigger functions
  assert.ok(sql.includes('prevent_unauthorized_role_change'), 'Must protect profile role changes');
  assert.ok(sql.includes('handle_new_user'), 'Must have idempotent handle_new_user trigger');
  assert.ok(sql.includes('brand_owner'), 'Must handle brand_owner account_status pending');
});
