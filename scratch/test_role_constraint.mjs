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

async function testRole() {
  // Test insert with 'brand_owner' on a random UUID to see if constraint blocks it
  const fakeId = '00000000-0000-0000-0000-000000000001';
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: fakeId,
      display_name: 'Test Brand',
      role: 'brand_owner'
    });
  console.log('Insert brand_owner result:', error);
  // Clean up if it inserted
  if (!error) {
    await supabase.from('profiles').delete().eq('id', fakeId);
  }
}

testRole().catch(console.error);
