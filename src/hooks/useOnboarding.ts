import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStepsForRole } from '../lib/onboardingQuestions';
import { getRoleLandingRoute } from '../lib/authValidation';
import { loadOnboardingData, saveOnboardingData } from '../services/onboardingService';
import type {
  OnboardingPersona,
  OnboardingAnswers,
  OnboardingState,
} from '../lib/onboardingTypes';

const SAVE_DEBOUNCE_MS = 1500;

export function useOnboarding() {
  const navigate = useNavigate();
  const { currentUser, refreshOnboarding } = useAuth();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<OnboardingState>({
    currentStepIndex: 0,
    answers: {},
    selectedPersona: null,
    isSaving: false,
    saveError: null,
    isCompleting: false,
    isCompleted: false,
    completionAnimating: false,
    direction: 'forward',
  });

  // Derive active persona from authoritative user role first, then fallback to questionnaire choice
  const effectiveRole = currentUser?.role || state.selectedPersona || 'customer';
  const visibleSteps = getStepsForRole(effectiveRole);
  const totalSteps = visibleSteps.length;
  const currentStep = visibleSteps[state.currentStepIndex] ?? null;
  const isLastStep = state.currentStepIndex >= totalSteps - 1;
  const progress = totalSteps > 0 ? ((state.currentStepIndex + 1) / (totalSteps + 1)) * 100 : 0;

  /** Save progress to Supabase and local cache */
  const saveProgress = useCallback(
    async (answers: OnboardingAnswers, persona: OnboardingPersona | null, completed = false) => {
      if (!currentUser?.id) return;

      try {
        setState((s) => ({ ...s, isSaving: true, saveError: null }));

        const result = await saveOnboardingData({
          userId: currentUser.id,
          role: currentUser.role || persona || 'customer',
          answers,
          markCompleted: completed,
          currentStep: state.currentStepIndex + 1,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to save onboarding responses');
        }

        if (completed && refreshOnboarding) {
          await refreshOnboarding();
        }
      } catch (err: any) {
        console.error('Failed to save onboarding progress:', err);
        setState((s) => ({
          ...s,
          saveError: err.message ?? 'Failed to save your answers. Please try again.',
        }));
        throw err;
      } finally {
        setState((s) => ({ ...s, isSaving: false }));
      }
    },
    [currentUser, refreshOnboarding]
  );

  /** Debounced auto-save for partial progress */
  const scheduleSave = useCallback(
    (answers: OnboardingAnswers, persona: OnboardingPersona | null) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveProgress(answers, persona, false).catch(() => {});
      }, SAVE_DEBOUNCE_MS);
    },
    [saveProgress]
  );

  /** Set an answer for a specific question */
  const setAnswer = useCallback(
    (questionId: string, value: string | string[] | null) => {
      setState((s) => {
        const newAnswers = { ...s.answers, [questionId]: value };

        const newPersona =
          questionId === 'persona' ? (value as OnboardingPersona) : s.selectedPersona;

        scheduleSave(newAnswers, newPersona);

        return {
          ...s,
          answers: newAnswers,
          selectedPersona: newPersona,
        };
      });
    },
    [scheduleSave]
  );

  /** Validate current step — returns error message or null */
  const validateCurrentStep = useCallback((): string | null => {
    if (!currentStep) return null;

    for (const question of currentStep.questions) {
      if (!question.required) continue;

      const isVisible = !question.showForPersonas
        ? true
        : Array.isArray(question.showForPersonas)
        ? question.showForPersonas.includes(effectiveRole as any)
        : question.showForPersonas === effectiveRole;

      if (!isVisible) continue;

      const answer = state.answers[question.id];

      if (
        answer === null ||
        answer === undefined ||
        answer === '' ||
        (Array.isArray(answer) && answer.length === 0)
      ) {
        return `Please answer: "${question.label}"`;
      }

      if (question.multiSelect && question.minSelections) {
        const arr = Array.isArray(answer) ? answer : [answer];
        if (arr.length < question.minSelections) {
          return `Please select at least ${question.minSelections} option(s) for: "${question.label}"`;
        }
      }
    }

    return null;
  }, [currentStep, state.answers, effectiveRole]);

  /** Complete onboarding and persist to database */
  const completeOnboarding = useCallback(async () => {
    try {
      setState((s) => ({ ...s, isCompleting: true }));
      await saveProgress(state.answers, state.selectedPersona, true);
      setState((s) => ({
        ...s,
        isCompleting: false,
        isCompleted: true,
        completionAnimating: true,
      }));

      // Navigate after completion animation to role landing route
      setTimeout(() => {
        const destination = getRoleLandingRoute(currentUser?.role);
        navigate(destination, { replace: true });
      }, 2400);
    } catch {
      setState((s) => ({ ...s, isCompleting: false }));
    }
  }, [saveProgress, state.answers, state.selectedPersona, currentUser, navigate]);

  /** Navigate forward to the next step or review */
  const goNext = useCallback(async () => {
    // Only validate if on a question step
    if (state.currentStepIndex < totalSteps) {
      const validationError = validateCurrentStep();
      if (validationError) {
        setState((s) => ({ ...s, saveError: validationError }));
        return;
      }
    }

    setState((s) => ({ ...s, saveError: null, direction: 'forward' }));

    if (state.currentStepIndex >= totalSteps) {
      // In review step, complete
      await completeOnboarding();
    } else {
      // Advance to next step (if on last question step, advances to totalSteps = review phase)
      setState((s) => ({
        ...s,
        currentStepIndex: s.currentStepIndex + 1,
      }));
    }
  }, [
    state.currentStepIndex,
    totalSteps,
    validateCurrentStep,
    completeOnboarding,
  ]);

  /** Navigate backward to the previous step */
  const goBack = useCallback(() => {
    setState((s) => ({
      ...s,
      saveError: null,
      direction: 'backward',
      currentStepIndex: Math.max(0, s.currentStepIndex - 1),
    }));
  }, []);

  /** Skip the current optional step */
  const skipStep = useCallback(() => {
    setState((s) => ({
      ...s,
      saveError: null,
      direction: 'forward',
      currentStepIndex: Math.min(s.currentStepIndex + 1, totalSteps - 1),
    }));
  }, [totalSteps]);

  /** Load previously saved progress from Supabase & local cache */
  const loadSavedProgress = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const loaded = await loadOnboardingData(currentUser.id);
      if (loaded && loaded.answers && Object.keys(loaded.answers).length > 0) {
        setState((s) => ({
          ...s,
          answers: loaded.answers,
          selectedPersona: loaded.persona || (currentUser.role as OnboardingPersona) || null,
        }));
      }
    } catch (err) {
      console.warn('Could not load saved onboarding progress:', err);
    }
  }, [currentUser]);

  // Auto-load on mount or user change
  useEffect(() => {
    if (currentUser?.id) {
      loadSavedProgress();
    }
  }, [currentUser?.id, loadSavedProgress]);

  return {
    state,
    visibleSteps,
    currentStep,
    totalSteps,
    isLastStep,
    progress,
    setAnswer,
    goNext,
    goBack,
    skipStep,
    completeOnboarding,
    validateCurrentStep,
    loadSavedProgress,
  };
}
