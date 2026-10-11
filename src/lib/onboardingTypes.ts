// ===========================================================================
// BRANDWAVES ONBOARDING TYPES
// Typed question/answer engine for the adaptive multi-step onboarding wizard.
// Persona types are UX personalization labels — NOT authorization roles.
// ===========================================================================

/** All supported onboarding personas (UX labels only, not DB roles) */
export type OnboardingPersona =
  | 'creator'
  | 'brand'
  | 'student'
  | 'developer'
  | 'educator'
  | 'marketing'
  | 'other';

/** Shape of an individual answer — single or multi-select */
export type AnswerValue = string | string[] | null;

/** All collected answers, keyed by question ID */
export type OnboardingAnswers = Record<string, AnswerValue>;

/** Selection card option */
export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  icon?: string; // lucide icon name or emoji
  emoji?: string;
}

/** The type of input to render for a question step */
export type QuestionInputType =
  | 'persona_cards'  // Large icon cards (Step 1 only)
  | 'chips'          // Small pill chips (multi or single)
  | 'cards'          // Smaller selection cards
  | 'text'           // Free text input
  | 'url'            // URL input
  | 'textarea';      // Multi-line text

/** Role conditions for showing a question */
export type PersonaCondition = OnboardingPersona | OnboardingPersona[];

/** A single onboarding question */
export interface OnboardingQuestion {
  id: string;
  stepId: string;
  label: string;          // Main question text
  description?: string;  // Supporting text beneath the question
  inputType: QuestionInputType;
  options?: QuestionOption[];
  multiSelect?: boolean;  // Allow multiple selections (default: false)
  required?: boolean;     // Whether an answer is required to proceed
  placeholder?: string;  // For text/url inputs
  /** Which personas see this question. Undefined = shown to all */
  showForPersonas?: PersonaCondition;
  /** Min selections required for multi-select */
  minSelections?: number;
  /** Max selections allowed for multi-select */
  maxSelections?: number;
}

/** A step in the wizard */
export interface OnboardingStep {
  id: string;
  title: string;
  subtitle?: string;
  questions: OnboardingQuestion[];
  /** Which personas see this step. Undefined = shown to all */
  showForPersonas?: PersonaCondition;
}

/** State managed by useOnboarding hook */
export interface OnboardingState {
  currentStepIndex: number;
  answers: OnboardingAnswers;
  selectedPersona: OnboardingPersona | null;
  isSaving: boolean;
  saveError: string | null;
  isCompleting: boolean;
  isCompleted: boolean;
  completionAnimating: boolean;
  direction: 'forward' | 'backward';
}

/** Persisted onboarding record from Supabase */
export interface OnboardingPreferences {
  onboarding_completed: boolean;
  onboarding_persona: string | null;
  onboarding_answers: OnboardingAnswers;
  onboarding_completed_at: string | null;
}
