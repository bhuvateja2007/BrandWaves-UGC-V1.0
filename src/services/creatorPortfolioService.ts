import { CreatorPortfolioItem } from '../types/marketplace';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getBrandById, getProductById, getMarketplaceCampaignById, CREATORS } from '../data/marketplaceData';

const LOCAL_STORAGE_PREFIX = 'brandwaves_creator_portfolio_';

export interface PortfolioStorageStatus {
  mode: 'supabase' | 'browser_fallback';
  isPersistent: boolean;
  message: string;
}

let cachedTableAvailable: boolean | null = null;

/**
 * Probes whether the remote Supabase database has public.creator_portfolios provisioned.
 */
export async function probePortfolioTableAvailability(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    cachedTableAvailable = false;
    return false;
  }

  if (cachedTableAvailable !== null) {
    return cachedTableAvailable;
  }

  try {
    const { error } = await supabase
      .from('creator_portfolios')
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
 * Returns transparent status of creator portfolio storage.
 */
export function getPortfolioStorageStatus(): PortfolioStorageStatus {
  if (isSupabaseConfigured && cachedTableAvailable === true) {
    return {
      mode: 'supabase',
      isPersistent: true,
      message: 'Portfolio items securely synchronized with Supabase Cloud Database (PostgreSQL RLS Protected).',
    };
  }

  return {
    mode: 'browser_fallback',
    isPersistent: false,
    message: 'Using local browser portfolio storage. Remote creator_portfolios table is pending SQL migration.',
  };
}

/**
 * Returns default/initial portfolio items for a creator.
 */
function getDefaultPortfolioForCreator(creatorId: string): CreatorPortfolioItem[] {
  // Check if this matches a canonical creator from marketplaceData
  const canonicalCreator = CREATORS.find(
    (c) => c.id === creatorId || c.handle === '@alexcreates' || creatorId.includes('alex')
  );

  if (canonicalCreator && canonicalCreator.portfolio?.length > 0) {
    return canonicalCreator.portfolio;
  }

  // Fallback initial starter items for Alex Rivera / default creator
  return [
    {
      id: 'port_starter_1',
      title: 'Velox Activewear — Urban Sprint Dynamic Reel',
      format: 'Reel',
      thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      views: '42.8K',
      engagement: '6.4%',
      date: '2026-09-18',
      relatedBrandId: 'brand_crimson_pop',
      relatedCampaignId: 'camp_summer_sip_challenge',
    },
    {
      id: 'port_starter_2',
      title: 'VoltEdge Studio Sound — Minimalist Workspace Audio Test',
      format: 'Short Video',
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      views: '88.3K',
      engagement: '8.1%',
      date: '2026-09-29',
      relatedBrandId: 'brand_voltedge',
      relatedProductId: 'prod_voltedge_anc_headphones',
      relatedCampaignId: 'camp_sound_in_focus',
    },
    {
      id: 'port_starter_3',
      title: 'Dew Theory Daily Barrier Sunscreen Wear Test',
      format: 'Reel',
      thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
      views: '26.1K',
      engagement: '5.2%',
      date: '2026-10-04',
      relatedBrandId: 'brand_dew_theory',
      relatedProductId: 'prod_dew_ceramide_sunscreen',
      relatedCampaignId: 'camp_glow_into_summer',
    },
  ];
}

const inMemoryPortfolioStore = new Map<string, CreatorPortfolioItem[]>();

/**
 * Reads local storage portfolio items for a creator.
 */
function getLocalPortfolio(creatorId: string): CreatorPortfolioItem[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    if (!inMemoryPortfolioStore.has(creatorId)) {
      inMemoryPortfolioStore.set(creatorId, getDefaultPortfolioForCreator(creatorId));
    }
    return inMemoryPortfolioStore.get(creatorId) || [];
  }
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${creatorId}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = getDefaultPortfolioForCreator(creatorId);
      localStorage.setItem(key, JSON.stringify(initial));
      inMemoryPortfolioStore.set(creatorId, initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    inMemoryPortfolioStore.set(creatorId, parsed);
    return parsed;
  } catch (err) {
    console.warn('[CreatorPortfolioService] Failed reading local portfolio:', err);
    return inMemoryPortfolioStore.get(creatorId) || getDefaultPortfolioForCreator(creatorId);
  }
}

