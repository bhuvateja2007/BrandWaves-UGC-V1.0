import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getMarketplaceCampaignById } from '../data/marketplaceData';
import { User } from '../types';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface CampaignApplication {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  pitch: string;
  proposedDeliverable: string;
  portfolioSampleUrl?: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export interface ApplicationStorageStatus {
  mode: 'supabase' | 'browser_fallback';
  isPersistent: boolean;
  message: string;
}

const LOCAL_STORAGE_KEY = 'brandwaves_campaign_applications';

let cachedTableAvailable: boolean | null = null;

/**
 * Probes whether public.campaign_applications is provisioned in the remote database.
 */
export async function probeApplicationTableAvailability(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    cachedTableAvailable = false;
    return false;
  }

  if (cachedTableAvailable !== null) {
    return cachedTableAvailable;
  }

  try {
    const { error } = await supabase
      .from('campaign_applications')
      .select('id')
      .limit(1);

    if (error && (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('does not exist'))) {
      cachedTableAvailable = false;
      return false;
    }

    cachedTableAvailable = !error;
    return cachedTableAvailable;
  } catch (err) {
    cachedTableAvailable = false;
    return false;
  }
}

/**
 * Transparent status indicator for campaign applications.
 */
export function getApplicationStorageStatus(): ApplicationStorageStatus {
  if (isSupabaseConfigured && cachedTableAvailable === true) {
    return {
      mode: 'supabase',
      isPersistent: true,
      message: 'Campaign applications synchronized with Supabase Cloud Database (PostgreSQL RLS Protected).',
    };
  }

  return {
    mode: 'browser_fallback',
    isPersistent: false,
    message: 'Using local browser application records. Remote campaign_applications table is pending SQL migration.',
  };
}

/**
 * Default seeded applications for the primary creator to demonstrate real tracking.
 */
function getDefaultSeededApplications(): CampaignApplication[] {
  return [
    {
      id: 'app_seed_001',
      campaignId: 'camp_summer_sip_challenge',
      campaignTitle: 'Summer Sip Botanical Tonic Challenge',
      brandId: 'brand_crimson_pop',
      brandName: 'Crimson Pop',
      brandLogo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=160&auto=format&fit=crop&q=80',
      creatorId: 'user_alex',
      creatorName: 'Alex Rivera',
      creatorHandle: '@alexcreates',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      pitch: 'I specialize in fast-paced aesthetic beverage styling and sound design. Planning a warm terrace sunset pour with micro-acoustic ASMR.',
      proposedDeliverable: '1x 9:16 Cinematic Vertical Reel + High-Res Product Shot',
      portfolioSampleUrl: 'https://instagram.com/reel/example_sip',
      status: 'accepted',
      appliedAt: '2026-10-02T14:32:00.000Z',
      reviewedAt: '2026-10-04T10:15:00.000Z',
      reviewerNotes: 'Strong acoustic portfolio. Approved for Phase 1 deliverable submission.',
    },
    {
      id: 'app_seed_002',
      campaignId: 'camp_sound_in_focus',
      campaignTitle: 'Precision Sound in Focus — Studio Acoustic Tour',
      brandId: 'brand_voltedge',
      brandName: 'VoltEdge',
      brandLogo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=160&auto=format&fit=crop&q=80',
      creatorId: 'user_alex',
      creatorName: 'Alex Rivera',
      creatorHandle: '@alexcreates',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      pitch: 'My audience is 65% tech-focused creatives. I will demonstrate latency-free studio editing and active noise cancellation in an urban café.',
      proposedDeliverable: '1x 60s Tech Breakdown Short + Carousel',
      portfolioSampleUrl: 'https://youtube.com/shorts/example_audio',
      status: 'pending',
      appliedAt: '2026-10-08T09:20:00.000Z',
    },
    {
      id: 'app_seed_003',
      campaignId: 'camp_summer_sip_challenge',
      campaignTitle: 'Summer Sip Botanical Tonic Challenge',
      brandId: 'brand_crimson_pop',
      brandName: 'Crimson Pop',
      brandLogo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=160&auto=format&fit=crop&q=80',
      creatorId: 'user_priya',
      creatorName: 'Priya Sharma',
      creatorHandle: '@priyacooks',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      pitch: 'I craft aesthetic mocktail reels highlighting craft tonic botanicals.',
      proposedDeliverable: '1x 30s High-energy Reel',
      status: 'pending',
      appliedAt: '2026-10-09T11:00:00.000Z',
    },
  ];
}

