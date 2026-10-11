import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../data/marketplaceData';
import { Product } from '../types/marketplace';

const STORAGE_PREFIX = 'brandwaves_recently_viewed_';
const RECENTLY_VIEWED_EVENT = 'brandwaves:recently_viewed_change';
const MAX_RECENT_ITEMS = 8;

export function useRecentlyViewed() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest';
  const storageKey = `${STORAGE_PREFIX}${userId}`;

  const getStoredIds = useCallback((): string[] => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [storageKey]);

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(getStoredIds);

  const refresh = useCallback(() => {
    setRecentlyViewedIds(getStoredIds());
  }, [getStoredIds]);

  useEffect(() => {
    refresh();
    const handleStorageChange = () => refresh();
    window.addEventListener(RECENTLY_VIEWED_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(RECENTLY_VIEWED_EVENT, handleStorageChange);
    };
  }, [refresh]);

  const addRecentlyViewed = useCallback(
    (productId: string) => {
      if (!productId || typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      try {
        const current = getStoredIds();
        // Remove existing occurrence to promote to front
        const filtered = current.filter((id) => id !== productId);
        const updated = [productId, ...filtered].slice(0, MAX_RECENT_ITEMS);

        localStorage.setItem(storageKey, JSON.stringify(updated));
        setRecentlyViewedIds(updated);

        window.dispatchEvent(new CustomEvent(RECENTLY_VIEWED_EVENT));
      } catch (err) {
        console.warn('Failed to record recently viewed product:', err);
      }
    },
    [getStoredIds, storageKey]
  );

  const clearRecentlyViewed = useCallback(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(storageKey);
      setRecentlyViewedIds([]);
      window.dispatchEvent(new CustomEvent(RECENTLY_VIEWED_EVENT));
    } catch (err) {
      console.warn('Failed to clear recently viewed products:', err);
    }
  }, [storageKey]);

  // Hydrate Product objects from canonical marketplace records
  const recentlyViewedProducts: Product[] = recentlyViewedIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => Boolean(p));

  return {
    recentlyViewedIds,
    recentlyViewedProducts,
    addRecentlyViewed,
    clearRecentlyViewed,
    hasRecentlyViewed: recentlyViewedProducts.length > 0,
  };
}
