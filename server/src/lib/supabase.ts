import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl && 
  serviceRoleKey && 
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id')
);

const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabaseServer: SupabaseClient = createClient(
  isServerSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isServerSupabaseConfigured ? serviceRoleKey : fallbackKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
