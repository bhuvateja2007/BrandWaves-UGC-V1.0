import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Submission } from '../types';
import { api } from '../api/client';
import { submissionService } from '../services/submissionService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { History, RotateCcw, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';

export const MySubmissions: React.FC = () => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Resubmit modal or inline state
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [updatedUrl, setUpdatedUrl] = useState<string>('');
  const [updatedCaption, setUpdatedCaption] = useState<string>('');
  const [resubmitting, setResubmitting] = useState<boolean>(false);
  const [resubmitError, setResubmitError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const subs = await submissionService.getCreatorSubmissions(currentUser);
      setSubmissions(subs);
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [currentUser]);

  const handleResubmit = async (id: string) => {
    if (!updatedUrl.trim() || (!updatedUrl.startsWith('http://') && !updatedUrl.startsWith('https://'))) {
      setResubmitError('Please enter a valid HTTP/HTTPS video URL for your revised deliverable.');
      return;
    }
    try {
      setResubmitting(true);
      setResubmitError(null);
      await submissionService.resubmitSubmission(id, {
        videoUrl: updatedUrl,
        caption: updatedCaption,
      });
      setActionSuccess('Deliverable revised and submitted to the brand review queue!');
      setEditingSubId(null);
      setUpdatedUrl('');
      setUpdatedCaption('');
      loadSubmissions();
    } catch (err: any) {
      setResubmitError(err.message || 'Failed to resubmit deliverable');
    } finally {
      setResubmitting(false);
    }
  };

  const actionRequiredCount = submissions.filter((s) => s.status === 'revision_requested').length;
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (platformFilter !== 'all' && s.platform.toLowerCase() !== platformFilter.toLowerCase()) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        s.videoTitle.toLowerCase().includes(term) ||
        s.campaignTitle.toLowerCase().includes(term) ||
        s.brandName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 flex flex-col gap-6">
        {/* Top Header & Summary Metrics */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#DBE2EF]/80">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#3F72AF]">
                Asset Governance
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span className="text-xs text-gray-500">Q4 Campaign Deliverables</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
              My Submissions
            </h1>
            <p className="text-sm text-gray-600">
              Track review progress, reviewer feedback, and revision requests for all your UGC deliveries.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#DBE2EF] shadow-2xs card-interactive">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-xs font-extrabold text-[#112D4E]">
                <AnimatedCounter value={actionRequiredCount} suffix=" Action Required" />
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#DBE2EF] shadow-2xs card-interactive">
              <span className="material-symbols-outlined text-[16px] text-[#3F72AF]">schedule</span>
              <span className="text-xs font-bold text-gray-600">
                <AnimatedCounter value={pendingCount} suffix=" Pending Validation" />
              </span>
            </div>
          </div>
        </section>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-celebrate-pop">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="font-bold hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Tabs Bar */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#DBE2EF] shadow-subtle">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Submissions', count: submissions.length },
              { id: 'pending', label: 'In Review', count: pendingCount },
              { id: 'revision_requested', label: 'Revision Requested', count: actionRequiredCount, alert: true },
              { id: 'approved', label: 'Approved', count: approvedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tab-transition cursor-pointer whitespace-nowrap btn-tactile ${
                  statusFilter === tab.id
                    ? 'bg-[#3F72AF] text-white shadow-xs btn-glow'
                    : 'text-gray-600 hover:bg-[#DBE2EF]/60 hover:text-[#112D4E]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : tab.alert && tab.count > 0
                      ? 'bg-rose-500 text-white'
                      : 'bg-[#DBE2EF] text-[#112D4E]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title or brand..."
              className="w-full md:w-60 bg-[#F9F7F7] text-[#112D4E] text-xs pl-9 pr-3 py-2 rounded-xl border border-[#DBE2EF] focus:border-[#3F72AF] focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </section>

        {/* Submissions List */}
        <section className="flex flex-col gap-4">
          {loading ? (
            <div className="p-12 text-center text-secondary text-sm animate-pulse">
              Loading deliverables...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 rounded-xl border border-brand-surface bg-surface-container-lowest text-center text-secondary text-sm">
              <span className="material-symbols-outlined text-[32px] text-outline block mb-2">
                video_library
              </span>
              No deliverables in this status category.
            </div>
          ) : (
            filtered.map((sub) => {
              const isRevision = sub.status === 'revision_requested';
              const isApproved = sub.status === 'approved';
              const isPending = sub.status === 'pending';

              return (
                <article
                  key={sub.id}
                  className={`bg-white rounded-2xl border shadow-subtle overflow-hidden card-interactive transition-all ${
                    isRevision
                      ? 'border-rose-300 hover:border-rose-500'
                      : 'border-[#DBE2EF] hover:border-[#3F72AF]/40'
                  }`}
                >
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-5">
                    {/* Media Thumbnail */}
                    <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 rounded-xl overflow-hidden bg-[#DBE2EF] border border-[#DBE2EF]/80 group shadow-2xs">
                      <img
                        src={sub.thumbnail}
                        alt={sub.videoTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/75 text-white backdrop-blur-sm">
                        {sub.platform}
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/75 text-white">
                        {sub.duration || '0:30'}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#3F72AF] uppercase tracking-wider">
                              {sub.brandName}
                            </span>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-xs text-gray-500">{sub.campaignTitle}</span>
                          </div>

                          <StatusBadge status={sub.status} />
                        </div>


                        <h3 className="text-lg font-bold text-brand-navy tracking-tight">
                          {sub.videoTitle}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-secondary flex-wrap">
                          <a
                            href={sub.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-blue hover:underline font-medium inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">link</span>
                            <span>View Live Post URL</span>
                          </a>
                          <span>•</span>
                          <span>Submitted: {new Date(sub.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Reviewer Feedback Box (if present) */}
                        {sub.reviewerNotes && (
                          <div
                            className={`p-4 rounded-xl border mt-2 flex flex-col gap-1.5 ${
                              isRevision
                                ? 'bg-error-container/20 border-error/30 text-brand-navy'
                                : 'bg-brand-surface/40 border-brand-surface text-secondary'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="flex items-center gap-1.5 text-brand-navy">
                                <span className="material-symbols-outlined text-[16px] text-brand-blue">
                                  rate_review
                                </span>
                                Reviewer: {sub.reviewerName || 'Brand Admin'}
                              </span>
                              <span className="text-[11px] text-secondary">
                                {sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed italic">
                              “{sub.reviewerNotes}”
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Revision Editor Form (when editing) */}
                      {isRevision && editingSubId === sub.id && (
                        <div className="mt-4 p-5 rounded-2xl bg-[#F9F7F7] border-2 border-brand-blue/30 flex flex-col gap-4 animate-fadeIn">
                          <div className="flex items-center justify-between pb-3 border-b border-[#DBE2EF]">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse"></span>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                                Submit Revised Deliverable (Rev #{(sub.revisions?.length || 0) + 2})
                              </h4>
                            </div>
                            <span className="text-[11px] text-secondary">
                              Previous version will be archived in your revision history
                            </span>
                          </div>

                          {resubmitError && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{resubmitError}</span>
                            </div>
                          )}

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-brand-navy flex items-center justify-between">
                              <span>Revised Post / Video URL *</span>
                              <span className="text-[10px] text-secondary font-normal">Must start with http:// or https://</span>
                            </label>
                            <input
                              type="url"
                              value={updatedUrl}
                              onChange={(e) => setUpdatedUrl(e.target.value)}
                              placeholder="https://instagram.com/p/... or https://tiktok.com/@.../video/..."
                              className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-white text-brand-navy focus:border-brand-blue focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-brand-navy flex items-center justify-between">
                              <span>Updated Caption & Disclosures</span>
                              <span className="text-[10px] text-secondary font-normal">Ensure required tags or hashtags are included</span>
                            </label>
                            <textarea
                              rows={3}
                              value={updatedCaption}
                              onChange={(e) => setUpdatedCaption(e.target.value)}
                              placeholder="Add revised caption, brand mentions (e.g. @Brand), and disclosure tags (#ad, #sponsored)..."
                              className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-white text-brand-navy focus:border-brand-blue focus:outline-none resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSubId(null);
                                setResubmitError(null);
                              }}
                              disabled={resubmitting}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-secondary hover:text-brand-navy hover:bg-white border border-transparent transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResubmit(sub.id)}
                              disabled={resubmitting}
                              className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-navy text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              {resubmitting ? (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Saving Revision...</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Submit Revision</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Revision History Section (when available) */}
                      {sub.revisions && sub.revisions.length > 0 && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedHistoryId(
                                expandedHistoryId === sub.id ? null : sub.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-navy cursor-pointer transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>
                              {expandedHistoryId === sub.id ? 'Hide' : 'View'} Revision History ({sub.revisions.length} prior {sub.revisions.length === 1 ? 'version' : 'versions'})
                            </span>
                          </button>

                          {expandedHistoryId === sub.id && (
                            <div className="mt-3 p-4 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col gap-3 animate-fadeIn">
                              <h5 className="text-[11px] font-bold uppercase tracking-wider text-brand-navy">
                                Historical Submission Versions
                              </h5>
                              <div className="flex flex-col gap-2.5">
                                {sub.revisions.map((rev) => (
                                  <div
                                    key={rev.revisionNumber}
                                    className="p-3 rounded-lg bg-white border border-[#DBE2EF] text-xs flex flex-col gap-1.5"
                                  >
                                    <div className="flex items-center justify-between text-[11px] font-bold text-brand-navy">
                                      <span className="flex items-center gap-1.5">
                                        <span className="px-1.5 py-0.5 rounded bg-[#DBE2EF] text-[#112D4E] text-[10px]">
                                          Version {rev.revisionNumber}
                                        </span>
                                        <span>Submitted: {new Date(rev.submittedAt).toLocaleString()}</span>
                                      </span>
                                      <a
                                        href={rev.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-blue hover:underline inline-flex items-center gap-1"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Archived URL</span>
                                      </a>
                                    </div>
                                    {rev.caption && (
                                      <p className="text-secondary text-[11px] line-clamp-2 italic">
                                        "{rev.caption}"
                                      </p>
                                    )}
                                    {rev.reviewerNotes && (
                                      <div className="text-[11px] p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                                        <span className="font-bold">Feedback received: </span>
                                        <span>{rev.reviewerNotes}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-brand-surface">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-secondary">
                            Asset ID: <code className="text-brand-navy font-mono text-[11px]">{sub.id}</code>
                          </span>
                          {sub.revisions && sub.revisions.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DBE2EF] text-[#112D4E] flex items-center gap-1">
                              <History className="w-3 h-3" />
                              <span>Rev #{sub.revisions.length + 1}</span>
                            </span>
                          )}
                        </div>

                        {isRevision && editingSubId !== sub.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubId(sub.id);
                              setUpdatedUrl(sub.videoUrl);
                              setUpdatedCaption(sub.caption || '');
                              setResubmitError(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-navy text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Prepare & Submit Revision</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};
