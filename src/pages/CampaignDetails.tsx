import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  Target, 
  FileText, 
  Sparkles, 
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  getMarketplaceCampaignById, 
  getBrandById, 
  getProductById, 
  getCreatorById 
} from '../data/marketplaceData';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { campaignApplicationService, CampaignApplication } from '../services/campaignApplicationService';
import { DemoNotice } from '../components/marketplace/DemoNotice';
import { ProductCard } from '../components/marketplace/ProductCard';
import { X, Send, Loader2, AlertTriangle } from 'lucide-react';

export const CampaignDetails: React.FC = () => {
  const params = useParams<{ id?: string; campaignId?: string }>();
  const campaignId = params.campaignId || params.id;
  const { currentUser } = useAuth();

  // 1. Check local canonical marketplace data first
  const marketplaceCampaign = campaignId ? getMarketplaceCampaignById(campaignId) : undefined;

  // 2. State for server fallback if needed
  const [serverCampaign, setServerCampaign] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(!marketplaceCampaign);

  // Application workflow state
  const [existingApplication, setExistingApplication] = useState<CampaignApplication | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState<boolean>(false);
  const [pitch, setPitch] = useState<string>('');
  const [proposedDeliverable, setProposedDeliverable] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [applying, setApplying] = useState<boolean>(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{ pitch?: string; deliverable?: string; url?: string }>({});

  useEffect(() => {
    if (currentUser?.id && campaignId) {
      const syncApplication = () => {
        campaignApplicationService.getApplicationsForCreator(currentUser.id).then((apps) => {
          const found = apps.find((a) => a.campaignId === campaignId && a.status !== 'withdrawn');
          setExistingApplication(found || null);
        });
      };
      syncApplication();
      window.addEventListener('campaign_applications_updated', syncApplication);
      return () => window.removeEventListener('campaign_applications_updated', syncApplication);
    }
  }, [currentUser?.id, campaignId]);

  useEffect(() => {
    if (marketplaceCampaign || !campaignId) return;

    setLoading(true);
    api.getCampaign(campaignId)
      .then((camp) => {
        setServerCampaign(camp);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load campaign from API fallback:', err);
        setLoading(false);
      });
  }, [campaignId, marketplaceCampaign]);

  if (loading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 pt-24 pb-12 text-center text-sm text-gray-500">
        Loading campaign details...
      </div>
    );
  }

  // Active campaign object
  const campaign = marketplaceCampaign || (serverCampaign ? {
    id: serverCampaign.id,
    title: serverCampaign.title,
    brandId: serverCampaign.brandId || '',
    brandName: serverCampaign.brandName,
    brandLogo: serverCampaign.brandLogo,
    productId: serverCampaign.productId,
    productName: serverCampaign.productName,
    category: serverCampaign.category,
    platform: serverCampaign.platform,
    format: serverCampaign.format,
    description: serverCampaign.description,
    brief: serverCampaign.description,
    objective: 'Promote authentic creator discovery and audience awareness.',
    targetNiches: [serverCampaign.category],
    requiredFormats: [serverCampaign.format],
    deliverables: serverCampaign.requirements || ['1x Dedicated UGC Review'],
    eligibility: serverCampaign.eligibleTiers?.map((t: string) => `Tier eligibility: ${t}`) || ['Verified Creator Account'],
    deadline: serverCampaign.deadline,
    rewardType: serverCampaign.rewardType || 'fixed',
    rewardAmount: serverCampaign.rewardAmount,
    status: serverCampaign.status || 'open',
    spotsTotal: serverCampaign.spotsTotal || 10,
    spotsFilled: serverCampaign.spotsFilled || 2,
    relatedCreatorIds: [],
  } : null);

  if (!campaign) {
    return (
      <div className="bg-white rounded-2xl border border-[#DBE2EF] p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <h2 className="text-xl font-black text-[#112D4E]">Campaign Not Found</h2>
        <p className="text-sm text-gray-500">
          The campaign brief you are looking for does not exist or may have expired.
        </p>
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#112D4E] text-white hover:bg-[#112D4E]/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all campaigns</span>
        </Link>
      </div>
    );
  }

  const brand = campaign.brandId ? getBrandById(campaign.brandId) : undefined;
  const product = campaign.productId ? getProductById(campaign.productId) : undefined;

  const relatedCreators = (campaign.relatedCreatorIds || [])
    .map((id: string) => getCreatorById(id))
    .filter((c: any): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="space-y-12 animate-fadeIn pb-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#112D4E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all campaigns</span>
        </Link>

        <DemoNotice type="general" />
      </div>

      {/* Hero Brief Header */}
      <div className="bg-white rounded-3xl border border-[#DBE2EF] p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row gap-8 items-start justify-between">
        <div className="space-y-4 max-w-2xl">
          {/* Brand Tag & Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            {brand ? (
              <Link to={`/brands/${brand.id}`} className="flex items-center gap-2 group">
                {campaign.brandLogo && (
                  <img
                    src={campaign.brandLogo}
                    alt={campaign.brandName}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#DBE2EF]"
                  />
                )}
                <span className="text-xs font-bold text-[#3F72AF] group-hover:underline">
                  {campaign.brandName}
                </span>
              </Link>
            ) : (
              <span className="text-xs font-bold text-gray-500">{campaign.brandName}</span>
            )}

            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#DBE2EF] text-[#112D4E]">
              {campaign.platform} • {campaign.format}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{campaign.status}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#112D4E] tracking-tight leading-tight">
            {campaign.title}
          </h1>

          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Compensation & Spots Card */}
        <div className="w-full lg:w-72 shrink-0 p-6 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Creator Compensation
            </span>
            <span className="text-2xl font-black text-[#112D4E] font-mono mt-0.5 block">
              {campaign.rewardAmount}
            </span>
          </div>

          <div className="pt-3 border-t border-[#DBE2EF] space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span>Spots Filled:</span>
              </span>
              <span className="font-bold text-[#112D4E]">
                {campaign.spotsFilled} / {campaign.spotsTotal}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Deadline:</span>
              </span>
              <span className="font-bold text-[#112D4E]">{campaign.deadline}</span>
            </div>

            <div className="flex items-center gap-1.5 pt-1 text-emerald-700 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Brand Escrow Guaranteed</span>
            </div>
          </div>

          {/* Application & Submission Action Bar */}
          {!currentUser ? (
            <Link
              to={`/login/creator?returnUrl=${encodeURIComponent(window.location.pathname)}`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-all shadow-sm active:scale-[0.98]"
            >
              <Briefcase className="w-4 h-4 text-[#DBE2EF]" />
              <span>Sign in as Creator to Apply</span>
            </Link>
          ) : currentUser.role !== 'creator' && currentUser.role !== 'admin' ? (
            <div className="p-3 rounded-xl bg-gray-100 text-gray-500 text-xs text-center font-medium">
              Creator application brief. Signed in as {currentUser.role}.
            </div>
          ) : existingApplication ? (
            <div className="space-y-2">
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                  existingApplication.status === 'accepted'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : existingApplication.status === 'pending'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="capitalize">Application {existingApplication.status}</span>
                </div>
                <Link to="/creator/applications" className="underline text-[11px]">
                  View
                </Link>
              </div>

              {existingApplication.status === 'accepted' ? (
                <Link
                  to={`/submit?campaignId=${campaign.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#112D4E] text-white text-xs font-bold hover:bg-[#3F72AF] transition-all shadow-sm active:scale-[0.98]"
                >
                  <Briefcase className="w-4 h-4 text-[#DBE2EF]" />
                  <span>Submit Campaign Work</span>
                </Link>
              ) : (
                <Link
                  to="/creator/applications"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#DBE2EF] text-[#112D4E] text-xs font-bold hover:bg-[#DBE2EF]/80 transition-all"
                >
                  <span>Track Application Status</span>
                </Link>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setProposedDeliverable(campaign.format || '1x 9:16 Vertical Video');
                setApplyError(null);
                setApplySuccess(false);
                setApplyModalOpen(true);
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:bg-[#112D4E] transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Apply to Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Campaign Detailed Brief Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Brief Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Creative Objective */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DBE2EF] space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#3F72AF]" />
              <h2 className="text-lg font-black text-[#112D4E]">Campaign Objective</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {campaign.objective}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed pt-2 border-t border-[#DBE2EF]/60">
              {campaign.brief}
            </p>
          </div>

          {/* Required Deliverables Checklist */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DBE2EF] space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#3F72AF]" />
              <h2 className="text-lg font-black text-[#112D4E]">Required Deliverables</h2>
            </div>

            <ul className="space-y-2.5">
              {campaign.deliverables.map((del: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <span>{del}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DBE2EF] space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#3F72AF]" />
              <h2 className="text-lg font-black text-[#112D4E]">Creator Eligibility</h2>
            </div>

            <ul className="space-y-2.5">
              {campaign.eligibility.map((el: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-[#DBE2EF] text-[#112D4E] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span>{el}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Linked Product & Brand */}
        <div className="lg:col-span-4 space-y-6">
          {/* Linked Product Card */}
          {product && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Featured Product in Brief
              </span>
              <ProductCard product={product} />
            </div>
          )}

          {/* Participating / Suggested Creators */}
          {relatedCreators.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-[#DBE2EF] space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-[#112D4E]">
                Featured Participating Creators
              </h3>
              <div className="space-y-2.5">
                {relatedCreators.map((cr: any) => (
                  <Link
                    key={cr.id}
                    to={`/creators/${cr.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F9F7F7] transition-all group"
                  >
                    <img
                      src={cr.avatar}
                      alt={cr.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-[#DBE2EF]"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#112D4E] group-hover:text-[#3F72AF] block truncate">
                        {cr.name}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono block">
                        {cr.handle}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Pitch Modal */}
      {applyModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-apply-title"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-xl border border-[#DBE2EF] my-8 relative">
            <div className="flex items-center justify-between border-b border-[#DBE2EF]/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F72AF] block">
                  Campaign Application Brief
                </span>
                <h2 id="modal-apply-title" className="text-lg font-black text-[#112D4E]">
                  Apply to {campaign.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!applying) {
                    setApplyModalOpen(false);
                    setValidationErrors({});
                  }
                }}
                disabled={applying}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-40"
                aria-label="Close application dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* State 3: Successfully Submitted (Derived from actual server response) */}
            {applySuccess && existingApplication ? (
              <div className="p-6 text-center space-y-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 animate-celebrate-pop">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                  <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" className="animate-checkmark" />
                  </svg>
                </div>
                
                <div>
                  <h3 className="text-lg font-black text-emerald-900">Application Transmitted!</h3>
                  <p className="text-xs text-emerald-800 mt-1 max-w-sm mx-auto leading-relaxed">
                    Your creative pitch has been locked into the escrow review queue for <strong>{campaign.brandName}</strong>.
                  </p>
                </div>

                {/* Real Server Response Metadata */}
                <div className="p-3 bg-white/90 rounded-xl border border-emerald-200/80 text-[11px] text-left text-gray-700 space-y-1 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-bold">Application Ref:</span>
                    <span className="font-bold text-[#112D4E]">{existingApplication.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-bold">Queue Status:</span>
                    <span className="font-bold text-amber-700 capitalize">{existingApplication.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-bold">Deliverable:</span>
                    <span className="truncate max-w-[200px] text-[#112D4E] font-medium">{existingApplication.proposedDeliverable}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#DBE2EF] text-xs font-bold text-gray-600 hover:text-[#112D4E] bg-white transition-all btn-tactile"
                  >
                    Close
                  </button>
                  <Link
                    to="/creator/applications"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all btn-tactile shadow-xs"
                  >
                    <span>Track In Application Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* States 1, 2, 5, 6: Form with Ready, Submitting, Validation Failure, and Error states */
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!currentUser || applying) return;

                  // Clear previous errors
                  setApplyError(null);
                  const errors: { pitch?: string; deliverable?: string; url?: string } = {};

                  // Strict validation according to business rules
                  if (!pitch.trim() || pitch.trim().length < 20) {
                    errors.pitch = 'Pitch must be at least 20 characters describing your concept and style.';
                  }

                  if (!proposedDeliverable.trim()) {
                    errors.deliverable = 'Proposed deliverable is required.';
                  }

                  if (portfolioUrl.trim() && !portfolioUrl.startsWith('http://') && !portfolioUrl.startsWith('https://')) {
                    errors.url = 'Portfolio URL must start with http:// or https://';
                  }

                  if (Object.keys(errors).length > 0) {
                    setValidationErrors(errors);
                    return;
                  }

                  setValidationErrors({});
                  setApplying(true);

                  try {
                    const newApp = await campaignApplicationService.applyToCampaign(currentUser, {
                      campaignId: campaign.id,
                      pitch: pitch.trim(),
                      proposedDeliverable: proposedDeliverable.trim(),
                      portfolioSampleUrl: portfolioUrl.trim() || undefined,
                    });

                    // Update existing application directly with actual server response
                    setExistingApplication(newApp);
                    setApplySuccess(true);
                  } catch (err: any) {
                    setApplyError(err.message || 'Network or server communication failure. Please retry.');
                  } finally {
                    setApplying(false);
                  }
                }}
                className="space-y-4"
                noValidate
              >
                {/* State 6: Network or Server Error Alert */}
                {applyError && (
                  <div 
                    role="alert"
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 shadow-2xs"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <strong className="block font-bold">Submission Error</strong>
                      <span className="text-[11px] leading-relaxed">{applyError}</span>
                    </div>
                  </div>
                )}

                {/* Contextual brief summary banner */}
                <div className="p-3 bg-[#F9F7F7] rounded-xl border border-[#DBE2EF] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold">Brand:</span>
                    <span className="font-bold text-[#112D4E]">{campaign.brandName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold">Guaranteed Compensation:</span>
                    <span className="font-mono font-bold text-[#3F72AF]">{campaign.rewardAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold">Applying As:</span>
                    <span className="font-semibold text-gray-700">{currentUser?.name} ({currentUser?.handle})</span>
                  </div>
                </div>

                {/* Field 1: Creative Concept Pitch */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="pitch-input" className="text-xs font-bold text-[#112D4E]">
                      Creative Concept Pitch <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] ${
                      pitch.length < 20 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-bold'
                    }`}>
                      {pitch.length} / 20 min characters
                    </span>
                  </div>
                  <textarea
                    id="pitch-input"
                    rows={3}
                    value={pitch}
                    onChange={(e) => {
                      setPitch(e.target.value);
                      if (validationErrors.pitch) {
                        setValidationErrors((prev) => ({ ...prev, pitch: undefined }));
                      }
                    }}
                    disabled={applying}
                    placeholder="Describe how your video style, visual pacing, and audience fit this brand brief..."
                    className={`w-full text-xs p-3 rounded-xl border transition-all resize-none focus:outline-none focus:bg-white ${
                      validationErrors.pitch
                        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 text-rose-900'
                        : 'border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:border-[#3F72AF]'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    required
                  />
                  {validationErrors.pitch && (
                    <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">
                      {validationErrors.pitch}
                    </span>
                  )}
                </div>

                {/* Field 2: Proposed Deliverable */}
                <div>
                  <label htmlFor="deliverable-input" className="text-xs font-bold text-[#112D4E] block mb-1">
                    Proposed Deliverable <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="deliverable-input"
                    type="text"
                    value={proposedDeliverable}
                    onChange={(e) => {
                      setProposedDeliverable(e.target.value);
                      if (validationErrors.deliverable) {
                        setValidationErrors((prev) => ({ ...prev, deliverable: undefined }));
                      }
                    }}
                    disabled={applying}
                    placeholder="e.g. 1x 9:16 High-Energy Product Reel"
                    className={`w-full text-xs p-3 rounded-xl border transition-all focus:outline-none focus:bg-white ${
                      validationErrors.deliverable
                        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 text-rose-900'
                        : 'border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:border-[#3F72AF]'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    required
                  />
                  {validationErrors.deliverable && (
                    <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">
                      {validationErrors.deliverable}
                    </span>
                  )}
                </div>

                {/* Field 3: Portfolio Sample URL */}
                <div>
                  <label htmlFor="portfolio-input" className="text-xs font-bold text-[#112D4E] block mb-1">
                    Relevant Portfolio Sample URL (Optional)
                  </label>
                  <input
                    id="portfolio-input"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => {
                      setPortfolioUrl(e.target.value);
                      if (validationErrors.url) {
                        setValidationErrors((prev) => ({ ...prev, url: undefined }));
                      }
                    }}
                    disabled={applying}
                    placeholder="https://instagram.com/reel/... or https://youtube.com/..."
                    className={`w-full text-xs p-3 rounded-xl border transition-all focus:outline-none focus:bg-white ${
                      validationErrors.url
                        ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 text-rose-900'
                        : 'border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:border-[#3F72AF]'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                  {validationErrors.url && (
                    <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">
                      {validationErrors.url}
                    </span>
                  )}
                </div>

                {/* Action Buttons: Cancel and Submit / Spinner */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DBE2EF]/60">
                  <button
                    type="button"
                    onClick={() => {
                      setApplyModalOpen(false);
                      setValidationErrors({});
                    }}
                    disabled={applying}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-50 btn-tactile"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2 btn-tactile focus-ring-bw"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Transmitting to Brand Queue...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Pitch to Brand</span>
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
