import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight, Package, Target } from 'lucide-react';
import { Brand } from '../../types/marketplace';
import { BookmarkButton } from '../common/BookmarkButton';

interface BrandCardProps {
  brand: Brand;
  isSelected?: boolean;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, isSelected = false }) => {
  return (
    <Link
      to={`/brands/${brand.id}`}
      className={`group flex flex-col liquid-glass-card rounded-2xl overflow-hidden card-interactive text-left focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 relative ${
        isSelected ? 'card-selected' : ''
      }`}
    >
      {/* Subtle top specular reflection line */}
      <div 
        className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" 
        aria-hidden="true" 
      />

      {/* Cover Image with Brand Logo Overlay */}
      <div className="relative h-32 w-full bg-[#112D4E]/10 overflow-hidden">
        <img
          src={brand.coverImage}
          alt={brand.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Top Badges & Bookmark */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <BookmarkButton
            id={brand.id}
            category="brand"
            size="sm"
            title={`Bookmark ${brand.name}`}
          />
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#112D4E] shadow-xs backdrop-blur-xs">
            {brand.category}
          </span>
        </div>

        {/* Brand Logo Floating */}
        <div className="absolute -bottom-4 left-4">
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-md bg-white group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=160&auto=format&fit=crop&q=80';
            }}
          />
        </div>
      </div>

      {/* Body Content */}
      <div className="pt-6 p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="text-base font-bold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors truncate">
            {brand.name}
          </h3>
          <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#3F72AF] shrink-0 mt-0.5 transition-colors" />
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-2.5">
          <MapPin className="w-3 h-3 text-[#3F72AF] shrink-0" />
          <span className="truncate">{brand.location}</span>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4 flex-1">
          {brand.tagline}
        </p>

        {/* Footer Meta: Products & Campaigns */}
        <div className="pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1 text-[11px]">
            <Package className="w-3.5 h-3.5 text-gray-400" />
            <span>{brand.productIds.length} Products</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <Target className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span className="font-semibold text-[#112D4E]">
              {brand.campaignIds.length} {brand.campaignIds.length === 1 ? 'Campaign' : 'Campaigns'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

