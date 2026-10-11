import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ArrowUpDown, ShoppingBag, Sparkles } from 'lucide-react';
import { getProducts, getBrandById } from '../../data/marketplaceData';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { Product } from '../../types/marketplace';

const CATEGORIES = [
  'All Products',
  'Skincare & Beauty',
  'Audio & Headphones',
  'Fashion & Accessories',
  'Lifestyle & Other Products',
];

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export const CustomerProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || 'All';

  const [search, setSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Keep state in sync with URL parameters if user navigated from dashboard
  React.useEffect(() => {
    if (urlSearch !== search) setSearch(urlSearch);
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
  }, [urlSearch, urlCategory]);

  const filteredProducts = useMemo(() => {
    let list = getProducts({
      search,
      category: selectedCategory,
    });

    switch (sortBy) {
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return list;
  }, [search, selectedCategory, sortBy]);

  const hasActiveFilters = search.trim() !== '' || selectedCategory !== 'All' || sortBy !== 'default';

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('default');
    setSearchParams({});
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DBE2EF] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Customer Product Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#112D4E] tracking-tight">
            Discover Products
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Browse 24 verified products from 10 partner labels. Save your favorite items to your personal wishlist with real-time persistence.
          </p>
        </div>

        <DemoNotice type="brand" className="self-start md:self-auto" />
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="space-y-4 liquid-glass-surface p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-glass">
        {/* Subtle top reflection line */}
        <div 
          className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" 
          aria-hidden="true" 
        />

        {/* Search input + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product title, brand name, category, or features..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-[#DBE2EF] rounded-xl text-sm text-[#112D4E] placeholder:text-gray-400 focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white/80 border border-[#DBE2EF] text-xs font-bold text-[#112D4E] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#3F72AF] cursor-pointer shadow-2xs"
            >
              <option value="default">Default Order</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Rail */}
        <div className="w-full overflow-x-auto pb-1 no-scrollbar flex items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#112D4E] text-white shadow-xs'
                  : 'bg-white/60 text-gray-600 hover:bg-white hover:text-[#112D4E] border border-[#DBE2EF]/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Result Meta & Clear Filters */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-[#DBE2EF]/60">
          <span>
            Showing <strong className="text-[#112D4E]">{filteredProducts.length}</strong> of 24 products
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[#3F72AF] hover:text-[#112D4E] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} showSaveButton={true} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="liquid-glass-surface rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-[#112D4E]">No matching products found</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            We couldn't find any products matching your current search or category criteria. Try broadening your keywords or clearing the active filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
