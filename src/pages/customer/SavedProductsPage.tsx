import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ShoppingBag, ArrowRight, Database, Laptop, Info } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { DemoNotice } from '../../components/marketplace/DemoNotice';

export const SavedProductsPage: React.FC = () => {
  const { savedProducts, loading, isPersistent, storageStatus } = useWishlist();

  return (
    <div className="min-h-screen bg-[#F9F7F7] pb-20">
      {/* Editorial Header */}
      <div className="bg-gradient-to-b from-[#DBE2EF]/30 to-transparent border-b border-[#DBE2EF]/60 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-3">
                <Bookmark className="w-3.5 h-3.5 text-[#3F72AF]" />
                Customer Wishlist
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] tracking-tight">
                Saved Products
              </h1>
              <p className="text-base text-gray-600 mt-2 max-w-2xl">
                Your personal collection of bookmarked products. Review specs, discover creator reviews, and revisit anytime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/80 border border-[#DBE2EF] text-xs font-medium text-gray-700 shadow-xs">
                {isPersistent ? (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Supabase Cloud Synchronized</span>
                  </>
                ) : (
                  <>
                    <Laptop className="w-3.5 h-3.5 text-amber-600" />
                    <span>Browser Storage (Local Fallback)</span>
                  </>
                )}
              </div>

              <Link
                to="/customer/products"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-semibold transition-colors shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Catalog</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Persistence Notice when operating under fallback */}
        {!isPersistent && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Account-Isolated Storage Fallback</span>
              <p className="text-amber-800 leading-relaxed">
                Saved products are currently preserved in your browser's local storage for your account. 
                To activate cross-device Supabase PostgreSQL synchronization, apply migration{' '}
                <code className="font-mono font-bold bg-amber-100 px-1 py-0.5 rounded text-[11px]">
                  supabase/migrations/20261010200000_customer_saved_products.sql
                </code>{' '}
                in the Supabase SQL editor.
              </p>
            </div>
          </div>
        )}

        {/* Count Bar */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {loading ? (
              'Loading saved products...'
            ) : (
              <>
                <strong className="text-[#112D4E] font-semibold">{savedProducts.length}</strong>{' '}
                {savedProducts.length === 1 ? 'saved product' : 'saved products'}
              </>
            )}
          </p>

          {savedProducts.length > 0 && (
            <Link
              to="/customer/products"
              className="text-xs font-semibold text-[#3F72AF] hover:text-[#112D4E] flex items-center gap-1 transition-colors"
            >
              <span>Add more products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Content State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white/50 border border-[#DBE2EF] animate-pulse"
              />
            ))}
          </div>
        ) : savedProducts.length === 0 ? (
          /* Empty State */
          <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-3xl border border-[#DBE2EF] shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#DBE2EF]/60 text-[#3F72AF] flex items-center justify-center mb-5">
              <Bookmark className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#112D4E] mb-2">No saved products yet</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Explore the BrandWaves catalog to bookmark featured products, compare brand stories, and track creator-vetted items.
            </p>
            <Link
              to="/customer/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showSaveButton={true} />
            ))}
          </div>
        )}

        <div className="mt-16">
          <DemoNotice />
        </div>
      </div>
    </div>
  );
};
