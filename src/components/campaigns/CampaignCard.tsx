import React from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../../types';
import { BookmarkButton } from '../common/BookmarkButton';

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const spotsPercentage = Math.min(100, Math.round(((campaign.spotsFilled || 0) / (campaign.spotsTotal || 10)) * 100));

  return (
    <article className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#DBE2EF] shadow-subtle card-interactive group">
      {/* Media & Details */}
      <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#DBE2EF] shrink-0 relative border border-[#DBE2EF]/60 shadow-2xs">
          <img
            src={campaign.brandLogo}
            alt={campaign.brandName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-1 left-1 bg-[#112D4E]/85 backdrop-blur-xs text-white px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">
            {campaign.category}
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {campaign.brandName}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#DBE2EF]/80 text-[#112D4E]">
              {campaign.platform} • {campaign.format}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Active Brief
            </span>
          </div>

          <Link
            to={`/campaigns/${campaign.id}`}
            className="text-base font-bold text-[#112D4E] hover:text-[#3F72AF] transition-colors truncate"
          >
            {campaign.title}
          </Link>

          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap pt-0.5">
            <span className="flex items-center gap-1 font-bold text-[#3F72AF]">
              <span className="material-symbols-outlined text-[16px]">payments</span>
              {campaign.rewardAmount}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              Deadline: {campaign.deadline}
            </span>
          </div>
        </div>
      </div>

      {/* Spots & CTA */}
      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#DBE2EF]/70">
        <div className="flex flex-col items-start md:items-end gap-1">
          <span className="text-xs font-medium text-gray-500">
            {campaign.spotsFilled} of {campaign.spotsTotal} spots filled
          </span>
          <div className="w-24 h-1.5 bg-[#DBE2EF] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#3F72AF] rounded-full transition-all duration-500"
              style={{ width: `${spotsPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <BookmarkButton size="sm" title={`Bookmark ${campaign.title}`} />
          <Link
            to={`/campaigns/${campaign.id}`}
            className="px-3 py-1.5 rounded-xl bg-[#DBE2EF]/80 hover:bg-[#DBE2EF] text-[#112D4E] transition-all text-xs font-bold btn-tactile"
          >
            Details
          </Link>
          <Link
            to={`/submit?campaignId=${campaign.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white transition-all text-xs font-bold shadow-xs btn-tactile btn-glow"
          >
            Submit Content
          </Link>
        </div>
      </div>
    </article>
  );
};

