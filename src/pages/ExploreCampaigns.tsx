import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles, Filter, Users, Clock, DollarSign, ArrowUpRight } from 'lucide-react';
import { getMarketplaceCampaigns } from '../data/marketplaceData';
import { MarketplaceCampaignCard } from '../components/marketplace/MarketplaceCampaignCard';
import { DemoNotice } from '../components/marketplace/DemoNotice';

const STATUS_FILTERS = ['All', 'Open', 'In Progress', 'Completed'];

const CATEGORY_FILTERS = [
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

export const ExploreCampaigns: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredCampaigns = useMemo(() => {
    return getMarketplaceCampaigns({
      search: searchTerm,
      status: selectedStatus === 'All' ? undefined : selectedStatus.toLowerCase().replace(' ', '_'),
      category: selectedCategory === 'All' ? undefined : selectedCategory,
    });
  }, [searchTerm, selectedStatus, selectedCategory]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || selectedStatus !== 'All' || selectedCategory !== 'All';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedCategory('All');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DBE2EF]/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Verified Brand Briefs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#112D4E] tracking-tight">
            Discover Active Campaigns
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Browse 10 authentic brand briefs with guaranteed compensation, structured deliverables, and direct creative autonomy.
          </p>
        </div>

        <DemoNotice type="general" className="self-start md:self-auto" />
      </section>

      {/* Filter Controls: Search & Channels */}
      <section className="space-y-4 liquid-glass-surface p-4 sm:p-5 rounded-2xl relative overflow-hidden shadow-glass">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns by brief title, brand name, objectives, or niche..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-[#DBE2EF] rounded-xl text-sm text-[#112D4E] placeholder:text-gray-400 focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filters Rail */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">Status:</span>
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-[#112D4E] text-white shadow-xs'
                    : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Rail */}
          <div className="w-full overflow-x-auto pb-1 no-scrollbar flex items-center gap-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 mr-1 shrink-0">Niche:</span>
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#3F72AF] text-white shadow-xs'
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
      </section>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Showing <strong className="text-[#112D4E] font-bold">{filteredCampaigns.length}</strong> of 10 campaigns
        </span>
        {hasActiveFilters && <span>Filtered briefs</span>}
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <MarketplaceCampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#DBE2EF] p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] flex items-center justify-center text-[#112D4E] mx-auto">
            <Sparkles className="w-6 h-6 text-[#3F72AF]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#112D4E]">No campaigns match your filters</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try choosing a different status or niche, or clear your search term.
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#112D4E] text-white hover:bg-[#112D4E]/90 transition-all"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
