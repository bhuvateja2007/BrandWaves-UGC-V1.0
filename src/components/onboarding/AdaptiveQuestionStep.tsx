import React from 'react';
import type { OnboardingQuestion, OnboardingStep, AnswerValue } from '../../lib/onboardingTypes';
import { getQuestionsForPersona } from '../../lib/onboardingQuestions';

interface AdaptiveQuestionStepProps {
  step: OnboardingStep;
  persona: string | null;
  answers: Record<string, AnswerValue>;
  onAnswer: (questionId: string, value: AnswerValue) => void;
}

import { OnboardingIcon } from './OnboardingIcon';

// ---------------------------------------------------------------------------
// Chip (single or multi-select pill)
// ---------------------------------------------------------------------------
interface ChipProps {
  option: { value: string; label: string; icon?: string };
  isSelected: boolean;
  onToggle: () => void;
  multiSelect: boolean;
}

const Chip: React.FC<ChipProps> = ({ option, isSelected, onToggle, multiSelect }) => (
  <button
    type="button"
    role={multiSelect ? 'checkbox' : 'radio'}
    aria-checked={isSelected}
    onClick={onToggle}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
    className={`
      inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold
      border transition-all duration-200 focus-visible:outline-none
      focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-1
      ${isSelected
        ? 'bg-brand-blue/90 border-brand-blue text-white shadow-[0_0_12px_rgba(63,114,175,0.3)]'
        : 'bg-white/10 border-white/25 text-white/80 hover:bg-white/18 hover:border-white/40'
      }
    `}
    style={{ WebkitTapHighlightColor: 'transparent' }}
  >
    {option.icon && <OnboardingIcon name={option.icon} className="w-3.5 h-3.5 text-current" />}
    <span>{option.label}</span>
  </button>
);

// ---------------------------------------------------------------------------
// Selection Card (smaller than persona cards)
// ---------------------------------------------------------------------------
interface SelectionCardProps {
  option: { value: string; label: string; description?: string; icon?: string };
  isSelected: boolean;
  onSelect: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ option, isSelected, onSelect }) => (
  <button
    type="button"
    role="radio"
    aria-checked={isSelected}
    onClick={onSelect}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
    className={`
      w-full text-left p-4 rounded-xl border transition-all duration-250
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue
      ${isSelected
        ? 'bg-white/18 border-brand-blue/60 shadow-[0_0_16px_rgba(63,114,175,0.18)] -translate-y-0.5'
        : 'bg-white/8 border-white/18 hover:bg-white/13 hover:border-white/30'
      }
    `}
    style={{ WebkitTapHighlightColor: 'transparent' }}
  >
    <div className="flex items-start gap-3">
      {option.icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isSelected ? 'bg-brand-blue text-white' : 'bg-white/10 text-white/70'
        }`}>
          <OnboardingIcon name={option.icon} className="w-4 h-4" />
        </div>
      )}
      <div>
        <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-white/85'}`}>
          {option.label}
        </p>
        {option.description && (
          <p className="text-xs text-white/50 mt-0.5 leading-snug">{option.description}</p>
        )}
      </div>
      {/* Radio dot */}
      <div className={`ml-auto mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
        isSelected ? 'bg-brand-blue border-brand-blue' : 'bg-transparent border-white/30'
      }`} aria-hidden="true" />
    </div>
  </button>
);

// ---------------------------------------------------------------------------
// Single Question Renderer
// ---------------------------------------------------------------------------
interface QuestionRendererProps {
  question: OnboardingQuestion;
  answer: AnswerValue;
  onAnswer: (value: AnswerValue) => void;
  index: number;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, answer, onAnswer, index }) => {
  const handleChipToggle = (value: string) => {
    if (question.multiSelect) {
      const current = Array.isArray(answer) ? answer : [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onAnswer(updated);
    } else {
      onAnswer(answer === value ? null : value);
    }
  };

  const isChipSelected = (value: string) => {
    if (Array.isArray(answer)) return answer.includes(value);
    return answer === value;
  };

  return (
    <div
      className="onboarding-question-enter space-y-4"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
          {question.label}
          {question.required && (
            <span className="text-brand-blue ml-1" aria-label="required">*</span>
          )}
        </h3>
        {question.description && (
          <p className="text-sm text-white/60 mt-1">{question.description}</p>
        )}
      </div>

      {/* CHIPS */}
      {(question.inputType === 'chips') && question.options && (
        <div
          role={question.multiSelect ? 'group' : 'radiogroup'}
          aria-label={question.label}
          className="flex flex-wrap gap-2"
        >
          {question.options.map((opt) => (
            <Chip
              key={opt.value}
              option={opt}
              isSelected={isChipSelected(opt.value)}
              onToggle={() => handleChipToggle(opt.value)}
              multiSelect={question.multiSelect ?? false}
            />
          ))}
        </div>
      )}

      {/* CARDS */}
      {question.inputType === 'cards' && question.options && (
        <div
          role="radiogroup"
          aria-label={question.label}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
        >
          {question.options.map((opt) => (
            <SelectionCard
              key={opt.value}
              option={opt}
              isSelected={answer === opt.value}
              onSelect={() => onAnswer(answer === opt.value ? null : opt.value)}
            />
          ))}
        </div>
      )}

      {/* TEXT INPUT */}
      {question.inputType === 'text' && (
        <input
          type="text"
          value={typeof answer === 'string' ? answer : ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={question.placeholder}
          className="glass-input w-full"
          aria-label={question.label}
          aria-required={question.required}
        />
      )}

      {/* URL INPUT */}
      {question.inputType === 'url' && (
        <input
          type="url"
          value={typeof answer === 'string' ? answer : ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={question.placeholder}
          className="glass-input w-full"
          aria-label={question.label}
          aria-required={question.required}
        />
      )}

      {/* TEXTAREA */}
      {question.inputType === 'textarea' && (
        <textarea
          value={typeof answer === 'string' ? answer : ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="glass-input w-full resize-none"
          aria-label={question.label}
          aria-required={question.required}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Step Component
// ---------------------------------------------------------------------------
export const AdaptiveQuestionStep: React.FC<AdaptiveQuestionStepProps> = ({
  step,
  persona,
  answers,
  onAnswer,
}) => {
  const visibleQuestions = getQuestionsForPersona(step.questions, persona);

  return (
    <div className="space-y-8">
      {visibleQuestions.map((question, i) => (
        <QuestionRenderer
          key={question.id}
          question={question}
          answer={answers[question.id] ?? null}
          onAnswer={(value) => onAnswer(question.id, value)}
          index={i}
        />
      ))}
    </div>
  );
};
