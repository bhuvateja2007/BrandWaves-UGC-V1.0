import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand, MarketplaceCampaign } from '../../types/marketplace';
import { brandOwnerService } from '../../services/brandOwnerService';
import { brandProductService, ExtendedProduct } from '../../services/brandProductService';
import { brandCampaignService } from '../../services/brandCampaignService';
import { campaignApplicationService, CampaignApplication } from '../../services/campaignApplicationService';
import { api } from '../../api/client';
import { Submission } from '../../types';
import { BrandNavHeader } from '../../components/brand/BrandNavHeader';
import { ProfileCompletionCard, CompletionItem } from '../../components/common';
import { WaterReveal } from '../../components/common/WaterMotion';
import { 
  ShoppingBag, 
  Compass, 
  ClipboardCheck, 
  CheckCircle2, 
  PlusCircle, 
  Users, 
  ArrowRight, 
  Clock, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const BrandDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [campaigns, setCampaigns] = useState<MarketplaceCampaign[]>([]);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize active brand
  useEffect(() => {
    if (currentUser) {
      const brand = brandOwnerService.getActiveBrand(currentUser);
      setActiveBrand(brand);
    }
  }, [currentUser]);

  // Load real records for the active brand
  const loadBrandData = async (brand: Brand) => {
    try {
      setLoading(true);
      // Real products
      const prods = brandProductService.getProductsForBrand(brand.id);
      setProducts(prods);

      // Real campaigns
      const camps = brandCampaignService.getCampaignsForBrand(brand.id);
      setCampaigns(camps);

      // Real applications
      const apps = await campaignApplicationService.getApplicationsForBrand(brand.id);
      setApplications(apps);

      // Real submissions from API
      try {
        const subs = await api.getSubmissions();
        const brandSubs = subs.filter(
          (s) => s.brandName.toLowerCase() === brand.name.toLowerCase()
        );
        setSubmissions(brandSubs);
      } catch {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to load brand dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeBrand) {
      loadBrandData(activeBrand);
    }
  }, [activeBrand]);

  // Derived real metrics
  const activeProductsCount = products.filter((p) => !p.isArchived).length;
  const archivedProductsCount = products.filter((p) => p.isArchived).length;

  const openCampaignsCount = campaigns.filter((c) => c.status === 'open' || (c.status as string) === 'active').length;
  const inProgressCampaignsCount = campaigns.filter((c) => c.status === 'in_progress').length;
  const completedCampaignsCount = campaigns.filter((c) => c.status === 'completed').length;
  const closedCampaignsCount = campaigns.filter((c) => c.status === 'closed').length;

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const acceptedApps = applications.filter((a) => a.status === 'accepted');

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const approvedSubmissions = submissions.filter((s) => s.status === 'approved');

  // Genuine Brand Profile Completion tasks derived from real records
  const brandCompletionTasks: CompletionItem[] = activeBrand ? [
    {
      id: 'brand-name',
      label: 'Brand Entity Name',
      description: 'Official corporate or studio title',
      isComplete: Boolean(activeBrand.name?.trim() && activeBrand.name.trim().length >= 2),
      actionUrl: '/brand/profile',
      actionLabel: 'Edit',
    },
    {
      id: 'brand-logo',
      label: 'Brand Logo Mark',
      description: 'High-res square avatar for briefs and cards',
      isComplete: Boolean(activeBrand.logo?.trim()),
      actionUrl: '/brand/profile',
      actionLabel: 'Set Logo',
    },
    {
      id: 'brand-cover',
      label: 'Storefront Cover',
      description: 'Wide brand showcase banner',
      isComplete: Boolean(activeBrand.coverImage?.trim()),
      actionUrl: '/brand/profile',
      actionLabel: 'Set Cover',
    },
    {
      id: 'brand-tagline',
      label: 'Brand Tagline',
      description: 'Catchy marketing subtitle',
      isComplete: Boolean(activeBrand.tagline?.trim() && activeBrand.tagline.trim().length >= 8),
      actionUrl: '/brand/profile',
      actionLabel: 'Write',
    },
    {
      id: 'brand-desc',
      label: 'Company Overview',
      description: 'Minimum 20 characters describing your mission',
      isComplete: Boolean(activeBrand.description?.trim() && activeBrand.description.trim().length >= 20),
      actionUrl: '/brand/profile',
      actionLabel: 'Write',
    },
    {
      id: 'brand-website',
      label: 'Official Website',
      description: 'Direct link to your verified storefront',
      isComplete: Boolean(activeBrand.website?.trim()),
      actionUrl: '/brand/profile',
      actionLabel: 'Link',
    },
    {
      id: 'brand-values',
      label: 'Brand Values & Ethos',
      description: 'Tags for AI creator matchmaker synergy',
      isComplete: Boolean(activeBrand.values && activeBrand.values.length > 0),
      actionUrl: '/brand/profile',
      actionLabel: 'Add Values',
    },
    {
      id: 'brand-products',
      label: 'Product Catalog',
      description: 'At least 1 active product for creator briefs',
      isComplete: activeProductsCount > 0,
      actionUrl: '/brand/products/new',
      actionLabel: 'Add Product',
    },
  ] : [];

  if (!activeBrand && !loading) {
    return (
      <div className="flex flex-col min-h-[60vh] items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-3xl bg-[#DBE2EF] text-[#112D4E] flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#112D4E]">No Authorized Brand Found</h2>
        <p className="text-sm text-gray-500 max-w-md mt-1 mb-6">
          Your account does not currently have an authorized brand associated. Please contact platform administration or complete brand registration.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold shadow-md hover:bg-[#112D4E]/90 transition-all"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <WaterReveal triggerKey={activeBrand?.id} className="w-full">
      <div className="flex flex-col gap-8 pb-12 animate-fadeIn">
        {/* Brand Header & Navigation */}
        <BrandNavHeader
          activeBrand={activeBrand}
          onBrandChange={(brand) => setActiveBrand(brand)}
          title={`${activeBrand?.name || 'Brand'} Dashboard`}
          subtitle="Real-time operational dashboard for products, briefs, applications, and deliverable reviews."
        />

      {/* Quick Action Hub */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/brand/products/new"
          className="p-4 rounded-2xl bg-white hover:bg-[#DBE2EF]/30 border border-[#DBE2EF] shadow-subtle flex items-center gap-3 transition-all card-interactive group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#3F72AF]/10 text-[#3F72AF] group-hover:bg-[#3F72AF] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#112D4E] truncate">Add Product</span>
            <span className="text-[10px] text-gray-500 truncate">Expand catalog</span>
          </div>
        </Link>

        <Link
          to="/brand/campaigns/new"
          className="p-4 rounded-2xl bg-white hover:bg-[#DBE2EF]/30 border border-[#DBE2EF] shadow-subtle flex items-center gap-3 transition-all card-interactive group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#112D4E]/10 text-[#112D4E] group-hover:bg-[#112D4E] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#112D4E] truncate">New Campaign</span>
            <span className="text-[10px] text-gray-500 truncate">Launch creator brief</span>
          </div>
        </Link>

        <Link
          to="/brand/applications"
          className="p-4 rounded-2xl bg-white hover:bg-[#DBE2EF]/30 border border-[#DBE2EF] shadow-subtle flex items-center gap-3 transition-all card-interactive group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#112D4E] truncate">Review Applications</span>
            <span className="text-[10px] text-gray-500 truncate">
              {pendingApps.length} pending
            </span>
          </div>
        </Link>

        <Link
          to="/brand/creators"
          className="p-4 rounded-2xl bg-white hover:bg-[#DBE2EF]/30 border border-[#DBE2EF] shadow-subtle flex items-center gap-3 transition-all card-interactive group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#112D4E] truncate">Discover Creators</span>
            <span className="text-[10px] text-gray-500 truncate">Browse roster</span>
          </div>
        </Link>
      </section>

      {/* Brand Profile Completion & Strength Progress */}
      {activeBrand && (
        <ProfileCompletionCard
          type="brand"
          items={brandCompletionTasks}
        />
      )}

      {/* Authoritative Metric KPI Grid (Based 100% on Actual Records) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products KPI */}
        <div className="bg-white rounded-2xl p-6 border border-[#DBE2EF] shadow-subtle flex flex-col justify-between gap-4 card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Active Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#DBE2EF]/60 text-[#3F72AF] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-[#112D4E]">
              {loading ? '...' : activeProductsCount}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {archivedProductsCount > 0 ? `${archivedProductsCount} archived` : 'In public showcase'}
            </p>
          </div>
          <Link
            to="/brand/products"
            className="text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] flex items-center gap-1 transition-colors"
          >
            <span>Manage Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Campaigns KPI */}
        <div className="bg-white rounded-2xl p-6 border border-[#DBE2EF] shadow-subtle flex flex-col justify-between gap-4 card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Campaign Briefs
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#DBE2EF]/60 text-[#112D4E] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-[#112D4E]">
              {loading ? '...' : campaigns.length}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
              <span className="text-emerald-600 font-bold">{openCampaignsCount} Open</span>
              <span>•</span>
              <span>{completedCampaignsCount} Completed</span>
            </div>
          </div>
          <Link
            to="/brand/campaigns"
            className="text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] flex items-center gap-1 transition-colors"
          >
            <span>View All Briefs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Applications KPI */}
        <div className="bg-white rounded-2xl p-6 border border-[#DBE2EF] shadow-subtle flex flex-col justify-between gap-4 card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Creator Applications
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#112D4E]">
                {loading ? '...' : applications.length}
              </span>
              {pendingApps.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {pendingApps.length} To Review
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedApps.length} creators accepted
            </p>
          </div>
          <Link
            to="/brand/applications"
            className="text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] flex items-center gap-1 transition-colors"
          >
            <span>Review Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Submissions KPI */}
        <div className="bg-white rounded-2xl p-6 border border-[#DBE2EF] shadow-subtle flex flex-col justify-between gap-4 card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
              Deliverable Reviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#112D4E]">
                {loading ? '...' : submissions.length}
              </span>
              {pendingSubmissions.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {pendingSubmissions.length} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {approvedSubmissions.length} approved deliverables
            </p>
          </div>
          <Link
            to="/brand/submissions"
            className="text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] flex items-center gap-1 transition-colors"
          >
            <span>Open Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Onboarding Guidance & Empty States (if brand has 0 products or campaigns) */}
      {(products.length === 0 || campaigns.length === 0) && (
        <section className="bg-gradient-to-br from-white to-[#F9F7F7] rounded-3xl p-6 sm:p-8 border border-[#DBE2EF] shadow-subtle">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#3F72AF] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#112D4E]">Brand Launchpad Checklist</h2>
              <p className="text-xs text-gray-500">Step-by-step guidance to activate your UGC collaboration program.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className={`p-5 rounded-2xl border transition-all ${activeBrand?.description ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-[#DBE2EF]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase text-gray-400">Step 1</span>
                {activeBrand?.description ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <h3 className="text-sm font-bold text-[#112D4E] mb-1">Brand Identity</h3>
              <p className="text-xs text-gray-500 mb-3">Complete your official logo, values, and storefront link.</p>
              <Link to="/brand/profile" className="text-xs font-bold text-[#3F72AF] hover:underline">
                Edit Brand Profile →
              </Link>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${products.length > 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-[#DBE2EF]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase text-gray-400">Step 2</span>
                {products.length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <h3 className="text-sm font-bold text-[#112D4E] mb-1">Add Flagship Products</h3>
              <p className="text-xs text-gray-500 mb-3">Upload your standout products for creators to feature.</p>
              <Link to="/brand/products/new" className="text-xs font-bold text-[#3F72AF] hover:underline">
                Add First Product →
              </Link>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${campaigns.length > 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-[#DBE2EF]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase text-gray-400">Step 3</span>
                {campaigns.length > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <h3 className="text-sm font-bold text-[#112D4E] mb-1">Launch Campaign Brief</h3>
              <p className="text-xs text-gray-500 mb-3">Publish structured deliverables and reward details.</p>
              <Link to="/brand/campaigns/new" className="text-xs font-bold text-[#3F72AF] hover:underline">
                Create Campaign →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Two Column Layout: Urgent Applications & Active Briefs */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Creator Applications */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DBE2EF] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#112D4E]">Pending Creator Pitches</h2>
                <p className="text-xs text-gray-500">Creators awaiting review on your campaign briefs.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                {pendingApps.length} pending
              </span>
            </div>

            {pendingApps.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#F9F7F7] border border-dashed border-[#DBE2EF] text-center my-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#112D4E]">All caught up!</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  No applications are currently awaiting decision for {activeBrand?.name}.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 my-2">
                {pendingApps.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={app.creatorAvatar}
                        alt={app.creatorName}
                        className="w-10 h-10 rounded-full object-cover border border-[#DBE2EF] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[#112D4E]">{app.creatorName}</span>
                          <span className="text-[11px] text-gray-500">{app.creatorHandle}</span>
                        </div>
                        <span className="text-[10px] text-[#3F72AF] font-bold block truncate">
                          Applied to: {app.campaignTitle}
                        </span>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          "{app.pitch}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/brand/applications"
            className="w-full mt-4 py-2.5 px-4 bg-[#F9F7F7] hover:bg-[#DBE2EF]/60 text-[#112D4E] font-bold text-xs rounded-xl border border-[#DBE2EF] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Go to Application Review Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Active Campaign Deliverables & Spots Progress */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DBE2EF] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#112D4E]">Active Campaign Roster</h2>
                <p className="text-xs text-gray-500">Brief fulfillment progress and creator spots.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DBE2EF] text-[#112D4E]">
                {campaigns.length} briefs
              </span>
            </div>

            {campaigns.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#F9F7F7] border border-dashed border-[#DBE2EF] text-center my-4">
                <Compass className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-[#112D4E]">No campaigns launched yet</p>
                <p className="text-[11px] text-gray-500 mt-0.5 mb-3">
                  Create your first campaign brief to start collaborating with creators.
                </p>
                <Link
                  to="/brand/campaigns/new"
                  className="px-4 py-2 rounded-xl bg-[#112D4E] text-white text-xs font-bold shadow-xs hover:bg-[#112D4E]/90 inline-block"
                >
                  Create Brief
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 my-2">
                {campaigns.slice(0, 3).map((camp) => (
                  <div
                    key={camp.id}
                    className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-[#112D4E] truncate">{camp.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        {camp.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>Spots Filled: {camp.spotsFilled} / {camp.spotsTotal}</span>
                      <span className="font-semibold text-[#112D4E]">{camp.rewardAmount}</span>
                    </div>

                    <div className="w-full bg-[#DBE2EF] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#3F72AF] h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (camp.spotsFilled / (camp.spotsTotal || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/brand/campaigns"
            className="w-full mt-4 py-2.5 px-4 bg-[#F9F7F7] hover:bg-[#DBE2EF]/60 text-[#112D4E] font-bold text-xs rounded-xl border border-[#DBE2EF] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Manage All Campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
      </div>
    </WaterReveal>
  );
};
