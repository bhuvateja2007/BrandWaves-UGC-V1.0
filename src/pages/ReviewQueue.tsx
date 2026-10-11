import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Submission } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { SkyFooter } from '../components/layout/SkyFooter';
import {
  RotateCcw,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';

export const ReviewQueue: React.FC = () => {
  const { currentUser, switchUser, isBrandAdmin, isSupabaseMode } = useAuth();
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubForReview, setSelectedSubForReview] = useState<Submission | null>(null);

  const loadSubmissions = () => {
    setLoading(true);
    setError(null);
    api.getSubmissions()
      .then((subs) => {
        setAllSubmissions(subs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load review queue:', err);
        setError('Failed to fetch deliverables. Please verify backend connection.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleReviewed = (updated: Submission) => {
    setAllSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  // Distinct campaigns for filter dropdown
  const uniqueCampaigns = useMemo(() => {
    const map = new Map<string, string>();
    allSubmissions.forEach((s) => {
      if (s.campaignId && s.campaignTitle) {
        map.set(s.campaignId, s.campaignTitle);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [allSubmissions]);

  // Tab counts
  const pendingCount = useMemo(
    () => allSubmissions.filter((s) => s.status === 'pending').length,
    [allSubmissions]
  );
  const resubmittedCount = useMemo(
    () =>
      allSubmissions.filter(
        (s) => (s.revisions?.length || 0) > 0 && s.status === 'pending'
      ).length,
    [allSubmissions]
  );
  const revisionRequestedCount = useMemo(
    () => allSubmissions.filter((s) => s.status === 'revision_requested').length,
    [allSubmissions]
  );
  const approvedCount = useMemo(
    () => allSubmissions.filter((s) => s.status === 'approved').length,
    [allSubmissions]
  );
  const rejectedCount = useMemo(
    () => allSubmissions.filter((s) => s.status === 'rejected').length,
    [allSubmissions]
  );

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    return allSubmissions
      .filter((sub) => {
        // Status & Resubmitted tab logic
        if (statusFilter === 'resubmitted') {
          if (!((sub.revisions?.length || 0) > 0 && sub.status === 'pending')) {
            return false;
          }
        } else if (statusFilter !== 'all' && sub.status !== statusFilter) {
          return false;
        }

        // Campaign filter
        if (campaignFilter !== 'all' && sub.campaignId !== campaignFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matchesTitle = sub.videoTitle.toLowerCase().includes(q);
          const matchesCreator =
            sub.creatorName.toLowerCase().includes(q) ||
            sub.creatorHandle.toLowerCase().includes(q);
          const matchesBrand = sub.brandName.toLowerCase().includes(q);
          const matchesCampaign = sub.campaignTitle.toLowerCase().includes(q);
          const matchesCaption = sub.caption?.toLowerCase().includes(q);

          if (!matchesTitle && !matchesCreator && !matchesBrand && !matchesCampaign && !matchesCaption) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [allSubmissions, statusFilter, campaignFilter, searchQuery, sortOrder]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F7F7]">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex flex-col gap-6">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DBE2EF]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3F72AF]">
                Brand Governance
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">Asset Verification & Smart Review</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
              Submission Review Queue
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-3xl">
              Inspect creator UGC deliverables against campaign requirements with automated compliance checks,
              AI-assisted draft feedback, and human-in-the-loop decisions.
            </p>
          </div>

          {!isBrandAdmin && !isSupabaseMode && (
            <div className="p-3.5 bg-white rounded-2xl border border-amber-200 shadow-2xs flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span className="text-xs text-[#112D4E] font-medium">
                Viewing as Creator. Switch to Brand Owner to evaluate deliverables.
              </span>
              <button
                type="button"
                onClick={() => switchUser('user_sarah')}
                className="px-3 py-1.5 rounded-xl bg-[#3F72AF] text-white text-xs font-bold shadow-xs hover:bg-[#112D4E] transition-colors cursor-pointer shrink-0"
              >
                Switch to Sarah
              </button>
            </div>
          )}
        </section>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <section className="bg-white p-4 rounded-2xl border border-[#DBE2EF] shadow-subtle flex flex-col gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'pending', label: 'Pending Review', count: pendingCount, icon: Clock },
              { id: 'resubmitted', label: 'Resubmitted Work', count: resubmittedCount, icon: History },
              { id: 'revision_requested', label: 'Revision Requested', count: revisionRequestedCount, icon: RotateCcw },
              { id: 'approved', label: 'Approved', count: approvedCount, icon: CheckCircle2 },
              { id: 'rejected', label: 'Rejected', count: rejectedCount, icon: XCircle },
              { id: 'all', label: 'All Submissions', count: allSubmissions.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#3F72AF] text-white shadow-xs'
                      : 'bg-[#F9F7F7] text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/25 text-white' : 'bg-[#DBE2EF] text-[#112D4E]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Campaign Dropdown, and Date Sorting */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-[#DBE2EF]/60">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by creator, title, brand, or caption..."
                className="w-full pl-10 pr-4 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Campaign:
                </span>
                <select
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs font-bold text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] max-w-xs truncate cursor-pointer"
                >
                  <option value="all">All Campaigns ({uniqueCampaigns.length})</option>
                  {uniqueCampaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="px-3 py-1.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] hover:bg-[#DBE2EF]/40 text-xs font-bold text-gray-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Toggle sort order"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* List of Submissions */}
        <section className="flex flex-col gap-4">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-[#DBE2EF] text-center text-gray-500 text-sm animate-pulse">
              Loading review queue deliverables...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-[#DBE2EF] text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#DBE2EF]/50 flex items-center justify-center text-gray-400">
                <CheckCircle2 className="w-6 h-6 text-[#3F72AF]" />
              </div>
              <h3 className="text-base font-bold text-[#112D4E]">No deliverables found</h3>
              <p className="text-xs text-gray-500 max-w-md">
                No submissions match your active filter settings for status '{statusFilter.replace('_', ' ')}'.
              </p>
              {(statusFilter !== 'pending' || campaignFilter !== 'all' || searchQuery) && (
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
            filteredSubmissions.map((sub) => {
              const hasRevisions = (sub.revisions?.length || 0) > 0;
              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-[#DBE2EF] shadow-subtle hover:shadow-card hover:border-[#3F72AF]/40 transition-all flex flex-col md:flex-row gap-5 items-start justify-between"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Deliverable thumbnail and media details */}
                    <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-[#DBE2EF]">
                      <img
                        src={sub.thumbnail}
                        alt={sub.videoTitle}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/80 text-white backdrop-blur-xs">
                        {sub.platform}
                      </div>
                      {sub.duration && (
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 text-white">
                          {sub.duration}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#3F72AF] uppercase tracking-wider">
                          {sub.brandName}
                        </span>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-xs font-semibold text-[#112D4E]">
                          {sub.campaignTitle}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'revision_requested'
                              ? 'bg-amber-100 text-amber-800'
                              : sub.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-[#112D4E]'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>

                        {/* Revision Badge */}
                        {hasRevisions && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DBE2EF] text-[#112D4E] flex items-center gap-1">
                            <History className="w-3 h-3" />
                            <span>Rev #{(sub.revisions?.length || 0) + 1} (Resubmitted)</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#112D4E] truncate">
                        {sub.videoTitle}
                      </h3>

                      {/* Creator Identity with profile link */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <img
                          src={sub.creatorAvatar}
                          alt={sub.creatorName}
                          className="w-5 h-5 rounded-full object-cover border border-[#DBE2EF]"
                        />
                        <Link
                          to={`/creators`}
                          className="font-semibold text-[#112D4E] hover:text-[#3F72AF] hover:underline"
                        >
                          {sub.creatorName}
                        </Link>
                        <span className="text-gray-400">({sub.creatorHandle})</span>
                      </div>

                      {/* Caption snapshot */}
                      <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                        {sub.caption || 'No caption provided.'}
                      </p>

                      {/* Media Link */}
                      <div className="flex items-center gap-3 pt-1 flex-wrap">
                        <a
                          href={sub.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#3F72AF] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Inspect Live Post URL</span>
                        </a>

                        {sub.smartReview && (
                          <span className="text-[11px] font-bold text-[#112D4E] bg-[#DBE2EF]/70 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#3F72AF]" />
                            <span>Smart Review Evaluated</span>
                          </span>
                        )}
                      </div>

                      {/* Previous Reviewer Feedback (if exists) */}
                      {sub.reviewerNotes && (
                        <div className="mt-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-[#112D4E] flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-[#3F72AF]" />
                              <span>Previous Feedback by {sub.reviewerName || 'Brand Reviewer'}</span>
                            </span>
                            {sub.reviewedAt && (
                              <span className="text-gray-500 font-normal">
                                {new Date(sub.reviewedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-700 italic">
                            "{sub.reviewerNotes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action Column */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#DBE2EF]">
                    <div className="flex flex-col md:items-end text-xs text-gray-500">
                      <span>Submitted: {new Date(sub.createdAt).toLocaleDateString()}</span>
                      <span className="text-[11px] text-gray-400 font-mono">ID: {sub.id}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSubForReview(sub)}
                      className="px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Review Decision</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Review Decision Modal */}
      <ReviewModal
        isOpen={!!selectedSubForReview}
        submission={selectedSubForReview}
        onClose={() => setSelectedSubForReview(null)}
        onReviewed={handleReviewed}
      />

      <SkyFooter />
    </div>
  );
};

