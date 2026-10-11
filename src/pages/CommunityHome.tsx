import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  Building2, 
  Target, 
  CheckCircle2,
  TrendingUp,
  Layers,
  ChevronRight,
  Star,
  Check
} from 'lucide-react';
import { 
  getFeaturedBrands, 
  getFeaturedCreators, 
  getFeaturedProducts, 
  getFeaturedCampaigns 
} from '../data/marketplaceData';
import { CreatorCard } from '../components/marketplace/CreatorCard';
import { ProductCard } from '../components/marketplace/ProductCard';
import { BrandCard } from '../components/marketplace/BrandCard';
import { MarketplaceCampaignCard } from '../components/marketplace/MarketplaceCampaignCard';
import { LoyaltyClubSection } from '../components/marketplace/LoyaltyClubSection';
import { DemoNotice } from '../components/marketplace/DemoNotice';

export const CommunityHome: React.FC = () => {
  const featuredBrands = getFeaturedBrands().slice(0, 4);
  const featuredCreators = getFeaturedCreators().slice(0, 6);
  const featuredProducts = getFeaturedProducts().slice(0, 6);
  const featuredCampaigns = getFeaturedCampaigns().slice(0, 4);

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      {/* =========================================================================
          1. HERO SECTION — PREMIUM EDITORIAL MARKETPLACE OPENING
          ========================================================================= */}
      <section className="relative overflow-hidden pt-4 pb-8" aria-label="BrandWaves Platform Overview">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Hero Typography & CTAs (Left Column) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="editorial-enter-title inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#EAF2F7] text-[#163B53] border border-[#DCE5EB] font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#397AA8]" />
              <span>Curated Creator &amp; Brand Marketplace</span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="editorial-enter-title text-4xl sm:text-5xl lg:text-6xl font-black text-[#163B53] tracking-tight leading-[1.08]">
                Where independent brands meet verified creators.
              </h1>
              <p className="editorial-enter-desc text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
                Connect with tested creators, explore authentic product reviews, and orchestrate performance-driven UGC campaigns with guaranteed milestone escrow.
              </p>
            </div>

            {/* Restrained Primary & Secondary CTAs */}
            <div className="editorial-enter-actions flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/campaigns"
                className="inline-flex items-center justify-center gap-2 font-bold text-sm bg-[#163B53] text-white px-6 py-3.5 rounded-xl shadow-sm hover:bg-[#26323A] hover:gap-3 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#397AA8]"
              >
                <span>Discover Active Briefs</span>
                <ArrowRight className="w-4 h-4 text-[#EAF2F7]" />
              </Link>
              <Link
                to="/creators"
                className="inline-flex items-center justify-center font-bold text-sm bg-white text-[#163B53] border border-[#DCE5EB] px-6 py-3.5 rounded-xl shadow-xs hover:bg-[#F8FAFC] hover:border-[#397AA8] transition-all focus:outline-none focus:ring-2 focus:ring-[#397AA8]"
              >
                Browse Creators
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center font-bold text-sm text-[#397AA8] hover:text-[#163B53] px-3 py-3.5 transition-colors"
              >
                Explore Products →
              </Link>
            </div>

            {/* Real Verified Platform Discovery Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-[#64748B] border-t border-[#DCE5EB]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><strong className="text-[#163B53]">18</strong> Curated Creators</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#397AA8]" />
                <span><strong className="text-[#163B53]">10</strong> Independent Brands</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#163B53]" />
                <span><strong className="text-[#163B53]">24</strong> Tested Products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-600" />
                <span><strong className="text-[#163B53]">10</strong> Active Briefs</span>
              </div>
            </div>
          </div>

          {/* Hero Editorial Balanced Showcase (Right Column) */}
          <div className="lg:col-span-5 relative editorial-enter-visuals">
            <div className="space-y-4">
              {/* Primary Showcase Tile: Featured Campaign Brief */}
              <div className="editorial-card p-5 bg-white relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=120&auto=format&fit=crop&q=80" 
                      alt="Dew Theory Brand"
                      className="w-8 h-8 rounded-lg object-cover border border-[#DCE5EB]" 
                    />
                    <div>
                      <span className="text-xs font-bold text-[#163B53] block">Dew Theory</span>
                      <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Skincare &amp; Barrier Care</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Open Brief
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#163B53] mb-1">
                  Barrier-First Daily Routine • Video Reviews
                </h4>
                <p className="text-xs text-[#64748B] line-clamp-2 mb-3">
                  Seeking beauty creators to produce honest 60s wearable wear-tests highlighting non-greasy SPF protection.
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#DCE5EB] text-xs">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Fixed Payout</span>
                    <span className="font-mono font-bold text-[#163B53]">$1,200</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Deliverables</span>
                    <span className="font-semibold text-[#163B53]">3 UGC Videos</span>
                  </div>
                </div>
              </div>

              {/* Secondary 2-Column Split: Creator Profile + Product Packshot */}
              <div className="grid grid-cols-2 gap-4">
                {/* Creator Tile */}
                <div className="editorial-card p-3.5 bg-white flex flex-col justify-between">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                      alt="Maya Chen Creator"
                      className="w-9 h-9 rounded-full object-cover border border-[#DCE5EB]"
                    />
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-[#163B53] block truncate">Maya Chen</span>
                      <span className="text-[10px] text-[#397AA8] font-mono block">@mayacreates</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#DCE5EB]">
                    <span className="flex items-center gap-1 font-semibold text-[#163B53]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      4.9 (42)
                    </span>
                    <span className="font-medium text-emerald-700">98% On-time</span>
                  </div>
                </div>

                {/* Product Packshot Tile with clean object-contain */}
                <div className="editorial-card p-3.5 bg-white flex flex-col justify-between">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-[#EAF2F7] flex items-center justify-center p-1 border border-[#DCE5EB] shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120&auto=format&fit=crop&q=80"
                        alt="Dew Theory Ceramide Shield"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-[#163B53] block truncate">Dew Theory</span>
                      <span className="text-[10px] text-[#64748B] truncate block">Ceramide Shield</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#DCE5EB]">
                    <span className="text-[10px] uppercase font-bold text-[#64748B]">Retail</span>
                    <span className="font-mono font-bold text-[#163B53]">$34.00</span>
                  </div>
                </div>
              </div>

              {/* Escrow Guarantee Trust Banner */}
              <div className="py-2.5 px-3.5 rounded-xl bg-[#EAF2F7] border border-[#DCE5EB] flex items-center justify-between text-xs text-[#163B53]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#397AA8]" />
                  <span className="font-semibold text-[11px]">Protected Milestone Escrow</span>
                </div>
                <span className="text-[10px] font-bold text-[#397AA8] uppercase tracking-wider">Automated Payouts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FEATURED BRANDS
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#397AA8]">
              Brand Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#163B53] tracking-tight">
              Featured Independent Brands
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Original labels setting new standards across beauty, audio, apparel, and lifestyle.
            </p>
          </div>
          <Link
            to="/brands"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] transition-colors"
          >
            <span>View all 10 brands</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. FEATURED CREATORS
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3F72AF]">
              Creator Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
              Featured Creators
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              18 verified voices crafting thoughtful reviews, styling routines, and authentic audience connections.
            </p>
          </div>
          <Link
            to="/creators"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] transition-colors"
          >
            <span>View all 18 creators</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. FEATURED PRODUCTS
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3F72AF]">
              Product Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
              Standout Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Curated everyday essentials tested and featured in active creator campaigns.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] transition-colors"
          >
            <span>View all 24 products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. FEATURED CAMPAIGNS
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3F72AF]">
              Open Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
              Active Brand Briefs
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Funded campaigns with locked compensation, guaranteed escrow, and clear deliverables.
            </p>
          </div>
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] transition-colors"
          >
            <span>View all 10 campaigns</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredCampaigns.map((campaign) => (
            <MarketplaceCampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>

      {/* Subtle Editorial Section Transition */}
      <div className="h-px w-full bg-[#DCE5EB] my-10" aria-hidden="true" />

      {/* =========================================================================
          6. LOYALTY & CREATOR MILESTONES (THE WAVE CLUB)
          ========================================================================= */}
      <LoyaltyClubSection />

      {/* Subtle Editorial Section Transition */}
      <div className="h-px w-full bg-[#DCE5EB] my-10" aria-hidden="true" />

      {/* =========================================================================
          7. HOW BRANDWAVES WORKS — EDITORIAL COLLABORATION ARCHITECTURE
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-[#DCE5EB] shadow-subtle space-y-10 relative overflow-hidden">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#397AA8]">
            Three Interconnected Journeys
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#163B53]">
            How BrandWaves Works
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            A unified ecosystem connecting conscious customers, authentic creators, and ambitious brand founders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="space-y-3 p-6 rounded-2xl bg-white/70 border border-[#DBE2EF] shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#112D4E] shadow-2xs">
              <ShoppingBag className="w-5 h-5 text-[#3F72AF]" />
            </div>
            <h3 className="text-base font-bold text-[#112D4E]">For Shoppers</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Explore authentic product wear-tests, barrier skincare tutorials, and honest gear evaluations before buying directly from brands.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:underline pt-2 block"
            >
              Start exploring products →
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="space-y-3 p-6 rounded-2xl bg-white/70 border border-[#DBE2EF] shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#112D4E] shadow-2xs">
              <Users className="w-5 h-5 text-[#3F72AF]" />
            </div>
            <h3 className="text-base font-bold text-[#112D4E]">For Creators</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Browse clear creative briefs, pitch your aesthetic, and receive guaranteed fixed payouts for authentic content your audience loves.
            </p>
            <Link
              to="/join/creator"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:underline pt-2 block"
            >
              Creator onboarding →
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="space-y-3 p-6 rounded-2xl bg-white/70 border border-[#DBE2EF] shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#112D4E] shadow-2xs">
              <Building2 className="w-5 h-5 text-[#3F72AF]" />
            </div>
            <h3 className="text-base font-bold text-[#112D4E]">For Brands</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Publish campaigns in minutes, collaborate with vetted creators, and receive broadcast-ready content with zero agency overhead.
            </p>
            <Link
              to="/join/brand"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:underline pt-2 block"
            >
              Brand onboarding →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. AUDIENCE CALLS TO ACTION & PORTAL ENTRANCES (3 CARDS)
          ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Path */}
        <div className="bg-[#112D4E] rounded-2xl p-6 sm:p-8 text-white space-y-5 flex flex-col justify-between shadow-md relative overflow-hidden group">
          <div 
            className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#DBE2EF] tracking-wider">
              Customer Path
            </span>
            <h3 className="text-xl font-black">Discover Products</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Explore 24 tested products from independent creators and brands across skincare, audio, and apparel.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#112D4E] bg-white hover:bg-[#F9F7F7] px-4 py-2.5 rounded-xl transition-all shadow-xs btn-tactile"
            >
              <span>Start exploring</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#3F72AF]" />
            </Link>
            <Link
              to="/join/customer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#DBE2EF] hover:text-white px-3 py-2 transition-colors"
            >
              <span>Sign In / Join</span>
            </Link>
          </div>
        </div>

        {/* Creator Path */}
        <div className="bg-[#3F72AF] rounded-2xl p-6 sm:p-8 text-white space-y-5 flex flex-col justify-between shadow-md relative overflow-hidden group">
          <div 
            className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#DBE2EF] tracking-wider">
              Creator Path
            </span>
            <h3 className="text-xl font-black">Creator Portal</h3>
            <p className="text-xs text-[#DBE2EF] leading-relaxed">
              Unlock funded campaigns, pitch brand briefs, showcase your portfolio, and track deliverable milestones.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              to="/creator"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#112D4E] bg-white hover:bg-[#F9F7F7] px-4 py-2.5 rounded-xl transition-all shadow-xs btn-tactile"
            >
              <span>Open Creator Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#3F72AF]" />
            </Link>
            <Link
              to="/join/creator"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#DBE2EF] hover:text-white px-3 py-2 transition-colors"
            >
              <span>Join as Creator</span>
            </Link>
          </div>
        </div>

        {/* Brand Path */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DBE2EF] text-[#112D4E] space-y-5 flex flex-col justify-between shadow-xs relative overflow-hidden group">
          <div 
            className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#3F72AF]/30 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#3F72AF] tracking-wider">
              Brand Path
            </span>
            <h3 className="text-xl font-black">Brand Portal</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Collaborate with 18 verified creator identities on authentic UGC campaigns with AI matching and smart reviews.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Link
              to="/brand"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#112D4E] hover:bg-[#153D56] px-4 py-2.5 rounded-xl transition-all shadow-xs btn-tactile"
            >
              <span>Open Brand Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/join/brand"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] px-3 py-2 transition-colors"
            >
              <span>Join as Brand</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Notice Bar */}
      <div className="flex justify-center pt-4">
        <DemoNotice type="general" />
      </div>
    </div>
  );
};
