import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface SuccessFeedbackProps {
  title: string;
  description?: string;
  badgeText?: string;
  actionButton?: React.ReactNode;
  secondaryButton?: React.ReactNode;
  className?: string;
  showParticles?: boolean;
}

export const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({
  title,
  description,
  badgeText = 'Action Completed',
  actionButton,
  secondaryButton,
  className = '',
  showParticles = true,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white border border-[#DBE2EF] shadow-card text-center flex flex-col items-center justify-center animate-celebrate-pop ${className}`}>
      {/* Restrained particle bursts - BrandWaves colors (disabled under reduced-motion) */}
      {showParticles && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
          <span className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-[#3F72AF]/40 animate-ping duration-700" />
          <span className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-ping duration-1000 delay-100" />
          <span className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-[#112D4E]/30 animate-ping duration-1000 delay-200" />
        </div>
      )}

      {/* Checkmark circle with SVG stroke draw */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shadow-xs animate-soft-pulse">
          <svg
            className="w-8 h-8 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline
              className={prefersReducedMotion ? '' : 'animate-checkmark'}
              points="20 6 9 17 4 12"
            />
          </svg>
        </div>
      </div>

      {badgeText && (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-2">
          {badgeText}
        </span>
      )}

      <h3 className="text-xl sm:text-2xl font-black text-[#112D4E] tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-gray-600 mt-1.5 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {(actionButton || secondaryButton) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {actionButton}
          {secondaryButton}
        </div>
      )}
    </div>
  );
};