/**
 * Saves local storage portfolio items for a creator and broadcasts event.
 */
function saveLocalPortfolio(creatorId: string, items: CreatorPortfolioItem[]): void {
  inMemoryPortfolioStore.set(creatorId, items);
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const key = `${LOCAL_STORAGE_PREFIX}${creatorId}`;
      localStorage.setItem(key, JSON.stringify(items));
      window.dispatchEvent(new Event('creator_portfolio_updated'));
    } catch (err) {
      console.error('[CreatorPortfolioService] Failed writing local portfolio:', err);
    }
  }
}

/**
 * Validates canonical entity associations (brand, product, campaign).
 */
export function validatePortfolioReferences(item: Partial<CreatorPortfolioItem>): { isValid: boolean; error?: string } {
  if (item.relatedBrandId && !getBrandById(item.relatedBrandId)) {
    return { isValid: false, error: `Invalid brand reference: "${item.relatedBrandId}" does not exist in canonical brands.` };
  }
  if (item.relatedProductId && !getProductById(item.relatedProductId)) {
    return { isValid: false, error: `Invalid product reference: "${item.relatedProductId}" does not exist in canonical products.` };
  }
  if (item.relatedCampaignId && !getMarketplaceCampaignById(item.relatedCampaignId)) {
    return { isValid: false, error: `Invalid campaign reference: "${item.relatedCampaignId}" does not exist in canonical campaigns.` };
  }
  return { isValid: true };
}

