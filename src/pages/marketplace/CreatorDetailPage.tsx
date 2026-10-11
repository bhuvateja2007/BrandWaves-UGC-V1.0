import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Globe, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  Eye, 
  DollarSign, 
  Award, 
  TrendingUp, 
  Briefcase, 
  Layers, 
  CheckCircle2,
  Package
} from 'lucide-react';
import { 
  getCreatorById, 
  getProductById, 
  getBrandById, 
  getMarketplaceCampaignById 
} from '../../data/marketplaceData';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { ProductCard } from '../../components/marketplace/ProductCard';

export const CreatorDetailPage: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const creator = creatorId ? getCreatorById(creatorId) : undefined;

  if (!creator) {
    return (
      <div className="bg-white rounded-2xl border border-[#DBE2EF] p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <h2 className="text-xl font-black text-[#112D4E]">Creator Not Found</h2>
        <p className="text-sm text-gray-500">
          The creator profile you are looking for does not exist in our directory or may have been updated.
        </p>
        <Link
          to="/creators"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#112D4E] text-white hover:bg-[#112D4E]/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all creators</span>
        </Link>
      </div>
    );
  }

  // Resolve connected products
  const relatedProducts = creator.relatedProductIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Resolve connected campaigns
  const relatedCampaigns = creator.relatedCampaignIds
    .map((id) => getMarketplaceCampaignById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="space-y-10 animate-fadeIn pb-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/creators"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#112D4E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all creators</span>
        </Link>

        <DemoNotice type="metrics" />
      </div>

      {/* Creator Profile Hero Banner */}
      <div className="bg-white rounded-3xl border border-[#DBE2EF] overflow-hidden shadow-xs">
        {/* Cover image */}
        <div className="h-44 sm:h-56 w-full bg-[#112D4E]/20 relative">
          {creator.coverImage && (
            <img
              src={creator.coverImage}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white shadow-lg bg-white shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
                    {creator.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DBE2EF] text-[#112D4E]">
                    {creator.niche}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-mono text-gray-500">{creator.handle}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#3F72AF]" />
                    {creator.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#3F72AF]" />
                    Languages: {creator.languages.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <Link
                to="/join/brand"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold shadow-sm hover:bg-[#112D4E]/90 transition-all active:scale-[0.98]"
              >
                <Briefcase className="w-4 h-4 text-[#DBE2EF]" />
                <span>Collaborate with {creator.name.split(' ')[0]}</span>
              </Link>
            </div>
          </div>

          {/* Bio */}
          <div className="max-w-3xl border-t border-[#DBE2EF]/60 pt-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              About the Creator
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {creator.bio}
            </p>

            {/* Supported Formats */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs font-bold text-gray-500">Formats:</span>
              {creator.formats.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F9F7F7] border border-[#DBE2EF] text-[#112D4E]"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Key Metrics Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#112D4E]">Performance Overview</h2>
          <span className="text-[11px] font-medium text-gray-500 italic">
            * Simulated sample metrics for demonstration
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#DBE2EF] p-4 shadow-xs">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Audience Reach
            </span>
            <span className="text-2xl font-black text-[#112D4E] mt-1 block">
              {creator.simulatedMetrics.followersCount}
            </span>
            <span className="text-[11px] text-gray-500">Total Followers</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DBE2EF] p-4 shadow-xs">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Typical Reach
            </span>
            <span className="text-2xl font-black text-[#112D4E] mt-1 block">
              {creator.simulatedMetrics.avgViews}
            </span>
            <span className="text-[11px] text-gray-500">Avg Views per post</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DBE2EF] p-4 shadow-xs">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Engagement Rate
            </span>
            <span className="text-2xl font-black text-[#112D4E] mt-1 block">
              {creator.simulatedMetrics.engagementRate}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">High affinity</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DBE2EF] p-4 shadow-xs">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Collaboration Tier
            </span>
            <span className="text-lg font-black text-[#112D4E] mt-1 block truncate">
              {creator.simulatedMetrics.collabRate}
            </span>
            <span className="text-[11px] text-gray-500">
              {creator.simulatedMetrics.completedCampaigns} completed projects
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Showcase Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-[#112D4E]">Recent Portfolio Work</h2>
          <p className="text-xs text-gray-500">
            Selected authentic brand collaborations and audience-tested content pieces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {creator.portfolio.map((item) => {
            const linkedBrand = item.relatedBrandId ? getBrandById(item.relatedBrandId) : undefined;
            const linkedProduct = item.relatedProductId ? getProductById(item.relatedProductId) : undefined;
            const linkedCampaign = item.relatedCampaignId ? getMarketplaceCampaignById(item.relatedCampaignId) : undefined;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#DBE2EF] overflow-hidden shadow-xs flex flex-col"
              >
                <div className="relative aspect-video w-full bg-gray-900 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                    {item.format}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono">
                    <Eye className="w-3 h-3 text-[#DBE2EF]" />
                    <span>{item.views}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-[#112D4E] mb-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Connected Entity Links */}
                  <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-[#DBE2EF]/60 text-xs">
                    {linkedBrand && (
                      <Link
                        to={`/brands/${linkedBrand.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3F72AF] hover:underline"
                      >
                        <span>Brand: {linkedBrand.name}</span>
                      </Link>
                    )}
                    {linkedProduct && (
                      <Link
                        to={`/products/${linkedProduct.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-[#112D4E] hover:underline"
                      >
                        <span>• Product: {linkedProduct.name}</span>
                      </Link>
                    )}
                    {linkedCampaign && (
                      <Link
                        to={`/campaigns/${linkedCampaign.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#112D4E] hover:underline ml-auto"
                      >
                        <span>Campaign Brief</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Products Featured */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-[#112D4E]">
              Featured Products Tested by {creator.name}
            </h2>
            <p className="text-xs text-gray-500">
              Standout items reviewed or styled by this creator.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Connected Active Campaigns */}
      {relatedCampaigns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-[#112D4E]">
            Related Brand Campaigns
          </h2>
          <div className="space-y-3">
            {relatedCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white p-4 rounded-xl border border-[#DBE2EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-[#3F72AF] transition-all"
              >
                <div>
                  <span className="text-xs font-bold text-[#3F72AF]">{camp.brandName}</span>
                  <h3 className="text-sm font-bold text-[#112D4E]">{camp.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{camp.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-extrabold text-[#112D4E] font-mono">
                    {camp.rewardAmount}
                  </span>
                  <Link
                    to={`/campaigns/${camp.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-[#112D4E] text-white text-xs font-bold hover:bg-[#112D4E]/90 transition-all"
                  >
                    View Brief
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
