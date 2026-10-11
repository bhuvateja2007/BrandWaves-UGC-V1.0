import React from 'react';
import type { OnboardingAnswers, OnboardingPersona } from '../../lib/onboardingTypes';
import { getStepsForPersona, getQuestionsForPersona } from '../../lib/onboardingQuestions';
import { Edit3, CheckCircle } from 'lucide-react';
import { OnboardingIcon } from './OnboardingIcon';

const PERSONA_LABELS: Record<string, { label: string; icon: string }> = {
  customer: { label: 'Customer / Shopper', icon: 'shopping-bag' },
  creator: { label: 'Creator / Influencer', icon: 'camera' },
  brand: { label: 'Brand Owner / Business', icon: 'building' },
  student: { label: 'Student', icon: 'graduation-cap' },
  developer: { label: 'Developer / Technical', icon: 'code' },
  educator: { label: 'Educator / Trainer', icon: 'book-open' },
  marketing: { label: 'Marketing / Agency', icon: 'trending-up' },
  other: { label: 'Other', icon: 'sparkles' },
};

interface OnboardingSummaryProps {
  persona: OnboardingPersona | null;
  answers: OnboardingAnswers;
  onEdit: () => void;
  onComplete: () => void;
  isCompleting: boolean;
  error: string | null;
}

/**
 * Final review step — shows a summary of all collected answers
 * before the user confirms and saves.
 */
export const OnboardingSummary: React.FC<OnboardingSummaryProps> = ({
  persona,
  answers,
  onEdit,
  onComplete,
  isCompleting,
  error,
}) => {
  const personaMeta = persona ? PERSONA_LABELS[persona] : null;
  const steps = getStepsForPersona(persona);

  // Collect answer summaries
  const summaryItems: { label: string; value: string }[] = [];

  for (const step of steps) {
    const questions = getQuestionsForPersona(step.questions, persona);
    for (const q of questions) {
      if (q.inputType === 'persona_cards') continue;
      const ans = answers[q.id];
      if (!ans || (Array.isArray(ans) && ans.length === 0)) continue;

      // Find option labels
      let displayValue: string;
      if (Array.isArray(ans)) {
        displayValue = ans
          .map((v) => {
            const opt = q.options?.find((o) => o.value === v);
            return opt ? opt.label : v;
          })
          .join(', ');
      } else {
        const opt = q.options?.find((o) => o.value === ans);
        displayValue = opt ? opt.label : (ans as string);
      }

      summaryItems.push({ label: q.label, value: displayValue });
    }
  }

  return (
    <div className="space-y-6">
      {/* Persona badge */}
      {personaMeta && (
        <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/20">
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white">
            <OnboardingIcon name={personaMeta.icon} className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Your Selected Profile</p>
            <p className="text-base font-bold text-white">{personaMeta.label}</p>
          </div>
        </div>
      )}

      {/* Answer summary */}
      {summaryItems.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {summaryItems.map((item, i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-xs text-white/45 font-medium">{item.label}</p>
              <p className="text-sm text-white/85 font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/50 italic">No additional answers to display.</p>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/15 border border-red-400/30 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onComplete}
          disabled={isCompleting}
          className="w-full glass-btn-primary flex items-center justify-center gap-2"
        >
          {isCompleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating your experience...</span>
            </>
          ) : (
            <span>Complete Profile & Enter</span>
          )}
        </button>

        <button
          type="button"
          onClick={onEdit}
          disabled={isCompleting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          Edit answers
        </button>
      </div>
    </div>
  );
};
