import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../hooks/useOnboarding';
import { LiquidGlassBackground } from '../../components/onboarding/LiquidGlassBackground';
import { GlassSurface } from '../../components/onboarding/GlassSurface';
import { OnboardingProgress } from '../../components/onboarding/OnboardingProgress';
import { PersonaSelectionStep } from '../../components/onboarding/PersonaSelectionStep';
import { AdaptiveQuestionStep } from '../../components/onboarding/AdaptiveQuestionStep';
import { OnboardingSummary } from '../../components/onboarding/OnboardingSummary';
import { OnboardingCompletion } from '../../components/onboarding/OnboardingCompletion';
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

/** True if a step is the review/summary step (injected as the final step) */
const SUMMARY_STEP_ID = '__summary__';

/**
 * OnboardingWizard — full-screen, multi-step onboarding experience.
 * Driven entirely by the typed question configuration.
 * Manages step transitions and delegates all state to useOnboarding.
 */
export const OnboardingWizard: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const onboarding = useOnboarding();
  const [stepKey, setStepKey] = useState(0); // Forces transition re-render

  // Guard: redirect unauthenticated users
  if (!loading && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Load saved progress on mount
  useEffect(() => {
    onboarding.loadSavedProgress();
  }, []);

  // Increment stepKey to trigger CSS transition
  const prevStep = React.useRef(onboarding.state.currentStepIndex);
  useEffect(() => {
    if (prevStep.current !== onboarding.state.currentStepIndex) {
      setStepKey((k) => k + 1);
      prevStep.current = onboarding.state.currentStepIndex;
    }
  }, [onboarding.state.currentStepIndex]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-navy">
        <div className="w-10 h-10 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
      </div>
    );
  }

  // Completion state
  if (onboarding.state.isCompleted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <LiquidGlassBackground />
        <GlassSurface animateHighlight className="w-full max-w-md">
          <OnboardingCompletion />
        </GlassSurface>
      </div>
    );
  }

  const { currentStep, state, totalSteps, isLastStep, progress } = onboarding;

  // Compute whether we're on the summary (virtual last step)
  const isSummaryStep = isLastStep && state.currentStepIndex === onboarding.visibleSteps.length - 1
    ? false // summary is injected after the last real step — handled by wizard logic
    : false;

  // We add a virtual "Review" step after the last visible step
  const isReviewPhase = state.currentStepIndex >= onboarding.visibleSteps.length;
  const displayTotalSteps = onboarding.visibleSteps.length + 1; // +1 for review
  const displayCurrentStep = Math.min(state.currentStepIndex, displayTotalSteps - 1);

  const isPersonaStep = currentStep?.id === 'persona';

  // Step title + subtitle
  const stepTitle = isReviewPhase
    ? 'Your BrandWaves experience is taking shape.'
    : currentStep?.title ?? "Let's shape your BrandWaves experience.";
  const stepSubtitle = isReviewPhase
    ? 'Everything looks great. Review your answers below.'
    : currentStep?.subtitle;

  // Check if step has optional questions only
  const stepHasRequiredQuestions = currentStep?.questions.some((q) => {
    const visible = !q.showForPersonas
      ? true
      : Array.isArray(q.showForPersonas)
      ? q.showForPersonas.includes(state.selectedPersona as any)
      : q.showForPersonas === state.selectedPersona;
    return visible && q.required;
  }) ?? false;

  const handleNext = () => {
    // Clear validation error before attempting next
    onboarding.goNext();
  };

  const handleGoToReview = () => {
    // After last real step, manually enter review
    onboarding.goNext();
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6">
      <LiquidGlassBackground />

      {/* BrandWaves wordmark */}
      <div className="relative z-10 mb-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-brand-blue flex items-center justify-center shadow-[0_0_16px_rgba(63,114,175,0.4)]">
          <span className="material-symbols-outlined text-white text-[18px]">waves</span>
        </div>
        <span className="text-white font-black text-lg tracking-tight">BrandWaves</span>
      </div>

      {/* Main glass panel */}
      <GlassSurface
        animateHighlight
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Progress */}
        <div className="mb-6">
          <OnboardingProgress
            currentStep={displayCurrentStep}
            totalSteps={displayTotalSteps}
            progress={isReviewPhase ? 95 : progress}
          />
        </div>

        {/* Step header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {stepTitle}
          </h1>
          {stepSubtitle && (
            <p className="text-sm text-white/60 mt-2 leading-relaxed">{stepSubtitle}</p>
          )}
        </div>

        {/* Step content — animated transition */}
        <div
          key={`step-${stepKey}-${isReviewPhase ? 'review' : currentStep?.id}`}
          className={`onboarding-step-enter ${
            state.direction === 'backward' ? 'onboarding-step-enter-back' : ''
          }`}
        >
          {isReviewPhase ? (
            <OnboardingSummary
              persona={state.selectedPersona}
              answers={state.answers}
              onEdit={onboarding.goBack}
              onComplete={handleGoToReview}
              isCompleting={state.isCompleting}
              error={state.saveError}
            />
          ) : isPersonaStep ? (
            <PersonaSelectionStep
              selectedPersona={state.selectedPersona}
              onSelect={(value) => onboarding.setAnswer('persona', value)}
            />
          ) : currentStep ? (
            <AdaptiveQuestionStep
              step={currentStep}
              persona={state.selectedPersona}
              answers={state.answers}
              onAnswer={onboarding.setAnswer}
            />
          ) : null}
        </div>

        {/* Validation error */}
        {state.saveError && !isReviewPhase && (
          <div
            role="alert"
            className="mt-4 px-4 py-3 bg-red-500/15 border border-red-400/30 rounded-xl text-red-300 text-sm"
          >
            {state.saveError}
          </div>
        )}

        {/* Navigation buttons (hidden in review — it has its own CTA) */}
        {!isReviewPhase && (
          <div className="flex items-center justify-between mt-8 gap-3">
            {/* Back */}
            <button
              type="button"
              onClick={onboarding.goBack}
              disabled={state.currentStepIndex === 0 || state.isCompleting}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${state.currentStepIndex === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              aria-label="Go to previous step"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-2">
              {/* Skip (only for optional steps without required questions) */}
              {!isPersonaStep && !stepHasRequiredQuestions && (
                <button
                  type="button"
                  onClick={onboarding.skipStep}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-white/45 hover:text-white/70 transition-colors"
                  aria-label="Skip this step"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Skip
                </button>
              )}

              {/* Continue */}
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  state.isCompleting ||
                  state.isSaving ||
                  (isPersonaStep && !state.selectedPersona)
                }
                className="glass-btn-primary flex items-center gap-2 min-w-[120px] justify-center"
                aria-label={isLastStep ? 'Review answers' : 'Continue to next step'}
              >
                {state.isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLastStep ? 'Review' : 'Continue'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </GlassSurface>

      {/* Footer note */}
      <p className="relative z-10 mt-6 text-xs text-white/35 text-center max-w-xs">
        Your answers personalize BrandWaves. They are kept private and never shared without your consent.
      </p>
    </div>
  );
};
