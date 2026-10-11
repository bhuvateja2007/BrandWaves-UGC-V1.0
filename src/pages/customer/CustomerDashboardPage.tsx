import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../hooks/useWishlist';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { 
  getFeaturedProducts, 
  getCreators, 
  getProductById, 
  getBrandById,
  getProducts 
} from '../../data/marketplaceData';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { DemoNotice } from '../../components/marketplace/DemoNotice';
import { 
  Search, 
  ShoppingBag, 
  Bookmark, 
  Compass, 
  Sparkles, 
  History,
  Trash2,
  ChevronRight,
  Flame,
  ArrowRight,
  Shirt,
  Coffee,
  Headphones,
  Heart,
  Package
} from 'lucide-react';

const POPULAR_CATEGORIES = [
  { name: 'Skincare', icon: Sparkles, count: 4 },
  { name: 'Beverage', icon: Package, count: 4 },
  { name: 'Streetwear', icon: Shirt, count: 3 },
  { name: 'Audio Hardware', icon: Headphones, count: 3 },
  { name: 'Specialty Coffee', icon: Coffee, count: 3 },
  { name: 'Wellness', icon: Heart, count: 3 },
];

interface EditorialCollection {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  productIds: string[];
}

const EDITORIAL_COLLECTIONS: EditorialCollection[] = [
  {
    id: 'col_daily_rituals',
    title: 'Daily Rituals & Natural Botanicals',
    subtitle: 'Morning essentials crafted with pure ingredients and zero fillers.',
    tagline: 'Clean Living Edit',
    productIds: [
      'prod_crimson_classic_cola',
      'prod_dew_ceramide_sunscreen',
      'prod_ember_nitro_coldbrew',
      'prod_loopkind_thermal_flask'
    ],
  },
  {
    id: 'col_urban_transit',
    title: 'Urban Transit & Everyday Carry',
    subtitle: 'Architectural streetwear and studio-grade hardware built for transit.',
    tagline: 'Metropolitan Design',
    productIds: [
      'prod_northlane_chore_jacket',
      'prod_voltedge_pulse_pro_headphones',
      'prod_roamwell_nomad_backpack',
      'prod_northlane_cargo_pant'
    ],
  },
  {
    id: 'col_sanctuary_spaces',
    title: 'Mindful Sanctuary & Home Accents',
    subtitle: 'Artisanal stoneware and movement equipment designed to ground modern living.',
    tagline: 'Home & Wellness',
    productIds: [
      'prod_form_alignment_mat',
      'prod_haven_ripple_vase',
      'prod_haven_amber_candle',
      'prod_pawfolk_cloud_bed'
    ],
  },
];

