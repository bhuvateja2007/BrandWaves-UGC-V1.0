import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand, MarketplaceCampaign, Creator } from '../../types/marketplace';
import { brandOwnerService } from '../../services/brandOwnerService';
import { brandCampaignService } from '../../services/brandCampaignService';
import { 
  creatorMatchmakerService, 
  CreatorMatchRecommendation, 
  MatchmakerFilterOptions 
} from '../../services/creatorMatchmakerService';
import { CREATORS } from '../../data/marketplaceData';
import { BrandNavHeader } from '../../components/brand/BrandNavHeader';
import { CreatorComparisonModal } from '../../components/brand/CreatorComparisonModal';
import {
  Sparkles,
  Compass,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  X,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  MapPin,
  Globe,
  Video,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckSquare,
  Square,
  RotateCcw,
  Star
} from 'lucide-react';

export const BrandMatchmakerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [brandCampaigns, setBrandCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketplaceCampaign | undefined>(undefined);
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<CreatorMatchRecommendation[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  // Comparison state
  const [selectedForComparison, setSelectedForComparison] = useState<CreatorMatchRecommendation[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState<boolean>(false);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCreatorForInvite, setSelectedCreatorForInvite] = useState<CreatorMatchRecommendation | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // 1. Initialize Active Brand
  useEffect(() => {
    if (!currentUser) return;
    const initialBrand = brandOwnerService.getActiveBrand(currentUser);
    setActiveBrand(initialBrand);
  }, [currentUser]);

  // 2. Load Campaigns for Active Brand
  useEffect(() => {
    if (!activeBrand) return;
    const camps = brandCampaignService.getCampaignsForBrand(activeBrand.id);
    setBrandCampaigns(camps);

    // Pick campaign from query param or default to first
    const queryCampId = searchParams.get('campaignId');
    if (queryCampId) {
      const found = camps.find((c) => c.id === queryCampId);
      if (found) {
        setSelectedCampaign(found);
        return;
      }
    }

    if (camps.length > 0) {
      setSelectedCampaign(camps[0]);
    } else {
      setSelectedCampaign(undefined);
    }
  }, [activeBrand, searchParams]);

  // 3. Evaluate and Fetch Creator Matches
  useEffect(() => {
    if (!selectedCampaign || !activeBrand) {
      setRecommendations([]);
      return;
    }

    let isMounted = true;
    setLoadingMatches(true);
    setFetchError(null);

    const filterOpts: MatchmakerFilterOptions = {
      niche: selectedNiche !== 'all' ? selectedNiche : undefined,
      country: selectedCountry !== 'all' ? selectedCountry : undefined,
      format: selectedFormat !== 'all' ? selectedFormat : undefined,
      language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
      minScore: minScore > 0 ? minScore : undefined,
      searchQuery: searchQuery.trim() || undefined,
    };

    creatorMatchmakerService
      .matchCreators(selectedCampaign, activeBrand.id, filterOpts)
      .then((res) => {
        if (!isMounted) return;
        setRecommendations(res.recommendations);
        setAiStatus(res.aiStatus);
        setLoadingMatches(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setFetchError(err.message || 'Failed to match creators');
        setLoadingMatches(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    selectedCampaign,
    activeBrand,
    selectedNiche,
    selectedCountry,
    selectedFormat,
    selectedLanguage,
    minScore,
    searchQuery,
  ]);

  const handleBrandChange = (brand: Brand) => {
    brandOwnerService.setActiveBrandId(brand.id);
    setActiveBrand(brand);
    setSelectedForComparison([]);
  };

  const handleSelectCampaign = (campId: string) => {
    const camp = brandCampaigns.find((c) => c.id === campId);
    if (camp) {
      setSelectedCampaign(camp);
      setSearchParams({ campaignId: camp.id });
      setSelectedForComparison([]);
    }
  };

  // Derive unique filter items from active creator pool
  const uniqueNiches = useMemo(() => {
    const set = new Set<string>();
    CREATORS.forEach((c) => c.niche && set.add(c.niche));
    return Array.from(set).sort();
  }, []);

  const uniqueCountries = useMemo(() => {
    const set = new Set<string>();
    CREATORS.forEach((c) => c.country && set.add(c.country));
    return Array.from(set).sort();
  }, []);

  const uniqueFormats = useMemo(() => {
    const set = new Set<string>();
    CREATORS.forEach((c) => c.formats?.forEach((f) => set.add(f)));
    return Array.from(set).sort();
  }, []);

  const uniqueLanguages = useMemo(() => {
    const set = new Set<string>();
    CREATORS.forEach((c) => c.languages?.forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, []);

  // Comparison toggle
  const toggleCompare = (rec: CreatorMatchRecommendation) => {
    const exists = selectedForComparison.some((r) => r.creatorId === rec.creatorId);
    if (exists) {
      setSelectedForComparison(selectedForComparison.filter((r) => r.creatorId !== rec.creatorId));
    } else {
      if (selectedForComparison.length >= 3) {
        alert('You can compare a maximum of 3 creators at once.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, rec]);
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedNiche('all');
    setSelectedCountry('all');
    setSelectedFormat('all');
    setSelectedLanguage('all');
    setMinScore(0);
  };

  // Invite creator handling
  const handleOpenInvite = (rec: CreatorMatchRecommendation) => {
    setSelectedCreatorForInvite(rec);
    setInviteMessage(
      `Hi ${rec.creator.name}! Based on your strong portfolio and ${rec.creator.niche} focus, ${activeBrand?.name} would love to collaborate with you on our campaign: "${selectedCampaign?.title}".`
    );
    setInviteSuccess(null);
    setInviteModalOpen(true);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorForInvite || !selectedCampaign) return;

    setInviteSuccess(
      `Collaboration invitation successfully delivered to ${selectedCreatorForInvite.creator.name} for "${selectedCampaign.title}". They will be notified to review the brief and submit their response.`
    );

    setTimeout(() => {
      setInviteModalOpen(false);
      setInviteSuccess(null);
      setSelectedCreatorForInvite(null);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F7] pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Brand Header and Switcher */}
        <BrandNavHeader
          activeBrand={activeBrand}
          onBrandChange={handleBrandChange}
          title="AI Creator Matchmaker"
          subtitle="Identify verified creators aligned with your campaign brief through multi-criteria scoring, portfolio analysis, and explainable match rationale."
        />

        {/* Campaign Selection Hub */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DBE2EF] shadow-subtle mb-6 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                  Target Campaign Brief
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-[#112D4E]">
                  Select Campaign to Match
                </h2>
              </div>
            </div>

            {brandCampaigns.length > 0 ? (
              <div className="flex items-center gap-3 flex-wrap">
                <label htmlFor="campaign-select" className="text-xs font-bold text-gray-500 sr-only">
                  Select Campaign
                </label>
                <div className="relative min-w-[280px]">
                  <select
                    id="campaign-select"
                    value={selectedCampaign?.id || ''}
                    onChange={(e) => handleSelectCampaign(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs font-bold text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] appearance-none cursor-pointer"
                  >
                    {brandCampaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.title} ({camp.category} • {camp.platform})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <Link
                  to="/brand/campaigns/new"
                  className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] text-xs font-bold text-[#3F72AF] hover:bg-[#DBE2EF]/40 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create with Copilot</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">No campaigns found for this brand.</span>
                <Link
                  to="/brand/campaigns/new"
                  className="px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-colors"
                >
                  Create Campaign
                </Link>
              </div>
            )}
          </div>

          {/* Active Campaign Detail Summary Strip */}
          {selectedCampaign && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#112D4E] text-white">
                    {selectedCampaign.platform}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#DBE2EF] text-[#112D4E]">
                    {selectedCampaign.category}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    Format: {selectedCampaign.format}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Reward: {selectedCampaign.rewardAmount}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#112D4E] mt-1">
                  {selectedCampaign.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {selectedCampaign.brief}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/brand/campaigns/${selectedCampaign.id}`}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#DBE2EF] text-xs font-bold text-[#112D4E] hover:bg-[#DBE2EF]/30 transition-colors flex items-center gap-1.5"
                >
                  <span>Campaign Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* AI Transparency & Methodology Banner */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#DBE2EF]/50 border border-[#DBE2EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-[#3F72AF] flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-[#112D4E]">
                  {aiStatus?.isConfigured
                    ? `Live AI Model Active: ${aiStatus.model || 'gemini-2.5-flash'}`
                    : 'Deterministic Multi-Criteria Scoring Active'}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white text-[#3F72AF] border border-[#DBE2EF]">
                  {aiStatus?.isConfigured ? 'Live AI Mode' : 'Transparent Demo Mode'}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                Evaluates authentic creator records across 6 core pillars: Niche (30%), Content Format (25%), Verified Portfolio (20%), Location (10%), Language (10%), and Reliability (5%).{' '}
                <strong className="text-[#112D4E]">
                  A score is a decision-support signal, not a guarantee.
                </strong>{' '}
                Always review creator portfolios before making collaboration decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Search, Filter & Scoring Controls */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DBE2EF] shadow-subtle mb-8 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators by name, handle, or bio keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs font-medium text-[#112D4E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Stats & Mobile Filter Toggle */}
            <div className="flex items-center justify-between lg:justify-end gap-3">
              <span className="text-xs font-bold text-gray-500">
                {loadingMatches ? 'Scoring creators...' : `Showing ${recommendations.length} recommendations`}
              </span>

              <button
                type="button"
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                className="lg:hidden px-3.5 py-2 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs font-bold text-[#112D4E] flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {(searchQuery || selectedNiche !== 'all' || selectedCountry !== 'all' || selectedFormat !== 'all' || selectedLanguage !== 'all' || minScore > 0) && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns & Min Score Slider */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-[#DBE2EF] ${showFiltersMobile ? 'block' : 'hidden lg:grid'}`}>
            {/* Niche */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Content Niche
              </label>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs font-bold text-[#112D4E] focus:outline-none focus:ring-1 focus:ring-[#3F72AF]"
              >
                <option value="all">All Niches</option>
                {uniqueNiches.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Location
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs font-bold text-[#112D4E] focus:outline-none focus:ring-1 focus:ring-[#3F72AF]"
              >
                <option value="all">All Locations</option>
                {uniqueCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Format */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Required Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs font-bold text-[#112D4E] focus:outline-none focus:ring-1 focus:ring-[#3F72AF]"
              >
                <option value="all">All Formats</option>
                {uniqueFormats.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Primary Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs font-bold text-[#112D4E] focus:outline-none focus:ring-1 focus:ring-[#3F72AF]"
              >
                <option value="all">All Languages</option>
                {uniqueLanguages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Score Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-500 uppercase">
                  Min Fit Score
                </label>
                <span className="text-xs font-extrabold text-[#3F72AF]">
                  {minScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-[#3F72AF] cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

        {/* Recommendations Content Area */}
        {loadingMatches ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-[#DBE2EF] border-t-[#3F72AF] rounded-full animate-spin" />
            <span className="text-xs font-bold text-[#112D4E]">
              Evaluating creators against campaign brief requirements...
            </span>
          </div>
        ) : fetchError ? (
          <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-800">Matching Error</h3>
            <p className="text-xs text-rose-700 max-w-md">{fetchError}</p>
          </div>
        ) : !selectedCampaign ? (
          <div className="p-12 rounded-3xl bg-white border border-[#DBE2EF] text-center flex flex-col items-center gap-3">
            <Compass className="w-10 h-10 text-gray-300" />
            <h3 className="text-base font-bold text-[#112D4E]">No Campaign Selected</h3>
            <p className="text-xs text-gray-500 max-w-md">
              Please select or create a campaign to see tailor-matched creator recommendations.
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-[#DBE2EF] text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-gray-300" />
            <h3 className="text-base font-bold text-[#112D4E]">No Creators Matched These Filters</h3>
            <p className="text-xs text-gray-500 max-w-md">
              No registered creators satisfy all active filters for this campaign brief. Try lowering the minimum match score or clearing specific format/country filters.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {recommendations.map((rec) => {
              const isSelectedForCompare = selectedForComparison.some(
                (r) => r.creatorId === rec.creatorId
              );

              return (
                <div
                  key={rec.creatorId}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 shadow-subtle flex flex-col gap-5 ${
                    isSelectedForCompare
                      ? 'border-[#3F72AF] ring-2 ring-[#3F72AF]/20'
                      : 'border-[#DBE2EF] hover:border-[#3F72AF]/50'
                  }`}
                >
                  {/* Top Creator Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Link to={`/creators/${rec.creator.id}`} className="shrink-0 group">
                        <img
                          src={rec.creator.avatar}
                          alt={rec.creator.name}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#DBE2EF] group-hover:border-[#3F72AF] transition-colors"
                        />
                      </Link>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/creators/${rec.creator.id}`}
                            className="text-base sm:text-lg font-black text-[#112D4E] hover:text-[#3F72AF] transition-colors flex items-center gap-1.5"
                          >
                            <span>{rec.creator.name}</span>
                            {rec.creator.isFeatured && (
                              <CheckCircle2 className="w-4 h-4 text-[#3F72AF]" />
                            )}
                          </Link>
                          <span className="text-xs text-gray-500 font-medium">
                            {rec.creator.handle}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                          <span className="font-bold text-[#3F72AF] bg-[#DBE2EF]/60 px-2.5 py-0.5 rounded-lg">
                            {rec.creator.niche}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {rec.creator.location} ({rec.creator.country})
                          </span>
                          {rec.creator.languages && rec.creator.languages.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-gray-400" />
                              {rec.creator.languages.join(', ')}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 max-w-2xl leading-relaxed">
                          {rec.creator.bio}
                        </p>
                      </div>
                    </div>

                    {/* Overall Score Badge & Compare Checkbox */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                            Match Score
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-2xl font-black text-[#112D4E]">
                              {rec.overallScore}%
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white ${
                            rec.overallScore >= 80
                              ? 'bg-[#112D4E]'
                              : rec.overallScore >= 60
                              ? 'bg-[#3F72AF]'
                              : 'bg-gray-500'
                          }`}
                        >
                          <Sparkles className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Compare Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleCompare(rec)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelectedForCompare
                            ? 'bg-[#3F72AF] text-white border-[#3F72AF]'
                            : 'bg-[#F9F7F7] text-gray-600 border-[#DBE2EF] hover:border-[#3F72AF]'
                        }`}
                      >
                        {isSelectedForCompare ? (
                          <CheckSquare className="w-3.5 h-3.5" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                        <span>{isSelectedForCompare ? 'Selected' : 'Compare'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Criteria Breakdown Grid */}
                  <div className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Niche Fit (30%)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#3F72AF] h-full rounded-full"
                            style={{ width: `${rec.breakdown.nicheScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#112D4E]">
                          {rec.breakdown.nicheScore}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Format (25%)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#3F72AF] h-full rounded-full"
                            style={{ width: `${rec.breakdown.formatScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#112D4E]">
                          {rec.breakdown.formatScore}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Portfolio (20%)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#3F72AF] h-full rounded-full"
                            style={{ width: `${rec.breakdown.portfolioScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#112D4E]">
                          {rec.breakdown.portfolioScore}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Location (10%)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#3F72AF] h-full rounded-full"
                            style={{ width: `${rec.breakdown.locationScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#112D4E]">
                          {rec.breakdown.locationScore}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Language (10%)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#3F72AF] h-full rounded-full"
                            style={{ width: `${rec.breakdown.languageScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#112D4E]">
                          {rec.breakdown.languageScore}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Reliability (5%)
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#3F72AF] h-full rounded-full"
                            style={{ width: `${rec.breakdown.eligibilityScore}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#112D4E]">
                          {rec.breakdown.eligibilityScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Match Rationale Summary */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      Match Rationale & Creative Fit
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {rec.rationale.summary}
                    </p>

                    {/* Met vs Unmet Badges */}
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {rec.metCriteria.map((item, idx) => (
                        <span
                          key={`met-${idx}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </span>
                      ))}

                      {rec.unmetCriteria.map((item, idx) => (
                        <span
                          key={`unmet-${idx}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200"
                        >
                          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{item}</span>
                        </span>
                      ))}

                      {rec.missingInfo.map((item, idx) => (
                        <span
                          key={`missing-${idx}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200"
                        >
                          <Info className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Relevant Verified Portfolio Samples */}
                  {rec.creator.portfolio && rec.creator.portfolio.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-[#DBE2EF]">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                        Verified Portfolio Samples ({rec.creator.portfolio.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {rec.creator.portfolio.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex items-center justify-between gap-2"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-[#112D4E] truncate">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {item.format} • {item.views} views
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-[#3F72AF] shrink-0 bg-white px-2 py-0.5 rounded-md border border-[#DBE2EF]">
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Bar */}
                  <div className="pt-3 border-t border-[#DBE2EF] flex items-center justify-between gap-3">
                    <Link
                      to={`/creators/${rec.creator.id}`}
                      className="text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] transition-colors flex items-center gap-1"
                    >
                      <span>View Full Profile & Reviews</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenInvite(rec)}
                      className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Invite to Campaign</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Side-by-Side Comparison Bar */}
        {selectedForComparison.length > 0 && selectedCampaign && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#112D4E] text-white px-6 py-4 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-6 animate-slideUp">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3 overflow-hidden">
                {selectedForComparison.map((r) => (
                  <img
                    key={r.creatorId}
                    src={r.creator.avatar}
                    alt={r.creator.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#112D4E]"
                  />
                ))}
              </div>
              <div>
                <span className="text-xs font-bold block">
                  {selectedForComparison.length} Creator{selectedForComparison.length > 1 ? 's' : ''} Selected
                </span>
                <span className="text-[10px] text-gray-300">
                  Ready for side-by-side fit matrix comparison
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedForComparison([])}
                className="text-xs text-gray-300 hover:text-white px-2 py-1 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setComparisonModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-[#3F72AF] hover:bg-white hover:text-[#112D4E] text-white text-xs font-bold transition-colors shadow-subtle flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compare Creators</span>
              </button>
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison Modal */}
        {selectedCampaign && (
          <CreatorComparisonModal
            creators={selectedForComparison}
            campaign={selectedCampaign}
            isOpen={comparisonModalOpen}
            onClose={() => setComparisonModalOpen(false)}
            onInvite={(rec) => {
              setComparisonModalOpen(false);
              handleOpenInvite(rec);
            }}
          />
        )}

        {/* Campaign Invitation Modal */}
        {inviteModalOpen && selectedCreatorForInvite && selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal border border-[#DBE2EF] overflow-hidden p-6 sm:p-7 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#DBE2EF]">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCreatorForInvite.creator.avatar}
                    alt={selectedCreatorForInvite.creator.name}
                    className="w-10 h-10 rounded-2xl object-cover border border-[#DBE2EF]"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-[#112D4E]">
                      Invite {selectedCreatorForInvite.creator.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Campaign: <strong>{selectedCampaign.title}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="text-gray-400 hover:text-[#112D4E] p-1 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {inviteSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900 leading-relaxed">
                    {inviteSuccess}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
                  <div className="p-3.5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex items-center justify-between text-xs">
                    <span className="text-gray-600">Match Compatibility:</span>
                    <span className="font-black text-[#112D4E]">
                      {selectedCreatorForInvite.overallScore}% Overall Fit
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#112D4E]">
                      Personalized Message to Creator
                    </label>
                    <textarea
                      rows={4}
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      required
                      className="w-full p-3 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-[#112D4E]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-2"
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
    </div>
  );
};
