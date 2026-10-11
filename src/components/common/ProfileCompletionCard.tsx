import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Trophy,
  ShieldCheck 
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface CompletionItem {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  actionUrl: string;
  actionLabel?: string;
}

export interface ProfileCompletionCardProps {
  type: 'creator' | 'brand';
  items: CompletionItem[];
  title?: string;
  className?: string;
  compact?: boolean;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  type,
  items,
  title,
  className = '',
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(!compact);
  const reducedMotion = useReducedMotion();

  const total = items.length;
  const completed = items.filter((i) => i.isComplete).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isAllComplete = percentage === 100;

  // SVG Circular progress ring calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const incompleteItems = items.filter((i) => !i.isComplete);
  const defaultTitle = type === 'creator' ? 'Creator Profile Strength' : 'Brand Profile Strength';

  return (
    <section 
      aria-labelledby="profile-completion-title"
      className={`bg-white rounded-3xl border border-[#DBE2EF] p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all ${className}`}
    >
      {/* Subtle top specular reflection */}
      <div 
        className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Header with Circular Progress Meter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Circular SVG Progress Ring */}
          <div 
            className="relative w-18 h-18 shrink-0 flex items-center justify-center"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${defaultTitle}: ${percentage}% complete`}
          >
            <svg 
              className="w-18 h-18 -rotate-90 transform"
              viewBox="0 0 80 80"
              aria-hidden="true"
            >
              {/* Background track circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-[#DBE2EF]/60"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Dynamic progress circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className={`transition-all duration-700 ease-out ${
                  isAllComplete ? 'stroke-emerald-500' : 'stroke-[#3F72AF]'
                }`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Percentage Text or Milestone Icon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {isAllComplete ? (
                <Trophy className={`w-5 h-5 text-emerald-600 ${reducedMotion ? '' : 'animate-celebrate-pop'}`} />
              ) : (
                <span className="text-sm font-extrabold text-[#112D4E] font-mono leading-none">
                  {percentage}%
                </span>
              )}
            </div>
          </div>

          {/* Titles & Status Copy */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h2 
                id="profile-completion-title" 
                className="text-base font-black text-[#112D4E] tracking-tight truncate"
              >
                {title || defaultTitle}
              </h2>
              {isAllComplete ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  100% Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DBE2EF] text-[#112D4E]">
                  <span>{completed} of {total} completed</span>
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 line-clamp-1">
              {isAllComplete
                ? 'Your profile is fully verified for maximum marketplace discovery.'
                : `${incompleteItems.length} required field${incompleteItems.length === 1 ? '' : 's'} remaining to maximize discovery.`}
            </p>
          </div>
        </div>

        {/* Action Toggle or Full Milestone Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isAllComplete ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Marketplace Tier Unlocked</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#DBE2EF] text-xs font-bold text-gray-600 hover:text-[#112D4E] hover:bg-[#F9F7F7] transition-all cursor-pointer btn-tactile"
              aria-expanded={expanded}
              aria-controls="completion-checklist"
            >
              <span>{expanded ? 'Hide Tasks' : `Complete (${incompleteItems.length})`}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Checklist & Direct Navigation CTAs */}
      {expanded && !isAllComplete && (
        <div 
          id="completion-checklist" 
          className="mt-5 pt-4 border-t border-[#DBE2EF]/70 space-y-2.5 animate-fadeIn"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  item.isComplete
                    ? 'bg-[#F9F7F7]/60 border-[#DBE2EF]/60 text-gray-500'
                    : 'bg-white border-[#DBE2EF] text-[#112D4E] hover:border-[#3F72AF]/60 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {item.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className={`text-xs font-bold block truncate ${
                      item.isComplete ? 'text-gray-500 line-through' : 'text-[#112D4E]'
                    }`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate">
                      {item.description}
                    </span>
                  </div>
                </div>

                {!item.isComplete && (
                  <Link
                    to={item.actionUrl}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3F72AF]/10 hover:bg-[#3F72AF] text-[#3F72AF] hover:text-white text-[11px] font-bold transition-all shrink-0 cursor-pointer btn-tactile focus:outline-none focus:ring-1 focus:ring-[#3F72AF]"
                  >
                    <span>{item.actionLabel || 'Add'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
