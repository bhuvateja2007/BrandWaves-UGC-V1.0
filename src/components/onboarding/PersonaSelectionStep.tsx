import React, { useCallback } from 'react';
import type { QuestionOption } from '../../lib/onboardingTypes';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface PersonaCardProps {
  option: QuestionOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

/**
 * Single large persona selection card.
 * Handles keyboard navigation, ripple effect, and selected state.
 */
const PersonaCard: React.FC<PersonaCardProps> = ({ option, isSelected, onSelect }) => {
  const reducedMotion = useReducedMotion();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Ripple from click point
      if (!reducedMotion) {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        ripple.className = 'ripple-effect';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }
      onSelect(option.value);
    },
    [option.value, onSelect, reducedMotion]
  );

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(option.value);
        }
      }}
      className={`
        ripple-surface relative w-full text-left rounded-2xl border transition-all duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
        ${isSelected
          ? 'persona-card-selected bg-white/20 border-brand-blue/70 shadow-[0_0_20px_rgba(63,114,175,0.2),0_4px_16px_rgba(17,45,78,0.15)] -translate-y-1'
          : 'persona-card-idle bg-white/8 border-white/20 hover:bg-white/13 hover:border-white/35 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(17,45,78,0.12)]'
        }
      `}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="p-4 sm:p-5 flex flex-col gap-2.5">
        {/* Emoji icon */}
        <span
          className={`text-3xl select-none transition-transform duration-300 ${
            isSelected ? 'scale-110' : ''
          }`}
          aria-hidden="true"
        >
          {option.emoji}
        </span>

        {/* Label */}
        <div>
          <p className={`font-bold text-sm leading-tight transition-colors duration-200 ${
            isSelected ? 'text-white' : 'text-white/90'
          }`}>
            {option.label}
          </p>
          {option.description && (
            <p className="text-xs text-white/55 mt-1 leading-snug">{option.description}</p>
          )}
        </div>

        {/* Selected indicator dot */}
        <div
          className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isSelected
              ? 'bg-brand-blue border-brand-blue scale-100 opacity-100'
              : 'bg-transparent border-white/30 scale-75 opacity-0'
          }`}
          aria-hidden="true"
        >
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
            <path
              d="M1.5 5l2.5 2.5L8.5 2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </button>
  );
};

interface PersonaSelectionStepProps {
  selectedPersona: string | null;
  onSelect: (value: string) => void;
}

/**
 * Step 1: Persona selection — shows 7 large glass cards.
 * Single selection (radio behavior). Keyboard navigable grid.
 */
export const PersonaSelectionStep: React.FC<PersonaSelectionStepProps> = ({
  selectedPersona,
  onSelect,
}) => {
  // Import options from the question config
  const personaOptions: QuestionOption[] = [
    { value: 'creator', label: 'Creator / Influencer', description: 'I create content and collaborate with brands.', emoji: '🎨' },
    { value: 'brand', label: 'Brand Owner / Business', description: 'I want to promote my brand and launch campaigns.', emoji: '🏢' },
    { value: 'student', label: 'Student', description: "I'm learning, building my portfolio and exploring opportunities.", emoji: '🎓' },
    { value: 'developer', label: 'Developer / Technical', description: 'I build products, tools or digital experiences.', emoji: '💻' },
    { value: 'educator', label: 'Educator / Trainer', description: 'I teach, mentor or create educational content.', emoji: '📚' },
    { value: 'marketing', label: 'Marketing / Agency', description: 'I manage campaigns, audiences or brand growth.', emoji: '📊' },
    { value: 'other', label: 'Other', description: 'My role is different.', emoji: '✨' },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Select your role"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
    >
      {personaOptions.map((option, i) => (
        <div
          key={option.value}
          className="onboarding-card-stagger"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <PersonaCard
            option={option}
            isSelected={selectedPersona === option.value}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
};
