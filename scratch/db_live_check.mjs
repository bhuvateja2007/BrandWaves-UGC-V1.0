import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const publishableKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];

console.log('=== SUPABASE DATABASE & AUTH LIVE CONNECTION CHECK ===');
console.log(`URL: ${supabaseUrl}`);
console.log(`Publishable Key Present: ${Boolean(publishableKey)} (${publishableKey?.slice(0, 15)}...)`);
console.log(`Service Role Key Present: ${Boolean(serviceRoleKey)} (${serviceRoleKey?.slice(0, 15)}...)`);

// 1. Check with Service Role Key (Admin/Backend)
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 2. Check with Anon/Publishable Key (Frontend client)
const anonClient = createClient(supabaseUrl, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runCheck() {
  const results = {
    databaseConnection: false,
    authConnection: false,
    tablesAccessible: [],
    usersFound: 0,
    loginTestSuccessful: false,
    latencyMs: 0
  };

  const start = Date.now();

  // Test 1: Service Role Ping / Profiles query
  try {
    const { data: profiles, error: profErr } = await adminClient.from('profiles').select('*').limit(10);
    results.latencyMs = Date.now() - start;
    if (profErr) {
      console.error('❌ Profiles query error (Service Role):', profErr.message);
    } else {
      results.databaseConnection = true;
      console.log(`✅ Database Connected! Profiles count: ${profiles.length} (Latency: ${results.latencyMs}ms)`);
      profiles.forEach(p => console.log(`   - Profile: ID=${p.id.slice(0,8)}... | Name=${p.display_name} | Role=${p.role}`));
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }

  // Test 2: Auth Users inspection
  try {
    const { data: usersData, error: userErr } = await adminClient.auth.admin.listUsers();
    if (userErr) {
      console.error('❌ Auth admin error:', userErr.message);
    } else {
      results.authConnection = true;
      results.usersFound = usersData.users.length;
      console.log(`✅ Supabase Auth Connected! Registered Users: ${results.usersFound}`);
      usersData.users.forEach(u => {
        console.log(`   - User: ${u.email} | ID=${u.id.slice(0,8)}... | Confirmed=${Boolean(u.email_confirmed_at)} | Role=${u.user_metadata?.role || 'none'}`);
      });
    }
  } catch (err) {
    console.error('❌ Auth connection failed:', err.message);
  }

  // Test 3: Check other tables in database
  const tablesToCheck = ['campaigns', 'products', 'brands', 'brand_profiles', 'creator_profiles', 'reviews', 'messages', 'onboarding_records'];
  for (const tbl of tablesToCheck) {
    try {
      const { data, error } = await adminClient.from(tbl).select('*').limit(1);
      if (!error) {
        results.tablesAccessible.push(tbl);
        console.log(`   ✓ Table "${tbl}" exists (${data?.length || 0} sample rows read)`);
      } else {
        console.log(`   - Table "${tbl}": ${error.message} (${error.code})`);
      }
    } catch (e) {
      // ignore
    }
  }

  // Test 4: Live Client Sign-In Test (as frontend does)
  console.log('\n--- Testing Frontend Client Login (anonClient signInWithPassword) ---');
  try {
    const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
      email: 'creator@brandwaves.io',
      password: 'Password123!'
    });

    if (authError) {
      console.error('❌ Client signInWithPassword failed:', authError.message);
    } else {
      results.loginTestSuccessful = true;
      console.log(`✅ Client Login Success! Signed in as: ${authData.user.email} (UID: ${authData.user.id})`);
      console.log(`   Access Token obtained: ${Boolean(authData.session?.access_token)}`);
      
      // Now test reading profile as the logged-in user
      const userClient = createClient(supabaseUrl, publishableKey, {
        global: {
          headers: {
            Authorization: `Bearer ${authData.session.access_token}`
          }
        }
      });
      const { data: userProf, error: userProfErr } = await userClient
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (userProfErr) {
        console.error('❌ Logged-in user profile fetch failed:', userProfErr.message);
      } else {
        console.log(`✅ Logged-in user profile fetch SUCCESS: Role=${userProf.role}, Name=${userProf.display_name}`);
      }
    }
  } catch (err) {
    console.error('❌ Client login test exception:', err.message);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Database connected: ${results.databaseConnection ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Auth service connected: ${results.authConnection ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Client Login working: ${results.loginTestSuccessful ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Response Latency: ${results.latencyMs}ms`);
}

runCheck().catch(console.error);
