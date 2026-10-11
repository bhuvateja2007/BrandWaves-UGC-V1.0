import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand, MarketplaceCampaign, MarketplaceCampaignStatus } from '../../types/marketplace';
import { brandOwnerService } from '../../services/brandOwnerService';
import { brandCampaignService } from '../../services/brandCampaignService';
import { campaignApplicationService } from '../../services/campaignApplicationService';
import { api } from '../../api/client';
import { BrandNavHeader } from '../../components/brand/BrandNavHeader';
import { 
  Compass, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Settings, 
  Sparkles,
  ClipboardCheck,
  Video
} from 'lucide-react';

export const BrandCampaignsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [appsCountByCampaign, setAppsCountByCampaign] = useState<Record<string, number>>({});
  const [subsCountByCampaign, setSubsCountByCampaign] = useState<Record<string, number>>({});

  useEffect(() => {
    if (currentUser) {
      const brand = brandOwnerService.getActiveBrand(currentUser);
      setActiveBrand(brand);
    }
  }, [currentUser]);

  const loadCampaigns = async (brandId: string) => {
    const list = brandCampaignService.getCampaignsForBrand(brandId);
    setCampaigns(list);

    // Load counts for each campaign
    const appCounts: Record<string, number> = {};
    const subCounts: Record<string, number> = {};

    try {
      const allApps = await campaignApplicationService.getApplicationsForBrand(brandId);
      allApps.forEach((a) => {
        appCounts[a.campaignId] = (appCounts[a.campaignId] || 0) + 1;
      });
      setAppsCountByCampaign(appCounts);
    } catch {}

    try {
      const allSubs = await api.getSubmissions();
      allSubs.forEach((s) => {
        subCounts[s.campaignId] = (subCounts[s.campaignId] || 0) + 1;
      });
      setSubsCountByCampaign(subCounts);
    } catch {}
  };

  useEffect(() => {
    if (activeBrand) {
      loadCampaigns(activeBrand.id);
    }
  }, [activeBrand]);

  const handleBrandChange = (brand: Brand) => {
    setActiveBrand(brand);
    loadCampaigns(brand.id);
  };

  const handleStatusChange = async (campaignId: string, newStatus: MarketplaceCampaignStatus) => {
    if (!currentUser) return;
    try {
      const updated = await brandCampaignService.setCampaignStatus(currentUser, campaignId, newStatus);
      setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'open' && c.status !== 'open' && (c.status as string) !== 'active') return false;
      if (statusFilter === 'in_progress' && c.status !== 'in_progress') return false;
      if (statusFilter === 'completed' && c.status !== 'completed') return false;
      if (statusFilter === 'closed' && c.status !== 'closed') return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.brief.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fadeIn">
      <BrandNavHeader
        activeBrand={activeBrand}
        onBrandChange={handleBrandChange}
        title="Campaign Briefs"
        subtitle="Manage creator briefs, set requirements, review participant quotas, and track fulfillment."
      />

      {/* Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-[#DBE2EF] shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search briefs by title or keywords..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-[#F9F7F7] p-1 rounded-xl border border-[#DBE2EF] overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'open', label: 'Open' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
              { id: 'closed', label: 'Closed' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-[#112D4E] text-white shadow-2xs'
                    : 'text-gray-500 hover:text-[#112D4E]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create Campaign Button */}
        <Link
          to="/brand/campaigns/new"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer btn-tactile shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign Brief</span>
        </Link>
      </section>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <section className="bg-white rounded-3xl p-12 text-center border border-[#DBE2EF] shadow-subtle flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#DBE2EF] text-[#112D4E] flex items-center justify-center mb-3">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[#112D4E]">No Campaign Briefs Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-5">
            {searchTerm || statusFilter !== 'all'
              ? 'No briefs matched your filter criteria.'
              : `You have not created any campaign briefs for ${activeBrand?.name || 'this brand'} yet.`}
          </p>
          <Link
            to="/brand/campaigns/new"
            className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Launch First Brief</span>
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCampaigns.map((camp) => {
            const appCount = appsCountByCampaign[camp.id] || 0;
            const subCount = subsCountByCampaign[camp.id] || 0;

            return (
              <div
                key={camp.id}
                className="bg-white rounded-3xl p-6 border border-[#DBE2EF] shadow-subtle flex flex-col justify-between gap-5 card-interactive"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-[#112D4E] text-white">
                        {camp.platform}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#DBE2EF] text-[#112D4E]">
                        {camp.category}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500">
                        {camp.format}
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={camp.status}
                      onChange={(e) => handleStatusChange(camp.id, e.target.value as MarketplaceCampaignStatus)}
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                        camp.status === 'open' || (camp.status as string) === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : camp.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : camp.status === 'completed'
                          ? 'bg-[#DBE2EF] text-[#112D4E] border-[#3F72AF]/30'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <h3 className="text-base font-extrabold text-[#112D4E] tracking-tight mb-1">
                    {camp.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                    {camp.brief || camp.description}
                  </p>

                  {/* Quota & Spots Progress */}
                  <div className="p-3.5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#3F72AF]" />
                        <span>Creator Spots</span>
                      </span>
                      <span className="font-extrabold text-[#112D4E]">
                        {camp.spotsFilled} / {camp.spotsTotal} filled
                      </span>
                    </div>
                    <div className="w-full bg-[#DBE2EF] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#3F72AF] h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (camp.spotsFilled / (camp.spotsTotal || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF]">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">Reward</span>
                      <span className="text-xs font-black text-[#112D4E] truncate block mt-0.5">
                        {camp.rewardAmount}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF]">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">Pitches</span>
                      <span className="text-xs font-black text-[#112D4E] block mt-0.5">
                        {appCount} applied
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF]">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">Submissions</span>
                      <span className="text-xs font-black text-[#112D4E] block mt-0.5">
                        {subCount} deliverables
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-3 border-t border-[#DBE2EF] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Deadline: {camp.deadline}</span>
                  </div>

                  <Link
                    to={`/brand/campaigns/${camp.id}`}
                    className="px-4 py-2 rounded-xl bg-[#112D4E] hover:bg-[#112D4E]/90 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Manage & Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};
