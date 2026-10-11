import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnalyticsOverview, Submission, Campaign } from '../types';
import { api } from '../api/client';
import { ActivityHeatmap } from '../components/heatmap/ActivityHeatmap';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { SkyFooter } from '../components/layout/SkyFooter';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

export const BrandDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [urgentReviews, setUrgentReviews] = useState<Submission[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubForReview, setSelectedSubForReview] = useState<Submission | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overview, subs, camps] = await Promise.all([
        api.getOverviewAnalytics(),
        api.getSubmissions({ status: 'pending' }),
        api.getCampaigns({ status: 'active' }),
      ]);
      setAnalytics(overview);
      setUrgentReviews(subs);
      setActiveCampaigns(camps);
    } catch (err) {
      console.error('Failed to load brand dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewed = (updated: Submission) => {
    // Refresh review queue and overview metrics
    setUrgentReviews((prev) => prev.filter((s) => s.id !== updated.id));
    loadData();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 flex flex-col gap-8">
        {/* Top Header Section */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DBE2EF]/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              BrandWave OS • Operational Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
              Brand Overview Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/reviews"
              className="px-4 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 btn-tactile btn-glow"
            >
              <span className="material-symbols-outlined text-[16px]">rate_review</span>
              <span>Open Review Queue ({urgentReviews.length})</span>
            </Link>
          </div>
        </section>

        {/* Core KPI Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 rounded-2xl p-6 border border-[#DBE2EF] bg-white shadow-subtle card-interactive">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Submissions</p>
            <p className="text-[#112D4E] text-2xl sm:text-3xl font-extrabold">
              {loading ? (
                <span className="text-gray-300">...</span>
              ) : (
                <AnimatedCounter 
                  value={analytics ? analytics.totalSubmissions : 24800} 
                  formatFn={(v) => `${(v / 1000).toFixed(1)}k`}
                />
              )}
            </p>
            <p className="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <span>↑</span> +14.2% from last cycle
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl p-6 border border-[#DBE2EF] bg-white shadow-subtle card-interactive">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Campaigns</p>
            <p className="text-[#112D4E] text-2xl sm:text-3xl font-extrabold">
              {loading ? (
                <span className="text-gray-300">...</span>
              ) : (
                <AnimatedCounter value={analytics ? analytics.activeCampaigns : 18} />
              )}
            </p>
            <p className="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <span>↑</span> +4.0% active running
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl p-6 border border-[#DBE2EF] bg-white shadow-subtle card-interactive">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Reviews</p>
            <p className="text-[#112D4E] text-2xl sm:text-3xl font-extrabold">
              {loading ? (
                <span className="text-gray-300">...</span>
              ) : (
                <AnimatedCounter value={urgentReviews.length} />
              )}
            </p>
            <p className="text-[#3F72AF] text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3F72AF] animate-pulse"></span>
              <span>{urgentReviews.length} requiring validation</span>
            </p>
          </div>
        </section>

        {/* Submission Velocity Chart */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-brand-navy">Submission Velocity</h2>
          <div className="flex flex-col rounded-xl border border-brand-surface p-6 bg-surface-container-lowest shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <p className="text-secondary text-sm font-medium">Weekly Ingestion Velocity</p>
                <p className="text-brand-navy text-3xl font-bold mt-0.5">1,840/wk</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-secondary">Last 30 days</span>
                <span className="text-success font-bold bg-success-container px-2 py-0.5 rounded-full">
                  +18.5%
                </span>
              </div>
            </div>

            {/* SVG Velocity Curve matching Stitch exact layout */}
            <div className="w-full h-36 relative">
              <svg
                fill="none"
                height="100%"
                preserveAspectRatio="none"
                viewBox="-3 0 478 150"
                width="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                  fill="url(#brand_wave_grad)"
                />
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="#3F72AF"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
                <defs>
                  <linearGradient id="brand_wave_grad" x1="236" x2="236" y1="1" y2="149" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#DBE2EF" />
                    <stop offset="1" stopColor="#DBE2EF" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex justify-around border-t border-brand-surface pt-2">
              <span className="text-secondary text-xs font-bold">W1</span>
              <span className="text-secondary text-xs font-bold">W2</span>
              <span className="text-secondary text-xs font-bold">W3</span>
              <span className="text-secondary text-xs font-bold">W4</span>
            </div>
          </div>
        </section>

        {/* Activity Overview Heatmap (52-week 7-day annual contribution calendar) */}
        <ActivityHeatmap
          title="Activity Overview"
          subtitle="Your activity and consistency over time • All campaign submissions & review actions"
        />

        {/* Urgent Review Queue Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-brand-navy">Urgent Review Queue</h2>
            <Link to="/reviews" className="text-xs font-semibold text-brand-blue hover:underline">
              View All ({urgentReviews.length})
            </Link>
          </div>

          {urgentReviews.length === 0 ? (
            <div className="p-8 rounded-xl border border-brand-surface bg-surface-container-lowest text-center text-secondary text-sm">
              <span className="material-symbols-outlined text-[28px] text-success block mb-1">
                check_circle
              </span>
              All submissions have been reviewed! The queue is clean.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {urgentReviews.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-brand-surface bg-surface-container-lowest shadow-subtle hover:border-brand-blue transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={sub.creatorAvatar}
                      alt={sub.creatorName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-brand-surface"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-brand-navy truncate">
                          {sub.videoTitle}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-error-container text-on-error-container">
                          Pending Review
                        </span>
                      </div>
                      <span className="text-xs text-secondary truncate">
                        Creator: {sub.creatorHandle} • Campaign: {sub.campaignTitle}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSubForReview(sub)}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-navy text-white text-xs font-semibold transition-colors shrink-0 shadow-xs cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Campaigns Snapshot */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-brand-navy">Active Campaigns</h2>
            <span className="text-xs font-medium text-secondary">
              {activeCampaigns.length} campaigns running
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCampaigns.slice(0, 4).map((camp) => (
              <div
                key={camp.id}
                className="flex flex-col p-5 rounded-xl border border-brand-surface bg-surface-container-lowest shadow-subtle justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-1">
                    <Link
                      to={`/campaigns/${camp.id}`}
                      className="text-sm font-bold text-brand-navy hover:text-brand-blue transition-colors"
                    >
                      {camp.title}
                    </Link>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-surface text-brand-navy">
                      {camp.category}
                    </span>
                  </div>
                  <p className="text-xs text-secondary line-clamp-2 mt-1">
                    {camp.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-secondary pt-3 border-t border-brand-surface">
                  <span>Submissions: <strong className="text-brand-navy">{camp.spotsFilled * 72}</strong></span>
                  <span>Approval Rate: <strong className="text-success">{analytics?.approvalRate || '94.2'}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Review Modal Trigger */}
      <ReviewModal
        isOpen={!!selectedSubForReview}
        submission={selectedSubForReview}
        onClose={() => setSelectedSubForReview(null)}
        onReviewed={handleReviewed}
      />

      {/* Atmospheric Sky Footer */}
      <SkyFooter />
    </div>
  );
};
