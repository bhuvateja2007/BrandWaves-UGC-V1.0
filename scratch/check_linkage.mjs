import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkLink() {
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const { data: profiles } = await supabase.from('profiles').select('*');

  console.log('Total auth users:', usersData.users.length);
  console.log('Total profiles:', profiles.length);

  const profileMap = new Map(profiles.map(p => [p.id, p]));

  for (const u of usersData.users) {
    const prof = profileMap.get(u.id);
    if (prof) {
      console.log(`✓ User ${u.email} (${u.id}) -> Profile exists (role: ${prof.role}, display_name: ${prof.display_name})`);
    } else {
      console.log(`✗ User ${u.email} (${u.id}) -> MISSING from profiles!`);
    }
  }

  // Also check if any profile has an id not in auth.users (orphaned profile)
  const userIds = new Set(usersData.users.map(u => u.id));
  for (const p of profiles) {
    if (!userIds.has(p.id)) {
      console.log(`! Orphaned profile: ${p.id} (${p.display_name}) not in auth.users!`);
    }
  }
}

checkLink().catch(console.error);
