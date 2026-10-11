import React, { useState, useMemo } from 'react';
import { Search, X, Package, Sparkles } from 'lucide-react';
import { getProducts, getProductCategoriesWithCounts } from '../../data/marketplaceData';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { WaterReveal } from '../../components/common/WaterMotion';

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Products');

  // Categories computed dynamically to ensure 100% accurate product counts
  const categories = useMemo(() => getProductCategoriesWithCounts(), []);

  const filteredProducts = useMemo(() => {
    return getProducts({
      search,
      category: selectedCategory === 'All Products' ? 'All' : selectedCategory,
    });
  }, [search, selectedCategory]);

  const hasActiveFilters = search.trim() !== '' || selectedCategory !== 'All Products';

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All Products');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DBE2EF] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Product Showcase</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#112D4E] tracking-tight">
            Discover Standout Products
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Explore 24 original products across 10 curated fictional brands, from craft sodas and clinical skincare to selvedge denim and acoustic hardware.
          </p>
        </div>

        <DemoNotice type="brand" className="self-start md:self-auto" />
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4 liquid-glass-surface p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-glass">
        {/* Subtle top specular reflection line */}
        <div 
          className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" 
          aria-hidden="true" 
        />

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, description, brand, or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-[#DBE2EF] rounded-xl text-sm text-[#112D4E] placeholder:text-gray-400 focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Horizontal Rail */}
        <div 
          className="w-full overflow-x-auto pb-1 no-scrollbar flex items-center gap-2"
          role="tablist"
          aria-label="Product Categories"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-1 ${
                  isSelected
                    ? 'bg-[#112D4E] text-white shadow-sm'
                    : 'bg-white/80 text-gray-600 hover:bg-[#E7F2F8] hover:text-[#112D4E] border border-[#DCE5EB]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#DBE2EF] text-[#112D4E]'
                  }`}
                >
                  {cat.count}
                </span>
                {isSelected && (
                  <span
                    className="absolute -bottom-1 left-3 right-3 h-0.5 bg-[#73B8D8] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] shrink-0 ml-2 py-1.5 px-2 rounded-lg hover:bg-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Showing <strong className="text-[#112D4E] font-bold">{filteredProducts.length}</strong> of 24 products
        </span>
        {hasActiveFilters && <span>Filtered by search & category</span>}
      </div>

      {/* Product Grid with Water-Inspired Transition Reveal */}
      {filteredProducts.length > 0 ? (
        <WaterReveal triggerKey={`${selectedCategory}-${search}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </WaterReveal>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#DBE2EF] p-12 text-center space-y-4 max-w-md mx-auto my-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] flex items-center justify-center text-[#112D4E] mx-auto">
            <Package className="w-6 h-6 text-[#3F72AF]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#112D4E]">No products found</h3>
            <p className="text-xs text-gray-500 mt-1">
              No products match your current search criteria. Try choosing a different category or clearing filters.
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#112D4E] text-white hover:bg-[#112D4E]/90 transition-all shadow-xs"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
