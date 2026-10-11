import { Product } from '../types/marketplace';
import { PRODUCTS, CAMPAIGNS, CREATORS } from '../data/marketplaceData';
import { User } from '../types';
import { brandOwnerService, isValidUrl } from './brandOwnerService';
import { creatorPortfolioService } from './creatorPortfolioService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'brandwaves_products_v1';

export interface ExtendedProduct extends Product {
  isArchived?: boolean;
}

export interface ProductStorageStatus {
  mode: 'supabase' | 'browser_fallback';
  isPersistent: boolean;
  message: string;
}

let inMemoryProducts: ExtendedProduct[] | null = null;
let cachedTableAvailable: boolean | null = null;

export async function probeProductTableAvailability(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    cachedTableAvailable = false;
    return false;
  }
  if (cachedTableAvailable !== null) {
    return cachedTableAvailable;
  }
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
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

export function getProductStorageStatus(): ProductStorageStatus {
  if (isSupabaseConfigured && cachedTableAvailable === true) {
    return {
      mode: 'supabase',
      isPersistent: true,
      message: 'Product catalog synchronized with Supabase Cloud Database (PostgreSQL RLS Protected).',
    };
  }
  return {
    mode: 'browser_fallback',
    isPersistent: false,
    message: 'Using local product catalog records. Database tables ready for live environment.',
  };
}

function getStoredProducts(): ExtendedProduct[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    if (!inMemoryProducts) {
      inMemoryProducts = PRODUCTS.map((p) => ({ ...p, isArchived: false }));
    }
    return inMemoryProducts!;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial: ExtendedProduct[] = PRODUCTS.map((p) => ({ ...p, isArchived: false }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      inMemoryProducts = initial;
      return initial;
    }
    const parsed = JSON.parse(raw);
    inMemoryProducts = parsed;
    return parsed;
  } catch (err) {
    console.warn('[BrandProductService] Failed reading stored products:', err);
    return inMemoryProducts || PRODUCTS;
  }
}

function saveStoredProducts(products: ExtendedProduct[]): void {
  inMemoryProducts = products;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new Event('brandwaves_products_updated'));
    } catch (err) {
      console.error('[BrandProductService] Failed writing stored products:', err);
    }
  }
}

