import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, Eye, ArrowUpRight } from 'lucide-react';
import { Creator } from '../../types/marketplace';
import { BookmarkButton } from '../common/BookmarkButton';

interface CreatorCardProps {
  creator: Creator;
  isSelected?: boolean;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, isSelected = false }) => {
  return (
    <Link
      to={`/creators/${creator.id}`}
      className={`group flex flex-col liquid-glass-card rounded-2xl p-5 card-interactive text-left focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 relative overflow-hidden ${
        isSelected ? 'card-selected' : ''
      }`}
    >
      {/* Subtle top specular reflection line */}
      <div 
        className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Top Header: Avatar & Key Meta */}
      <div className="flex items-start gap-3.5 mb-3.5">
        <div className="relative shrink-0 overflow-hidden rounded-full">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[#DBE2EF] group-hover:ring-[#3F72AF] group-hover:scale-105 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
            }}
          />
          {creator.isFeatured && (
            <span
              className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#112D4E] text-white shadow-xs z-10"
              title="Featured Creator"
            >
              Star
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-base font-bold text-[#112D4E] truncate group-hover:text-[#3F72AF] transition-colors">
              {creator.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <BookmarkButton
                id={creator.id}
                category="creator"
                size="sm"
                title={`Bookmark ${creator.name}`}
              />
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#3F72AF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </div>
          <p className="text-xs font-mono text-gray-500 truncate">{creator.handle}</p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
            <MapPin className="w-3 h-3 text-[#3F72AF] shrink-0" />
            <span className="truncate">{creator.location}</span>
          </div>
        </div>
      </div>

      {/* Niche & Languages */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#DBE2EF] text-[#112D4E]">
          {creator.niche}
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600">
          <Globe className="w-2.5 h-2.5 text-gray-400" />
          {creator.languages.slice(0, 2).join(', ')}
        </span>
      </div>

      {/* Bio Snippet */}
      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3.5">
        {creator.bio}
      </p>

      {/* Portfolio Preview Strip (when portfolio items exist) */}
      {creator.portfolio && creator.portfolio.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            <span>Portfolio Preview</span>
            <span className="text-[#3F72AF] font-mono">{creator.portfolio.length} items</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {creator.portfolio.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="relative aspect-4/3 rounded-lg overflow-hidden bg-gray-100 group/thumb"
                title={`${item.title} (${item.format})`}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded text-[8px] font-extrabold bg-[#112D4E]/80 text-white backdrop-blur-xs">
                  {item.format}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Metrics (clearly sourced simulatedMetrics) */}
      <div className="pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs text-gray-500 mt-auto">
        <div>
          <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Followers</span>
          <span className="font-bold text-[#112D4E] font-mono">{creator.simulatedMetrics.followersCount}</span>
        </div>
        <div className="text-center">
          <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Eng. Rate</span>
          <span className="font-bold text-emerald-600 font-mono">{creator.simulatedMetrics.engagementRate}</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-end gap-1">
            <Eye className="w-2.5 h-2.5" /> Avg Views
          </span>
          <span className="font-bold text-[#112D4E] font-mono">{creator.simulatedMetrics.avgViews}</span>
        </div>
      </div>
    </Link>
  );
};