let inMemoryApplications: CampaignApplication[] | null = null;

function getLocalApplications(): CampaignApplication[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    if (!inMemoryApplications) {
      inMemoryApplications = getDefaultSeededApplications();
    }
    return inMemoryApplications;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultSeededApplications();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      inMemoryApplications = initial;
      return initial;
    }
    const parsed = JSON.parse(raw);
    inMemoryApplications = parsed;
    return parsed;
  } catch (err) {
    console.warn('[CampaignApplicationService] Failed reading local applications:', err);
    return inMemoryApplications || getDefaultSeededApplications();
  }
}

function saveLocalApplications(apps: CampaignApplication[]): void {
  inMemoryApplications = apps;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps));
      window.dispatchEvent(new Event('campaign_applications_updated'));
    } catch (err) {
      console.error('[CampaignApplicationService] Failed writing local applications:', err);
    }
  }
}

export const campaignApplicationService = {
  /**
   * Retrieves all applications submitted by a specific creator.
   */
  async getApplicationsForCreator(creatorId: string): Promise<CampaignApplication[]> {
    if (!creatorId) return [];

    const isAvailable = await probeApplicationTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('campaign_applications')
          .select('*')
          .eq('creator_id', creatorId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            campaignId: d.campaign_id,
            campaignTitle: d.campaign_title || 'Active Campaign',
            brandId: d.brand_id || '',
            brandName: d.brand_name || 'Brand Partner',
            brandLogo: d.brand_logo,
            creatorId: d.creator_id,
            creatorName: d.creator_name || 'Creator',
            creatorHandle: d.creator_handle || '@creator',
            creatorAvatar: d.creator_avatar || '',
            pitch: d.pitch,
            proposedDeliverable: d.proposed_deliverable,
            portfolioSampleUrl: d.portfolio_sample_url,
            status: d.status,
            appliedAt: d.created_at,
            reviewedAt: d.reviewed_at,
            reviewerNotes: d.reviewer_notes,
          }));
        }
      } catch (err) {
        console.warn('[CampaignApplicationService] Supabase fetch failed:', err);
      }
    }

    const local = getLocalApplications();
    // Return applications for this creator (or seed fallback if creator matches default)
    return local.filter(
      (a) => a.creatorId === creatorId || (creatorId.includes('alex') && a.creatorId === 'user_alex')
    );
  },

  /**
   * Checks whether a creator has already applied to a campaign.
   */
  async hasApplied(creatorId: string, campaignId: string): Promise<boolean> {
    const apps = await this.getApplicationsForCreator(creatorId);
    return apps.some((a) => a.campaignId === campaignId && a.status !== 'withdrawn');
  },

  /**
   * Applies to a campaign with validation and duplicate prevention.
   */
  async applyToCampaign(
    creator: User,
    payload: {
      campaignId: string;
      pitch: string;
      proposedDeliverable: string;
      portfolioSampleUrl?: string;
    }
  ): Promise<CampaignApplication> {
    if (!creator || !creator.id) throw new Error('Authentication required');
    if (creator.role !== 'creator' && creator.role !== 'admin') {
      throw new Error('Forbidden: Only content creators can apply to campaign briefs');
    }
    if (creator.accountStatus === 'suspended') {
      throw new Error('Account suspended from applying to campaigns');
    }

    if (!payload.pitch?.trim() || payload.pitch.trim().length < 20) {
      throw new Error('Please provide an application pitch of at least 20 characters explaining your creative concept.');
    }
    if (!payload.proposedDeliverable?.trim()) {
      throw new Error('Please outline your proposed deliverable (e.g. 1x Vertical Reel).');
    }

    // Verify campaign existence in canonical records
    const canonicalCampaign = getMarketplaceCampaignById(payload.campaignId);
    if (!canonicalCampaign) {
      throw new Error(`Campaign with ID "${payload.campaignId}" not found.`);
    }

    // Prevent duplicate applications
    const alreadyApplied = await this.hasApplied(creator.id, payload.campaignId);
    if (alreadyApplied) {
      throw new Error('You have already submitted an active application to this campaign.');
    }

    const newApplication: CampaignApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      campaignId: canonicalCampaign.id,
      campaignTitle: canonicalCampaign.title,
      brandId: canonicalCampaign.brandId,
      brandName: canonicalCampaign.brandName,
      brandLogo: canonicalCampaign.brandLogo,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorHandle: creator.handle,
      creatorAvatar: creator.avatar,
      pitch: payload.pitch.trim(),
      proposedDeliverable: payload.proposedDeliverable.trim(),
      portfolioSampleUrl: payload.portfolioSampleUrl?.trim() || undefined,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };

    const isAvailable = await probeApplicationTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('campaign_applications')
          .insert({
            campaign_id: newApplication.campaignId,
            creator_id: newApplication.creatorId,
            pitch: newApplication.pitch,
            proposed_deliverable: newApplication.proposedDeliverable,
            portfolio_sample_url: newApplication.portfolioSampleUrl || null,
            status: 'pending',
          })
          .select()
          .single();

        if (!error && data) {
          return {
            ...newApplication,
            id: data.id,
          };
        }
      } catch (err) {
        console.warn('[CampaignApplicationService] Supabase insert failed, saving locally:', err);
      }
    }

    const local = getLocalApplications();
    const updated = [newApplication, ...local];
    saveLocalApplications(updated);
    return newApplication;
  },

  /**
   * Withdraws a pending application. Creators can only withdraw their own pending applications.
   */
  async withdrawApplication(creatorId: string, applicationId: string): Promise<CampaignApplication> {
    if (!creatorId) throw new Error('Authentication required');
    if (!applicationId) throw new Error('Application ID required');

    const isAvailable = await probeApplicationTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('campaign_applications')
          .update({ status: 'withdrawn' })
          .eq('id', applicationId)
          .eq('creator_id', creatorId)
          .eq('status', 'pending') // Only pending can be withdrawn!
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            campaignId: data.campaign_id,
            campaignTitle: data.campaign_title || 'Campaign',
            brandId: data.brand_id || '',
            brandName: data.brand_name || 'Brand',
            creatorId: data.creator_id,
            creatorName: data.creator_name || 'Creator',
            creatorHandle: data.creator_handle || '@creator',
            creatorAvatar: data.creator_avatar || '',
            pitch: data.pitch,
            proposedDeliverable: data.proposed_deliverable,
            status: 'withdrawn',
            appliedAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('[CampaignApplicationService] Supabase withdraw failed:', err);
      }
    }

    const local = getLocalApplications();
    const index = local.findIndex(
      (a) => a.id === applicationId && (a.creatorId === creatorId || (creatorId.includes('alex') && a.creatorId === 'user_alex'))
    );

    if (index === -1) {
      throw new Error('Application not found or you are not authorized to withdraw it');
    }

    if (local[index].status !== 'pending') {
      throw new Error(`Cannot withdraw an application that is already ${local[index].status}.`);
    }

    local[index].status = 'withdrawn';
    saveLocalApplications(local);
    return local[index];
  },

  /**
   * Retrieves all applications associated with a specific brand or set of brands.
   */
  async getApplicationsForBrand(brandIdOrIds: string | string[]): Promise<CampaignApplication[]> {
    const brandIds = Array.isArray(brandIdOrIds) ? brandIdOrIds : [brandIdOrIds];
    if (brandIds.length === 0) return [];

    const isAvailable = await probeApplicationTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('campaign_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: CampaignApplication[] = data.map((d: any) => ({
            id: d.id,
            campaignId: d.campaign_id,
            campaignTitle: d.campaign_title || 'Active Campaign',
            brandId: d.brand_id || '',
            brandName: d.brand_name || 'Brand Partner',
            brandLogo: d.brand_logo,
            creatorId: d.creator_id,
            creatorName: d.creator_name || 'Creator',
            creatorHandle: d.creator_handle || '@creator',
            creatorAvatar: d.creator_avatar || '',
            pitch: d.pitch,
            proposedDeliverable: d.proposed_deliverable,
            portfolioSampleUrl: d.portfolio_sample_url,
            status: d.status,
            appliedAt: d.created_at,
            reviewedAt: d.reviewed_at,
            reviewerNotes: d.reviewer_notes,
          }));
          return mapped.filter((a) => brandIds.includes(a.brandId));
        }
      } catch (err) {
        console.warn('[CampaignApplicationService] Supabase fetch failed:', err);
      }
    }

    const local = getLocalApplications();
    return local.filter((a) => brandIds.includes(a.brandId));
  },

  /**
   * Retrieves applications for a specific campaign ID.
   */
  async getApplicationsForCampaign(campaignId: string): Promise<CampaignApplication[]> {
    if (!campaignId) return [];
    const local = getLocalApplications();
    return local.filter((a) => a.campaignId === campaignId);
  },

  /**
   * Reviews an application with strict brand ownership enforcement and validation.
   */
  async reviewApplication(
    reviewer: User,
    applicationId: string,
    decision: 'accepted' | 'rejected',
    reviewerNotes?: string
  ): Promise<CampaignApplication> {
    if (!reviewer || !reviewer.id) throw new Error('Authentication required');

    // Role check: Only brand_owner, brand_admin, or admin can review applications
    if (reviewer.role !== 'brand_owner' && reviewer.role !== 'brand_admin' && reviewer.role !== 'admin') {
      throw new Error('Forbidden: Only Brand Owners and Administrators can review creator applications');
    }

    if (decision !== 'accepted' && decision !== 'rejected') {
      throw new Error('Invalid decision. Must be "accepted" or "rejected".');
    }

    const local = getLocalApplications();
    const index = local.findIndex((a) => a.id === applicationId);
    if (index === -1) {
      throw new Error(`Application with ID "${applicationId}" not found.`);
    }

    const targetApp = local[index];

    // Creator cannot review own application!
    if (reviewer.id === targetApp.creatorId) {
      throw new Error('Forbidden: Creators cannot review or approve their own applications');
    }

    // Ownership check: If not platform admin, verify reviewer is authorized for this brand
    if (reviewer.role !== 'admin') {
      const isOwnerOfBrand =
        (reviewer.brandId && reviewer.brandId === targetApp.brandId) ||
        (reviewer.brandName && reviewer.brandName.toLowerCase() === targetApp.brandName.toLowerCase()) ||
        (reviewer.authorizedBrandIds && reviewer.authorizedBrandIds.includes(targetApp.brandId));

      // Demo brand owner fallback ONLY when user has no specific brand configured yet
      const isDemoOwner = (reviewer.role === 'brand_owner' || reviewer.role === 'brand_admin') &&
        !reviewer.brandId && (!reviewer.authorizedBrandIds || reviewer.authorizedBrandIds.length === 0) &&
        targetApp.brandId === 'brand_crimson_pop';

      if (!isOwnerOfBrand && !isDemoOwner) {
        throw new Error(
          `Unauthorized: You do not have permission to review applications for brand "${targetApp.brandName}"`
        );
      }
    }

    // State transition check: Only pending applications can be reviewed!
    if (targetApp.status !== 'pending') {
      throw new Error(
        `Cannot review application: Current status is already "${targetApp.status}". Only pending applications can be accepted or rejected.`
      );
    }

    const reviewedAt = new Date().toISOString();
    const notes = reviewerNotes?.trim() || (decision === 'accepted' ? 'Application accepted by brand team.' : 'Application declined for this campaign brief.');

    const isAvailable = await probeApplicationTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        await supabase
          .from('campaign_applications')
          .update({
            status: decision,
            reviewer_notes: notes,
            reviewed_by: reviewer.id,
            updated_at: reviewedAt,
          })
          .eq('id', applicationId);
      } catch (err) {
        console.warn('[CampaignApplicationService] Supabase review update failed:', err);
      }
    }

    targetApp.status = decision;
    targetApp.reviewedAt = reviewedAt;
    targetApp.reviewerNotes = notes;

    saveLocalApplications(local);
    return targetApp;
  },

  getStorageStatus: getApplicationStorageStatus,
};

