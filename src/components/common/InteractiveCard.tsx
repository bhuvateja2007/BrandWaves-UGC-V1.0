import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'article' | 'div' | 'section';
  hoverLift?: boolean;
  borderHighlight?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  as: Component = 'div',
  hoverLift = true,
  borderHighlight = true,
  className = '',
  children,
  ...rest
}) => {
  const prefersReducedMotion = useReducedMotion();

  const motionClass = !prefersReducedMotion && hoverLift ? 'card-interactive' : '';
  const borderClass = borderHighlight ? 'hover:border-[#3F72AF]/40' : '';

  return (
    <Component
      className={`rounded-2xl border border-[#DBE2EF] bg-white transition-all shadow-subtle ${motionClass} ${borderClass} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};
