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

async function testInsertBrand() {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: 'eaf5fdfb-d71a-422e-a850-055631bfd8c4',
      display_name: 'Brand Owner (Velox)',
      avatar_url: null,
      role: 'creator', // Let's test with creator first to see if creator works
    });
  console.log('Insert with role creator result:', { data, error });
}

testInsertBrand().catch(console.error);
