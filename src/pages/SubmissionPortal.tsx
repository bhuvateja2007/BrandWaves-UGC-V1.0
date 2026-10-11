import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Campaign } from '../types';
import { api } from '../api/client';
import { SkyFooter } from '../components/layout/SkyFooter';

export const SubmissionPortal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const campaignIdFromQuery = searchParams.get('campaignId') || 'camp_velox_sprint';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaignIdFromQuery);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Form State
  const [platform, setPlatform] = useState<'TikTok' | 'Instagram' | 'YouTube'>('TikTok');
  const [videoUrl, setVideoUrl] = useState<string>('https://www.tiktok.com/@alex.creates/video/7482910482910');
  const [videoTitle, setVideoTitle] = useState<string>('High Velocity Training Reel — Authentic Drop');
  const [caption, setCaption] = useState<string>('Testing out the new athletic drop with raw movement and sprint pacing. Loving the hold! 🔥 #BrandWaves #UGC');
  const [tags, setTags] = useState<string>('#VeloxSpeed, #RunnerGear, #BrandWaves');
  const [complianceAgreed, setComplianceAgreed] = useState<boolean>(true);

  const [currentStep, setCurrentStep] = useState<number>(2);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);

  useEffect(() => {
    api.getCampaigns({ status: 'active' }).then((camps) => {
      setCampaigns(camps);
      const match = camps.find((c) => c.id === selectedCampaignId) || camps[0];
      if (match) {
        setSelectedCampaignId(match.id);
        setSelectedCampaign(match);
      }
    });
  }, [selectedCampaignId]);

  const handleCampaignChange = (id: string) => {
    setSelectedCampaignId(id);
    const match = campaigns.find((c) => c.id === id);
    if (match) setSelectedCampaign(match);
  };

  const isUrlValid = videoUrl.startsWith('http://') || videoUrl.startsWith('https://');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl || !videoTitle) {
      setError('Please provide both the post URL and deliverable title.');
      return;
    }
    if (!isUrlValid) {
      setError('Please provide a valid web link starting with http:// or https://');
      return;
    }
    if (!complianceAgreed) {
      setError('You must confirm compliance with brand guidelines.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.createSubmission({
        campaignId: selectedCampaignId,
        platform,
        videoUrl,
        videoTitle,
        caption,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        thumbnail: 'https://images.unsplash.com/photo-1483721074577-83a378a49459?auto=format&fit=crop&w=600&q=80',
      });
      // Redirect to My Submissions where the new deliverable appears in the review queue
      navigate('/submissions');
    } catch (err: any) {
      setError(err.message || 'Failed to submit content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 flex flex-col gap-6">
        {/* Top Context Header & Breadcrumbs */}
        <div className="p-4 sm:p-6 bg-surface-container-low rounded-2xl border border-brand-surface shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-1.5 text-xs text-secondary font-medium">
              <Link to="/campaigns" className="hover:text-brand-navy">
                Discover Campaigns
              </Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-brand-navy font-semibold truncate max-w-xs sm:max-w-md">
                {selectedCampaign?.title || 'Active Campaign'}
              </span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-brand-blue font-bold">Submit Content</span>
            </nav>

            <h1 className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight mt-1">
              Submit UGC Content — {selectedCampaign?.brandName || 'Brand Brief'}
            </h1>

            <div className="flex items-center gap-3 text-xs text-secondary flex-wrap mt-0.5">
              <span className="font-bold text-brand-navy">
                Brand: {selectedCampaign?.brandName}
              </span>
              <span>•</span>
              <span className="font-bold text-brand-blue">
                Reward: {selectedCampaign?.rewardAmount}
              </span>
              <span>•</span>
              <span>Deadline: {selectedCampaign?.deadline}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={handleSaveDraft}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer btn-tactile ${
                draftSaved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs animate-celebrate-pop'
                  : 'bg-white text-[#112D4E] border-[#DBE2EF] shadow-2xs hover:bg-[#F9F7F7]'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${draftSaved ? 'text-emerald-600 animate-icon-pop' : 'text-gray-400'}`}>
                {draftSaved ? 'check_circle' : 'bookmark_border'}
              </span>
              <span>{draftSaved ? 'Draft Saved ✓' : 'Save Draft'}</span>
            </button>
          </div>
        </div>


        {/* Stepper Visual Tracker */}
        <div className="bg-surface-container-lowest border border-brand-surface rounded-2xl shadow-subtle p-4 sm:p-5">
          <div className="grid grid-cols-5 gap-2 relative">
            {[
              { num: 1, label: 'Platform & Links', done: true },
              { num: 2, label: 'Media Upload', done: true, active: true },
              { num: 3, label: 'Caption & Tags', done: false },
              { num: 4, label: 'Compliance', done: false },
              { num: 5, label: 'Review & Submit', done: false },
            ].map((st) => (
              <div
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className="flex items-center md:flex-col md:items-center text-left md:text-center gap-2 cursor-pointer group"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    st.active
                      ? 'bg-brand-blue text-white ring-4 ring-brand-surface'
                      : st.done
                      ? 'bg-success text-white'
                      : 'bg-brand-surface text-secondary'
                  }`}
                >
                  {st.done && !st.active ? '✓' : st.num}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-secondary">Step {st.num}</span>
                  <span className="text-xs font-semibold text-brand-navy">{st.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Content Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Modules (7 Columns) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-6">
            {error && (
              <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Campaign Selection Selector */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-brand-surface shadow-subtle flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary">
                Select Campaign Brief
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => handleCampaignChange(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-brand-navy p-3 rounded-xl border border-brand-surface bg-brand-bg/50 focus:border-brand-blue focus:outline-none"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brandName} — {c.title} ({c.rewardAmount})
                  </option>
                ))}
              </select>
            </div>

            {/* Platform & Published Link */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-brand-surface shadow-subtle flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-brand-navy">
                  1. Platform &amp; Live Post URL
                </h3>
                {isUrlValid && (
                  <span className="inline-flex items-center gap-1 bg-success-container text-success px-2 py-0.5 rounded text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px]">check</span> Valid format
                  </span>
                )}
              </div>

              {/* Platform Pills */}
              <div className="grid grid-cols-3 gap-3">
                {(['TikTok', 'Instagram', 'YouTube'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setPlatform(plat)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      platform === plat
                        ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                        : 'bg-white text-secondary border-brand-surface hover:bg-brand-surface/50'
                    }`}
                  >
                    <span>{plat === 'TikTok' ? '🎵' : plat === 'Instagram' ? '📸' : '▶️'}</span>
                    <span>{plat}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Published Video URL
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    link
                  </span>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                    placeholder="https://www.tiktok.com/@yourname/video/..."
                    className="w-full text-xs sm:text-sm font-medium text-brand-navy pl-10 pr-4 py-2.5 rounded-xl border border-brand-surface bg-brand-bg/50 focus:border-brand-blue focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-brand-surface shadow-subtle flex flex-col gap-4">
              <h3 className="text-sm font-bold text-brand-navy">
                2. Deliverable Details &amp; Metadata
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Deliverable Title
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  required
                  placeholder="e.g. Sprint UGC Reel — Speed & Flex Fit"
                  className="w-full text-xs sm:text-sm font-medium text-brand-navy p-2.5 rounded-xl border border-brand-surface bg-brand-bg/50 focus:border-brand-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Post Caption
                </label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Paste the caption used in the published post..."
                  className="w-full text-xs font-medium text-brand-navy p-2.5 rounded-xl border border-brand-surface bg-brand-bg/50 focus:border-brand-blue focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Campaign Hashtags Used
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="#VeloxSpeed, #BrandWaves, #UGC"
                  className="w-full text-xs sm:text-sm font-medium text-brand-navy p-2.5 rounded-xl border border-brand-surface bg-brand-bg/50 focus:border-brand-blue focus:outline-none"
                />
              </div>
            </div>

            {/* Compliance Agreement */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-brand-surface shadow-subtle flex items-start gap-3">
              <input
                type="checkbox"
                id="compliance"
                checked={complianceAgreed}
                onChange={(e) => setComplianceAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-brand-blue rounded border-brand-surface focus:ring-brand-blue cursor-pointer"
              />
              <label htmlFor="compliance" className="text-xs text-secondary leading-relaxed cursor-pointer select-none">
                I certify that this deliverable is my original work, meets all brand brief criteria, and contains no copyrighted audio or unauthorized logos.
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer btn-tactile btn-glow disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting to Review Queue...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  <span>Submit Deliverable for Review</span>
                </>
              )}
            </button>
          </form>

          {/* Right Brief Reference Sticky Card (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
            <div className="bg-white rounded-2xl p-6 border border-[#DBE2EF] shadow-subtle card-interactive flex flex-col gap-4">
              <span className="text-[11px] uppercase font-bold text-gray-500">
                Campaign Brief Reference
              </span>
              <h3 className="text-base font-extrabold text-[#112D4E]">
                {selectedCampaign?.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedCampaign?.description}
              </p>

              <div className="pt-3 border-t border-[#DBE2EF] flex flex-col gap-2">
                <span className="text-xs font-bold text-[#112D4E]">Key Guidelines</span>
                <ul className="flex flex-col gap-2 text-xs text-gray-600">
                  {selectedCampaign?.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#3F72AF] font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-[#DBE2EF]/40 rounded-xl border border-[#DBE2EF] flex items-center justify-between text-xs font-bold text-[#112D4E]">
                <span>Guaranteed Payout</span>
                <span className="text-[#3F72AF] font-extrabold">{selectedCampaign?.rewardAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SkyFooter />
    </div>
  );
};

