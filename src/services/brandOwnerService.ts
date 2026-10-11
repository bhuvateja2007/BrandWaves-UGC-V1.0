import { Brand } from '../types/marketplace';
import { BRANDS } from '../data/marketplaceData';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'brandwaves_brands_v1';

export interface BrandStorageStatus {
  mode: 'supabase' | 'browser_fallback';
  isPersistent: boolean;
  message: string;
}

let inMemoryBrands: Brand[] | null = null;
let cachedTableAvailable: boolean | null = null;

/**
 * Checks if Supabase public.brands table is provisioned.
 */
export async function probeBrandTableAvailability(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    cachedTableAvailable = false;
    return false;
  }
  if (cachedTableAvailable !== null) {
    return cachedTableAvailable;
  }
  try {
    const { error } = await supabase.from('brands').select('id').limit(1);
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
 * Returns the transparent storage persistence status.
 */
export function getBrandStorageStatus(): BrandStorageStatus {
  if (isSupabaseConfigured && cachedTableAvailable === true) {
    return {
      mode: 'supabase',
      isPersistent: true,
      message: 'Brand profiles synced with Supabase Cloud Database (PostgreSQL RLS Protected).',
    };
  }
  return {
    mode: 'browser_fallback',
    isPersistent: false,
    message: 'Using local storage records. Database tables ready for live environment.',
  };
}

/**
 * Loads all brand records from storage or initial seed.
 */
function getStoredBrands(): Brand[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    if (!inMemoryBrands) {
      inMemoryBrands = JSON.parse(JSON.stringify(BRANDS));
    }
    return inMemoryBrands!;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = JSON.parse(JSON.stringify(BRANDS));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      inMemoryBrands = initial;
      return initial;
    }
    const parsed = JSON.parse(raw);
    inMemoryBrands = parsed;
    return parsed;
  } catch (err) {
    console.warn('[BrandOwnerService] Failed reading stored brands:', err);
    return inMemoryBrands || BRANDS;
  }
}

/**
 * Saves brand records to storage.
 */
function saveStoredBrands(brands: Brand[]): void {
  inMemoryBrands = brands;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(brands));
      window.dispatchEvent(new Event('brandwaves_brands_updated'));
    } catch (err) {
      console.error('[BrandOwnerService] Failed writing stored brands:', err);
    }
  }
}

/**
 * Validates HTTP/HTTPS URL format.
 */
