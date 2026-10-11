import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles, Bookmark, Check } from 'lucide-react';
import { Product } from '../../types/marketplace';
import { getBrandById } from '../../data/marketplaceData';
import { useWishlist } from '../../hooks/useWishlist';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ProductCardProps {
  product: Product;
  showSaveButton?: boolean;
  isSelected?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product,
  showSaveButton = true,
  isSelected = false,
}) => {
  const brand = getBrandById(product.brandId);
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(product.id);
  const reducedMotion = useReducedMotion();
  const [savePopped, setSavePopped] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(product.id);
    if (!reducedMotion) {
      setSavePopped(true);
      setTimeout(() => setSavePopped(false), 600);
    }
  };

  // Distinguish isolated packshots (e.g. bottles, tech hardware) from lifestyle photography
  const isPackshot = 
    product.category === 'Audio and Headphones' || 
    product.category === 'Skincare and Beauty' ||
    product.name.toLowerCase().includes('shield') ||
    product.name.toLowerCase().includes('pulse') ||
    product.name.toLowerCase().includes('hydration');

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group flex flex-col h-full bg-white border border-[#DCE5EB] rounded-2xl overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-[#397AA8] focus:ring-offset-2 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-editorial hover:border-[#397AA8] ${
        isSelected ? 'ring-2 ring-[#397AA8] shadow-sm -translate-y-0.5' : ''
      }`}
    >
      {/* Product Image Container with strict 4:3 aspect ratio and object centering */}
      <div className="relative aspect-[4/3] w-full bg-[#F8FAFC] border-b border-[#DCE5EB] overflow-hidden shrink-0 flex items-center justify-center p-2">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full transition-transform duration-300 ease-out group-hover:scale-102 ${
            isPackshot 
              ? 'object-contain object-center max-h-[90%]' 
              : 'object-cover object-center'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Category Pill and Featured Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 max-w-[calc(100%-4rem)]">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-[#163B53] shadow-2xs border border-[#DCE5EB] truncate">
            {product.category}
          </span>
          {product.isFeatured && (
            <span className="px-2 py-0.8 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-[#163B53] text-white shadow-2xs flex items-center gap-1 shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-[#EAF2F7]" />
              <span className="hidden sm:inline">Featured</span>
            </span>
          )}
        </div>

        {/* Save / Wishlist Button with clean toggle feedback */}
        {showSaveButton && (
          <button
            type="button"
            onClick={handleBookmark}
            aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name} to wishlist`}
            title={saved ? 'Remove from saved' : 'Save to wishlist'}
            className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 z-20 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#397AA8] ${
              saved
                ? 'bg-[#163B53] text-white shadow-sm scale-105'
                : 'bg-white/95 hover:bg-white text-[#64748B] hover:text-[#163B53] border border-[#DCE5EB] hover:scale-105 active:scale-95'
            }`}
          >
            <Bookmark 
              className={`w-3.5 h-3.5 transition-all ${
                saved ? 'fill-current text-white scale-110' : ''
              } ${savePopped ? 'scale-125' : ''}`} 
            />
          </button>
        )}
      </div>

      {/* Content Container - Consistent Flex Box with Guaranteed Alignment */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Brand Name Header */}
          <div className="h-5 mb-1 flex items-center">
            {brand ? (
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#397AA8] truncate block">
                {brand.name}
              </span>
            ) : (
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                BrandWaves Curated
              </span>
            )}
          </div>

          {/* Product Title - Fixed 2-Line Height for Card Symmetry */}
          <div className="min-h-[2.5rem] mb-2 flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#163B53] group-hover:text-[#397AA8] transition-colors leading-snug line-clamp-2">
              {product.name}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#397AA8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-0.5 transition-all" />
          </div>

          {/* Product Description - 2-Line Clamp with Uniform Line Height */}
          <p className="min-h-[2rem] text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Verified Creator Attribution or Brand Guarantee Strip */}
          <div className="h-7 mb-4 flex items-center">
            {product.relatedCreatorIds && product.relatedCreatorIds.length > 0 ? (
              <div className="w-full flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#EAF2F7] text-[11px] text-[#163B53] font-semibold border border-[#DCE5EB]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#397AA8] shrink-0" />
                <span className="truncate">Featured by {product.relatedCreatorIds.length} verified creators</span>
              </div>
            ) : (
              <div className="w-full flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-[#F8FAFC] text-[11px] text-[#64748B] font-medium border border-[#DCE5EB]">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">Tested independent merchandise</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Alignment: Price and Action Button */}
        <div className="pt-3 border-t border-[#DCE5EB] flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Price</span>
            <span className="text-base sm:text-lg font-black text-[#163B53] font-mono leading-tight">
              {product.priceFormatted}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF2F7] group-hover:bg-[#163B53] text-xs font-bold text-[#163B53] group-hover:text-white transition-all shadow-2xs">
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};
