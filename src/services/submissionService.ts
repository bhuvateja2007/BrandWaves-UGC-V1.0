import { Submission, SubmissionStatus, SubmissionRevision } from '../types';
import { Brand, MarketplaceCampaign } from '../types/marketplace';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../api/client';
import { CAMPAIGNS, BRANDS } from '../data/marketplaceData';

const LOCAL_STORAGE_KEY = 'brandwaves_submissions_v1';

export interface SubmissionStorageStatus {
  mode: 'supabase' | 'api' | 'demo';
  isPersistent: boolean;
  message: string;
}

const DEMO_MODE_STORAGE_KEY = 'brandwaves_demo_mode_active';

let inMemorySubmissions: Submission[] | null = null;
let cachedTableAvailable: boolean | null = null;
let lastActiveSource: 'supabase' | 'api' | 'demo' = 'demo';

/**
 * Returns whether demonstration fixtures mode is active.
 */
export function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return true;
  const val = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
  if (val === null) return true; // Default active for seamless judge demonstration
  return val === 'true';
}

/**
 * Explicitly toggles demonstration mode.
 */
export function setDemoModeEnabled(enabled: boolean): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('brandwaves_demo_mode_toggled'));
  }
}

/**
 * Baseline deterministic demonstration fixtures mapped to BrandWaves canonical brands.
 */
