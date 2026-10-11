import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;  // 0-indexed
  totalSteps: number;
  progress: number;     // 0-100
}

/**
 * Step progress indicator for the onboarding wizard.
 * Shows dot indicators + smooth progress bar.
 * Accessible: uses aria-valuenow and live region for screen readers.
 */
export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  progress,
}) => {
  return (
    <div className="w-full space-y-3" role="status" aria-label={`Step ${currentStep + 1} of ${totalSteps}`}>
      {/* Step dots */}
      <div className="flex items-center justify-center gap-2" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-500 ${
              i < currentStep
                ? 'w-5 h-1.5 bg-brand-blue'
                : i === currentStep
                ? 'w-7 h-2 bg-brand-blue shadow-[0_0_8px_rgba(63,114,175,0.5)]'
                : 'w-1.5 h-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-0.5 bg-white/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-blue to-[#6ba3d6] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Screen reader text */}
      <p className="sr-only">
        Step {currentStep + 1} of {totalSteps}. {Math.round(progress)}% complete.
      </p>
    </div>
  );
};
