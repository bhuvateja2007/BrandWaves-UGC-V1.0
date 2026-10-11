import React from 'react';
import type { OnboardingAnswers, OnboardingPersona } from '../../lib/onboardingTypes';
import { getStepsForPersona, getQuestionsForPersona } from '../../lib/onboardingQuestions';
import { Edit3 } from 'lucide-react';

const PERSONA_LABELS: Record<OnboardingPersona, { label: string; emoji: string }> = {
  creator: { label: 'Creator / Influencer', emoji: '🎨' },
  brand: { label: 'Brand Owner / Business', emoji: '🏢' },
  student: { label: 'Student', emoji: '🎓' },
  developer: { label: 'Developer / Technical', emoji: '💻' },
  educator: { label: 'Educator / Trainer', emoji: '📚' },
  marketing: { label: 'Marketing / Agency', emoji: '📊' },
  other: { label: 'Other', emoji: '✨' },
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
  const steps = getStepsForPersona(persona).slice(1); // Skip persona step itself

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
            return opt ? `${opt.emoji ?? ''} ${opt.label}`.trim() : v;
          })
          .join(', ');
      } else {
        const opt = q.options?.find((o) => o.value === ans);
        displayValue = opt ? `${opt.emoji ?? ''} ${opt.label}`.trim() : (ans as string);
      }

      summaryItems.push({ label: q.label, value: displayValue });
    }
  }

  return (
    <div className="space-y-6">
      {/* Persona badge */}
      {personaMeta && (
        <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/20">
          <span className="text-3xl" aria-hidden="true">{personaMeta.emoji}</span>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Your Role</p>
            <p className="text-white font-bold text-base">{personaMeta.label}</p>
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
            <span>Create my experience ✨</span>
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