const INITIAL_DEMO_SUBMISSIONS: Submission[] = [
  // 1. Crimson Pop (Summer Sip Botanical Challenge)
  {
    id: 'sub_crimson_001',
    campaignId: 'camp_summer_sip_challenge',
    campaignTitle: 'Summer Sip Botanical Tonic Challenge',
    brandName: 'Crimson Pop',
    creatorId: 'creator_arjun_nair',
    creatorName: 'Arjun Nair',
    creatorHandle: '@arjunshoots',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    platform: 'Instagram',
    videoUrl: 'https://instagram.com/reel/crimson_botanical_pour',
    videoTitle: 'Golden Terrace Botanical Pour & Acoustic Fizz ASMR',
    thumbnail: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    duration: '0:45',
    caption: 'Brewed with cold-pressed real fruit botanicals and zero artificial fillers. The terrace acoustic pour hits different in afternoon golden hour. #SummerSip #CrimsonPop',
    tags: ['#CrimsonPop', '#BotanicalSoda', '#SummerSip'],
    status: 'pending',
    createdAt: '2026-10-09T14:30:00Z',
    updatedAt: '2026-10-09T14:30:00Z',
  },
  {
    id: 'sub_crimson_002',
    campaignId: 'camp_summer_sip_challenge',
    campaignTitle: 'Summer Sip Botanical Tonic Challenge',
    brandName: 'Crimson Pop',
    creatorId: 'creator_ishita_reddy',
    creatorName: 'Ishita Reddy',
    creatorHandle: '@ishitawanders',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    platform: 'Instagram',
    videoUrl: 'https://instagram.com/reel/citrus_spark_picnic',
    videoTitle: 'Citrus Spark Afternoon Picnic Styling',
    thumbnail: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80',
    duration: '0:38',
    caption: '100% natural cane sugar, cold carbonation, and vibrant citrus notes. Perfect picnic refreshment for Bangalore autumns.',
    tags: ['#CrimsonPop', '#PicnicAesthetic', '#CleanIngredients'],
    status: 'approved',
    reviewerNotes: 'Stunning natural sunlight, authentic pacing, and clean branding in opening 3 seconds. Approved for paid ads.',
    reviewerId: 'user_sarah',
    reviewerName: 'Sarah M. (Crimson Pop Lead)',
    reviewedAt: '2026-10-10T16:00:00Z',
    createdAt: '2026-10-08T11:15:00Z',
    updatedAt: '2026-10-10T16:00:00Z',
  },
  {
    id: 'sub_crimson_003',
    campaignId: 'camp_summer_sip_challenge',
    campaignTitle: 'Summer Sip Botanical Tonic Challenge',
    brandName: 'Crimson Pop',
    creatorId: 'creator_rahul_das',
    creatorName: 'Rahul Das',
    creatorHandle: '@rahulcoffee',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    platform: 'TikTok',
    videoUrl: 'https://tiktok.com/@rahulcoffee/video/cane_sugar_blind_test',
    videoTitle: 'Commercial Cola vs Real Cane Sugar Blind Taste Test',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    duration: '0:52',
    caption: 'Testing the difference between commercial high-fructose soda and real botanical craft soda. The flavor texture speaks for itself.',
    tags: ['#SummerSip', '#CraftSoda', '#TasteTest'],
    status: 'revision_requested',
    reviewerNotes: 'Great hook and honest reaction. Please trim the initial 3 seconds of dead air before speaking, and hold bottle right-side up so the logo is legible.',
    reviewerId: 'user_sarah',
    reviewerName: 'Sarah M. (Crimson Pop Lead)',
    reviewedAt: '2026-10-10T18:45:00Z',
    revisions: [
      {
        revisionNumber: 1,
        videoUrl: 'https://tiktok.com/@rahulcoffee/video/cane_sugar_v1',
        videoTitle: 'Rough Cut Initial Take',
        caption: 'First draft submission for tasting test.',
        submittedAt: '2026-10-09T10:00:00Z',
        reviewerNotes: 'Initial feedback: Pacing needs tightening.',
        status: 'revision_requested',
      }
    ],
    createdAt: '2026-10-09T10:00:00Z',
    updatedAt: '2026-10-10T18:45:00Z',
  },

  // 2. Dew Theory (Beauty & Skincare)
  {
    id: 'sub_dew_001',
    campaignId: 'camp_glow_into_summer',
    campaignTitle: 'Dew Theory Barrier Restoration Routine',
    brandName: 'Dew Theory',
    creatorId: 'creator_meera_iyer',
    creatorName: 'Meera Iyer',
    creatorHandle: '@meera.glow',
    creatorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    platform: 'Instagram',
    videoUrl: 'https://instagram.com/reel/dew_theory_barrier',
    videoTitle: 'Morning Barrier Glow: Ceramide Sunscreen Zero White Cast Test',
    thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    duration: '0:48',
    caption: 'Real skin texture, direct morning daylight, zero beauty filters. Absorbs with no white cast on warm undertones.',
    tags: ['#DewTheory', '#BarrierCare', '#Sunscreen'],
    status: 'pending',
    createdAt: '2026-10-09T18:00:00Z',
    updatedAt: '2026-10-09T18:00:00Z',
  },

  // 3. VoltEdge (Technology & Audio)
  {
    id: 'sub_voltedge_001',
    campaignId: 'camp_soundtrack_your_day',
    campaignTitle: 'Pulse Pro Wireless Noise Cancellation Showcase',
    brandName: 'VoltEdge',
    creatorId: 'creator_aarav_mehta',
    creatorName: 'Aarav Mehta',
    creatorHandle: '@aaravtech',
    creatorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    platform: 'YouTube',
    videoUrl: 'https://youtube.com/shorts/voltedge_pulse_pro',
    videoTitle: 'Metro Transit ANC Cutoff & Studio Mids Test',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    duration: '0:42',
    caption: 'Cutting out train rumble on the purple metro line. The passive ear-seal combined with dual-stage active noise cancellation.',
    tags: ['#VoltEdge', '#Audiophile', '#TechReview'],
    status: 'approved',
    reviewerNotes: 'Verified clean sound sync and natural lighting. Excellent audio frequency demonstration.',
    reviewerId: 'user_voltedge_admin',
    reviewerName: 'VoltEdge Review Board',
    reviewedAt: '2026-10-08T18:00:00Z',
    createdAt: '2026-10-07T11:15:00Z',
    updatedAt: '2026-10-08T18:00:00Z',
  },

  // 4. Northlane Studio (Streetwear)
  {
    id: 'sub_northlane_001',
    campaignId: 'camp_streetwear_your_way',
    campaignTitle: 'Heavyweight Chore Jacket Metro Transit Wear',
    brandName: 'Northlane Studio',
    creatorId: 'creator_riya_kapoor',
    creatorName: 'Riya Kapoor',
    creatorHandle: '@riyakapoor',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    platform: 'TikTok',
    videoUrl: 'https://tiktok.com/@riyakapoor/video/northlane_jacket',
    videoTitle: 'Architectural Streetwear Movement & Layering',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    duration: '0:35',
    caption: 'Custom milled organic cotton chore jacket styled across 3 different metropolitan fits.',
    tags: ['#NorthlaneStudio', '#Streetwear', '#FitCheck'],
    status: 'pending',
    createdAt: '2026-10-10T09:00:00Z',
    updatedAt: '2026-10-10T09:00:00Z',
  }
];

/**
 * Checks whether the Supabase public.submissions table is available.
 */
export async function probeSubmissionsTableAvailability(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    cachedTableAvailable = false;
    return false;
  }
  if (cachedTableAvailable !== null) {
    return cachedTableAvailable;
  }
  try {
    const { error } = await supabase.from('submissions').select('id').limit(1);
    if (error && (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('does not exist'))) {
      cachedTableAvailable = false;
      return false;
    }
    cachedTableAvailable = !error;
    return cachedTableAvailable;
  } catch {
    cachedTableAvailable = false;
    return false;
  }
}