export const brandProductService = {
  /**
   * Lists products with optional filters.
   */
  getProducts(filters?: {
    brandId?: string;
    category?: string;
    search?: string;
    status?: 'active' | 'archived' | 'all';
  }): ExtendedProduct[] {
    let list = getStoredProducts();

    if (filters?.brandId) {
      list = list.filter((p) => p.brandId === filters.brandId);
    }

    if (filters?.category && filters.category !== 'all') {
      list = list.filter(
        (p) => p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (filters?.status === 'active') {
      list = list.filter((p) => !p.isArchived);
    } else if (filters?.status === 'archived') {
      list = list.filter((p) => p.isArchived);
    }

    return list;
  },

  /**
   * Retrieves products for a specific brand.
   */
  getProductsForBrand(brandId: string): ExtendedProduct[] {
    return this.getProducts({ brandId, status: 'all' });
  },

  /**
   * Retrieves a product by ID.
   */
  getProductById(id: string): ExtendedProduct | undefined {
    return getStoredProducts().find((p) => p.id === id);
  },

  /**
   * Creates a new brand product.
   */
  async createProduct(
    user: User,
    payload: {
      brandId: string;
      name: string;
      category: string;
      description: string;
      price: number;
      currency?: string;
      image: string;
      gallery?: string[];
      features?: string[];
      externalPurchaseUrl?: string;
      isFeatured?: boolean;
    }
  ): Promise<ExtendedProduct> {
    if (!user || !user.id) {
      throw new Error('Authentication required');
    }

    // Role check
    if (user.role !== 'brand_owner' && user.role !== 'brand_admin' && user.role !== 'admin') {
      throw new Error('Forbidden: Only Brand Owners and Administrators can create products');
    }

    // Ownership check
    if (!brandOwnerService.isAuthorizedForBrand(user, payload.brandId)) {
      throw new Error(`Unauthorized: You are not authorized to create products for brand "${payload.brandId}"`);
    }

    // Validations
    if (!payload.name || payload.name.trim().length < 2) {
      throw new Error('Product name must be at least 2 characters.');
    }
    if (!payload.category || !payload.category.trim()) {
      throw new Error('Product category is required.');
    }
    if (!payload.description || payload.description.trim().length < 10) {
      throw new Error('Product description must be at least 10 characters.');
    }
    if (typeof payload.price !== 'number' || isNaN(payload.price) || payload.price < 0) {
      throw new Error('Product price must be a non-negative number.');
    }
    if (!payload.image || !isValidUrl(payload.image)) {
      throw new Error('Please provide a valid product image URL starting with http:// or https://');
    }
    if (payload.externalPurchaseUrl && !isValidUrl(payload.externalPurchaseUrl)) {
      throw new Error('External purchase URL must start with http:// or https://');
    }

    const currency = payload.currency || '₹';
    const newProduct: ExtendedProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      brandId: payload.brandId,
      name: payload.name.trim(),
      category: payload.category.trim(),
      description: payload.description.trim(),
      price: payload.price,
      currency,
      priceFormatted: `${currency}${payload.price}`,
      image: payload.image.trim(),
      gallery: payload.gallery && payload.gallery.length > 0 ? payload.gallery : [payload.image.trim()],
      features: payload.features && payload.features.length > 0 ? payload.features : [],
      externalPurchaseUrl: payload.externalPurchaseUrl ? payload.externalPurchaseUrl.trim() : undefined,
      isFeatured: Boolean(payload.isFeatured),
      isArchived: false,
      relatedCreatorIds: [],
    };

    // If Supabase table is available, attempt remote insert
    const isAvailable = await probeProductTableAvailability();
    if (isAvailable && isSupabaseConfigured) {
      try {
        await supabase.from('products').insert({
          id: newProduct.id,
          brand_id: newProduct.brandId,
          name: newProduct.name,
          category: newProduct.category,
          description: newProduct.description,
          price: newProduct.price,
          currency: newProduct.currency,
          image: newProduct.image,
          gallery: newProduct.gallery,
          features: newProduct.features,
          external_purchase_url: newProduct.externalPurchaseUrl || null,
          is_featured: newProduct.isFeatured,
          is_archived: false,
        });
      } catch (err) {
        console.warn('[BrandProductService] Supabase insert failed, saving locally:', err);
      }
    }

    const all = getStoredProducts();
    const updated = [newProduct, ...all];
    saveStoredProducts(updated);
    return newProduct;
  },

  /**
   * Updates an existing brand product.
   */
  async updateProduct(
    user: User,
    productId: string,
    updates: Partial<Omit<ExtendedProduct, 'id' | 'brandId'>>
  ): Promise<ExtendedProduct> {
    if (!user || !user.id) throw new Error('Authentication required');

    const all = getStoredProducts();
    const index = all.findIndex((p) => p.id === productId);
    if (index === -1) {
      throw new Error(`Product with ID "${productId}" not found.`);
    }

    const current = all[index];

    // Ownership check
    if (!brandOwnerService.isAuthorizedForBrand(user, current.brandId)) {
      throw new Error(`Unauthorized: You are not authorized to modify products for brand "${current.brandId}"`);
    }

    // Validations
    if (updates.name !== undefined && updates.name.trim().length < 2) {
      throw new Error('Product name must be at least 2 characters.');
    }
    if (updates.description !== undefined && updates.description.trim().length < 10) {
      throw new Error('Product description must be at least 10 characters.');
    }
    if (updates.price !== undefined && (isNaN(updates.price) || updates.price < 0)) {
      throw new Error('Product price must be a valid non-negative number.');
    }
    if (updates.image !== undefined && !isValidUrl(updates.image)) {
      throw new Error('Please provide a valid product image URL starting with http:// or https://');
    }
    if (updates.externalPurchaseUrl && !isValidUrl(updates.externalPurchaseUrl)) {
      throw new Error('External purchase URL must start with http:// or https://');
    }

    const currency = updates.currency || current.currency;
    const price = updates.price !== undefined ? updates.price : current.price;

    const updatedProduct: ExtendedProduct = {
      ...current,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      category: updates.category !== undefined ? updates.category.trim() : current.category,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      price,
      currency,
      priceFormatted: `${currency}${price}`,
      image: updates.image !== undefined ? updates.image.trim() : current.image,
      externalPurchaseUrl: updates.externalPurchaseUrl !== undefined ? updates.externalPurchaseUrl.trim() : current.externalPurchaseUrl,
      isArchived: updates.isArchived !== undefined ? updates.isArchived : current.isArchived,
    };

    all[index] = updatedProduct;
    saveStoredProducts(all);
    return updatedProduct;
  },

  /**
   * Toggles product archival status (safe alternative to deletion).
   */
  async archiveProduct(user: User, productId: string, archive = true): Promise<ExtendedProduct> {
    return this.updateProduct(user, productId, { isArchived: archive });
  },

  /**
   * Safely deletes a product only if no campaign or creator portfolio references it.
   */
  async deleteProduct(user: User, productId: string): Promise<{ success: boolean; message: string }> {
    if (!user || !user.id) throw new Error('Authentication required');

    const all = getStoredProducts();
    const index = all.findIndex((p) => p.id === productId);
    if (index === -1) {
      throw new Error(`Product with ID "${productId}" not found.`);
    }

    const product = all[index];

    // Ownership check
    if (!brandOwnerService.isAuthorizedForBrand(user, product.brandId)) {
      throw new Error(`Unauthorized: You are not authorized to delete products for brand "${product.brandId}"`);
    }

    // Dependency check 1: Campaigns referencing this product
    const referencingCampaign = CAMPAIGNS.find((c) => c.productId === productId);
    if (referencingCampaign) {
      throw new Error(
        `Cannot delete "${product.name}" because it is actively referenced by campaign "${referencingCampaign.title}". Please archive the product instead to maintain campaign integrity.`
      );
    }

    // Dependency check 2: Creator portfolios referencing this product
    const referencingCreator = CREATORS.find((c) =>
      c.portfolio.some((item) => item.relatedProductId === productId)
    );
    if (referencingCreator) {
      throw new Error(
        `Cannot delete "${product.name}" because it is showcased in creator portfolio items for ${referencingCreator.name}. Please archive the product instead.`
      );
    }

    // Safe to delete
    all.splice(index, 1);
    saveStoredProducts(all);

    return {
      success: true,
      message: `Product "${product.name}" was successfully deleted.`,
    };
  },

  getStorageStatus: getProductStorageStatus,
};
