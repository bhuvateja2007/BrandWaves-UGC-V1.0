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

async function testUpdate() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      display_name: 'Alex Rivera', 
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      updated_at: new Date().toISOString()
    })
    .eq('id', '7604ed1d-6126-468c-9103-c51a06e5fe0f');
  console.log('Update result with valid schema:', { data, error });
}

testUpdate().catch(console.error);
