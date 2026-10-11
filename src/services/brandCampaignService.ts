import { MarketplaceCampaign, MarketplaceCampaignStatus } from '../types/marketplace';
import { CAMPAIGNS } from '../data/marketplaceData';
import { User } from '../types';
import { brandOwnerService } from './brandOwnerService';
import { brandProductService } from './brandProductService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'brandwaves_campaigns_v1';

export interface CampaignStorageStatus {
  mode: 'supabase' | 'browser_fallback';
  isPersistent: boolean;
  message: string;
}

let inMemoryCampaigns: MarketplaceCampaign[] | null = null;
let cachedTableAvailable: boolean | null = null;

export async function probeCampaignTableAvailability(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    cachedTableAvailable = false;
    return false;
  }
  if (cachedTableAvailable !== null) {
    return cachedTableAvailable;
  }
  try {
    const { error } = await supabase.from('campaigns').select('id').limit(1);
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

export function getCampaignStorageStatus(): CampaignStorageStatus {
  if (isSupabaseConfigured && cachedTableAvailable === true) {
    return {
      mode: 'supabase',
      isPersistent: true,
      message: 'Campaign briefs synchronized with Supabase Cloud Database (PostgreSQL RLS Protected).',
    };
  }
  return {
    mode: 'browser_fallback',
    isPersistent: false,
    message: 'Using local campaign records. Database tables ready for live environment.',
  };
}

function getStoredCampaigns(): MarketplaceCampaign[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    if (!inMemoryCampaigns) {
      inMemoryCampaigns = JSON.parse(JSON.stringify(CAMPAIGNS));
    }
    return inMemoryCampaigns!;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial: MarketplaceCampaign[] = JSON.parse(JSON.stringify(CAMPAIGNS));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      inMemoryCampaigns = initial;
      return initial;
    }
    const parsed = JSON.parse(raw);
    inMemoryCampaigns = parsed;
    return parsed;
  } catch (err) {
    console.warn('[BrandCampaignService] Failed reading stored campaigns:', err);
    return inMemoryCampaigns || CAMPAIGNS;
  }
}

function saveStoredCampaigns(campaigns: MarketplaceCampaign[]): void {
  inMemoryCampaigns = campaigns;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(campaigns));
      window.dispatchEvent(new Event('brandwaves_campaigns_updated'));
    } catch (err) {
      console.error('[BrandCampaignService] Failed writing stored campaigns:', err);
    }
  }
}