export function isValidUrl(url?: string): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const brandOwnerService = {
  /**
   * Retrieves all known brands.
   */
  getAllBrands(): Brand[] {
    return getStoredBrands();
  },

  /**
   * Retrieves a brand by ID.
   */
  getBrandById(id: string): Brand | undefined {
    return getStoredBrands().find((b) => b.id === id);
  },

  /**
   * Resolves the list of brands that the given user is authorized to manage.
   * Enforces server-compatible authorization logic.
   */
  getAuthorizedBrands(user: User | null): Brand[] {
    if (!user) return [];
    const all = getStoredBrands();

    // Admins have access to all platform brands
    if (user.role === 'admin') {
      return all;
    }

    // Must be brand_owner or brand_admin
    if (user.role !== 'brand_owner' && user.role !== 'brand_admin') {
      return [];
    }

    // 1. Check authorizedBrandIds array
    if (user.authorizedBrandIds && user.authorizedBrandIds.length > 0) {
      const matches = all.filter((b) => user.authorizedBrandIds!.includes(b.id));
      if (matches.length > 0) return matches;
    }

    // 2. Check brandId
    if (user.brandId) {
      const match = all.find((b) => b.id === user.brandId);
      if (match) return [match];
    }

    // 3. Check brandName
    if (user.brandName) {
      const match = all.find(
        (b) => b.name.toLowerCase() === user.brandName!.toLowerCase()
      );
      if (match) return [match];
    }

    // 4. Default demo brand fallback for new brand_owner accounts
    // Crimson Pop is our canonical primary demo brand
    const defaultDemo = all.find((b) => b.id === 'brand_crimson_pop') || all[0];
    return defaultDemo ? [defaultDemo] : [];
  },

  /**
   * Verifies if a user is authorized to manage a specific brand.
   */
  isAuthorizedForBrand(user: User | null, brandId: string): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const authorized = this.getAuthorizedBrands(user);
    return authorized.some((b) => b.id === brandId);
  },

  /**
   * Sets the active preferred brand ID in browser storage.
   */
  setActiveBrandId(brandId: string): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('brandwaves_active_brand_id', brandId);
        window.dispatchEvent(new Event('brandwaves_active_brand_changed'));
      } catch (err) {
        console.warn('[BrandOwnerService] Failed to set active brand ID:', err);
      }
    }
  },

  /**
   * Resolves the active brand for a brand owner, with optional preferred ID.
   */
  getActiveBrand(user: User | null, preferredBrandId?: string): Brand | undefined {
    let pref = preferredBrandId;
    if (!pref && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        pref = localStorage.getItem('brandwaves_active_brand_id') || undefined;
      } catch {
        // Ignore localStorage error
      }
    }
    const authorized = this.getAuthorizedBrands(user);
    if (authorized.length === 0) return undefined;
    if (pref) {
      const found = authorized.find((b) => b.id === pref);
      if (found) return found;
    }
    return authorized[0];
  },

  /**
   * Updates brand profile fields with strict authorization and validation.
   */
  async updateBrandProfile(
    user: User,
    brandId: string,
    updates: {
      name?: string;
      tagline?: string;
      description?: string;
      category?: string;
      logo?: string;
      coverImage?: string;
      location?: string;
      website?: string;
      values?: string[];
    }
  ): Promise<Brand> {
    if (!user || !user.id) {
      throw new Error('Authentication required');
    }

    if (!this.isAuthorizedForBrand(user, brandId)) {
      throw new Error(`Unauthorized: You do not have permission to manage brand "${brandId}"`);
    }

    const all = getStoredBrands();
    const index = all.findIndex((b) => b.id === brandId);
    if (index === -1) {
      throw new Error(`Brand with ID "${brandId}" not found`);
    }

    // Validations
    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      if (!trimmedName || trimmedName.length < 2) {
        throw new Error('Brand name must be at least 2 characters.');
      }
    }

    if (updates.description !== undefined) {
      const trimmedDesc = updates.description.trim();
      if (!trimmedDesc || trimmedDesc.length < 10) {
        throw new Error('Brand description must be at least 10 characters.');
      }
    }

    if (updates.website && !isValidUrl(updates.website)) {
      throw new Error('Please enter a valid website URL starting with http:// or https://');
    }

    if (updates.logo && !isValidUrl(updates.logo)) {
      throw new Error('Please enter a valid logo image URL starting with http:// or https://');
    }

    if (updates.coverImage && !isValidUrl(updates.coverImage)) {
      throw new Error('Please enter a valid cover image URL starting with http:// or https://');
    }

    const currentBrand = all[index];
    const updatedBrand: Brand = {
      ...currentBrand,
      name: updates.name !== undefined ? updates.name.trim() : currentBrand.name,
      tagline: updates.tagline !== undefined ? updates.tagline.trim() : currentBrand.tagline,
      description: updates.description !== undefined ? updates.description.trim() : currentBrand.description,
      category: updates.category !== undefined ? updates.category.trim() : currentBrand.category,
      logo: updates.logo !== undefined ? updates.logo.trim() : currentBrand.logo,
      coverImage: updates.coverImage !== undefined ? updates.coverImage.trim() : currentBrand.coverImage,
      location: updates.location !== undefined ? updates.location.trim() : currentBrand.location,
      website: updates.website !== undefined ? updates.website.trim() : currentBrand.website,
      values: updates.values !== undefined ? updates.values : currentBrand.values,
    };

    // If Supabase table is available, attempt remote update
    const isAvailable = await probeBrandTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        await supabase
          .from('brands')
          .update({
            name: updatedBrand.name,
            tagline: updatedBrand.tagline,
            description: updatedBrand.description,
            category: updatedBrand.category,
            logo: updatedBrand.logo,
            cover_image: updatedBrand.coverImage,
            location: updatedBrand.location,
            website: updatedBrand.website,
            values: updatedBrand.values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', brandId);
      } catch (err) {
        console.warn('[BrandOwnerService] Supabase brand update failed, using local save:', err);
      }
    }

    all[index] = updatedBrand;
    saveStoredBrands(all);
    return updatedBrand;
  },

  getStorageStatus: getBrandStorageStatus,
};
