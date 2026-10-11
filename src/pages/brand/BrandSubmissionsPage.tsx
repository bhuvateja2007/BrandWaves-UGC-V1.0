import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Brand } from '../../types/marketplace';
import { Submission } from '../../types';
import { brandOwnerService } from '../../services/brandOwnerService';
import { brandCampaignService } from '../../services/brandCampaignService';
import { MarketplaceCampaign } from '../../types/marketplace';
import { api } from '../../api/client';
import { BrandNavHeader } from '../../components/brand/BrandNavHeader';
import { ReviewModal } from '../../components/reviews/ReviewModal';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  Play,
  AlertCircle,
  Video,
  RefreshCw,
  Sparkles,
  History,
  X
} from 'lucide-react';

export const BrandSubmissionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [brandCampaigns, setBrandCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'revision_requested' | 'rejected'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Initialize active brand
  useEffect(() => {
    if (!currentUser) return;
    const initialBrand = brandOwnerService.getActiveBrand(currentUser);
    setActiveBrand(initialBrand);
  }, [currentUser]);

  // Load submissions and campaigns
  const loadData = async (brand: Brand) => {
    try {
      setLoading(true);
      setError(null);

      const subs = await api.getSubmissions();
      const camps = brandCampaignService.getCampaignsForBrand(brand.id);

      // Filter submissions belonging to this brand
      const brandSubs = subs.filter((s: Submission) => {
        const matchesBrandName = s.brandName.toLowerCase() === brand.name.toLowerCase();
        const matchesCampaign = camps.some((c: MarketplaceCampaign) => c.id === s.campaignId);
        return matchesBrandName || matchesCampaign;
      });

      setSubmissions(brandSubs);
      setBrandCampaigns(camps);
    } catch (err: any) {
      console.error('[BrandSubmissionsPage] Failed to load submissions:', err);
      setError(err.message || 'Failed to load campaign submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeBrand) {
      loadData(activeBrand);
    }
  }, [activeBrand]);

  const handleBrandChange = (brand: Brand) => {
    brandOwnerService.setActiveBrandId(brand.id);
    setActiveBrand(brand);
  };

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Status
      if (statusFilter !== 'all' && sub.status !== statusFilter) {
        return false;
      }

      // Campaign
      if (campaignFilter !== 'all' && sub.campaignId !== campaignFilter) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = sub.videoTitle.toLowerCase().includes(q);
        const matchesCreator = sub.creatorName.toLowerCase().includes(q);
        const matchesCaption = sub.caption?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCreator && !matchesCaption) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [submissions, statusFilter, campaignFilter, searchQuery]);

  // Tab counts
  const pendingCount = useMemo(() => submissions.filter((s) => s.status === 'pending').length, [submissions]);
  const approvedCount = useMemo(() => submissions.filter((s) => s.status === 'approved').length, [submissions]);
  const revisionCount = useMemo(() => submissions.filter((s) => s.status === 'revision_requested').length, [submissions]);
  const rejectedCount = useMemo(() => submissions.filter((s) => s.status === 'rejected').length, [submissions]);

  const handleOpenReview = (sub: Submission) => {
    setSelectedSubmission(sub);
    setReviewModalOpen(true);
  };

  const handleReviewed = (updated: Submission) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F7F7] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation & Brand Switcher */}
        <BrandNavHeader
          activeBrand={activeBrand}
          onBrandChange={handleBrandChange}
          title="Deliverable Review & Approval Queue"
          subtitle="Inspect UGC video deliverables against your campaign briefs. Approve for publication or request creative revisions."
        />

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-3xl p-6 border border-[#DBE2EF] shadow-subtle mb-8 flex flex-col gap-5">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DBE2EF]/60">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#112D4E] text-white shadow-xs'
                  : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60'
              }`}
            >
              All Deliverables ({submissions.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-[#3F72AF] text-white shadow-xs'
                  : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-[#112D4E] text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-green-700 text-white shadow-xs'
                  : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved ({approvedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('revision_requested')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'revision_requested'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revisions Requested ({revisionCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'rejected'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Declined ({rejectedCount})</span>
            </button>
          </div>

          {/* Search & Campaign Dropdown */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deliverables by title, creator, or caption..."
                className="w-full pl-12 pr-4 py-2.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-2xl text-xs text-[#112D4E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
                Campaign:
              </span>
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs font-bold text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] max-w-xs truncate"
              >
                <option value="all">All Campaigns ({brandCampaigns.length})</option>
                {brandCampaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submissions Grid */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-[#DBE2EF] text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#3F72AF] animate-spin" />
            <p className="text-xs font-bold text-[#112D4E]">Loading deliverables...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#DBE2EF] text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#DBE2EF]/50 flex items-center justify-center text-gray-400">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#112D4E]">No deliverables found</h3>
            <p className="text-xs text-gray-500 max-w-md">
              {submissions.length === 0
                ? `There are currently no UGC video deliverables submitted for ${activeBrand?.name || 'this brand'}. As creators complete assigned briefs, their videos will appear here for review.`
                : 'No deliverables match your active search and filter selections.'}
            </p>
            {submissions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setCampaignFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl border border-[#DBE2EF] shadow-subtle hover:shadow-hover hover:border-[#3F72AF]/40 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Media thumbnail */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={sub.thumbnail}
                    alt={sub.videoTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {/* Status overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    {sub.revisions && sub.revisions.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#3F72AF] text-white shadow-sm flex items-center gap-1">
                        <History className="w-3 h-3" /> Rev #{sub.revisions.length + 1}
                      </span>
                    )}
                    {sub.status === 'pending' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-[#112D4E] shadow-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                    {sub.status === 'approved' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500 text-white shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {sub.status === 'revision_requested' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Revisions Needed
                      </span>
                    )}
                    {sub.status === 'rejected' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Declined
                      </span>
                    )}
                  </div>

                  {/* Platform & Duration badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                      {sub.platform}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                      {sub.duration}
                    </span>
                  </div>

                  {/* Direct Link button */}
                  <a
                    href={sub.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity"
                    title="Play Video Sample"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/90 text-[#112D4E] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 ml-1" />
                    </div>
                  </a>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#112D4E] line-clamp-1 group-hover:text-[#3F72AF] transition-colors">
                      {sub.videoTitle}
                    </h3>

                    {/* Creator snippet */}
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={sub.creatorAvatar}
                        alt={sub.creatorName}
                        className="w-6 h-6 rounded-full object-cover border border-[#DBE2EF]"
                      />
                      <span className="text-xs font-semibold text-gray-700 truncate">
                        {sub.creatorName}
                      </span>
                    </div>

                    {/* Caption */}
                    {sub.caption && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                        "{sub.caption}"
                      </p>
                    )}

                    {/* Reviewer Feedback (if any) */}
                    {sub.reviewerNotes && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-[11px] text-gray-700">
                        <span className="font-bold text-[#112D4E] block mb-0.5">Feedback Note:</span>
                        <p className="italic">{sub.reviewerNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer metadata */}
                  <div className="mt-4 pt-3 border-t border-[#DBE2EF] flex items-center justify-between text-[11px] text-gray-400">
                    <span>Submitted {new Date(sub.createdAt).toLocaleDateString()}</span>
                    <a
                      href={sub.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3F72AF] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Media Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Review action footer */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => handleOpenReview(sub)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-subtle cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{sub.status === 'pending' ? 'Review Deliverable' : 'Update Review Decision'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal Integration */}
      <ReviewModal
        submission={selectedSubmission}
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedSubmission(null);
        }}
        onReviewed={handleReviewed}
      />
    </div>
  );
};