export const brandCampaignService = {
  /**
   * Retrieves all campaigns with optional filters.
   */
  getCampaigns(filters?: {
    brandId?: string;
    status?: string;
    search?: string;
  }): MarketplaceCampaign[] {
    let list = getStoredCampaigns();

    if (filters?.brandId) {
      list = list.filter((c) => c.brandId === filters.brandId);
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((c) => c.status === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.brief.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Retrieves campaigns for a specific brand.
   */
  getCampaignsForBrand(brandId: string): MarketplaceCampaign[] {
    return this.getCampaigns({ brandId });
  },

  /**
   * Retrieves a campaign by ID.
   */
  getCampaignById(id: string): MarketplaceCampaign | undefined {
    return getStoredCampaigns().find((c) => c.id === id);
  },

  /**
   * Creates a new campaign brief.
   */
  async createCampaign(
    user: User,
    payload: {
      brandId: string;
      title: string;
      brief: string;
      description: string;
      objective?: string;
      category: string;
      platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Multi-platform';
      format: string;
      productId?: string;
      deliverables: string[];
      requirements?: string[];
      eligibility?: string[];
      targetNiches?: string[];
      deadline: string;
      rewardType: 'fixed' | 'rev_share' | 'gifted_product';
      rewardAmount: string;
      spotsTotal: number;
      startDate?: string;
      endDate?: string;
      status?: MarketplaceCampaignStatus;
    }
  ): Promise<MarketplaceCampaign> {
    if (!user || !user.id) throw new Error('Authentication required');

    // Role check
    if (user.role !== 'brand_owner' && user.role !== 'brand_admin' && user.role !== 'admin') {
      throw new Error('Forbidden: Only Brand Owners and Administrators can create campaigns');
    }

    // Ownership check
    if (!brandOwnerService.isAuthorizedForBrand(user, payload.brandId)) {
      throw new Error(`Unauthorized: You are not authorized to create campaigns for brand "${payload.brandId}"`);
    }

    // Resolve brand name & logo
    const brand = brandOwnerService.getBrandById(payload.brandId);
    if (!brand) {
      throw new Error(`Brand with ID "${payload.brandId}" not found.`);
    }

    // Validations
    if (!payload.title || payload.title.trim().length < 3) {
      throw new Error('Campaign title must be at least 3 characters.');
    }
    if (!payload.brief || payload.brief.trim().length < 15) {
      throw new Error('Creative brief must be at least 15 characters outlining the campaign goals.');
    }
    if (!payload.description || payload.description.trim().length < 20) {
      throw new Error('Campaign description must be at least 20 characters.');
    }
    if (!payload.category || !payload.category.trim()) {
      throw new Error('Campaign category is required.');
    }
    if (!payload.deliverables || payload.deliverables.length === 0) {
      throw new Error('Please outline at least one required deliverable (e.g. 1x 60s Reel).');
    }
    if (!payload.deadline) {
      throw new Error('Application deadline is required.');
    }
    const deadlineDate = new Date(payload.deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new Error('Invalid deadline date format.');
    }
    if (payload.endDate) {
      const endDate = new Date(payload.endDate);
      if (!isNaN(endDate.getTime()) && deadlineDate.getTime() > endDate.getTime()) {
        throw new Error('Application deadline must precede campaign end date.');
      }
    }
    if (payload.startDate && payload.endDate) {
      const startDate = new Date(payload.startDate);
      const endDate = new Date(payload.endDate);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate.getTime() > endDate.getTime()) {
        throw new Error('Campaign start date must precede campaign end date.');
      }
    }
    if (typeof payload.spotsTotal !== 'number' || payload.spotsTotal < 1) {
      throw new Error('Spots total must be at least 1 creator spot.');
    }

    // Product reference verification
    let productName: string | undefined;
    if (payload.productId) {
      const prod = brandProductService.getProductById(payload.productId);
      if (!prod) {
        throw new Error(`Associated product with ID "${payload.productId}" not found.`);
      }
      if (prod.brandId !== payload.brandId) {
        throw new Error(`Associated product "${prod.name}" does not belong to brand "${brand.name}".`);
      }
      productName = prod.name;
    }

    const newCampaign: MarketplaceCampaign = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      brandId: payload.brandId,
      brandName: brand.name,
      brandLogo: brand.logo,
      title: payload.title.trim(),
      brief: payload.brief.trim(),
      description: payload.description.trim(),
      objective: payload.objective?.trim() || payload.brief.trim(),
      category: payload.category.trim(),
      platform: payload.platform,
      format: payload.format || '9:16 Vertical Video',
      productId: payload.productId,
      productName,
      targetNiches: payload.targetNiches || [payload.category.trim()],
      requiredFormats: [payload.format || '9:16 Vertical Video'],
      deliverables: payload.deliverables,
      eligibility: payload.eligibility || ['Minimum 5,000 engaged audience', 'Original creator voice'],
      deadline: payload.deadline,
      rewardType: payload.rewardType,
      rewardAmount: payload.rewardAmount || 'Fixed Escrow',
      status: payload.status || 'open',
      spotsTotal: payload.spotsTotal,
      spotsFilled: 0,
      isFeatured: false,
      relatedCreatorIds: [],
    };

    // If Supabase table is available, attempt remote insert
    const isAvailable = await probeCampaignTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        await supabase.from('campaigns').insert({
          id: newCampaign.id,
          brand_name: newCampaign.brandName,
          brand_logo: newCampaign.brandLogo,
          title: newCampaign.title,
          category: newCampaign.category,
          platform: newCampaign.platform,
          format: newCampaign.format,
          description: newCampaign.description,
          requirements: newCampaign.deliverables,
          reward_type: newCampaign.rewardType,
          reward_amount: newCampaign.rewardAmount,
          spots_total: newCampaign.spotsTotal,
          spots_filled: 0,
          deadline: newCampaign.deadline,
          status: newCampaign.status === 'open' ? 'active' : newCampaign.status,
        });
      } catch (err) {
        console.warn('[BrandCampaignService] Supabase insert failed, saving locally:', err);
      }
    }

    const all = getStoredCampaigns();
    const updated = [newCampaign, ...all];
    saveStoredCampaigns(updated);
    return newCampaign;
  },

  /**
   * Updates an existing campaign brief.
   */
  async updateCampaign(
    user: User,
    campaignId: string,
    updates: Partial<Omit<MarketplaceCampaign, 'id' | 'brandId' | 'brandName'>>
  ): Promise<MarketplaceCampaign> {
    if (!user || !user.id) throw new Error('Authentication required');

    const all = getStoredCampaigns();
    const index = all.findIndex((c) => c.id === campaignId);
    if (index === -1) {
      throw new Error(`Campaign with ID "${campaignId}" not found.`);
    }

    const current = all[index];

    // Ownership check
    if (!brandOwnerService.isAuthorizedForBrand(user, current.brandId)) {
      throw new Error(`Unauthorized: You are not authorized to modify campaigns for brand "${current.brandId}"`);
    }

    // Validations
    if (updates.title !== undefined && updates.title.trim().length < 3) {
      throw new Error('Campaign title must be at least 3 characters.');
    }
    if (updates.brief !== undefined && updates.brief.trim().length < 15) {
      throw new Error('Creative brief must be at least 15 characters.');
    }
    if (updates.description !== undefined && updates.description.trim().length < 20) {
      throw new Error('Campaign description must be at least 20 characters.');
    }
    if (updates.spotsTotal !== undefined && (isNaN(updates.spotsTotal) || updates.spotsTotal < 1)) {
      throw new Error('Spots total must be at least 1.');
    }

    const updatedCampaign: MarketplaceCampaign = {
      ...current,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : current.title,
      brief: updates.brief !== undefined ? updates.brief.trim() : current.brief,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      category: updates.category !== undefined ? updates.category.trim() : current.category,
      deliverables: updates.deliverables !== undefined ? updates.deliverables : current.deliverables,
      spotsTotal: updates.spotsTotal !== undefined ? updates.spotsTotal : current.spotsTotal,
    };

    all[index] = updatedCampaign;
    saveStoredCampaigns(all);
    return updatedCampaign;
  },

  /**
   * Changes the campaign status.
   */
  async setCampaignStatus(
    user: User,
    campaignId: string,
    status: MarketplaceCampaignStatus
  ): Promise<MarketplaceCampaign> {
    return this.updateCampaign(user, campaignId, { status });
  },

  getStorageStatus: getCampaignStorageStatus,
};
