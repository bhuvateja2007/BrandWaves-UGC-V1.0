import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Campaign, Submission, CreatorStats } from '../types';
import { api } from '../api/client';
import { ActivityHeatmap } from '../components/heatmap/ActivityHeatmap';
import { SkyFooter } from '../components/layout/SkyFooter';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { MotionButton } from '../components/common/MotionButton';

export const CreatorDashboard: React.FC = () => {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [revisionItems, setRevisionItems] = useState<Submission[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Resubmit state
  const [resubmittingId, setResubmittingId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState<string>('');
  const [resubmitSuccess, setResubmitSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [creatorStats, userSubs, camps] = await Promise.all([
        api.getCreatorStats(),
        api.getCreatorSubmissions(),
        api.getCampaigns({ status: 'active' }),
      ]);
      setStats(creatorStats);
      setRevisionItems(userSubs.filter((s) => s.status === 'revision_requested'));
      setCampaigns(camps);
    } catch (err) {
      console.error('Failed to load creator dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResubmit = async (subId: string) => {
    if (!newUrl.trim()) return;
    try {
      await api.resubmitSubmission(subId, { videoUrl: newUrl });
      setResubmitSuccess('Deliverable resubmitted successfully! It is now pending reviewer review.');
      setResubmittingId(null);
      setNewUrl('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to resubmit deliverable');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 flex flex-col gap-8">
        {/* Top Editorial Header & Quick Action */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-brand-surface">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
                Creator Workspace • October Briefing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">
              Welcome back, Alex
            </h1>
            <p className="text-sm text-secondary max-w-xl">
              Your next great collaboration starts here. Brands are actively reviewing your submitted deliverables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-navy text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>Explore campaigns</span>
            </Link>
          </div>
        </section>

        {/* 4-Column Compact Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Active Submissions */}
          <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-subtle card-interactive flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Active Submissions</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] mt-1">
                  {loading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    <AnimatedCounter value={stats?.activeSubmissions ?? 2} />
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#DBE2EF] flex items-center justify-center text-[#3F72AF] shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
              <span className="text-gray-500">In review pipeline</span>
              <span className="font-bold text-[#3F72AF]">Live Escrow Guarded</span>
            </div>
          </div>

          {/* 2. Approved Deliverables */}
          <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-subtle card-interactive flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Approved Deliverables</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] mt-1">
                  {loading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    <AnimatedCounter value={stats?.approvedSubmissions ?? 28} />
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
              <span className="text-gray-500">Lifetime approved</span>
              <span className="font-bold text-emerald-600">+4 this month</span>
            </div>
          </div>

          {/* 3. Revision Requests */}
          <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-subtle card-interactive flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Revision Requests</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] mt-1">
                  {loading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    <AnimatedCounter value={revisionItems.length} />
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center justify-center shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">priority_high</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
              <span className="text-gray-500">Action needed</span>
              <span className="font-bold text-rose-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {revisionItems.length > 0 ? 'Needs edit' : 'Queue clear'}
              </span>
            </div>
          </div>

          {/* 4. Campaigns Joined */}
          <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-subtle card-interactive flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Campaigns Joined</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] mt-1">
                  {loading ? (
                    <span className="text-gray-300">...</span>
                  ) : (
                    <AnimatedCounter value={stats?.campaignsJoined ?? 12} />
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#DBE2EF] flex items-center justify-center text-[#112D4E] shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
              <span className="text-gray-500">Active brands</span>
              <span className="font-bold text-[#112D4E]">3 partners</span>
            </div>
          </div>
        </section>

        {/* Resubmit Success Notice */}
        {resubmitSuccess && (
          <div className="p-4 rounded-xl bg-success-container border border-success/30 text-success text-xs font-semibold flex items-center justify-between">
            <span>{resubmitSuccess}</span>
            <button onClick={() => setResubmitSuccess(null)} className="text-success font-bold hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Urgent Reviewer Feedback Required Alert Banner */}
        {revisionItems.length > 0 && (
          <section className="flex flex-col gap-3">
            <div className="bg-surface-container-lowest rounded-xl p-5 border-l-4 border-l-error border border-brand-surface shadow-subtle flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-error-container text-error inline-flex items-center">
                    <span className="material-symbols-outlined text-[18px]">rate_review</span>
                  </span>
                  <h3 className="text-base font-bold text-brand-navy">
                    Submission Feedback Required
                  </h3>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-secondary font-semibold">
                  Action required by creator
                </span>
              </div>

              {revisionItems.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-brand-bg/60 border border-brand-surface flex flex-col sm:flex-row gap-4 items-start">
                  <img
                    src={item.thumbnail}
                    alt={item.videoTitle}
                    className="w-20 h-28 object-cover rounded-lg shrink-0 border border-brand-surface"
                  />
                  <div className="flex flex-col justify-between flex-1 gap-2 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-brand-navy">
                          {item.campaignTitle}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-error-container text-error">
                          Needs Revision
                        </span>
                      </div>
                      <p className="text-xs text-secondary italic bg-white p-3 rounded-lg border border-brand-surface">
                        “{item.reviewerNotes || 'Please adjust per the brand requirements.'}”
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                      <span className="text-[11px] text-secondary">
                        Reviewer: <strong className="text-brand-navy">{item.reviewerName || 'Brand Team'}</strong>
                      </span>

                      {resubmittingId === item.id ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="url"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="Paste updated video URL..."
                            className="text-xs p-1.5 rounded-lg border border-brand-surface bg-white text-brand-navy w-full sm:w-64"
                          />
                          <button
                            type="button"
                            onClick={() => handleResubmit(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold cursor-pointer shrink-0"
                          >
                            Submit
                          </button>
                          <button
                            type="button"
                            onClick={() => setResubmittingId(null)}
                            className="text-xs text-secondary cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setResubmittingId(item.id);
                              setNewUrl(item.videoUrl);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-navy text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">upload_file</span>
                            <span>Update Submission</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Eligible Campaigns */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">
                Recommended Eligible Campaigns
              </h2>
              <p className="text-xs text-secondary">
                Curated based on your high engagement in Tech, Fitness &amp; Lifestyle niches.
              </p>
            </div>
            <Link
              to="/campaigns"
              className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-0.5"
            >
              <span>View all briefs</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {campaigns.slice(0, 3).map((camp) => (
              <div
                key={camp.id}
                className="bg-surface-container-lowest rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-brand-surface shadow-subtle hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={camp.brandLogo}
                    alt={camp.brandName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-brand-surface"
                  />
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                        {camp.brandName}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-brand-surface font-semibold text-brand-navy">
                        {camp.platform} • {camp.format}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-success-container font-semibold text-success">
                        Eligible
                      </span>
                    </div>
                    <Link
                      to={`/campaigns/${camp.id}`}
                      className="text-base font-bold text-brand-navy hover:text-brand-blue transition-colors truncate"
                    >
                      {camp.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-secondary">
                      <span className="font-bold text-brand-blue">{camp.rewardAmount}</span>
                      <span>•</span>
                      <span>Deadline: {camp.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                  <span className="text-xs text-secondary">
                    {camp.spotsFilled}/{camp.spotsTotal} spots
                  </span>
                  <Link
                    to={`/submit?campaignId=${camp.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-navy text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Submit Deliverable
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Creator Personal Activity Heatmap */}
        <ActivityHeatmap
          title="Creator Activity Overview"
          subtitle="Your UGC submissions, edits, and approved deliverables logged over time"
          userId="user_alex"
        />
      </main>

      <SkyFooter />
    </div>
  );
};
