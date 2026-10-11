import React from 'react';
import { CreatorMatchRecommendation } from '../../services/creatorMatchmakerService';
import { MarketplaceCampaign } from '../../types/marketplace';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Star,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';

interface CreatorComparisonModalProps {
  creators: CreatorMatchRecommendation[];
  campaign: MarketplaceCampaign;
  isOpen: boolean;
  onClose: () => void;
  onInvite: (creator: CreatorMatchRecommendation) => void;
}

export const CreatorComparisonModal: React.FC<CreatorComparisonModalProps> = ({
  creators,
  campaign,
  isOpen,
  onClose,
  onInvite,
}) => {
  if (!isOpen || creators.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-modal border border-[#DBE2EF] overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#DBE2EF] flex items-center justify-between bg-[#F9F7F7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#112D4E]">
                Creator Fit Comparison
              </h3>
              <p className="text-xs text-gray-500">
                Evaluating {creators.length} creators for campaign:{' '}
                <strong className="text-[#3F72AF]">{campaign.title}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-[#112D4E] p-1 rounded-xl hover:bg-[#DBE2EF]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-x-auto">
          <div
            className="grid gap-6 min-w-[700px]"
            style={{ gridTemplateColumns: `repeat(${creators.length}, minmax(0, 1fr))` }}
          >
            {creators.map((rec) => {
              const { creator, overallScore, breakdown, rationale } = rec;
              const isTop = overallScore >= 80;

              return (
                <div
                  key={rec.creatorId}
                  className="bg-[#F9F7F7] rounded-3xl border border-[#DBE2EF] p-5 flex flex-col justify-between gap-5 relative group"
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full ${
                        isTop
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : overallScore >= 65
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {overallScore}% Match
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {creator.country}
                    </span>
                  </div>

                  {/* Creator Identity */}
                  <div className="flex flex-col items-center text-center gap-2">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-subtle"
                    />
                    <div>
                      <h4 className="text-base font-extrabold text-[#112D4E] truncate max-w-[200px]">
                        {creator.name}
                      </h4>
                      <span className="text-xs font-semibold text-gray-400">
                        {creator.handle}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DBE2EF] text-[#112D4E]">
                      {creator.niche}
                    </span>
                  </div>

                  {/* Criteria Breakdown Scores */}
                  <div className="bg-white rounded-2xl p-4 border border-[#DBE2EF]/60 flex flex-col gap-2.5 text-xs">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-0.5">
                      Scoring Matrix
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Niche Fit</span>
                      <span className="font-extrabold text-[#112D4E]">{breakdown.nicheScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#DBE2EF]/60 overflow-hidden">
                      <div
                        className="h-full bg-[#3F72AF] rounded-full"
                        style={{ width: `${breakdown.nicheScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-gray-500">Format Mastery</span>
                      <span className="font-extrabold text-[#112D4E]">{breakdown.formatScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#DBE2EF]/60 overflow-hidden">
                      <div
                        className="h-full bg-[#3F72AF] rounded-full"
                        style={{ width: `${breakdown.formatScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-gray-500">Portfolio Relevance</span>
                      <span className="font-extrabold text-[#112D4E]">{breakdown.portfolioScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#DBE2EF]/60 overflow-hidden">
                      <div
                        className="h-full bg-[#3F72AF] rounded-full"
                        style={{ width: `${breakdown.portfolioScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-gray-500">Reliability Record</span>
                      <span className="font-extrabold text-[#112D4E]">
                        {creator.simulatedMetrics?.completedCampaigns || 0} completed
                      </span>
                    </div>
                  </div>

                  {/* AI Match Rationale Summary */}
                  <div className="bg-white rounded-2xl p-4 border border-[#DBE2EF]/60 text-xs flex flex-col gap-2">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                      Match Rationale
                    </div>
                    <p className="text-gray-700 italic leading-relaxed text-[11px]">
                      "{rationale.summary}"
                    </p>

                    {rationale.strengths && rationale.strengths.length > 0 && (
                      <div className="mt-1 flex flex-col gap-1">
                        {rationale.strengths.slice(0, 2).map((s, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[10px] text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Portfolio Samples Preview */}
                  {creator.portfolio && creator.portfolio.length > 0 && (
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                        Deliverable Samples
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {creator.portfolio.slice(0, 2).map((p) => (
                          <div
                            key={p.id}
                            className="aspect-video rounded-xl overflow-hidden border border-[#DBE2EF] relative bg-black"
                          >
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="w-full h-full object-cover opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                              <span className="text-[8px] text-white font-medium line-clamp-1">
                                {p.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-[#DBE2EF]">
                    <button
                      type="button"
                      onClick={() => onInvite(rec)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-subtle cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Invite to Campaign</span>
                    </button>

                    <a
                      href={`/creators/${creator.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-white border border-[#DBE2EF] hover:bg-[#DBE2EF]/40 text-xs font-bold text-[#112D4E] flex items-center justify-center gap-1 text-center"
                    >
                      <span>Full Public Profile</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Decision Support Signal disclaimer */}
        <div className="p-4 px-6 border-t border-[#DBE2EF] bg-[#F9F7F7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#3F72AF] shrink-0" />
            <span>
              <strong>Decision-Support Signal:</strong> Match scores are calculated from creator categories, deliverable formats, and verified portfolios. Brand owners should review full portfolios before finalizing collaborations.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#DBE2EF] text-xs font-bold text-[#112D4E] hover:bg-white cursor-pointer shrink-0"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
