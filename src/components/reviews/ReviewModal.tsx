import React, { useState, useEffect } from 'react';
import { Submission, SmartReviewResult } from '../../types';
import { api } from '../../api/client';
import { smartReviewService } from '../../services/smartReviewService';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  History,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  Info,
  Check,
  X
} from 'lucide-react';

interface ReviewModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewed: (updated: Submission) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  submission,
  isOpen,
  onClose,
  onReviewed,
}) => {
  const [decision, setDecision] = useState<'approved' | 'revision_requested' | 'rejected'>('approved');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Smart Review state
  const [smartReview, setSmartReview] = useState<SmartReviewResult | null>(null);
  const [loadingSmartReview, setLoadingSmartReview] = useState<boolean>(false);
  const [showSmartReview, setShowSmartReview] = useState<boolean>(true);
  const [showRevisionsHistory, setShowRevisionsHistory] = useState<boolean>(false);
  const [humanChecklistState, setHumanChecklistState] = useState<Record<string, boolean>>({});

  // Confirmation dialog state before saving decision
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);

  // Celebratory state on approved submission
  const [celebrationState, setCelebrationState] = useState<{ active: boolean; reviewed: Submission | null }>({
    active: false,
    reviewed: null,
  });

  // Load or generate smart review when modal opens
  useEffect(() => {
    if (!isOpen || !submission) {
      setSmartReview(null);
      setNotes('');
      setError(null);
      setConfirmDialogOpen(false);
      return;
    }

    // Default prefill if submission already has review notes
    if (submission.reviewerNotes) {
      setNotes(submission.reviewerNotes);
    } else {
      setNotes('');
    }

    // Load smart review
    if (submission.smartReview) {
      setSmartReview(submission.smartReview);
    } else {
      setLoadingSmartReview(true);
      smartReviewService
        .getSmartReview(submission)
        .then((result) => {
          setSmartReview(result);
          // Initialize human checklist
          const initialChecks: Record<string, boolean> = {};
          result.humanChecklist.forEach((_, i) => {
            initialChecks[`check_${i}`] = false;
          });
          setHumanChecklistState(initialChecks);
        })
        .catch((err) => {
          console.warn('[ReviewModal] Smart review load failed:', err);
        })
        .finally(() => {
          setLoadingSmartReview(false);
        });
    }
  }, [isOpen, submission]);

  if (!isOpen || !submission) return null;

  // Apply suggested AI feedback draft to the reviewer textarea
  const handleApplySuggestedFeedback = (feedbackText: string) => {
    setNotes(feedbackText);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  const handleToggleHumanCheck = (id: string) => {
    setHumanChecklistState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide reviewer feedback or guidance notes before submitting.');
      return;
    }
    setError(null);
    setConfirmDialogOpen(true);
  };

  const handleExecuteDecision = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const reviewed = await api.reviewSubmission(submission.id, {
        status: decision,
        reviewerNotes: notes,
        smartReview: smartReview || undefined,
      });

      setConfirmDialogOpen(false);

      if (decision === 'approved') {
        setCelebrationState({ active: true, reviewed });
        setTimeout(() => {
          onReviewed(reviewed);
          onClose();
          setCelebrationState({ active: false, reviewed: null });
        }, 950);
      } else {
        onReviewed(reviewed);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review decision');
      setConfirmDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-floating border border-[#DBE2EF] overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#DBE2EF] bg-[#F9F7F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3F72AF]/10 text-[#3F72AF] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#112D4E] tracking-tight">
                Smart Deliverable Review
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Grounded verification • AI-assisted observations • Human decision authority
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-[#112D4E] p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverable Snapshot Header */}
        <div className="p-5 flex flex-col sm:flex-row gap-4 border-b border-[#DBE2EF] bg-white">
          <div className="relative w-full sm:w-28 h-36 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-gray-100 border border-[#DBE2EF] shadow-2xs group">
            <img
              src={submission.thumbnail}
              alt={submission.videoTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-extrabold bg-black/80 text-white uppercase">
              {submission.platform}
            </span>
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/75 text-white">
              {submission.duration || '0:30'}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-extrabold text-[#3F72AF] uppercase tracking-wider">
                  {submission.brandName}
                </span>
                <span className="text-gray-300 text-xs">•</span>
                <span className="text-xs text-gray-600 font-medium truncate">
                  {submission.campaignTitle}
                </span>

                {submission.revisions && submission.revisions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200">
                    Revision #{submission.revisions.length + 1}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-extrabold text-[#112D4E]">
                {submission.videoTitle}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Creator: <span className="font-bold text-[#112D4E]">{submission.creatorName}</span> ({submission.creatorHandle})
              </p>

              {submission.caption && (
                <p className="text-xs text-gray-600 bg-[#F9F7F7] p-2.5 rounded-xl border border-[#DBE2EF]/80 mt-2 line-clamp-2 italic">
                  "{submission.caption}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-[#DBE2EF]/60">
              <a
                href={submission.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#3F72AF] hover:underline inline-flex items-center gap-1.5 font-bold"
              >
                <span>Open Published Media URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {submission.revisions && submission.revisions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRevisionsHistory(!showRevisionsHistory)}
                  className="text-xs text-gray-600 hover:text-[#112D4E] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{showRevisionsHistory ? 'Hide History' : `View ${submission.revisions.length} Prior Revisions`}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Revision History Drawer (if requested) */}
          {showRevisionsHistory && submission.revisions && submission.revisions.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                <History className="w-4 h-4 text-amber-600" />
                <span>Historical Revision Audit Log</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {submission.revisions.map((rev) => (
                  <div key={rev.revisionNumber} className="bg-white p-3 rounded-xl border border-amber-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-gray-700">
                      <span>Revision #{rev.revisionNumber}</span>
                      <span className="text-[11px] text-gray-400 font-normal">
                        {new Date(rev.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {rev.reviewerNotes && (
                      <p className="text-gray-600 text-[11px] mt-1 italic">
                        Previous feedback: "{rev.reviewerNotes}"
                      </p>
                    )}
                    <a
                      href={rev.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#3F72AF] hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Original Link</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structured Smart Review Section */}
          <div className="rounded-2xl border border-[#DBE2EF] bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setShowSmartReview(!showSmartReview)}
              className="w-full p-4 bg-[#F9F7F7] flex items-center justify-between text-left cursor-pointer hover:bg-gray-100/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#3F72AF]/10 text-[#3F72AF] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#112D4E]">
                      Smart Campaign Requirement Checks
                    </span>
                    {smartReview && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DBE2EF] text-[#112D4E]">
                        {smartReview.isLiveAI ? 'Live AI Analysis' : 'Deterministic Rules Engine'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Automated verification &amp; AI-assisted observations
                  </p>
                </div>
              </div>

              {showSmartReview ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showSmartReview && (
              <div className="p-4 flex flex-col gap-4 border-t border-[#DBE2EF]">
                {loadingSmartReview ? (
                  <div className="py-8 text-center text-xs text-gray-500 animate-pulse flex flex-col items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#3F72AF] animate-spin" />
                    <span>Evaluating deliverable against campaign brief...</span>
                  </div>
                ) : smartReview ? (
                  <>
                    {/* Executive Summary */}
                    <div className="p-3.5 rounded-xl bg-[#DBE2EF]/30 border border-[#DBE2EF] text-xs text-[#112D4E] font-medium leading-relaxed">
                      <span className="font-extrabold mr-1">Summary:</span>
                      {smartReview.summary}
                    </div>

                    {/* Tier 1: Automatically Verifiable Checks */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3F72AF]" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                          Tier 1: Verifiable Structural Checks
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {smartReview.verifiableChecks.map((chk) => (
                          <div
                            key={chk.id}
                            className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                              chk.status === 'pass'
                                ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-950'
                                : chk.status === 'fail'
                                ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                                : 'bg-amber-50/40 border-amber-200 text-amber-950'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                {chk.status === 'pass' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : chk.status === 'fail' ? (
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                )}
                                <span>{chk.title}</span>
                              </span>
                              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white font-extrabold border">
                                {chk.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600">{chk.explanation}</p>
                            <div className="text-[10px] text-gray-500 font-mono bg-white/70 p-1.5 rounded border">
                              Evidence: {chk.evidence}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tier 2: AI-Assisted Observations */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                          Tier 2: AI-Assisted Brief Observations
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {smartReview.aiObservations.map((obs) => (
                          <div
                            key={obs.id}
                            className="p-3 rounded-xl border border-[#DBE2EF] bg-white text-xs flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between font-bold text-[#112D4E]">
                              <span className="truncate pr-2">{obs.title}</span>
                              <span
                                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                                  obs.status === 'pass'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {obs.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600 leading-relaxed">{obs.explanation}</p>
                            <div className="text-[10px] text-gray-500 bg-[#F9F7F7] p-1.5 rounded border border-[#DBE2EF]/60">
                              Observed Evidence: {obs.evidence}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Feedback Draft Shortcut */}
                    {smartReview.suggestedFeedback && (
                      <div className="p-3.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#112D4E] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
                            <span>AI Drafted Feedback Suggestion</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleApplySuggestedFeedback(smartReview.suggestedFeedback)}
                            className="text-[11px] font-bold text-[#3F72AF] hover:underline flex items-center gap-1 cursor-pointer btn-tactile"
                          >
                            {copiedFeedback ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Inserted!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Apply to Notes</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 italic leading-relaxed">
                          "{smartReview.suggestedFeedback}"
                        </p>
                      </div>
                    )}

                    {/* Media Analysis Limitation Disclosure */}
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 flex items-start gap-2">
                      <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span>{smartReview.mediaAnalysisNotice}</span>
                    </div>

                    {/* Tier 3: Human Judgment Checklist */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#112D4E]" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                          Tier 3: Human Creative Review Checklist
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 bg-[#F9F7F7] p-3 rounded-xl border border-[#DBE2EF]">
                        {smartReview.humanChecklist.map((item, idx) => (
                          <label
                            key={idx}
                            className="flex items-start gap-2 text-xs text-[#112D4E] cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(humanChecklistState[`check_${idx}`])}
                              onChange={() => handleToggleHumanCheck(`check_${idx}`)}
                              className="mt-0.5 rounded text-[#3F72AF] focus:ring-[#3F72AF]"
                            />
                            <span className="leading-snug">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {/* Render Celebratory Confirmation if Decision is Approved & Confirmed by Backend */}
          {celebrationState.active ? (
            <div className="p-8 flex flex-col items-center justify-center animate-celebrate-pop">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-xs animate-soft-pulse mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                Audited &amp; Confirmed
              </span>
              <h3 className="text-xl font-extrabold text-[#112D4E] tracking-tight">
                Deliverable Approved!
              </h3>
              <p className="text-xs text-gray-600 mt-1 max-w-sm text-center">
                Deliverable marked approved and review notification dispatched to {submission.creatorName}.
              </p>
            </div>
          ) : (
            /* Reviewer Decision Form */
            <form onSubmit={handlePreSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                  Reviewer Decision (Human Authority)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('approved')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer btn-tactile ${
                      decision === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-gray-600 border-[#DBE2EF] hover:bg-[#F9F7F7]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('revision_requested')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer btn-tactile ${
                      decision === 'revision_requested'
                        ? 'bg-[#3F72AF] text-white border-[#3F72AF] shadow-xs'
                        : 'bg-white text-gray-600 border-[#DBE2EF] hover:bg-[#F9F7F7]'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Request Revision</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('rejected')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer btn-tactile ${
                      decision === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-gray-600 border-[#DBE2EF] hover:bg-[#F9F7F7]'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Reviewer Feedback Notes (Mandatory for Creator)
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Always editable before final confirmation
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    decision === 'approved'
                      ? 'Great hook and clear branding presentation! Deliverable meets all campaign guidelines.'
                      : decision === 'revision_requested'
                      ? 'Please trim the first 3 seconds to jump straight into product application and add #VeloxSpeed.'
                      : 'Does not adhere to the agreed brief requirements.'
                  }
                  className="w-full text-xs font-medium text-[#112D4E] p-3 rounded-xl border border-[#DBE2EF] focus:border-[#3F72AF] focus:ring-2 focus:ring-[#3F72AF]/20 focus:outline-none bg-[#F9F7F7]/60 resize-none shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#DBE2EF]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-[#112D4E] rounded-xl cursor-pointer btn-tactile"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold bg-[#3F72AF] hover:bg-[#112D4E] text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 btn-tactile disabled:opacity-60"
                >
                  <span>Review &amp; Confirm Decision</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Confirmation Modal Overlay (Ensures deliberate human action) */}
        {confirmDialogOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#DBE2EF] shadow-floating flex flex-col gap-4 animate-scale-up">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    decision === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : decision === 'revision_requested'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {decision === 'approved' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : decision === 'revision_requested' ? (
                    <RotateCcw className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#112D4E]">
                    Confirm {decision === 'approved' ? 'Approval' : decision === 'revision_requested' ? 'Revision Request' : 'Rejection'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    This decision will be finalized and sent to {submission.creatorName}.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#F9F7F7] rounded-xl border border-[#DBE2EF] text-xs text-gray-700 font-medium italic">
                "{notes}"
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialogOpen(false)}
                  disabled={submitting}
                  className="px-3.5 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 rounded-lg cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDecision}
                  disabled={submitting}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer btn-tactile ${
                    decision === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : decision === 'revision_requested'
                      ? 'bg-[#3F72AF] hover:bg-[#112D4E]'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? 'Processing...' : 'Yes, Confirm Decision'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
