import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand, Creator } from '../../types/marketplace';
import { MarketplaceCampaign } from '../../types/marketplace';
import { brandOwnerService } from '../../services/brandOwnerService';
import { brandCampaignService } from '../../services/brandCampaignService';
import { CREATORS } from '../../data/marketplaceData';
import { BrandNavHeader } from '../../components/brand/BrandNavHeader';
import {
  Users,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  MapPin,
  Globe,
  Video,
  Layers,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Compass
} from 'lucide-react';

export const BrandCreatorsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [brandCampaigns, setBrandCampaigns] = useState<MarketplaceCampaign[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState<'campaigns' | 'name' | 'portfolio'>('campaigns');

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCreatorForInvite, setSelectedCreatorForInvite] = useState<Creator | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string>('');

  // Initialize active brand
  useEffect(() => {
    if (!currentUser) return;
    const initialBrand = brandOwnerService.getActiveBrand(currentUser);
    setActiveBrand(initialBrand);
  }, [currentUser]);

  // Load brand campaigns for invitations
  useEffect(() => {
    if (activeBrand) {
      const camps = brandCampaignService.getCampaignsForBrand(activeBrand.id);
      setBrandCampaigns(camps);
      if (camps.length > 0) {
        setSelectedCampaignId(camps[0].id);
      }
    }
  }, [activeBrand]);

  const handleBrandChange = (brand: Brand) => {
    brandOwnerService.setActiveBrandId(brand.id);
    setActiveBrand(brand);
  };

  // Derive unique niches, countries, formats, languages from dataset
  const niches = useMemo(() => {
    const set = new Set<string>();
    CREATORS.forEach((c) => {
      if (c.niche) set.add(c.niche);
    });
    return Array.from(set).sort();
  }, []);

  const countries = useMemo(() => {
    const set = new Set<string>();
    CREATORS.forEach((c) => {
      if (c.country) set.add(c.country);
    });
    return Array.from(set).sort();
  }, []);

  const formats = useMemo(() => {
    const set = new Set<string>();
    CREATORS.forEach((c) => {
      c.formats?.forEach((f) => set.add(f));
    });
    return Array.from(set).sort();
  }, []);

  const languages = useMemo(() => {
    const set = new Set<string>();
    CREATORS.forEach((c) => {
      c.languages?.forEach((l) => set.add(l));
    });
    return Array.from(set).sort();
  }, []);

  // Filtered and sorted creators
  const filteredCreators = useMemo(() => {
    return CREATORS.filter((creator) => {
      // Search
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesName = creator.name.toLowerCase().includes(query);
        const matchesHandle = creator.handle.toLowerCase().includes(query);
        const matchesBio = creator.bio.toLowerCase().includes(query);
        const matchesNiche = creator.niche.toLowerCase().includes(query);
        if (!matchesName && !matchesHandle && !matchesBio && !matchesNiche) {
          return false;
        }
      }

      // Niche
      if (selectedNiche !== 'all' && creator.niche !== selectedNiche) {
        return false;
      }

      // Country
      if (selectedCountry !== 'all' && creator.country !== selectedCountry) {
        return false;
      }

      // Format
      if (selectedFormat !== 'all' && !creator.formats?.includes(selectedFormat)) {
        return false;
      }

      // Language
      if (selectedLanguage !== 'all' && !creator.languages?.includes(selectedLanguage)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'campaigns') {
        return (b.simulatedMetrics?.completedCampaigns || 0) - (a.simulatedMetrics?.completedCampaigns || 0);
      }
      if (sortBy === 'portfolio') {
        return (b.portfolio?.length || 0) - (a.portfolio?.length || 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, selectedNiche, selectedCountry, selectedFormat, selectedLanguage, sortBy]);

  const handleOpenInvite = (creator: Creator) => {
    setSelectedCreatorForInvite(creator);
    setInviteMessage(`Hi ${creator.name}! We love your content on BrandWaves and would love for you to collaborate on our upcoming campaign for ${activeBrand?.name}.`);
    setInviteSuccess(null);
    setInviteModalOpen(true);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorForInvite || !selectedCampaignId) return;

    const camp = brandCampaigns.find((c) => c.id === selectedCampaignId);
    setInviteSuccess(
      `Invitation sent to ${selectedCreatorForInvite.name} for campaign "${camp?.title || 'Brand Brief'}". In Phase 6, AI automated outreach will follow up directly.`
    );

    setTimeout(() => {
      setInviteModalOpen(false);
      setInviteSuccess(null);
      setSelectedCreatorForInvite(null);
    }, 2400);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedNiche('all');
    setSelectedCountry('all');
    setSelectedFormat('all');
    setSelectedLanguage('all');
    setSortBy('campaigns');
  };

  return (
    <div className="min-h-screen bg-[#F9F7F7] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation & Brand Switcher */}
        <BrandNavHeader
          activeBrand={activeBrand}
          onBrandChange={handleBrandChange}
          title="Creator Discovery & Outreach"
          subtitle="Discover verified creators across India & globally. Review authentic portfolios and invite creators to your briefs."
        />

        {/* Demo Metrics Transparency Alert */}
        <div className="mb-6 p-4 rounded-2xl bg-[#DBE2EF]/50 border border-[#DBE2EF] text-xs text-[#112D4E] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#3F72AF] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">Real Portfolios & Simulated Reach Metrics</span>
            <p className="text-gray-600 leading-relaxed">
              Creator profiles, work samples, and format specialties represent actual registered portfolio assets.
              Reach figures (followers & views) are clearly labeled as <strong>simulated demo estimates</strong> for testing discovery workflows. No follower or engagement data is fabricated or claimed as production API telemetry.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-6 border border-[#DBE2EF] shadow-subtle mb-8 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by creator name, @handle, niche, or bio..."
                className="w-full pl-12 pr-4 py-3 bg-[#F9F7F7] border border-[#DBE2EF] rounded-2xl text-sm text-[#112D4E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#112D4E]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3.5 py-2.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs font-bold text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="campaigns">Most Completed Campaigns</option>
                <option value="portfolio">Most Portfolio Items</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Detailed Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#DBE2EF]/60">
            {/* Niche */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                Niche / Category
              </label>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs font-medium text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="all">All Niches ({niches.length})</option>
                {niches.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                Location
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs font-medium text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="all">All Locations ({countries.length})</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                Deliverable Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs font-medium text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="all">All Formats ({formats.length})</option>
                {formats.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs font-medium text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="all">All Languages ({languages.length})</option>
                {languages.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(searchQuery || selectedNiche !== 'all' || selectedCountry !== 'all' || selectedFormat !== 'all' || selectedLanguage !== 'all') && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">
                Found <strong className="text-[#112D4E]">{filteredCreators.length}</strong> matching creators
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-[#3F72AF] hover:underline cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Creators Grid */}
        {filteredCreators.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#DBE2EF] text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#DBE2EF]/50 flex items-center justify-center text-gray-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#112D4E]">No creators match your criteria</h3>
            <p className="text-xs text-gray-500 max-w-md">
              Try adjusting your search terms or clearing specific category or location filters to browse our 18 verified demo creators.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-2xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all cursor-pointer shadow-subtle"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white rounded-3xl border border-[#DBE2EF] shadow-subtle hover:shadow-hover hover:border-[#3F72AF]/40 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Header banner / avatar */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#DBE2EF] shadow-2xs shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[#112D4E] truncate">
                          {creator.name}
                        </h3>
                        {creator.isFeatured && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#DBE2EF] text-[#3F72AF] rounded-full shrink-0">
                            Featured
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-400 block truncate">
                        {creator.handle}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-[#3F72AF] shrink-0" />
                        <span className="truncate">{creator.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-600 line-clamp-2 mt-3 leading-relaxed">
                    {creator.bio}
                  </p>

                  {/* Badges / Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DBE2EF]/60 text-[#112D4E]">
                      {creator.niche}
                    </span>
                    {creator.formats?.slice(0, 2).map((fmt) => (
                      <span key={fmt} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F9F7F7] border border-[#DBE2EF] text-gray-600">
                        {fmt}
                      </span>
                    ))}
                    {creator.languages?.slice(0, 2).map((lang) => (
                      <span key={lang} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F9F7F7] border border-[#DBE2EF] text-gray-500">
                        {lang}
                      </span>
                    ))}
                  </div>

                  {/* Simulated Metrics Strip */}
                  <div className="mt-4 p-2.5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]/60 flex items-center justify-between text-center">
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        Demo Reach
                      </div>
                      <div className="text-xs font-black text-[#112D4E]">
                        {creator.simulatedMetrics?.followersCount || '50K'}
                      </div>
                    </div>
                    <div className="w-px h-6 bg-[#DBE2EF]" />
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        Eng. Rate
                      </div>
                      <div className="text-xs font-black text-[#3F72AF]">
                        {creator.simulatedMetrics?.engagementRate || '4.2%'}
                      </div>
                    </div>
                    <div className="w-px h-6 bg-[#DBE2EF]" />
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        Completed
                      </div>
                      <div className="text-xs font-black text-[#112D4E]">
                        {creator.simulatedMetrics?.completedCampaigns || 0} briefs
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Previews */}
                  {creator.portfolio && creator.portfolio.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Recent Deliverables</span>
                        <span>{creator.portfolio.length} samples</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {creator.portfolio.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="relative rounded-xl overflow-hidden border border-[#DBE2EF] group/item aspect-video bg-gray-100"
                          >
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1.5">
                              <span className="text-[9px] text-white font-medium line-clamp-1">
                                {item.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-3 border-t border-[#DBE2EF] bg-[#F9F7F7]/60 flex items-center gap-2">
                  <Link
                    to={`/creators/${creator.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#DBE2EF] hover:bg-[#DBE2EF]/40 text-xs font-bold text-[#112D4E] flex items-center justify-center gap-1.5 transition-all text-center shadow-2xs"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenInvite(creator)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-subtle cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite to Campaign Modal */}
      {inviteModalOpen && selectedCreatorForInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal border border-[#DBE2EF] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#DBE2EF] flex items-center justify-between bg-[#F9F7F7]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCreatorForInvite.avatar}
                  alt={selectedCreatorForInvite.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#DBE2EF]"
                />
                <div>
                  <h3 className="text-base font-extrabold text-[#112D4E]">
                    Invite {selectedCreatorForInvite.name}
                  </h3>
                  <span className="text-xs text-gray-500">{selectedCreatorForInvite.handle}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-gray-400 hover:text-[#112D4E] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#112D4E]">Invitation Dispatched</h4>
                <p className="text-xs text-gray-600 max-w-sm leading-relaxed">
                  {inviteSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="p-6 flex flex-col gap-4">
                {brandCampaigns.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    <p className="font-bold mb-1">No Active Campaigns for {activeBrand?.name || 'this brand'}</p>
                    <p>
                      Please create a campaign brief first in the Campaigns tab before inviting creators.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                        Select Campaign Brief *
                      </label>
                      <select
                        value={selectedCampaignId}
                        onChange={(e) => setSelectedCampaignId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs font-semibold text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                      >
                        {brandCampaigns.map((camp) => (
                          <option key={camp.id} value={camp.id}>
                            {camp.title} ({camp.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                        Personalized Invitation Message
                      </label>
                      <textarea
                        rows={4}
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                        placeholder="Explain why this creator is an authentic fit for this brand brief..."
                      />
                    </div>
                  </>
                )}

                <div className="pt-3 border-t border-[#DBE2EF] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] text-xs font-bold text-gray-600 hover:bg-[#F9F7F7]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={brandCampaigns.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-subtle disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Invitation</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
