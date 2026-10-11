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

async function testRoleUpdate() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      role: 'admin',
      updated_at: new Date().toISOString()
    })
    .eq('id', '7604ed1d-6126-468c-9103-c51a06e5fe0f');
  console.log('Update role result with service role:', { data, error });
}

testRoleUpdate().catch(console.error);
