import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  ExternalLink, 
  Package, 
  Target, 
  Users, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  getBrandById, 
  getProducts, 
  getMarketplaceCampaignById, 
  getCreatorById 
} from '../../data/marketplaceData';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { ProductCard } from '../../components/marketplace/ProductCard';

export const BrandDetailPage: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const brand = brandId ? getBrandById(brandId) : undefined;

  if (!brand) {
    return (
      <div className="bg-white rounded-2xl border border-[#DBE2EF] p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <h2 className="text-xl font-black text-[#112D4E]">Brand Not Found</h2>
        <p className="text-sm text-gray-500">
          The brand profile you are looking for does not exist in our catalog or may have been updated.
        </p>
        <Link
          to="/brands"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#112D4E] text-white hover:bg-[#112D4E]/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all brands</span>
        </Link>
      </div>
    );
  }

  // Resolve brand products
  const products = getProducts({ brandId: brand.id });

  // Resolve brand campaigns
  const campaigns = brand.campaignIds
    .map((id) => getMarketplaceCampaignById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  // Resolve brand creators
  const creators = brand.creatorIds
    .map((id) => getCreatorById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="space-y-12 animate-fadeIn pb-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/brands"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#112D4E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all brands</span>
        </Link>

        <DemoNotice type="brand" />
      </div>

      {/* Brand Hero Header */}
      <div className="bg-white rounded-3xl border border-[#DBE2EF] overflow-hidden shadow-xs">
        {/* Cover image */}
        <div className="h-44 sm:h-64 w-full bg-[#112D4E]/20 relative">
          <img
            src={brand.coverImage}
            alt={brand.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Brand Information */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-white shadow-lg bg-white shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
                    {brand.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DBE2EF] text-[#112D4E]">
                    {brand.category}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#3F72AF]" />
                    {brand.location}
                  </span>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#3F72AF] hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{brand.website.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/join/creator"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold shadow-sm hover:bg-[#112D4E]/90 transition-all"
              >
                <Target className="w-4 h-4 text-[#DBE2EF]" />
                <span>Join Brand Campaign</span>
              </Link>
            </div>
          </div>

          {/* Description & Brand Values */}
          <div className="border-t border-[#DBE2EF]/60 pt-6 space-y-4 max-w-3xl">
            <div>
              <p className="text-base sm:text-lg font-bold text-[#112D4E] leading-snug mb-2">
                "{brand.tagline}"
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {brand.description}
              </p>
            </div>

            {/* Brand Values Pills */}
            {brand.values && brand.values.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Brand Commitments & Values
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {brand.values.map((val) => (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#F9F7F7] border border-[#DBE2EF] text-[#112D4E]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{val}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Products Collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#112D4E]">
              Products by {brand.name}
            </h2>
            <p className="text-xs text-gray-500">
              Explore the {products.length} products featured in active creator campaigns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Brand Active Campaigns */}
      {campaigns.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#DBE2EF]">
          <div>
            <h2 className="text-xl font-black text-[#112D4E]">
              Active Campaigns by {brand.name}
            </h2>
            <p className="text-xs text-gray-500">
              Open and ongoing creator collaborations funded by {brand.name}.
            </p>
          </div>

          <div className="space-y-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white p-5 rounded-2xl border border-[#DBE2EF] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-[#3F72AF] transition-all"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {camp.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-500">
                      Deadline: {camp.deadline}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#112D4E]">{camp.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{camp.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">Reward</span>
                    <span className="text-base font-extrabold text-[#112D4E] font-mono">{camp.rewardAmount}</span>
                  </div>

                  <Link
                    to={`/campaigns/${camp.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold hover:bg-[#112D4E]/90 transition-all"
                  >
                    <span>View Brief</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collaborated Creators */}
      {creators.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#DBE2EF]">
          <div>
            <h2 className="text-xl font-black text-[#112D4E]">
              Creators Collaborating with {brand.name}
            </h2>
            <p className="text-xs text-gray-500">
              Creators who have partnered with {brand.name} to produce authentic UGC and reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creators.map((c) => (
              <Link
                key={c.id}
                to={`/creators/${c.id}`}
                className="bg-white p-4 rounded-2xl border border-[#DBE2EF] flex items-center gap-3.5 shadow-xs hover:border-[#3F72AF] transition-all"
              >
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#DBE2EF] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#112D4E] truncate">{c.name}</h3>
                  <p className="text-xs font-mono text-gray-500">{c.handle}</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#DBE2EF] text-[#112D4E] mt-1">
                    {c.niche}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
