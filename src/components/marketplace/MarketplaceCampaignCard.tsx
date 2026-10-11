import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ArrowUpRight, DollarSign } from 'lucide-react';
import { MarketplaceCampaign } from '../../types/marketplace';
import { BookmarkButton } from '../common/BookmarkButton';

interface MarketplaceCampaignCardProps {
  campaign: MarketplaceCampaign;
  isSelected?: boolean;
}

export const MarketplaceCampaignCard: React.FC<MarketplaceCampaignCardProps> = ({ 
  campaign,
  isSelected = false,
}) => {
  const statusConfig = {
    open: {
      label: 'Open',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
    },
    in_progress: {
      label: 'In Progress',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      dotClass: 'bg-blue-500',
    },
    completed: {
      label: 'Completed',
      badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
      dotClass: 'bg-gray-400',
    },
    closed: {
      label: 'Closed',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-400',
    },
  }[campaign.status] || {
    label: campaign.status,
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
  };

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className={`group flex flex-col liquid-glass-card rounded-2xl p-5 card-interactive text-left focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 relative overflow-hidden ${
        isSelected ? 'card-selected' : ''
      }`}
    >
      {/* Subtle top specular reflection line */}
      <div 
        className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Brand & Status Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {campaign.brandLogo && (
            <img
              src={campaign.brandLogo}
              alt={campaign.brandName}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#DBE2EF] shrink-0 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span className="text-xs font-bold text-gray-500 truncate">{campaign.brandName}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <BookmarkButton
            id={campaign.id}
            category="campaign"
            size="sm"
            title={`Bookmark ${campaign.title}`}
          />
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.badgeClass} shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
            <span>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Campaign Title */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-bold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors line-clamp-1">
          {campaign.title}
        </h3>
        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#3F72AF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4 flex-1">
        {campaign.description}
      </p>

      {/* Category & Platform Tags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#DBE2EF] text-[#112D4E]">
          {campaign.category}
        </span>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600">
          {campaign.platform}
        </span>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600">
          {campaign.format}
        </span>
      </div>

      {/* Compensation, Spots & Deadline Footer */}
      <div className="pt-3 border-t border-[#DBE2EF]/60 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-extrabold text-[#112D4E] font-mono">{campaign.rewardAmount}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1" title={`${campaign.spotsFilled} of ${campaign.spotsTotal} spots filled`}>
            <Users className="w-3 h-3 text-gray-400" />
            <span>{campaign.spotsFilled}/{campaign.spotsTotal} spots</span>
          </span>

          <span className="flex items-center gap-1" title={`Deadline: ${campaign.deadline}`}>
            <Clock className="w-3 h-3 text-gray-400" />
            <span>{campaign.deadline}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

