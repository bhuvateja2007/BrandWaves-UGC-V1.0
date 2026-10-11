import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand, MarketplaceCampaign, MarketplaceCampaignStatus } from '../../types/marketplace';
import { brandOwnerService } from '../../services/brandOwnerService';
import { brandCampaignService } from '../../services/brandCampaignService';
import { campaignApplicationService, CampaignApplication } from '../../services/campaignApplicationService';
import { api } from '../../api/client';
import { Submission } from '../../types';
import { ReviewModal } from '../../components/reviews/ReviewModal';
import { 
  Compass, 
  ArrowLeft, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Gift, 
  AlertCircle, 
  ClipboardCheck, 
  Video, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Send
} from 'lucide-react';
import { creatorMatchmakerService, CreatorMatchRecommendation } from '../../services/creatorMatchmakerService';

export const BrandCampaignDetailPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { currentUser } = useAuth();

  const [campaign, setCampaign] = useState<MarketplaceCampaign | undefined>(undefined);
  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'details' | 'applications' | 'submissions' | 'matchmaker'>('details');
  const [selectedSubForReview, setSelectedSubForReview] = useState<Submission | null>(null);
  const [unauthorizedAccess, setUnauthorizedAccess] = useState<boolean>(false);
  const [matchedCreators, setMatchedCreators] = useState<CreatorMatchRecommendation[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || !campaignId) return;

    const camp = brandCampaignService.getCampaignById(campaignId);
    if (!camp) {
      setLoading(false);
      return;
    }

    // Security check: verify ownership!
    const isOwner = brandOwnerService.isAuthorizedForBrand(currentUser, camp.brandId);
    if (!isOwner) {
      setUnauthorizedAccess(true);
      setLoading(false);
      return;
    }

    setCampaign(camp);
    const brand = brandOwnerService.getBrandById(camp.brandId);
    setActiveBrand(brand);

    // Load applications for this campaign
    campaignApplicationService.getApplicationsForCampaign(camp.id)
      .then((apps) => setApplications(apps))
      .catch(() => setApplications([]));

    // Load submissions for this campaign
    api.getSubmissions({ campaignId: camp.id })
      .then((subs) => setSubmissions(subs))
      .catch(() => setSubmissions([]));

    // Preload matchmaker recommendations for this campaign
    setLoadingMatches(true);
    creatorMatchmakerService.matchCreators(camp, camp.brandId)
      .then((res) => {
        setMatchedCreators(res.recommendations);
        setLoadingMatches(false);
      })
      .catch(() => setLoadingMatches(false));

    setLoading(false);
  }, [currentUser, campaignId]);

  const handleStatusChange = async (newStatus: MarketplaceCampaignStatus) => {
    if (!currentUser || !campaign) return;
    try {
      const updated = await brandCampaignService.setCampaignStatus(currentUser, campaign.id, newStatus);
      setCampaign(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update campaign status');
    }
  };

  const handleApplicationDecision = async (appId: string, decision: 'accepted' | 'rejected') => {
    if (!currentUser) return;
    try {
      const updated = await campaignApplicationService.reviewApplication(currentUser, appId, decision);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err: any) {
      alert(err.message || 'Failed to update application decision');
    }
  };

  const handleSubmissionReviewed = (reviewed: Submission) => {
    setSubmissions((prev) => prev.map((s) => (s.id === reviewed.id ? reviewed : s)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#DBE2EF] border-t-[#3F72AF] rounded-full animate-spin" />
      </div>
    );
  }

  if (unauthorizedAccess) {
    return (
      <div className="flex flex-col min-h-[60vh] items-center justify-center text-center p-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#112D4E]">Cross-Brand Access Denied</h2>
        <p className="text-xs text-gray-600 max-w-md mt-2 mb-6 leading-relaxed">
          You do not have authorization to view or manage this campaign. Campaigns may only be managed by verified owners of the associated brand.
        </p>
        <Link
          to="/brand/campaigns"
          className="px-5 py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold shadow-md hover:bg-[#112D4E]/90 transition-all"
        >
          Return to Your Campaigns
        </Link>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col min-h-[60vh] items-center justify-center text-center p-6">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <h2 className="text-xl font-bold text-[#112D4E]">Campaign Not Found</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          The requested campaign brief could not be located.
        </p>
        <Link
          to="/brand/campaigns"
          className="px-5 py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold"
        >
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const pendingApps = applications.filter((a) => a.status === 'pending');

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/brand/campaigns"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#112D4E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#3F72AF]">
            {activeBrand?.name}
          </span>
          <span className="text-gray-300">•</span>
          <a
            href={`/campaigns/${campaign.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-gray-600 hover:text-[#112D4E] flex items-center gap-1"
          >
            <span>Public Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Campaign Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DBE2EF] shadow-subtle flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#DBE2EF]">
          <div className="flex items-start gap-4">
            {campaign.brandLogo ? (
              <img
                src={campaign.brandLogo}
                alt={campaign.brandName}
                className="w-16 h-16 rounded-2xl object-cover border border-[#DBE2EF] shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#DBE2EF] text-[#112D4E] flex items-center justify-center shrink-0">
                <Compass className="w-8 h-8" />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#112D4E] text-white">
                  {campaign.platform}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#DBE2EF] text-[#112D4E]">
                  {campaign.category}
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  {campaign.format}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#112D4E] tracking-tight">
                {campaign.title}
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {campaign.brief}
              </p>
            </div>
          </div>

          {/* Status & Spots Controls */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Status:</span>
              <select
                value={campaign.status}
                onChange={(e) => handleStatusChange(e.target.value as MarketplaceCampaignStatus)}
                className="text-xs font-black uppercase px-3 py-1.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] cursor-pointer"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] w-full md:w-56 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#112D4E]">
                <span>Spots Filled</span>
                <span>{campaign.spotsFilled} / {campaign.spotsTotal}</span>
              </div>
              <div className="w-full bg-[#DBE2EF] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3F72AF] h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (campaign.spotsFilled / (campaign.spotsTotal || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Compensation</span>
            <span className="text-xs sm:text-sm font-black text-[#112D4E] block mt-0.5">
              {campaign.rewardAmount}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Deadline</span>
            <span className="text-xs sm:text-sm font-black text-[#112D4E] block mt-0.5">
              {campaign.deadline}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Total Pitches</span>
            <span className="text-xs sm:text-sm font-black text-[#112D4E] block mt-0.5">
              {applications.length} ({pendingApps.length} pending)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Deliverables</span>
            <span className="text-xs sm:text-sm font-black text-[#112D4E] block mt-0.5">
              {submissions.length} submitted
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[#DBE2EF] pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'details'
                ? 'border-[#112D4E] text-[#112D4E]'
                : 'border-transparent text-gray-400 hover:text-[#112D4E]'
            }`}
          >
            Brief & Requirements
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'applications'
                ? 'border-[#112D4E] text-[#112D4E]'
                : 'border-transparent text-gray-400 hover:text-[#112D4E]'
            }`}
          >
            <span>Applications</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#DBE2EF] text-[#112D4E]">
              {applications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'submissions'
                ? 'border-[#112D4E] text-[#112D4E]'
                : 'border-transparent text-gray-400 hover:text-[#112D4E]'
            }`}
          >
            <span>Deliverables</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#DBE2EF] text-[#112D4E]">
              {submissions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matchmaker')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matchmaker'
                ? 'border-[#112D4E] text-[#112D4E]'
                : 'border-transparent text-gray-400 hover:text-[#112D4E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>AI Matchmaker</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#3F72AF]/15 text-[#3F72AF] font-bold">
              {matchedCreators.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Details & Requirements */}
        {activeTab === 'details' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Description */}
            <div>
              <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-2">
                Full Creative Brief & Campaign Description
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-[#F9F7F7] p-4 rounded-2xl border border-[#DBE2EF]">
                {campaign.description}
              </p>
            </div>

            {/* Deliverables */}
            <div>
              <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-2">
                Mandatory Deliverables
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {campaign.deliverables.map((deliv, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] flex items-center gap-2 text-xs font-bold text-[#112D4E]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            {campaign.eligibility && campaign.eligibility.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-2">
                  Creator Eligibility Criteria
                </h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.eligibility.map((el, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-[#DBE2EF]/60 text-[#112D4E] text-xs font-bold border border-[#DBE2EF]"
                    >
                      {el}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Applications List */}
        {activeTab === 'applications' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {applications.length === 0 ? (
              <div className="p-10 text-center bg-[#F9F7F7] rounded-2xl border border-dashed border-[#DBE2EF]">
                <ClipboardCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#112D4E]">No creator applications submitted yet</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Creators discovering this brief on the marketplace will submit pitches here.
                </p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={app.creatorAvatar}
                      alt={app.creatorName}
                      className="w-12 h-12 rounded-full object-cover border border-[#DBE2EF] shrink-0"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#112D4E]">{app.creatorName}</span>
                        <span className="text-[11px] text-gray-500">{app.creatorHandle}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            app.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        "{app.pitch}"
                      </p>
                      <div className="text-[11px] text-gray-500 font-medium">
                        Proposed: <span className="text-[#112D4E] font-bold">{app.proposedDeliverable}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Actions (if pending) */}
                  {app.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApplicationDecision(app.id, 'accepted')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplicationDecision(app.id, 'rejected')}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Submissions Deliverables */}
        {activeTab === 'submissions' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {submissions.length === 0 ? (
              <div className="p-10 text-center bg-[#F9F7F7] rounded-2xl border border-dashed border-[#DBE2EF]">
                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#112D4E]">No deliverables submitted yet</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Accepted creators will upload finished UGC deliverables for this brief.
                </p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={sub.thumbnail}
                      alt={sub.videoTitle}
                      className="w-16 h-20 rounded-xl object-cover border border-[#DBE2EF] shrink-0"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#112D4E]">{sub.videoTitle}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'revision_requested'
                              ? 'bg-amber-100 text-amber-800'
                              : sub.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        By {sub.creatorName} ({sub.creatorHandle})
                      </div>
                      <a
                        href={sub.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#3F72AF] font-bold hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <span>Open Deliverable Video</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSubForReview(sub)}
                    className="px-4 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    Review Deliverable
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: AI Creator Matchmaker */}
        {activeTab === 'matchmaker' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-[#DBE2EF]/40 border border-[#DBE2EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white text-[#3F72AF] flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#112D4E]">
                    AI Creator Matchmaker — Brief Alignment
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    Evaluated all registered creators against this campaign’s category ({campaign.category}), format ({campaign.format}), and portfolio relevance.
                  </p>
                </div>
              </div>

              <Link
                to={`/brand/matchmaker?campaignId=${campaign.id}`}
                className="px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <span>Full Matchmaker Studio</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {inviteSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{inviteSuccessMsg}</span>
              </div>
            )}

            {loadingMatches ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-4 border-[#DBE2EF] border-t-[#3F72AF] rounded-full animate-spin" />
                <span className="text-xs font-bold text-[#112D4E]">
                  Scoring creators against campaign brief...
                </span>
              </div>
            ) : matchedCreators.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#DBE2EF] text-center">
                <p className="text-xs text-gray-500">No matching creators found for this criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {matchedCreators.slice(0, 5).map((rec) => (
                  <div
                    key={rec.creatorId}
                    className="p-5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] hover:border-[#3F72AF]/50 transition-all flex flex-col gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <Link to={`/creators/${rec.creator.id}`}>
                          <img
                            src={rec.creator.avatar}
                            alt={rec.creator.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-[#DBE2EF] shrink-0"
                          />
                        </Link>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/creators/${rec.creator.id}`}
                              className="text-sm font-extrabold text-[#112D4E] hover:text-[#3F72AF]"
                            >
                              {rec.creator.name}
                            </Link>
                            <span className="text-xs text-gray-500 font-medium">
                              {rec.creator.handle}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                            <span className="font-bold text-[#3F72AF] bg-[#DBE2EF]/60 px-2 py-0.5 rounded-md text-[11px]">
                              {rec.creator.niche}
                            </span>
                            <span>{rec.creator.location} ({rec.creator.country})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Match Score
                          </span>
                          <span className="text-lg font-black text-[#112D4E]">
                            {rec.overallScore}%
                          </span>
                        </div>
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                            rec.overallScore >= 80 ? 'bg-[#112D4E]' : 'bg-[#3F72AF]'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Rationale & Criteria */}
                    <p className="text-xs text-gray-700 leading-relaxed bg-white p-3.5 rounded-xl border border-[#DBE2EF]">
                      {rec.rationale.summary}
                    </p>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <Link
                        to={`/creators/${rec.creator.id}`}
                        className="text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] flex items-center gap-1"
                      >
                        <span>View Portfolio</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setInviteSuccessMsg(`Invitation delivered to ${rec.creator.name} for "${campaign.title}"!`);
                          setTimeout(() => setInviteSuccessMsg(null), 3000);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Invite to Brief</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal for Submissions */}
      <ReviewModal
        isOpen={Boolean(selectedSubForReview)}
        submission={selectedSubForReview}
        onClose={() => setSelectedSubForReview(null)}
        onReviewed={handleSubmissionReviewed}
      />
    </div>
  );
};
