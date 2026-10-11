import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Submission, Campaign, CreatorStats } from '../../types';
import { CreatorPortfolioItem } from '../../types/marketplace';
import { creatorPortfolioService } from '../../services/creatorPortfolioService';
import { campaignApplicationService, CampaignApplication } from '../../services/campaignApplicationService';
import { getMarketplaceCampaigns } from '../../data/marketplaceData';
import { ActivityHeatmap } from '../../components/heatmap/ActivityHeatmap';
import { AnimatedCounter, ProfileCompletionCard, CompletionItem } from '../../components/common';
import { WaterReveal } from '../../components/common/WaterMotion';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { 
  Sparkles, 
  Compass, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  Eye, 
  ExternalLink,
  Shield,
  Briefcase
} from 'lucide-react';

export const CreatorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [revisionItems, setRevisionItems] = useState<Submission[]>([]);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<CreatorPortfolioItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Resubmit deliverable state
  const [resubmittingId, setResubmittingId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState<string>('');
  const [resubmitSuccess, setResubmitSuccess] = useState<string | null>(null);

  const creatorId = currentUser?.id || 'user_alex';

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [creatorStats, userSubs, apps, portfolio] = await Promise.all([
        api.getCreatorStats().catch(() => null),
        api.getCreatorSubmissions().catch(() => []),
        campaignApplicationService.getApplicationsForCreator(creatorId).catch(() => []),
        creatorPortfolioService.getPortfolioItems(creatorId).catch(() => []),
      ]);

      setStats(creatorStats);
      setRevisionItems(userSubs.filter((s) => s.status === 'revision_requested'));
      setApplications(apps);
      setPortfolioItems(portfolio);
    } catch (err) {
      console.error('Failed to load creator dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handlePortfolioUpdate = () => {
      creatorPortfolioService.getPortfolioItems(creatorId).then(setPortfolioItems);
    };
    const handleApplicationUpdate = () => {
      campaignApplicationService.getApplicationsForCreator(creatorId).then(setApplications);
    };

    window.addEventListener('creator_portfolio_updated', handlePortfolioUpdate);
    window.addEventListener('campaign_applications_updated', handleApplicationUpdate);

    return () => {
      window.removeEventListener('creator_portfolio_updated', handlePortfolioUpdate);
      window.removeEventListener('campaign_applications_updated', handleApplicationUpdate);
    };
  }, [creatorId]);

  const handleResubmit = async (subId: string) => {
    if (!newUrl.trim()) return;
    try {
      await api.resubmitSubmission(subId, { videoUrl: newUrl });
      setResubmitSuccess('Deliverable resubmitted to brand review queue!');
      setResubmittingId(null);
      setNewUrl('');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to resubmit deliverable');
    }
  };

  // Genuine Profile Completeness items derived from real user state and saved metadata
  let creatorMeta: any = null;
  try {
    const raw = localStorage.getItem(`brandwaves_creator_meta_${creatorId}`);
    if (raw) creatorMeta = JSON.parse(raw);
  } catch {}

  const completionTasks: CompletionItem[] = [
    {
      id: 'name',
      label: 'Display Name',
      description: 'Your verified public creator alias',
      isComplete: Boolean(currentUser?.name?.trim() && currentUser.name.trim().length >= 2),
      actionUrl: '/profile',
      actionLabel: 'Edit Name',
    },
    {
      id: 'avatar',
      label: 'Profile Photo',
      description: 'High-resolution headshot or studio portrait',
      isComplete: Boolean(currentUser?.avatar && !currentUser.avatar.includes('placeholder')),
      actionUrl: '/profile',
      actionLabel: 'Upload Photo',
    },
    {
      id: 'bio',
      label: 'Creator Bio & Voice',
      description: 'Minimum 20 characters describing your content style',
      isComplete: Boolean(currentUser?.bio && currentUser.bio.trim().length >= 20),
      actionUrl: '/profile',
      actionLabel: 'Write Bio',
    },
    {
      id: 'niches',
      label: 'Content Niches',
      description: 'Select categories matching your creator focus',
      isComplete: Boolean(creatorMeta?.niches && creatorMeta.niches.length > 0),
      actionUrl: '/profile',
      actionLabel: 'Pick Niches',
    },
    {
      id: 'formats',
      label: 'Content Formats',
      description: 'Vertical reel, YouTube video, or carousel',
      isComplete: Boolean(creatorMeta?.formats && creatorMeta.formats.length > 0),
      actionUrl: '/profile',
      actionLabel: 'Set Formats',
    },
    {
      id: 'social',
      label: 'Social Channel Links',
      description: 'Connect Instagram, TikTok, or YouTube',
      isComplete: Boolean(creatorMeta?.instagramHandle || creatorMeta?.tiktokHandle || creatorMeta?.youtubeChannel),
      actionUrl: '/profile',
      actionLabel: 'Add Socials',
    },
    {
      id: 'portfolio',
      label: 'Portfolio Showcase',
      description: 'Add at least 1 past work sample or brand reel',
      isComplete: portfolioItems.length > 0,
      actionUrl: '/creator/portfolio',
      actionLabel: 'Add Sample',
    },
  ];

  // Recommended campaigns from canonical data
  const recommendedCampaigns = getMarketplaceCampaigns().slice(0, 3);

  const pendingAppsCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedAppsCount = applications.filter((a) => a.status === 'accepted').length;

  return (
    <WaterReveal triggerKey={creatorId} className="w-full">
      <div className="space-y-8 animate-fadeIn pb-16">
        {/* 1. Header / Welcome Hero */}
      <section className="bg-white rounded-3xl border border-[#DBE2EF] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={currentUser?.name || 'Creator'}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#DBE2EF] shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DBE2EF] text-[#112D4E]">
                {currentUser?.tier || 'Verified Creator'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-gray-500 font-mono">
                {currentUser?.handle || '@alexcreates'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight truncate">
              Welcome back, {currentUser?.name || 'Alex'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-1 max-w-xl">
              {currentUser?.bio || 'Creator workspace for authentic storytelling and brand collaborations.'}
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
          <Link
            to="/creator/campaigns"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-xs btn-tactile"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Campaigns</span>
          </Link>
          <Link
            to="/creator/portfolio"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#DBE2EF] hover:bg-[#DBE2EF]/80 text-[#112D4E] text-xs font-bold transition-all btn-tactile"
          >
            <Layers className="w-4 h-4 text-[#3F72AF]" />
            <span>Manage Portfolio</span>
          </Link>
        </div>
      </section>

      {/* 2. Real Profile Completion & Progress Rewards */}
      <ProfileCompletionCard
        type="creator"
        items={completionTasks}
      />

      {/* 3. 4-Column Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Submissions */}
        <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Active Deliverables
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#112D4E] mt-1 font-mono">
                {loading ? '...' : <AnimatedCounter value={stats?.activeSubmissions ?? 0} />}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#DBE2EF] flex items-center justify-center text-[#3F72AF]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
            <span className="text-gray-500">In review pipeline</span>
            <Link to="/creator/submissions" className="font-bold text-[#3F72AF] hover:underline">
              View Work →
            </Link>
          </div>
        </div>

        {/* Approved Deliverables */}
        <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Approved Deliverables
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#112D4E] mt-1 font-mono">
                {loading ? '...' : <AnimatedCounter value={stats?.approvedSubmissions ?? 0} />}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
            <span className="text-gray-500">Lifetime approved</span>
            {(() => {
              const reviewed = (stats?.approvedSubmissions || 0) + (stats?.revisionRequests || 0);
              const rate = reviewed > 0 ? Math.round(((stats?.approvedSubmissions || 0) / reviewed) * 100) : 100;
              return <span className="font-bold text-emerald-700">{rate}% Quality Rate</span>;
            })()}
          </div>
        </div>

        {/* Campaign Applications */}
        <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Active Applications
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#112D4E] mt-1 font-mono">
                {loading ? '...' : <AnimatedCounter value={applications.length} />}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#DBE2EF] flex items-center justify-center text-[#112D4E]">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
            <span className="text-gray-500">{pendingAppsCount} pending, {acceptedAppsCount} accepted</span>
            <Link to="/creator/applications" className="font-bold text-[#3F72AF] hover:underline">
              Track Status →
            </Link>
          </div>
        </div>

        {/* Portfolio Pieces */}
        <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Showcased Work
              </span>
              <p className="text-2xl sm:text-3xl font-black text-[#112D4E] mt-1 font-mono">
                {loading ? '...' : <AnimatedCounter value={portfolioItems.length} />}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#DBE2EF] flex items-center justify-center text-[#3F72AF]">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
            <span className="text-gray-500">Featured items</span>
            <Link to="/creator/portfolio" className="font-bold text-[#3F72AF] hover:underline">
              Manage →
            </Link>
          </div>
        </div>
      </section>

      {/* Resubmit Success Banner */}
      {resubmitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{resubmitSuccess}</span>
          <button onClick={() => setResubmitSuccess(null)} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 4. Urgent Revision Required Alert (if any) */}
      {revisionItems.length > 0 && (
        <section className="bg-white rounded-3xl border-l-4 border-l-rose-500 border border-[#DBE2EF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-black text-[#112D4E]">
                Revision Requested by Brand Reviewer
              </h2>
            </div>
            <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Action Required
            </span>
          </div>

          {revisionItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col sm:flex-row gap-4 items-start"
            >
              <img
                src={item.thumbnail}
                alt={item.videoTitle}
                className="w-20 h-24 object-cover rounded-xl shrink-0 border border-[#DBE2EF]"
              />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-[#112D4E]">{item.campaignTitle}</span>
                  <span className="text-[10px] text-gray-500">•</span>
                  <span className="text-xs font-semibold text-gray-600">{item.brandName}</span>
                </div>
                <p className="text-xs text-gray-700 italic bg-white p-3 rounded-xl border border-[#DBE2EF]">
                  “{item.reviewerNotes || 'Please adjust video pacing and include official campaign hashtag.'}”
                </p>

                {resubmittingId === item.id ? (
                  <div className="flex items-center gap-2 pt-2 flex-wrap sm:flex-nowrap">
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="Paste updated reel/video URL..."
                      className="text-xs p-2 rounded-xl border border-[#DBE2EF] bg-white text-[#112D4E] w-full sm:w-80"
                    />
                    <button
                      type="button"
                      onClick={() => handleResubmit(item.id)}
                      className="px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-all"
                    >
                      Resubmit
                    </button>
                    <button
                      type="button"
                      onClick={() => setResubmittingId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResubmittingId(item.id);
                      setNewUrl(item.videoUrl);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all"
                  >
                    <span>Update Deliverable URL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 5. Active Applications & Collaboration Progress */}
      <section className="bg-white rounded-3xl border border-[#DBE2EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#DBE2EF]/60">
          <div>
            <h2 className="text-lg font-black text-[#112D4E]">
              Campaign Applications & Collaborations
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live statuses of your active pitches and brand acceptance decisions.
            </p>
          </div>
          <Link
            to="/creator/applications"
            className="text-xs font-bold text-[#3F72AF] hover:underline inline-flex items-center gap-1"
          >
            <span>View all ({applications.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="p-8 text-center bg-[#F9F7F7] rounded-2xl border border-dashed border-[#DBE2EF] space-y-3">
            <FileText className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-[#112D4E]">No Active Applications</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              You haven't submitted any campaign applications yet. Browse verified brand briefs to pitch your creative vision.
            </p>
            <Link
              to="/creator/campaigns"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Browse Active Briefs</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.slice(0, 4).map((app) => (
              <div
                key={app.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {app.brandName}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        app.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <Link
                    to={`/creator/campaigns/${app.campaignId}`}
                    className="text-sm font-bold text-[#112D4E] hover:text-[#3F72AF] transition-colors line-clamp-1 block"
                  >
                    {app.campaignTitle}
                  </Link>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {app.pitch}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[10px]">
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                  {app.status === 'accepted' ? (
                    <Link
                      to={`/submit?campaignId=${app.campaignId}`}
                      className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Submit Deliverable</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to="/creator/applications"
                      className="text-xs font-bold text-[#3F72AF] hover:underline"
                    >
                      Details →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Recommended Eligible Campaigns */}
      <section className="bg-white rounded-3xl border border-[#DBE2EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#DBE2EF]/60">
          <div>
            <h2 className="text-lg font-black text-[#112D4E]">
              Recommended Campaign Briefs
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Curated opportunities matched to your content formats and verified tier.
            </p>
          </div>
          <Link
            to="/creator/campaigns"
            className="text-xs font-bold text-[#3F72AF] hover:underline inline-flex items-center gap-1"
          >
            <span>View all briefs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col justify-between hover:shadow-card transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {camp.brandLogo && (
                    <img
                      src={camp.brandLogo}
                      alt={camp.brandName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#DBE2EF]"
                    />
                  )}
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#DBE2EF] text-[#112D4E]">
                    {camp.category}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    {camp.brandName}
                  </span>
                  <Link
                    to={`/creator/campaigns/${camp.id}`}
                    className="text-sm font-black text-[#112D4E] hover:text-[#3F72AF] transition-colors line-clamp-1 block mt-0.5"
                  >
                    {camp.title}
                  </Link>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {camp.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Reward</span>
                  <span className="text-xs font-mono font-black text-[#112D4E]">{camp.rewardAmount}</span>
                </div>
                <Link
                  to={`/creator/campaigns/${camp.id}`}
                  className="px-3 py-1.5 rounded-xl bg-[#112D4E] hover:bg-[#3F72AF] text-white text-xs font-bold transition-colors"
                >
                  View Brief
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Recent Portfolio Showcase */}
      <section className="bg-white rounded-3xl border border-[#DBE2EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#DBE2EF]/60">
          <div>
            <h2 className="text-lg font-black text-[#112D4E]">
              Portfolio Showcase
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Highlight reels and product tests visible to brands during campaign selection.
            </p>
          </div>
          <Link
            to="/creator/portfolio"
            className="text-xs font-bold text-[#3F72AF] hover:underline inline-flex items-center gap-1"
          >
            <span>Manage ({portfolioItems.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {portfolioItems.length === 0 ? (
          <div className="p-8 text-center bg-[#F9F7F7] rounded-2xl border border-dashed border-[#DBE2EF] space-y-3">
            <Layers className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-[#112D4E]">No Portfolio Items Added</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Showcase your past UGC reels, video reviews, or photo carousels to attract premium brands.
            </p>
            <Link
              to="/creator/portfolio"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Portfolio Piece</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#DBE2EF] bg-[#F9F7F7] overflow-hidden flex flex-col justify-between group hover:shadow-card transition-shadow"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                    {item.format}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-black text-[#112D4E] line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-[#DBE2EF]/60">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span>{item.views}</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8. Creator Heatmap Activity */}
      <ActivityHeatmap
        title="Creator Production Cadence"
        subtitle="Your daily UGC submissions, edits, and approved campaign deliverables"
        userId={creatorId}
      />

      {/* Demo Notice */}
      <DemoNotice type="creator" />
      </div>
    </WaterReveal>
  );
};