export const CustomerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { savedIds } = useWishlist();
  const { recentlyViewedProducts, clearRecentlyViewed, hasRecentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollectionId, setActiveCollectionId] = useState<string>(EDITORIAL_COLLECTIONS[0].id);

  const featuredProducts = getFeaturedProducts().slice(0, 4);

  // Discover creator portfolio items explicitly linked to canonical products
  const creatorsWithProductContent = getCreators()
    .filter((c) => c.portfolio.some((p) => Boolean(p.relatedProductId)))
    .slice(0, 3);

  const activeCollection = EDITORIAL_COLLECTIONS.find((c) => c.id === activeCollectionId) || EDITORIAL_COLLECTIONS[0];
  const collectionProducts = activeCollection.productIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/customer/products');
    }
  };

  const displayName = currentUser?.name?.split(' ')[0] || 'Shopper';

  return (
    <div className="space-y-12 animate-fadeIn pb-16">
      {/* =========================================================================
          1. WELCOME HERO SECTION
          ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl liquid-glass-surface p-7 sm:p-10 shadow-glass">
        {/* Subtle top reflection line */}
        <div 
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" 
          aria-hidden="true" 
        />

        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#3F72AF] animate-pulse" />
            <span>Customer Portal • Phase 3</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#112D4E] tracking-tight leading-tight">
            Welcome back, {displayName}!
          </h1>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
            Explore authentic creator evaluations, follow original independent labels, and save standout products directly to your personal wishlist.
          </p>

          {/* Prominent Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative max-w-xl">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by brand, title, or category..."
                className="w-full pl-11 pr-24 py-3 bg-white/80 border border-[#DBE2EF] rounded-2xl text-sm text-[#112D4E] placeholder:text-gray-400 focus:bg-white focus:border-[#3F72AF] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/20 shadow-xs transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#112D4E] hover:bg-[#3F72AF] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/customer/products"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore All Products</span>
            </Link>

            <Link
              to="/customer/creators"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white text-[#112D4E] border border-[#DBE2EF] text-xs font-bold transition-all shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-[#3F72AF]" />
              <span>Discover Creators</span>
            </Link>

            <Link
              to="/customer/saved"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white text-[#112D4E] border border-[#DBE2EF] text-xs font-bold transition-all shadow-2xs"
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedIds.length > 0 ? 'text-[#3F72AF] fill-current' : 'text-gray-400'}`} />
              <span>Saved Items ({savedIds.length})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. FEATURED PRODUCTS (WITH SAVE/UNSAVE)
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3F72AF]">
              Handpicked Essentials
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Tested by creators and curated for everyday excellence.
            </p>
          </div>

          <Link
            to="/customer/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] transition-colors"
          >
            <span>View all 24 products</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} showSaveButton={true} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. DISCOVER BY CATEGORY
          ========================================================================= */}
      <section className="space-y-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#3F72AF]">
            Curated Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
            Discover by Category
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Filter authentic products by the rituals and goods that match your daily life.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {POPULAR_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => navigate(`/customer/products?category=${encodeURIComponent(cat.name)}`)}
              className="liquid-glass-card p-4 rounded-2xl text-left hover:border-[#3F72AF] transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-[#DBE2EF]/60 flex items-center justify-center text-[#3F72AF] group-hover:bg-[#3F72AF] group-hover:text-white transition-all mb-3 shadow-2xs">
                <cat.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors block truncate">
                  {cat.name}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {cat.count} products
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. EDITORIAL COLLECTIONS / TRENDING NOW
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3F72AF]">
              <Flame className="w-3.5 h-3.5" />
              <span>Editorial Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
              Curated Collections
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Thematic edits connecting verified creator evaluations with standout product pairings.
            </p>
          </div>

          {/* Collection Tab Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {EDITORIAL_COLLECTIONS.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveCollectionId(col.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  activeCollectionId === col.id
                    ? 'bg-[#112D4E] text-white shadow-xs'
                    : 'bg-white/70 text-gray-600 hover:bg-white hover:text-[#112D4E] border border-[#DBE2EF]'
                }`}
              >
                {col.tagline}
              </button>
            ))}
          </div>
        </div>

        {/* Collection Banner Header */}
        <div className="p-6 rounded-2xl bg-[#DBE2EF]/40 border border-[#DBE2EF] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-[#3F72AF] tracking-wider block">
              {activeCollection.tagline}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#112D4E]">
              {activeCollection.title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
              {activeCollection.subtitle}
            </p>
          </div>

          <Link
            to={`/customer/products?search=${encodeURIComponent(activeCollection.title.split(' ')[0])}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] shrink-0"
          >
            <span>Explore collection goods</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Collection Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collectionProducts.map((product) => (
            <ProductCard key={product.id} product={product} showSaveButton={true} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. CREATOR-INSPIRED DISCOVERY
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3F72AF]">
              Authentic Evaluations
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
              Creator-Inspired Reviews
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Explore actual creative portfolio pieces explicitly linked to canonical products.
            </p>
          </div>

          <Link
            to="/customer/creators"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] transition-colors"
          >
            <span>Explore all creators</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creatorsWithProductContent.map((creator) => {
            const portfolioItem = creator.portfolio.find((p) => Boolean(p.relatedProductId)) || creator.portfolio[0];
            const linkedProduct = portfolioItem?.relatedProductId ? getProductById(portfolioItem.relatedProductId) : undefined;

            return (
              <div 
                key={creator.id}
                className="liquid-glass-card rounded-2xl overflow-hidden p-4 space-y-3.5 flex flex-col justify-between"
              >
                {/* Creator Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#DBE2EF]"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/creators/${creator.id}`}
                      className="text-xs font-bold text-[#112D4E] hover:text-[#3F72AF] transition-colors truncate block"
                    >
                      {creator.name}
                    </Link>
                    <span className="text-[11px] text-gray-400 font-mono block truncate">
                      {creator.niche} · {creator.location}
                    </span>
                  </div>
                </div>

                {/* Portfolio Showcase Thumbnail */}
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900 relative">
                  <img
                    src={portfolioItem.thumbnail}
                    alt={portfolioItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                    {portfolioItem.format}
                  </div>
                </div>

                {/* Title & Product Link */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#112D4E] line-clamp-1 block">
                    {portfolioItem.title}
                  </span>
                  {linkedProduct && (
                    <div className="pt-2 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                          Featured Item
                        </span>
                        <Link 
                          to={`/customer/products/${linkedProduct.id}`}
                          className="font-bold text-[#3F72AF] hover:underline truncate block"
                        >
                          {linkedProduct.name}
                        </Link>
                      </div>
                      <span className="font-mono font-bold text-[#112D4E] shrink-0">
                        {linkedProduct.priceFormatted}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          6. RECENTLY VIEWED PRODUCTS (PRIVACY-CONSCIOUS LOCAL RECENCY)
          ========================================================================= */}
      <section className="space-y-6 pt-4 border-t border-[#DBE2EF]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              <History className="w-3.5 h-3.5 text-[#3F72AF]" />
              <span>Browsing History</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
              Recently Viewed
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Privacy-conscious recency stored exclusively in your local browser session.
            </p>
          </div>

          {hasRecentlyViewed && (
            <button
              type="button"
              onClick={clearRecentlyViewed}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-rose-600 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {hasRecentlyViewed ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showSaveButton={true} />
            ))}
          </div>
        ) : (
          <div className="liquid-glass-surface rounded-2xl p-8 sm:p-10 text-center max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center mx-auto shadow-2xs">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#112D4E]">No recently viewed products yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
              As you browse products and creator showcases across BrandWaves, your recent items will appear here for fast recall.
            </p>
            <div className="pt-2">
              <Link
                to="/customer/products"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#112D4E] hover:bg-[#3F72AF] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>Browse Product Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Demo Notice footer */}
      <div className="flex justify-center pt-4">
        <DemoNotice type="metrics" />
      </div>
    </div>
  );
};
