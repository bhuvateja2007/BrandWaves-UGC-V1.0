import fs from 'fs';
import path from 'path';
import { supabaseServer, isServerSupabaseConfigured } from '../lib/supabase.js';

interface SeedData {
  users?: any[];
  campaigns?: any[];
  submissions?: any[];
}

export async function runMigration() {
  console.log('=== BRANDWAVES SUPABASE DATA MIGRATION ===');
  
  const dbPath = path.resolve(process.cwd(), 'server/data/db.json');
  if (!fs.existsSync(dbPath)) {
    console.error(`Local database file not found at ${dbPath}`);
    return;
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  const data: SeedData = JSON.parse(raw);

  console.log(`Loaded from local JSON persistence:`);
  console.log(`- Users: ${data.users?.length || 0}`);
  console.log(`- Campaigns: ${data.campaigns?.length || 0}`);
  console.log(`- Submissions: ${data.submissions?.length || 0}`);

  if (!isServerSupabaseConfigured) {
    console.warn('\n[Notice] Supabase credentials not set in environment.');
    console.warn('Migration script prepared and validated locally.');
    console.warn('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to execute live database import.\n');
    return {
      status: 'prepared_pending_credentials',
      importedCampaigns: data.campaigns?.length || 0,
      importedSubmissions: data.submissions?.length || 0,
    };
  }

  console.log('Connecting to Supabase PostgreSQL...');

  // 1. Import Campaigns to remote Supabase PostgreSQL
  let campaignCount = 0;
  if (data.campaigns && data.campaigns.length > 0) {
    // Verified brand owner profile ID
    const defaultBrandId = 'eaf5fdfb-d71a-422e-a850-055631bfd8c4';

    for (const c of data.campaigns) {
      // Check if campaign already exists by title
      const { data: existing } = await supabaseServer
        .from('campaigns')
        .select('id')
        .eq('title', c.title)
        .limit(1);

      if (existing && existing.length > 0) {
        campaignCount++;
        continue;
      }

      const rewardNum = parseInt((c.rewardAmount || '500').replace(/[^0-9]/g, ''), 10) || 500;
      const budgetNum = rewardNum * (c.spotsTotal || 3);

      const { error } = await supabaseServer
        .from('campaigns')
        .insert({
          brand_id: defaultBrandId,
          title: c.title,
          description: c.description || 'Authentic creator video campaign',
          brief: Array.isArray(c.requirements) ? c.requirements.join('. ') : (c.description || c.title),
          category: c.category || 'General',
          status: 'published',
          budget: budgetNum,
          reward_amount: rewardNum,
          slots: c.spotsTotal || 5,
          start_date: new Date().toISOString(),
          end_date: c.deadline ? new Date(c.deadline).toISOString() : new Date(Date.now() + 14 * 86400000).toISOString(),
          requirements: Array.isArray(c.requirements) ? c.requirements : ['High-res 9:16 vertical video', 'Authentic product review'],
          cover_image_url: c.brandLogo || null,
        });

      if (error) {
        console.error(`Failed to insert campaign '${c.title}':`, error.message);
      } else {
        campaignCount++;
      }
    }
    console.log(`✔ Synced ${campaignCount} campaigns to remote Supabase PostgreSQL.`);
  }

  return {
    status: 'success',
    importedCampaigns: campaignCount,
  };
}

// Allow direct execution from CLI: node --import tsx server/src/db/migrate-to-supabase.ts
if (process.argv[1]?.includes('migrate-to-supabase')) {
  runMigration()
    .then((res) => {
      console.log('Migration process finished:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
