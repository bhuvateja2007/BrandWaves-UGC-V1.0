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

async function testRoles() {
  const roles = ['customer', 'creator', 'brand_owner', 'admin', 'user', 'moderator'];
  for (const role of roles) {
    const fakeId = `00000000-0000-0000-0000-00000000000${roles.indexOf(role) + 2}`;
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: fakeId,
        display_name: 'Test ' + role,
        role: role
      });
    if (error) {
      console.log(`Role '${role}' -> ERROR:`, error.message);
    } else {
      console.log(`Role '${role}' -> SUCCESS!`);
      await supabase.from('profiles').delete().eq('id', fakeId);
    }
  }
}

testRoles().catch(console.error);
