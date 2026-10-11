import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand } from '../../types/marketplace';
import { brandOwnerService } from '../../services/brandOwnerService';
import { 
  campaignApplicationService, 
  CampaignApplication, 
  ApplicationStatus 
} from '../../services/campaignApplicationService';
import { brandCampaignService } from '../../services/brandCampaignService';
import { MarketplaceCampaign } from '../../types/marketplace';
import { BrandNavHeader } from '../../components/brand/BrandNavHeader';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ExternalLink,
  Search,
  AlertCircle,
  UserCheck,
  MessageSquare,
  Sparkles,
  RefreshCw,
  X,
  Send,
  Compass
} from 'lucide-react';

export const BrandApplicationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [brandCampaigns, setBrandCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<CampaignApplication | null>(null);
  const [decision, setDecision] = useState<'accepted' | 'rejected'>('accepted');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Initialize active brand
  useEffect(() => {
    if (!currentUser) return;
    const initialBrand = brandOwnerService.getActiveBrand(currentUser);
    setActiveBrand(initialBrand);
  }, [currentUser]);

  // Load applications and campaigns for active brand
  const loadData = async (brandId: string) => {
    try {
      setLoading(true);
      setError(null);

      const apps = await campaignApplicationService.getApplicationsForBrand(brandId);
      const camps = brandCampaignService.getCampaignsForBrand(brandId);

      setApplications(apps);
      setBrandCampaigns(camps);
    } catch (err: any) {
      console.error('[BrandApplicationsPage] Failed to load data:', err);
      setError(err.message || 'Failed to load creator applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeBrand) {
      loadData(activeBrand.id);
    }
  }, [activeBrand]);

  // Listen to application updates from anywhere in the platform
  useEffect(() => {
    const handleUpdate = () => {
      if (activeBrand) {
        campaignApplicationService.getApplicationsForBrand(activeBrand.id).then(setApplications);
      }
    };

    window.addEventListener('campaign_applications_updated', handleUpdate);
    return () => window.removeEventListener('campaign_applications_updated', handleUpdate);
  }, [activeBrand]);

  const handleBrandChange = (brand: Brand) => {
    brandOwnerService.setActiveBrandId(brand.id);
    setActiveBrand(brand);
  };

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }

      // Campaign
      if (campaignFilter !== 'all' && app.campaignId !== campaignFilter) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesCreator = app.creatorName.toLowerCase().includes(query) || app.creatorHandle.toLowerCase().includes(query);
        const matchesCampaign = app.campaignTitle.toLowerCase().includes(query);
        const matchesPitch = app.pitch.toLowerCase().includes(query);
        if (!matchesCreator && !matchesCampaign && !matchesPitch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }, [applications, statusFilter, campaignFilter, searchQuery]);

  // Counts for tabs
  const pendingCount = useMemo(() => applications.filter((a) => a.status === 'pending').length, [applications]);
  const acceptedCount = useMemo(() => applications.filter((a) => a.status === 'accepted').length, [applications]);
  const rejectedCount = useMemo(() => applications.filter((a) => a.status === 'rejected').length, [applications]);

  const openReviewModal = (app: CampaignApplication, initialDecision: 'accepted' | 'rejected') => {
    setSelectedApp(app);
    setDecision(initialDecision);
    setReviewNotes(
      initialDecision === 'accepted'
        ? 'Great pitch and authentic brand alignment. Approved to proceed with content creation!'
        : 'Thank you for applying. We are unable to move forward with this pitch for our current brief.'
    );
    setReviewSuccess(null);
    setReviewModalOpen(true);
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedApp) return;

    try {
      setSubmittingReview(true);
      setError(null);

      const updated = await campaignApplicationService.reviewApplication(
        currentUser,
        selectedApp.id,
        decision,
        reviewNotes
      );

      // Update local state immediately
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );

      setReviewSuccess(
        `Application from ${selectedApp.creatorName} has been ${decision === 'accepted' ? 'ACCEPTED' : 'REJECTED'}. The decision is now synchronized with the creator portal.`
      );

      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccess(null);
        setSelectedApp(null);
      }, 1600);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review decision');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F7] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation & Brand Switcher */}
        <BrandNavHeader
          activeBrand={activeBrand}
          onBrandChange={handleBrandChange}
          title="Creator Application Review Queue"
          subtitle="Review incoming pitches and creator deliverables for your active campaign briefs."
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
              All Applications ({applications.length})
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
              onClick={() => setStatusFilter('accepted')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'accepted'
                  ? 'bg-green-700 text-white shadow-xs'
                  : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accepted ({acceptedCount})</span>
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
                placeholder="Search by creator name, @handle, campaign, or pitch..."
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

        {/* Applications List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-[#DBE2EF] text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#3F72AF] animate-spin" />
            <p className="text-xs font-bold text-[#112D4E]">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#DBE2EF] text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#DBE2EF]/50 flex items-center justify-center text-gray-400">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#112D4E]">No applications found</h3>
            <p className="text-xs text-gray-500 max-w-md">
              {applications.length === 0
                ? `There are currently no creator applications for ${activeBrand?.name || 'this brand'}. When creators apply to your briefs, their proposals will appear here for review.`
                : 'No applications match your active search and filter selections.'}
            </p>
            {applications.length > 0 && (
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
          <div className="flex flex-col gap-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-[#DBE2EF] shadow-subtle p-6 hover:border-[#3F72AF]/40 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
              >
                {/* Creator info & pitch */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <img
                    src={app.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                    alt={app.creatorName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#DBE2EF] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-[#112D4E]">
                        {app.creatorName}
                      </h3>
                      <span className="text-xs font-bold text-gray-400">
                        {app.creatorHandle}
                      </span>
                      {app.creatorId && (
                        <Link
                          to={`/creators/${app.creatorId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#3F72AF] hover:underline flex items-center gap-1"
                        >
                          <span>Public Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                      <span className="font-semibold text-[#112D4E]">Campaign:</span>
                      <span className="text-[#3F72AF] font-bold">{app.campaignTitle}</span>
                      <span>•</span>
                      <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Proposed Deliverable */}
                    <div className="mt-3 p-3 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]/60">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                        Proposed Deliverable: <strong className="text-[#112D4E]">{app.proposedDeliverable}</strong>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed font-normal">
                        "{app.pitch}"
                      </p>
                      {app.portfolioSampleUrl && (
                        <div className="mt-2 pt-2 border-t border-[#DBE2EF]/40 flex items-center gap-1.5 text-xs">
                          <span className="text-gray-400">Portfolio sample:</span>
                          <a
                            href={app.portfolioSampleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#3F72AF] hover:underline truncate max-w-sm"
                          >
                            {app.portfolioSampleUrl}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Reviewer Feedback Notes (if already reviewed) */}
                    {app.reviewedAt && (
                      <div className="mt-3 p-3 rounded-2xl bg-[#DBE2EF]/30 border border-[#DBE2EF] text-xs">
                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          <span>Review Feedback</span>
                          <span>{new Date(app.reviewedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 italic">
                          {app.reviewerNotes || 'No additional reviewer comments.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Review Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#DBE2EF]">
                  {/* Status Badge */}
                  <div>
                    {app.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Decision</span>
                      </span>
                    )}
                    {app.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accepted</span>
                      </span>
                    )}
                    {app.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Declined</span>
                      </span>
                    )}
                  </div>

                  {/* Actions for Pending Applications */}
                  {app.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openReviewModal(app, 'accepted')}
                        className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openReviewModal(app, 'rejected')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-red-300 hover:bg-red-50 text-red-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {reviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal border border-[#DBE2EF] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#DBE2EF] flex items-center justify-between bg-[#F9F7F7]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    decision === 'accepted' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {decision === 'accepted' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#112D4E]">
                    {decision === 'accepted' ? 'Accept Application' : 'Decline Application'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {selectedApp.creatorName} ({selectedApp.campaignTitle})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="text-gray-400 hover:text-[#112D4E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#112D4E]">Decision Recorded</h4>
                <p className="text-xs text-gray-600 max-w-sm leading-relaxed">
                  {reviewSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleDecisionSubmit} className="p-6 flex flex-col gap-4">
                {/* Decision Toggle */}
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-2">
                    Review Decision *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision('accepted')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        decision === 'accepted'
                          ? 'bg-green-50 border-green-500 text-green-800 ring-2 ring-green-200'
                          : 'bg-[#F9F7F7] border-[#DBE2EF] text-gray-600 hover:bg-[#DBE2EF]/60'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Accept Application</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecision('rejected')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        decision === 'rejected'
                          ? 'bg-red-50 border-red-500 text-red-800 ring-2 ring-red-200'
                          : 'bg-[#F9F7F7] border-[#DBE2EF] text-gray-600 hover:bg-[#DBE2EF]/60'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Decline Application</span>
                    </button>
                  </div>
                </div>

                {/* Feedback Notes */}
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                    Feedback / Decision Notes (Visible to Creator) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                    placeholder="Provide constructive feedback or next steps for the creator..."
                  />
                </div>

                <div className="pt-3 border-t border-[#DBE2EF] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] text-xs font-bold text-gray-600 hover:bg-[#F9F7F7]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-subtle cursor-pointer flex items-center gap-1.5 ${
                      decision === 'accepted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {submittingReview ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirm {decision === 'accepted' ? 'Acceptance' : 'Rejection'}</span>
                      </>
                    )}
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
