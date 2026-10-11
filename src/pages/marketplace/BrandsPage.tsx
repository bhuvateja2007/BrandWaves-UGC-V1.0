import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles, Building2 } from 'lucide-react';
import { getBrands } from '../../data/marketplaceData';
import { BrandCard } from '../../components/marketplace/BrandCard';
import { DemoNotice } from '../../components/marketplace/DemoNotice';

const BRAND_CATEGORIES = [
  'All',
  'Beverages',
  'Beauty & Skincare',
  'Fashion & Streetwear',
  'Technology & Audio',
  'Fitness & Activewear',
  'Food & Beverage',
  'Travel & Luggage',
  'Home & Living',
  'Sustainable Lifestyle',
  'Pet Care & Lifestyle',
];

export const BrandsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBrands = useMemo(() => {
    return getBrands({
      search,
      category: selectedCategory,
    });
  }, [search, selectedCategory]);

  const hasActiveFilters = search.trim() !== '' || selectedCategory !== 'All';

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DBE2EF] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Brand Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#112D4E] tracking-tight">
            Discover Brands
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Discover 10 forward-thinking fictional brands collaborating with authentic creators across beverages, beauty, fashion, audio, fitness, and design.
          </p>
        </div>

        <DemoNotice type="brand" className="self-start md:self-auto" />
      </div>

      {/* Search and Category Filter Bar */}
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
            placeholder="Search brands by name, category, tagline, or city..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-[#DBE2EF] rounded-xl text-sm text-[#112D4E] placeholder:text-gray-400 focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Rail */}
        <div className="w-full overflow-x-auto pb-1 no-scrollbar flex items-center gap-1.5">
          {BRAND_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-[#112D4E] text-white shadow-xs'
                  : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
              }`}
            >
              {cat}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:underline shrink-0 ml-2"
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
          Showing <strong className="text-[#112D4E] font-bold">{filteredBrands.length}</strong> of 10 brands
        </span>
        {hasActiveFilters && <span>Filtered results</span>}
      </div>

      {/* Brand Grid */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#DBE2EF] p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] flex items-center justify-center text-[#112D4E] mx-auto">
            <Building2 className="w-6 h-6 text-[#3F72AF]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#112D4E]">No brands found</h3>
            <p className="text-xs text-gray-500 mt-1">
              No brands match your search query or selected category.
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#112D4E] text-white hover:bg-[#112D4E]/90 transition-all"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};
