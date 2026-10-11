import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Target,
  ArrowRight,
  Bookmark
} from 'lucide-react';
import { 
  getProductById, 
  getBrandById, 
  getCreatorById, 
  getMarketplaceCampaignById,
  getProducts 
} from '../../data/marketplaceData';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { useWishlist } from '../../hooks/useWishlist';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = productId ? getProductById(productId) : undefined;
  const { isSaved, toggleSave } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();
  const saved = product ? isSaved(product.id) : false;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  React.useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
    }
  }, [product, addRecentlyViewed]);

  if (!product) {
    return (
      <div className="bg-white rounded-2xl border border-[#DBE2EF] p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <h2 className="text-xl font-black text-[#112D4E]">Product Not Found</h2>
        <p className="text-sm text-gray-500">
          The product you are looking for does not exist in our catalog or may have been updated.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#112D4E] text-white hover:bg-[#112D4E]/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all products</span>
        </Link>
      </div>
    );
  }

  const brand = getBrandById(product.brandId);

  // Resolve creators who reviewed this product
  const relatedCreators = (product.relatedCreatorIds || [])
    .map((id) => getCreatorById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  // Find related campaign for this product
  const relatedCampaign = brand?.campaignIds
    .map((id) => getMarketplaceCampaignById(id))
    .find((c) => c?.productId === product.id);

  // More products from the same brand
  const moreBrandProducts = getProducts({ brandId: product.brandId }).filter(
    (p) => p.id !== product.id
  );

  const activeImage = selectedImage || product.image;

  return (
    <div className="space-y-12 animate-fadeIn pb-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#112D4E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all products</span>
        </Link>

        <DemoNotice type="brand" />
      </div>

      {/* Product Hero Section: Gallery + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Product Imagery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full rounded-3xl bg-[#DBE2EF]/30 border border-[#DBE2EF] overflow-hidden relative shadow-xs">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
              }}
            />
            {product.isFeatured && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#112D4E] text-white shadow-xs">
                <Sparkles className="w-3 h-3 text-[#DBE2EF]" />
                <span>Featured Pick</span>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex items-center gap-3">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === img
                      ? 'border-[#3F72AF] shadow-sm scale-102'
                      : 'border-[#DBE2EF] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Meta & Brand */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand Tagline & Link */}
          {brand && (
            <div className="flex items-center gap-3 pb-3 border-b border-[#DBE2EF]/60">
              <Link to={`/brands/${brand.id}`} className="flex items-center gap-2.5 group">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#DBE2EF] shadow-xs"
                />
                <div>
                  <span className="text-sm font-extrabold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors block">
                    {brand.name}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {brand.category} · {brand.location}
                  </span>
                </div>
              </Link>
            </div>
          )}

          {/* Product Title & Category */}
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#DBE2EF] text-[#112D4E]">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Price & Wishlist Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#DBE2EF]/60">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#112D4E] font-mono">
                {product.priceFormatted}
              </span>
              <span className="text-xs text-gray-500 font-medium">Standard Retail (Simulated)</span>
            </div>

            <button
              type="button"
              onClick={() => toggleSave(product.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs ${
                saved
                  ? 'bg-[#3F72AF] text-white hover:bg-[#112D4E]'
                  : 'bg-white hover:bg-[#F9F7F7] text-[#112D4E] border border-[#DBE2EF]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
            </button>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            {product.description}
          </p>

          {/* Features Checklist */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Key Features
              </h3>
              <ul className="space-y-2">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* External Action Note */}
          <div className="pt-4 border-t border-[#DBE2EF] space-y-3">
            <div className="p-4 bg-[#F9F7F7] rounded-2xl border border-[#DBE2EF] space-y-2">
              <span className="text-xs font-bold text-[#112D4E] block">
                BrandWaves Discovery Marketplace
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                BrandWaves connects creators and audiences to discover standout products. To purchase directly from this brand’s storefront, click below:
              </p>
              {product.externalPurchaseUrl ? (
                <a
                  href={product.externalPurchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3F72AF] hover:underline pt-1"
                >
                  <span>Visit Brand Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Storefront link available during active campaign cycles.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Creators Who Featured This Product */}
      {relatedCreators.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#DBE2EF]">
          <div>
            <h2 className="text-xl font-black text-[#112D4E]">
              Creators Who Reviewed This Product
            </h2>
            <p className="text-xs text-gray-500">
              Authentic creator showcases, tutorials, and portfolio items featuring {product.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedCreators.map((creator) => (
              <Link
                key={creator.id}
                to={`/creators/${creator.id}`}
                className="bg-white p-4 rounded-2xl border border-[#DBE2EF] flex items-center gap-3.5 shadow-xs hover:border-[#3F72AF] hover:shadow-sm transition-all"
              >
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#DBE2EF] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#112D4E] truncate">{creator.name}</h3>
                  <p className="text-xs font-mono text-gray-500">{creator.handle}</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#DBE2EF] text-[#112D4E] mt-1">
                    {creator.niche}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Campaign Banner */}
      {relatedCampaign && (
        <div className="p-6 bg-gradient-to-r from-[#112D4E] to-[#1a3d66] rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/20 text-white">
                Active Campaign
              </span>
              <span className="text-xs text-[#DBE2EF] font-bold">{relatedCampaign.rewardAmount}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">{relatedCampaign.title}</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{relatedCampaign.brief}</p>
          </div>

          <Link
            to={`/campaigns/${relatedCampaign.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#112D4E] text-xs font-bold hover:bg-[#F9F7F7] transition-all shrink-0 self-start md:self-auto shadow-sm"
          >
            <span>View Campaign Brief</span>
            <ArrowRight className="w-4 h-4 text-[#3F72AF]" />
          </Link>
        </div>
      )}

      {/* More Products from Brand */}
      {moreBrandProducts.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#DBE2EF]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#112D4E]">
              More from {brand?.name}
            </h2>
            {brand && (
              <Link
                to={`/brands/${brand.id}`}
                className="text-xs font-bold text-[#3F72AF] hover:underline"
              >
                View all {brand.productIds.length} products →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreBrandProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
