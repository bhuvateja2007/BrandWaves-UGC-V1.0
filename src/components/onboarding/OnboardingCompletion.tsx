import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Completion animation shown after onboarding answers are
 * confirmed saved by the server. Transitions into the dashboard.
 */
export const OnboardingCompletion: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !ringRef.current) return;
    // Trigger ring expand
    ringRef.current.classList.add('completion-ring-active');
  }, [reducedMotion]);

  return (
    <div
      className="flex flex-col items-center justify-center py-12 gap-6 animate-completion-fade"
      aria-live="polite"
      aria-label="Setup complete"
    >
      {/* Expanding ring + checkmark */}
      <div className="relative">
        <div ref={ringRef} className="completion-ring" aria-hidden="true" />
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-blue to-[#6ba3d6] flex items-center justify-center shadow-[0_0_40px_rgba(63,114,175,0.5)] animate-celebrate-pop">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path
              className="animate-checkmark"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white">You're all set!</h2>
        <p className="text-sm text-white/65 max-w-xs mx-auto">
          Your BrandWaves experience is personalized and ready. Taking you to your dashboard…
        </p>
      </div>

      {/* Subtle animated dots */}
      {!reducedMotion && (
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
