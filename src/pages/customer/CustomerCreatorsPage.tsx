import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, X, Users, Sparkles, MapPin, Globe, Film, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { getCreators, getProductById } from '../../data/marketplaceData';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { Creator } from '../../types/marketplace';

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

export const CustomerCreatorsPage: React.FC = () => {
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
    <div className="min-h-screen bg-[#F9F7F7] pb-20">
      {/* Editorial Header */}
      <div className="bg-gradient-to-b from-[#DBE2EF]/30 to-transparent border-b border-[#DBE2EF]/60 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5 text-[#3F72AF]" />
              Creator Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] tracking-tight">
              Discover Creators & Reviews
            </h1>
            <p className="text-base text-gray-600 mt-2 leading-relaxed">
              Find authentic creator voices sharing high-craft product reviews, video breakdowns, and style inspiration.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by creator name, handle, or focus niche..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-[#DBE2EF] text-[#112D4E] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Niche selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Niche:</span>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-[#DBE2EF] text-xs font-medium text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                {NICHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Country selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Region:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-[#DBE2EF] text-xs font-medium text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-[#DBE2EF] text-xs font-medium text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Count Bar */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <strong className="text-[#112D4E] font-semibold">{filteredCreators.length}</strong>{' '}
            {filteredCreators.length === 1 ? 'creator' : 'creators'}
          </p>

          <span className="text-[11px] font-mono text-gray-400">
            Canonical Dataset — Simulated Metrics for Demo
          </span>
        </div>

        {/* Results */}
        {filteredCreators.length === 0 ? (
          <div className="max-w-md mx-auto my-12 p-8 text-center bg-white rounded-3xl border border-[#DBE2EF]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#112D4E] mb-2">No creators found</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              We couldn't find any creators matching your filter criteria. Try clearing some filters or searching with a different term.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3F72AF] text-white text-xs font-semibold hover:bg-[#112D4E] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <CreatorEditorialCard key={creator.id} creator={creator} />
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

interface CreatorEditorialCardProps {
  creator: Creator;
}

const CreatorEditorialCard: React.FC<CreatorEditorialCardProps> = ({ creator }) => {
  // Find linked products from this creator's portfolio
  const linkedPortfolioItems = creator.portfolio.filter((p) => p.relatedProductId);

  return (
    <div className="bg-white rounded-2xl border border-[#DBE2EF] p-5 hover:shadow-lg transition-all flex flex-col justify-between">
      <div>
        {/* Creator Identity */}
        <div className="flex items-start gap-3.5 mb-4">
          <Link to={`/creators/${creator.id}`} className="shrink-0 relative group">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-[#DBE2EF] group-hover:ring-[#3F72AF] transition-all"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <Link
                to={`/creators/${creator.id}`}
                className="text-base font-bold text-[#112D4E] hover:text-[#3F72AF] transition-colors truncate"
              >
                {creator.name}
              </Link>
              <Link
                to={`/creators/${creator.id}`}
                className="text-gray-400 hover:text-[#3F72AF] p-1 transition-colors"
                title="View Creator Profile"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-xs font-mono text-gray-500">{creator.handle}</p>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
              <MapPin className="w-3 h-3 text-[#3F72AF]" />
              <span>{creator.location}</span>
            </div>
          </div>
        </div>

        {/* Niche & Languages */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#DBE2EF] text-[#112D4E]">
            {creator.niche}
          </span>
          {creator.languages.slice(0, 2).map((lang) => (
            <span
              key={lang}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600"
            >
              {lang}
            </span>
          ))}
        </div>

        {/* Short Bio */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {creator.bio}
        </p>

        {/* Featured Review / Content with Linked Product */}
        {linkedPortfolioItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
              <Film className="w-3 h-3 text-[#3F72AF]" />
              Featured Product Review
            </p>
            {linkedPortfolioItems.slice(0, 1).map((item) => {
              const prod = item.relatedProductId ? getProductById(item.relatedProductId) : null;
              return (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#112D4E] truncate">{item.title}</p>
                    {prod && (
                      <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        <span>Reviewing:</span>
                        <strong className="text-[#3F72AF] font-medium">{prod.name}</strong>
                      </p>
                    )}
                  </div>
                  {prod && (
                    <Link
                      to={`/customer/products/${prod.id}`}
                      className="shrink-0 p-1.5 rounded-lg bg-white border border-[#DBE2EF] text-[#3F72AF] hover:bg-[#3F72AF] hover:text-white transition-colors"
                      title={`View Product: ${prod.name}`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simulated Metrics Demo pill & Action */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span>{creator.simulatedMetrics.followersCount} followers</span>
          <span>•</span>
          <span>{creator.simulatedMetrics.engagementRate} eng.</span>
        </div>
        <Link
          to={`/creators/${creator.id}`}
          className="text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] transition-colors"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
};
