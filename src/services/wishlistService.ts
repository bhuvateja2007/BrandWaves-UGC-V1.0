import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getProductById } from '../data/marketplaceData';

const STORAGE_PREFIX = 'brandwaves_saved_products_';
const WISHLIST_CHANGE_EVENT = 'brandwaves:wishlist_change';

// In-memory fallback for headless/Node.js testing or environments where localStorage is unavailable
const inMemoryStore = new Map<string, string[]>();

export interface WishlistStorageStatus {
  isCloudConfigured: boolean;
  isTableAvailable: boolean;
  storageMode: 'supabase_postgres' | 'browser_storage_fallback';
  statusLabel: string;
  details: string;
}

let cachedTableAvailable: boolean | null = null;
let probePromise: Promise<boolean> | null = null;

/**
 * Checks whether the Supabase database table `public.saved_products` is created
 * and accessible. Caches the result to avoid repetitive network overhead.
 */
export async function probeWishlistTableAvailability(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    cachedTableAvailable = false;
    return false;
  }

  if (cachedTableAvailable !== null) {
    return cachedTableAvailable;
  }

  if (probePromise) {
    return probePromise;
  }

  probePromise = (async () => {
    try {
      const { error } = await supabase.from('saved_products').select('id').limit(1);
      // PGRST205 indicates table does not exist in schema cache
      if (error && error.code === 'PGRST205') {
        cachedTableAvailable = false;
      } else if (!error) {
        cachedTableAvailable = true;
      } else {
        // Any error other than missing table (e.g., auth check) means table exists
        cachedTableAvailable = error.code !== 'PGRST205';
      }
    } catch {
      cachedTableAvailable = false;
    } finally {
      probePromise = null;
    }
    return Boolean(cachedTableAvailable);
  })();

  return probePromise;
}

/**
 * Checks whether the wishlist is configured for Supabase cloud sync
 * (Maintained for backward compatibility with existing tests).
 */
export function isWishlistBackendConfigured(): boolean {
  return isSupabaseConfigured;
}

/**
 * Returns comprehensive, honest information about wishlist storage mode.
 */
export async function getWishlistStorageStatus(): Promise<WishlistStorageStatus> {
  const isAvailable = await probeWishlistTableAvailability();

  if (isSupabaseConfigured && isAvailable) {
    return {
      isCloudConfigured: true,
      isTableAvailable: true,
      storageMode: 'supabase_postgres',
      statusLabel: 'Supabase Cloud Synchronized',
      details: 'Wishlist is securely stored in Supabase PostgreSQL with user-isolated Row Level Security.',
    };
  }

  return {
    isCloudConfigured: isSupabaseConfigured,
    isTableAvailable: false,
    storageMode: 'browser_storage_fallback',
    statusLabel: 'Browser Storage (Local Fallback)',
    details: isSupabaseConfigured
      ? 'Database connected, but the public.saved_products migration is pending in Supabase SQL editor. Saved items are safely isolated in your browser storage.'
      : 'Local storage fallback active. Items are saved locally on this browser for your account.',
  };
}

/**
 * Read saved product IDs for the specified user.
 */
export async function getSavedProductIds(userId: string): Promise<string[]> {
  if (!userId) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('saved_products')
        .select('product_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return getLocalSavedProductIds(userId);
      }

      const dbIds = data.map((row: { product_id: string }) => row.product_id);
      if (dbIds.length > 0) return dbIds;

      return getLocalSavedProductIds(userId);
    } catch (err) {
      return getLocalSavedProductIds(userId);
    }
  }

  return getLocalSavedProductIds(userId);
}

/**
 * Save a product to the user's wishlist (idempotent & reference-validated).
 */
export async function saveProduct(userId: string, productId: string): Promise<boolean> {
  if (!userId || !productId) return false;

  // Validate that the product exists in the canonical marketplace catalog
  const product = getProductById(productId);
  if (!product) {
    console.warn(`[Wishlist] Rejecting save for non-existent product: ${productId}`);
    return false;
  }

  // Always keep local/memory store synced for instant optimistic reads & offline fallback
  addLocalSavedProduct(userId, productId);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('saved_products')
        .upsert(
          { user_id: userId, product_id: productId },
          { onConflict: 'user_id,product_id', ignoreDuplicates: true }
        );

      if (error) {
        // Fallback gracefully to local storage if table is missing or network error
        notifyWishlistChange();
        return true;
      }

      notifyWishlistChange();
      return true;
    } catch (err) {
      notifyWishlistChange();
      return true;
    }
  }

  notifyWishlistChange();
  return true;
}

/**
 * Remove a saved product from the user's wishlist.
 */
export async function removeSavedProduct(userId: string, productId: string): Promise<boolean> {
  if (!userId || !productId) return false;

  removeLocalSavedProduct(userId, productId);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('saved_products')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        notifyWishlistChange();
        return true;
      }

      notifyWishlistChange();
      return true;
    } catch (err) {
      notifyWishlistChange();
      return true;
    }
  }

  notifyWishlistChange();
  return true;
}

/**
 * Subscribes to cross-component wishlist change events.
 */
export function subscribeToWishlist(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(WISHLIST_CHANGE_EVENT, handler);

  return () => {
    window.removeEventListener(WISHLIST_CHANGE_EVENT, handler);
  };
}

// -----------------------------------------------------------------------------
// LOCAL / IN-MEMORY STORAGE HELPERS (Scoped strictly per user ID)
// -----------------------------------------------------------------------------

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function getLocalSavedProductIds(userId: string): string[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return inMemoryStore.get(userId) || [];
  }
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return inMemoryStore.get(userId) || [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return inMemoryStore.get(userId) || [];
  }
}

function addLocalSavedProduct(userId: string, productId: string): void {
  const current = getLocalSavedProductIds(userId);
  if (!current.includes(productId)) {
    const updated = [productId, ...current];
    inMemoryStore.set(userId, updated);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to write to localStorage:', e);
      }
    }
  }
}

function removeLocalSavedProduct(userId: string, productId: string): void {
  const current = getLocalSavedProductIds(userId);
  const updated = current.filter((id) => id !== productId);
  inMemoryStore.set(userId, updated);
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update localStorage:', e);
    }
  }
}

function notifyWishlistChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WISHLIST_CHANGE_EVENT));
  }
}