export const creatorPortfolioService = {
  /**
   * Fetches all portfolio items for a specific creator.
   */
  async getPortfolioItems(creatorId: string): Promise<CreatorPortfolioItem[]> {
    if (!creatorId) return [];

    const isAvailable = await probePortfolioTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('creator_portfolios')
          .select('*')
          .eq('creator_id', creatorId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            format: d.format,
            thumbnail: d.thumbnail,
            views: d.views || '0',
            engagement: d.engagement || '0%',
            date: d.date || new Date().toISOString().split('T')[0],
            relatedBrandId: d.related_brand_id,
            relatedProductId: d.related_product_id,
            relatedCampaignId: d.related_campaign_id,
          }));
        }
      } catch (err) {
        console.warn('[CreatorPortfolioService] Supabase fetch failed, falling back to local storage:', err);
      }
    }

    return getLocalPortfolio(creatorId);
  },

  /**
   * Creates a new portfolio item for a creator with ownership enforcement.
   */
  async addPortfolioItem(
    creatorId: string,
    payload: Omit<CreatorPortfolioItem, 'id'>
  ): Promise<CreatorPortfolioItem> {
    if (!creatorId) throw new Error('Authentication required: creatorId is required');
    if (!payload.title?.trim()) throw new Error('Portfolio item title cannot be empty');
    if (!payload.thumbnail?.trim()) throw new Error('Portfolio item thumbnail URL cannot be empty');

    // Canonical relationship validation
    const refCheck = validatePortfolioReferences(payload);
    if (!refCheck.isValid) throw new Error(refCheck.error);

    const newItem: CreatorPortfolioItem = {
      id: `port_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title.trim(),
      format: payload.format || 'Reel',
      thumbnail: payload.thumbnail.trim(),
      views: payload.views || '1.2K (Demo)',
      engagement: payload.engagement || '4.5%',
      date: payload.date || new Date().toISOString().split('T')[0],
      relatedBrandId: payload.relatedBrandId || undefined,
      relatedProductId: payload.relatedProductId || undefined,
      relatedCampaignId: payload.relatedCampaignId || undefined,
    };

    const isAvailable = await probePortfolioTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('creator_portfolios')
          .insert({
            creator_id: creatorId,
            title: newItem.title,
            format: newItem.format,
            thumbnail: newItem.thumbnail,
            views: newItem.views,
            engagement: newItem.engagement,
            date: newItem.date,
            related_brand_id: newItem.relatedBrandId || null,
            related_product_id: newItem.relatedProductId || null,
            related_campaign_id: newItem.relatedCampaignId || null,
          })
          .select()
          .single();

        if (!error && data) {
          return {
            ...newItem,
            id: data.id,
          };
        }
      } catch (err) {
        console.warn('[CreatorPortfolioService] Supabase insert failed, storing locally:', err);
      }
    }

    // Local fallback
    const existing = getLocalPortfolio(creatorId);
    const updated = [newItem, ...existing];
    saveLocalPortfolio(creatorId, updated);
    return newItem;
  },

  /**
   * Updates an existing portfolio item, strictly enforcing creator ownership.
   */
  async updatePortfolioItem(
    creatorId: string,
    itemId: string,
    updates: Partial<CreatorPortfolioItem>
  ): Promise<CreatorPortfolioItem> {
    if (!creatorId) throw new Error('Authentication required');
    if (!itemId) throw new Error('Item ID is required');

    // Canonical relationship validation
    const refCheck = validatePortfolioReferences(updates);
    if (!refCheck.isValid) throw new Error(refCheck.error);

    const isAvailable = await probePortfolioTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const dbUpdates: any = {};
        if (updates.title) dbUpdates.title = updates.title.trim();
        if (updates.format) dbUpdates.format = updates.format;
        if (updates.thumbnail) dbUpdates.thumbnail = updates.thumbnail.trim();
        if (updates.views) dbUpdates.views = updates.views;
        if (updates.engagement) dbUpdates.engagement = updates.engagement;
        if (updates.date) dbUpdates.date = updates.date;
        if ('relatedBrandId' in updates) dbUpdates.related_brand_id = updates.relatedBrandId || null;
        if ('relatedProductId' in updates) dbUpdates.related_product_id = updates.relatedProductId || null;
        if ('relatedCampaignId' in updates) dbUpdates.related_campaign_id = updates.relatedCampaignId || null;

        const { data, error } = await supabase
          .from('creator_portfolios')
          .update(dbUpdates)
          .eq('id', itemId)
          .eq('creator_id', creatorId) // Ownership check!
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            title: data.title,
            format: data.format,
            thumbnail: data.thumbnail,
            views: data.views,
            engagement: data.engagement,
            date: data.date,
            relatedBrandId: data.related_brand_id,
            relatedProductId: data.related_product_id,
            relatedCampaignId: data.related_campaign_id,
          };
        }
      } catch (err) {
        console.warn('[CreatorPortfolioService] Supabase update failed:', err);
      }
    }

    // Local fallback
    const existing = getLocalPortfolio(creatorId);
    const index = existing.findIndex((item) => item.id === itemId);
    if (index === -1) {
      throw new Error('Portfolio item not found or you are not authorized to edit it');
    }

    const updatedItem: CreatorPortfolioItem = {
      ...existing[index],
      ...updates,
      id: existing[index].id, // Prevent ID alteration!
    };

    existing[index] = updatedItem;
    saveLocalPortfolio(creatorId, existing);
    return updatedItem;
  },

  /**
   * Deletes a portfolio item, strictly enforcing creator ownership.
   */
  async deletePortfolioItem(creatorId: string, itemId: string): Promise<boolean> {
    if (!creatorId) throw new Error('Authentication required');
    if (!itemId) throw new Error('Item ID is required');

    const isAvailable = await probePortfolioTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('creator_portfolios')
          .delete()
          .eq('id', itemId)
          .eq('creator_id', creatorId); // Ownership check!

        if (!error) return true;
      } catch (err) {
        console.warn('[CreatorPortfolioService] Supabase delete failed:', err);
      }
    }

    // Local fallback
    const existing = getLocalPortfolio(creatorId);
    const filtered = existing.filter((item) => item.id !== itemId);
    if (filtered.length === existing.length) {
      return false;
    }

    saveLocalPortfolio(creatorId, filtered);
    return true;
  },

  getStorageStatus: getPortfolioStorageStatus,
};
