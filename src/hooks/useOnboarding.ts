import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStepsForPersona } from '../lib/onboardingQuestions';
import type {
  OnboardingPersona,
  OnboardingAnswers,
  OnboardingState,
} from '../lib/onboardingTypes';

const SAVE_DEBOUNCE_MS = 1500;

export function useOnboarding() {
  const navigate = useNavigate();
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

  /** Computed: steps visible for the currently selected persona */
  const visibleSteps = getStepsForPersona(state.selectedPersona);
  const totalSteps = visibleSteps.length;
  const currentStep = visibleSteps[state.currentStepIndex] ?? null;
  const isLastStep = state.currentStepIndex >= totalSteps - 1;
  const progress = totalSteps > 0 ? ((state.currentStepIndex + 1) / (totalSteps + 1)) * 100 : 0;

  /** Save progress to Supabase (debounced for partial saves) */
  const saveProgress = useCallback(
    async (answers: OnboardingAnswers, persona: OnboardingPersona | null, completed = false) => {
      if (!isSupabaseConfigured) return;

      try {
        setState((s) => ({ ...s, isSaving: true, saveError: null }));

        const { error } = await supabase.rpc('upsert_onboarding_preferences', {
          p_persona: persona ?? '',
          p_answers: answers,
          p_completed: completed,
        });

        if (error) throw error;
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
    []
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

        // If answering the persona question, capture the selected persona
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

      // Filter for persona
      const isVisible = !question.showForPersonas
        ? true
        : Array.isArray(question.showForPersonas)
        ? question.showForPersonas.includes(state.selectedPersona as any)
        : question.showForPersonas === state.selectedPersona;

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
  }, [currentStep, state.answers, state.selectedPersona]);

  /** Navigate forward to the next step */
  const goNext = useCallback(async () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setState((s) => ({ ...s, saveError: validationError }));
      return;
    }

    setState((s) => ({ ...s, saveError: null, direction: 'forward' }));

    if (isLastStep) {
      // Final completion
      try {
        setState((s) => ({ ...s, isCompleting: true }));
        await saveProgress(state.answers, state.selectedPersona, true);
        setState((s) => ({
          ...s,
          isCompleting: false,
          isCompleted: true,
          completionAnimating: true,
        }));

        // Navigate after animation
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2800);
      } catch {
        setState((s) => ({ ...s, isCompleting: false }));
      }
    } else {
      // Recalculate visible steps based on potentially updated persona
      const newSteps = getStepsForPersona(
        state.answers['persona'] as OnboardingPersona | null ?? state.selectedPersona
      );
      const nextIndex = Math.min(state.currentStepIndex + 1, newSteps.length - 1);
      setState((s) => ({
        ...s,
        currentStepIndex: nextIndex,
        // Re-sync persona in case persona step was just completed
        selectedPersona:
          (s.answers['persona'] as OnboardingPersona | null) ?? s.selectedPersona,
      }));
    }
  }, [isLastStep, state.answers, state.selectedPersona, state.currentStepIndex, validateCurrentStep, saveProgress, navigate]);

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

  /** Load previously saved partial progress */
  const loadSavedProgress = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase.rpc('get_my_onboarding_status');
      if (error || !data || data.length === 0) return;

      const row = data[0];
      if (row.onboarding_answers && Object.keys(row.onboarding_answers).length > 0) {
        setState((s) => ({
          ...s,
          answers: row.onboarding_answers,
          selectedPersona: (row.onboarding_persona as OnboardingPersona) || null,
        }));
      }
    } catch (err) {
      console.error('Could not load saved onboarding progress:', err);
    }
  }, []);

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
    validateCurrentStep,
    loadSavedProgress,
  };
}
