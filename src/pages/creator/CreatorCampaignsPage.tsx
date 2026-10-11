import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMarketplaceCampaigns } from '../../data/marketplaceData';
import { MarketplaceCampaign } from '../../types/marketplace';
import { campaignApplicationService, CampaignApplication } from '../../services/campaignApplicationService';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { 
  Search, 
  X, 
  Sparkles, 
  Compass, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';

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
];

const STATUS_FILTERS = ['All', 'Open', 'In Progress'];

export const CreatorCampaignsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const creatorId = currentUser?.id || 'user_alex';

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'reward' | 'deadline' | 'spots'>('reward');
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(true);

  useEffect(() => {
    campaignApplicationService.getApplicationsForCreator(creatorId)
      .then(setApplications)
      .catch((err) => console.warn('Failed loading applications for campaigns view:', err))
      .finally(() => setLoadingApps(false));

    const handleUpdate = () => {
      campaignApplicationService.getApplicationsForCreator(creatorId).then(setApplications);
    };
    window.addEventListener('campaign_applications_updated', handleUpdate);
    return () => window.removeEventListener('campaign_applications_updated', handleUpdate);
  }, [creatorId]);

  const rawCampaigns = useMemo(() => {
    return getMarketplaceCampaigns({
      search: searchTerm,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      status: selectedStatus === 'All' ? undefined : selectedStatus.toLowerCase().replace(' ', '_'),
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const sortedCampaigns = useMemo(() => {
    const list = [...rawCampaigns];
    if (sortBy === 'reward') {
      // Sort roughly by numeric amount in rewardAmount
      list.sort((a, b) => {
        const numA = parseInt(a.rewardAmount.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.rewardAmount.replace(/\D/g, '') || '0', 10);
        return numB - numA;
      });
    } else if (sortBy === 'spots') {
      list.sort((a, b) => (b.spotsTotal - b.spotsFilled) - (a.spotsTotal - a.spotsFilled));
    } else if (sortBy === 'deadline') {
      list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    return list;
  }, [rawCampaigns, sortBy]);

  const hasActiveFilters = searchTerm.trim() !== '' || selectedCategory !== 'All' || selectedStatus !== 'All';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
  };

  const getApplicationForCampaign = (campId: string) => {
    return applications.find((a) => a.campaignId === campId && a.status !== 'withdrawn');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DBE2EF]/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Brand Brief Discovery</span>
          </div>
          <h1 className="text-3xl font-black text-[#112D4E] tracking-tight">
            Discover Verified Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Browse authentic brand briefs with guaranteed creator escrow, structured deliverables, and direct creative autonomy.
          </p>
        </div>

        <DemoNotice type="general" className="self-start md:self-auto" />
      </section>

      {/* Filter & Search Bar */}
      <section className="bg-white p-5 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns by brand, brief title, category, or deliverables..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] placeholder:text-gray-400 focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Rail */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 mr-1 shrink-0">Niche:</span>
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#112D4E] text-white shadow-xs'
                  : 'bg-[#F9F7F7] text-gray-600 border border-[#DBE2EF] hover:bg-[#DBE2EF]/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DBE2EF]/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-gray-400">Status:</span>
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                  selectedStatus === st
                    ? 'bg-[#DBE2EF] text-[#112D4E] font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] uppercase font-bold text-gray-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs p-1 rounded-lg border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E]"
              >
                <option value="reward">Highest Reward</option>
                <option value="spots">Spots Available</option>
                <option value="deadline">Closest Deadline</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-[#3F72AF] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>Showing {sortedCampaigns.length} campaigns</span>
      </div>

      {/* Campaigns Grid */}
      {sortedCampaigns.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DBE2EF] p-12 text-center max-w-lg mx-auto space-y-4">
          <Compass className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-black text-[#112D4E]">No Matching Briefs Found</h3>
          <p className="text-xs text-gray-500">
            Try adjusting your search criteria or clear your niche filter to explore more briefs.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-all"
          >
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedCampaigns.map((camp) => {
            const existingApp = getApplicationForCampaign(camp.id);

            return (
              <div
                key={camp.id}
                className="bg-white rounded-3xl border border-[#DBE2EF] p-6 shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Brand & Format Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {camp.brandLogo && (
                        <img
                          src={camp.brandLogo}
                          alt={camp.brandName}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#DBE2EF]"
                        />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-[#3F72AF]">
                        {camp.brandName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#DBE2EF] text-[#112D4E]">
                        {camp.platform} • {camp.format}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <Link
                      to={`/creator/campaigns/${camp.id}`}
                      className="text-base font-black text-[#112D4E] group-hover:text-[#3F72AF] transition-colors line-clamp-1 block"
                    >
                      {camp.title}
                    </Link>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  {/* Deliverables Preview */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                      Required Deliverables:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {camp.deliverables.map((del, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#F9F7F7] border border-[#DBE2EF] text-gray-700 font-medium"
                        >
                          {del}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Metrics & Action */}
                <div className="pt-4 border-t border-[#DBE2EF]/60 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      Compensation
                    </span>
                    <span className="text-sm font-black text-[#112D4E] font-mono">
                      {camp.rewardAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {existingApp ? (
                      <Link
                        to="/creator/applications"
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                          existingApp.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : existingApp.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="capitalize">Applied ({existingApp.status})</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/creator/campaigns/${camp.id}`}
                        className="px-4 py-2 rounded-xl bg-[#112D4E] hover:bg-[#3F72AF] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                      >
                        <span>View Brief & Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
