import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Users, Sparkles } from 'lucide-react';
import { getCreators } from '../../data/marketplaceData';
import { CreatorCard } from '../../components/marketplace/CreatorCard';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { WaterReveal } from '../../components/common/WaterMotion';

const NICHES = [
  'All',
  'Technology',
  'Beauty',
  'Fashion',
  'Fitness',
  'Lifestyle',
  'Food',
  'Skincare',
  'Gaming',
  'Home & Lifestyle',
  'Travel',
];

const COUNTRIES = ['All', 'India', 'UK', 'USA'];

const LANGUAGES = [
  'All',
  'English',
  'Hindi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Bengali',
  'Marathi',
  'Punjabi',
  'Gujarati',
];

export const CreatorsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const filteredCreators = useMemo(() => {
    return getCreators({
      search,
      niche: selectedNiche,
      country: selectedCountry,
      language: selectedLanguage,
    });
  }, [search, selectedNiche, selectedCountry, selectedLanguage]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedNiche !== 'All' ||
    selectedCountry !== 'All' ||
    selectedLanguage !== 'All';

  const clearFilters = () => {
    setSearch('');
    setSelectedNiche('All');
    setSelectedCountry('All');
    setSelectedLanguage('All');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DBE2EF] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Curated Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#112D4E] tracking-tight">
            Discover Creators
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Connect with 18 verified voices across technology, beauty, streetwear, fitness, and lifestyle across India and globally.
          </p>
        </div>

        <DemoNotice type="metrics" className="self-start md:self-auto" />
      </div>

      {/* Search and Filters Bar */}
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
            placeholder="Search creators by name, handle, bio, city, or niche..."
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

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Niche Pills Rail */}
          <div className="w-full overflow-x-auto pb-1 no-scrollbar flex items-center gap-1.5">
            {NICHES.map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => setSelectedNiche(niche)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  selectedNiche === niche
                    ? 'bg-[#112D4E] text-white shadow-xs'
                    : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                }`}
              >
                {niche}
              </button>
            ))}
          </div>

          {/* Secondary Dropdowns: Country & Language */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs w-full">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Location:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-[#F9F7F7] border border-[#DBE2EF] rounded-lg px-2.5 py-1.5 font-medium text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Locations' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-[#F9F7F7] border border-[#DBE2EF] rounded-lg px-2.5 py-1.5 font-medium text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l === 'All' ? 'All Languages' : l}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:underline p-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Showing <strong className="text-[#112D4E] font-bold">{filteredCreators.length}</strong> of 18 creators
        </span>
        {hasActiveFilters && <span>Filtered results</span>}
      </div>

      {/* Creator Grid with Water Reveal Entrance */}
      {filteredCreators.length > 0 ? (
        <WaterReveal triggerKey={`${selectedNiche}-${selectedCountry}-${selectedLanguage}-${search}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </WaterReveal>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#DBE2EF] p-12 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] flex items-center justify-center text-[#112D4E] mx-auto">
            <Users className="w-6 h-6 text-[#3F72AF]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#112D4E]">No creators match your criteria</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search query, or clear the niche, location, or language filters.
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
