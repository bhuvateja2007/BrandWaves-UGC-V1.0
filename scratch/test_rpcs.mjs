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

async function checkRpc() {
  const testFunctions = ['has_role', 'is_admin', 'is_brand_admin', 'get_my_onboarding_status', 'exec_sql', 'execute_sql'];
  for (const fn of testFunctions) {
    const { data, error } = await supabase.rpc(fn);
    console.log(`RPC '${fn}':`, error ? error.message : 'SUCCESS', error?.code);
  }
}

checkRpc().catch(console.error);
