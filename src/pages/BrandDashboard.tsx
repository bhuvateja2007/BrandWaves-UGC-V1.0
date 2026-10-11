import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnalyticsOverview, Submission, Campaign } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ActivityHeatmap } from '../components/heatmap/ActivityHeatmap';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

export const BrandDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [urgentReviews, setUrgentReviews] = useState<Submission[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubForReview, setSelectedSubForReview] = useState<Submission | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const brandId = currentUser?.brandId || (currentUser?.role === 'brand_owner' ? currentUser.brandName : undefined);
      const [overview, subs, camps] = await Promise.all([
        api.getOverviewAnalytics(brandId),
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
  }, [currentUser]);

  const handleReviewed = (updated: Submission) => {
    // Refresh review queue and overview metrics
    setUrgentReviews((prev) => prev.filter((s) => s.id !== updated.id));
    loadData();
  };

  // Dynamic 4-week submission velocity curve derived directly from database records
  const weeklyData = useMemo(() => {
    return analytics?.weeklyBreakdown || [0, 0, 0, 0];
  }, [analytics?.weeklyBreakdown]);

  const { pathLine, pathFill, points, isAllZero } = useMemo(() => {
    const vals = weeklyData;
    const isZero = vals.every((v) => v === 0);
    const maxVal = Math.max(1, ...vals);
    const xCoords = [40, 170, 300, 430];
    const baselineY = 125;

    const coords = vals.map((v, i) => {
      const y = isZero ? baselineY : baselineY - (v / maxVal) * 95;
      return { x: xCoords[i], y, val: v };
    });

    if (isZero) {
      return {
        pathLine: `M 0 ${baselineY} L 478 ${baselineY}`,
        pathFill: `M 0 ${baselineY} L 478 ${baselineY} L 478 150 L 0 150 Z`,
        points: coords,
        isAllZero: true,
      };
    }

    let lineD = `M 0 ${coords[0].y} L ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = p0.x + (p1.x - p0.x) / 2;
      lineD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    lineD += ` L 478 ${coords[coords.length - 1].y}`;
    const fillD = `${lineD} L 478 150 L 0 150 Z`;

    return { pathLine: lineD, pathFill: fillD, points: coords, isAllZero: false };
  }, [weeklyData]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12 w-full">
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
          <div className="text-[#112D4E] text-2xl sm:text-3xl font-extrabold">
            {loading ? (
              <span className="text-gray-300">...</span>
            ) : (
              <AnimatedCounter 
                value={analytics?.totalSubmissions ?? 0} 
                formatFn={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`)}
              />
            )}
          </div>
          <p className="text-emerald-600 text-xs font-bold flex items-center gap-1">
            <span>↑</span> Verified deliverables
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl p-6 border border-[#DBE2EF] bg-white shadow-subtle card-interactive">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Campaigns</p>
          <div className="text-[#112D4E] text-2xl sm:text-3xl font-extrabold">
            {loading ? (
              <span className="text-gray-300">...</span>
            ) : (
              <AnimatedCounter value={analytics?.activeCampaigns ?? 0} />
            )}
          </div>
          <p className="text-emerald-600 text-xs font-bold flex items-center gap-1">
            <span>↑</span> Currently active briefs
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl p-6 border border-[#DBE2EF] bg-white shadow-subtle card-interactive">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Reviews</p>
          <div className="text-[#112D4E] text-2xl sm:text-3xl font-extrabold">
            {loading ? (
              <span className="text-gray-300">...</span>
            ) : (
              <AnimatedCounter value={urgentReviews.length} />
            )}
          </div>
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
              <p className="text-brand-navy text-3xl font-bold mt-0.5">
                {analytics?.weeklyVelocity || `${urgentReviews.length}/wk`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-secondary">Measured rate</span>
              <span className="text-success font-bold bg-success-container px-2 py-0.5 rounded-full">
                {analytics?.velocityChange || '+0%'}
              </span>
            </div>
          </div>

          {/* Dynamic Velocity Curve derived from database records */}
          <div className="w-full h-36 relative">
            <svg
              fill="none"
              height="100%"
              preserveAspectRatio="none"
              viewBox="-3 0 478 150"
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="brand_wave_grad" x1="236" x2="236" y1="1" y2="149" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#DBE2EF" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#DBE2EF" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Area gradient under curve */}
              <path d={pathFill} fill="url(#brand_wave_grad)" />

              {/* Curve stroke */}
              <path
                d={pathLine}
                stroke="#3F72AF"
                strokeLinecap="round"
                strokeWidth={isAllZero ? '2' : '3'}
                strokeDasharray={isAllZero ? '4 4' : undefined}
              />

              {/* Data points for each week */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isAllZero ? 3 : 5}
                    fill="#3F72AF"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all hover:r-6 cursor-pointer"
                  >
                    <title>{`Week ${idx + 1}: ${pt.val} submission${pt.val === 1 ? '' : 's'}`}</title>
                  </circle>
                  {!isAllZero && pt.val > 0 && (
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fill="#112D4E"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {pt.val}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {isAllZero && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[11px] font-semibold text-gray-400 bg-white/80 px-2.5 py-1 rounded-full border border-gray-200">
                  Zero submissions recorded in rolling 4-week window
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-around border-t border-brand-surface pt-2">
            <span className="text-secondary text-xs font-bold">W1 ({weeklyData[0]})</span>
            <span className="text-secondary text-xs font-bold">W2 ({weeklyData[1]})</span>
            <span className="text-secondary text-xs font-bold">W3 ({weeklyData[2]})</span>
            <span className="text-secondary text-xs font-bold">W4 ({weeklyData[3]})</span>
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
                <span>Spots Filled: <strong className="text-brand-navy">{camp.spotsFilled} / {camp.spotsTotal}</strong></span>
                <span>Approval Rate: <strong className="text-success">{analytics?.approvalRate ?? 100}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Review Modal Trigger */}
      <ReviewModal
        isOpen={!!selectedSubForReview}
        submission={selectedSubForReview}
        onClose={() => setSelectedSubForReview(null)}
        onReviewed={handleReviewed}
      />
    </div>
  );
};
