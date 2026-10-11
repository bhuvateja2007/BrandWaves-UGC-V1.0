import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getSavedProductIds, 
  saveProduct, 
  removeSavedProduct, 
  subscribeToWishlist,
  isWishlistBackendConfigured,
  getWishlistStorageStatus,
  WishlistStorageStatus
} from '../services/wishlistService';
import { getProductById } from '../data/marketplaceData';
import { Product } from '../types/marketplace';

export function useWishlist() {
  const { currentUser } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [storageStatus, setStorageStatus] = useState<WishlistStorageStatus | null>(null);

  const userId = currentUser?.id || '';

  const refresh = useCallback(async () => {
    if (!userId) {
      setSavedIds([]);
      setLoading(false);
      return;
    }

    try {
      const [ids, status] = await Promise.all([
        getSavedProductIds(userId),
        getWishlistStorageStatus(),
      ]);
      setSavedIds(ids);
      setStorageStatus(status);
    } catch (err) {
      console.warn('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToWishlist(refresh);
    return () => unsubscribe();
  }, [refresh]);

  const isSaved = useCallback(
    (productId: string) => savedIds.includes(productId),
    [savedIds]
  );

  const toggleSave = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!userId) return false;

      const currentlySaved = savedIds.includes(productId);
      // Optimistic state update
      setSavedIds((prev) =>
        currentlySaved ? prev.filter((id) => id !== productId) : [productId, ...prev]
      );

      if (currentlySaved) {
        return await removeSavedProduct(userId, productId);
      } else {
        return await saveProduct(userId, productId);
      }
    },
    [userId, savedIds]
  );

  // Hydrate saved product records from the canonical data source
  const savedProducts: Product[] = savedIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => Boolean(p));

  return {
    savedIds,
    savedProducts,
    isSaved,
    toggleSave,
    loading,
    refresh,
    storageStatus,
    isPersistent: Boolean(storageStatus?.isTableAvailable),
    isCloudConfigured: isWishlistBackendConfigured(),
  };
}