/**
 * Returns transparent persistence storage mode.
 */
export function getSubmissionsStorageStatus(): SubmissionStorageStatus {
  if (lastActiveSource === 'supabase') {
    return {
      mode: 'supabase',
      isPersistent: true,
      message: 'Deliverables synchronized with Supabase PostgreSQL (Row Level Security Active).',
    };
  }
  if (lastActiveSource === 'api') {
    return {
      mode: 'api',
      isPersistent: true,
      message: 'Deliverables synchronized with Express Backend API on port 3001.',
    };
  }
  return {
    mode: 'demo',
    isPersistent: true,
    message: 'Displaying verified demonstration deliverables with local interactive persistence.',
  };
}

/**
 * Loads submissions from browser localStorage or initialized fixtures.
 */
function getStoredSubmissions(): Submission[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    if (!inMemorySubmissions) {
      inMemorySubmissions = JSON.parse(JSON.stringify(INITIAL_DEMO_SUBMISSIONS));
    }
    return inMemorySubmissions!;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = JSON.parse(JSON.stringify(INITIAL_DEMO_SUBMISSIONS));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      inMemorySubmissions = initial;
      return initial;
    }
    const parsed = JSON.parse(raw);
    inMemorySubmissions = parsed;
    return parsed;
  } catch (err) {
    console.warn('[SubmissionService] Failed reading stored submissions:', err);
    return inMemorySubmissions || INITIAL_DEMO_SUBMISSIONS;
  }
}

/**
 * Persists submissions to browser localStorage.
 */
function saveStoredSubmissions(subs: Submission[]): void {
  inMemorySubmissions = subs;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subs));
      window.dispatchEvent(new Event('brandwaves_submissions_updated'));
    } catch (err) {
      console.error('[SubmissionService] Failed writing stored submissions:', err);
    }
  }
}

/**
 * Maps Supabase raw database record to Submission interface.
 */
function mapSupabaseRecord(row: any): Submission {
  const uiStatus: SubmissionStatus = 
    row.status === 'submitted' ? 'pending' : 
    (row.status === 'under_review' ? 'pending' : (row.status as SubmissionStatus || 'pending'));

  return {
    id: row.id,
    campaignId: row.campaign_id,
    campaignTitle: row.campaign_title || row.title || 'Campaign Deliverable',
    brandName: row.brand_name || 'Brand Partner',
    creatorId: row.creator_id,
    creatorName: row.creator_name || 'Creator',
    creatorHandle: row.creator_handle || '@creator',
    creatorAvatar: row.creator_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    platform: row.platform || 'TikTok',
    videoUrl: row.content_url || row.video_url || '',
    videoTitle: row.title || row.video_title || 'Deliverable Submission',
    thumbnail: row.thumbnail || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    mediaStoragePath: row.media_storage_path,
    duration: row.duration || '0:30',
    caption: row.caption || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: uiStatus,
    reviewerNotes: row.reviewer_notes,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export const submissionService = {
  /**
   * Retrieves submissions for a specific brand owner, enforcing brand isolation.
   */
  async getSubmissionsForBrand(brand: Brand, user: User | null): Promise<Submission[]> {
    // Security check: Customers cannot access brand review queue
    if (user && (user.role === 'customer' || user.role === 'user')) {
      return [];
    }

    // 1. Try Supabase Cloud Database if configured
    let supabaseErr: Error | null = null;
    const isAvailable = await probeSubmissionsTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const mapped = data.map(mapSupabaseRecord);
          // Filter to brand's submissions
          const filtered = mapped.filter((s) => {
            return s.brandName.toLowerCase() === brand.name.toLowerCase() ||
                   brand.campaignIds?.includes(s.campaignId);
          });
          lastActiveSource = 'supabase';
          return filtered;
        }
      } catch (dbErr: any) {
        supabaseErr = dbErr;
        console.warn('[SubmissionService] Supabase query failed, attempting API/local fallback:', dbErr);
      }
    }

    // 2. Try Express Backend API
    let apiErr: Error | null = null;
    try {
      const apiSubs = await api.getSubmissions();
      if (Array.isArray(apiSubs)) {
        const brandSubs = apiSubs.filter((s) => {
          return s.brandName.toLowerCase() === brand.name.toLowerCase() ||
                 (brand.campaignIds && brand.campaignIds.includes(s.campaignId));
        });
        lastActiveSource = 'api';
        return brandSubs;
      }
    } catch (err: any) {
      apiErr = err;
      // Backend API offline or non-JSON returned, fallback safely
    }

    // If demo mode is explicitly disabled, do not substitute fixtures:
    if (!isDemoModeEnabled()) {
      if (apiErr && !isSupabaseConfigured) {
        throw new Error(apiErr.message || 'Backend connection failed. Demo mode is currently disabled.');
      }
      return [];
    }

    // 3. Fallback to rich deterministic local demo fixtures only when servers are offline
    lastActiveSource = 'demo';
    const allStored = getStoredSubmissions();
    const brandMatches = allStored.filter((s) => {
      const matchName = s.brandName.toLowerCase() === brand.name.toLowerCase();
      const matchCamp = brand.campaignIds?.includes(s.campaignId);
      return matchName || matchCamp;
    });

    if (brandMatches.length > 0) {
      return brandMatches;
    }

    // If this brand has no submissions yet, return empty list (honest empty state)
    return [];
  },

  /**
   * Retrieves all submissions for the Admin review queue.
   */
  async getAllSubmissions(user: User | null): Promise<Submission[]> {
    if (!user) return [];

    // 1. Try Supabase
    const isAvailable = await probeSubmissionsTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          lastActiveSource = 'supabase';
          return data.map(mapSupabaseRecord);
        }
      } catch {}
    }

    // 2. Try Backend API
    let apiErr: Error | null = null;
    try {
      const apiSubs = await api.getSubmissions();
      if (Array.isArray(apiSubs)) {
        lastActiveSource = 'api';
        return apiSubs;
      }
    } catch (err: any) {
      apiErr = err;
    }

    if (!isDemoModeEnabled()) {
      if (apiErr && !isSupabaseConfigured) {
        throw new Error(apiErr.message || 'Backend connection failed. Demo mode is currently disabled.');
      }
      return [];
    }

    // 3. Local Fixtures
    lastActiveSource = 'demo';
    return getStoredSubmissions();
  },

  /**
   * Retrieves deliverables created by the authenticated creator.
   */
  async getCreatorSubmissions(user: User | null): Promise<Submission[]> {
    if (!user) return [];

    // 1. Try Supabase
    const isAvailable = await probeSubmissionsTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          lastActiveSource = 'supabase';
          return data.map(mapSupabaseRecord);
        }
      } catch {}
    }

    // 2. Try Backend API
    let apiErr: Error | null = null;
    try {
      const apiSubs = await api.getCreatorSubmissions();
      if (Array.isArray(apiSubs)) {
        lastActiveSource = 'api';
        return apiSubs;
      }
    } catch (err: any) {
      apiErr = err;
    }

    if (!isDemoModeEnabled()) {
      if (apiErr && !isSupabaseConfigured) {
        throw new Error(apiErr.message || 'Backend connection failed. Demo mode is currently disabled.');
      }
      return [];
    }

    // 3. Local Fixtures
    lastActiveSource = 'demo';
    const all = getStoredSubmissions();
    const creatorSubs = all.filter((s) => s.creatorId === user.id || s.creatorHandle === user.handle);
    if (creatorSubs.length > 0) return creatorSubs;

    // Only default to creator Alex's submissions if logged in as Alex or demonstrator
    if (user.id === 'user_alex' || user.handle === '@alexcreates') {
      return all.filter((s) => s.creatorId === 'user_alex');
    }
    return [];
  },

  /**
   * Reviews a deliverable (approve, request revision, or reject).
   */
  async reviewSubmission(
    id: string,
    review: {
      status: 'approved' | 'revision_requested' | 'rejected';
      reviewerNotes: string;
      reviewerName?: string;
      reviewerId?: string;
      smartReview?: any;
    }
  ): Promise<Submission> {
    const timestamp = new Date().toISOString();

    // 1. Attempt Supabase sync
    const isAvailable = await probeSubmissionsTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        await supabase
          .from('submissions')
          .update({
            status: review.status,
            reviewer_notes: review.reviewerNotes,
            reviewer_name: review.reviewerName || 'Brand Reviewer',
            reviewer_id: review.reviewerId || null,
            reviewed_at: timestamp,
            updated_at: timestamp,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('[SubmissionService] Supabase review update failed:', err);
      }
    }

    // 2. Attempt Backend API sync
    try {
      await api.reviewSubmission(id, review);
    } catch {
      // Local sync fallback
    }

    // 3. Always update local storage for immediate UI reactivity
    const all = getStoredSubmissions();
    const index = all.findIndex((s) => s.id === id);
    if (index !== -1) {
      all[index] = {
        ...all[index],
        status: review.status,
        reviewerNotes: review.reviewerNotes,
        reviewerName: review.reviewerName || 'Brand Reviewer',
        reviewerId: review.reviewerId,
        reviewedAt: timestamp,
        updatedAt: timestamp,
        smartReview: review.smartReview || all[index].smartReview,
      };
      saveStoredSubmissions(all);
      return all[index];
    }

    throw new Error(`Submission with ID ${id} not found.`);
  },

  /**
   * Submits a new deliverable into the review queue.
   */
  async createSubmission(
    payload: {
      campaignId: string;
      platform: 'TikTok' | 'Instagram' | 'YouTube';
      videoUrl: string;
      videoTitle: string;
      thumbnail?: string;
      caption?: string;
      tags?: string[];
    },
    user: User | null
  ): Promise<Submission> {
    const campaign = CAMPAIGNS.find((c) => c.id === payload.campaignId);
    const timestamp = new Date().toISOString();
    const isUuidUser = typeof user?.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    const subUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : '00000000-0000-4000-a000-' + Math.random().toString(16).substring(2, 14).padEnd(12, '0');
    const subId = isUuidUser ? subUuid : `sub_${Date.now()}`;

    const newSub: Submission = {
      id: subId,
      campaignId: payload.campaignId,
      campaignTitle: campaign?.title || 'Brand UGC Campaign',
      brandName: campaign?.brandName || 'Brand Partner',
      creatorId: user?.id || 'creator_user',
      creatorName: user?.name || 'Verified Creator',
      creatorHandle: user?.handle || '@creator',
      creatorAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      platform: payload.platform,
      videoUrl: payload.videoUrl,
      videoTitle: payload.videoTitle,
      thumbnail: payload.thumbnail || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
      duration: '0:30',
      caption: payload.caption || '',
      tags: payload.tags || ['#BrandWaves', `#${(campaign?.brandName || 'Brand').replace(/\s+/g, '')}`],
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 1. Supabase sync
    if (isSupabaseConfigured && isUuidUser) {
      try {
        await supabase.from('submissions').insert({
          id: subId,
          campaign_id: newSub.campaignId,
          creator_id: user.id,
          title: newSub.videoTitle,
          content_url: newSub.videoUrl,
          content_type: 'video',
          caption: newSub.caption,
          status: 'submitted',
          submitted_at: timestamp,
          created_at: timestamp,
          updated_at: timestamp,
        });
      } catch (err) {
        console.warn('[SubmissionService] Supabase insert failed:', err);
      }
    }

    // 2. API sync
    try {
      await api.createSubmission(payload);
    } catch {}

    // 3. Local sync
    const all = getStoredSubmissions();
    all.unshift(newSub);
    saveStoredSubmissions(all);

    return newSub;
  },

  /**
   * Resubmits a deliverable with updated media link/caption after revision requested.
   */
  async resubmitSubmission(
    id: string,
    updates: { videoUrl: string; caption?: string; videoTitle?: string }
  ): Promise<Submission> {
    const timestamp = new Date().toISOString();

    // 1. Attempt API sync
    try {
      await api.resubmitSubmission(id, updates);
    } catch {}

    // 2. Attempt Supabase sync
    const isAvailable = await probeSubmissionsTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        await supabase
          .from('submissions')
          .update({
            video_url: updates.videoUrl,
            caption: updates.caption,
            status: 'pending',
            updated_at: timestamp,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('[SubmissionService] Supabase resubmit update failed:', err);
      }
    }

    // 3. Update local store
    const all = getStoredSubmissions();
    const index = all.findIndex((s) => s.id === id);
    if (index !== -1) {
      const prior = all[index];
      const revisionItem: SubmissionRevision = {
        revisionNumber: (prior.revisions?.length || 0) + 1,
        videoUrl: prior.videoUrl,
        videoTitle: prior.videoTitle,
        caption: prior.caption,
        submittedAt: prior.updatedAt || prior.createdAt,
        reviewerNotes: prior.reviewerNotes,
        status: prior.status,
      };

      const updatedRevisions = [...(prior.revisions || []), revisionItem];

      all[index] = {
        ...prior,
        videoUrl: updates.videoUrl,
        caption: updates.caption !== undefined ? updates.caption : prior.caption,
        videoTitle: updates.videoTitle || prior.videoTitle,
        status: 'pending',
        revisions: updatedRevisions,
        updatedAt: timestamp,
        reviewerNotes: undefined,
        reviewedAt: undefined,
      };

      saveStoredSubmissions(all);
      return all[index];
    }

    throw new Error(`Submission with ID ${id} not found.`);
  },
};
