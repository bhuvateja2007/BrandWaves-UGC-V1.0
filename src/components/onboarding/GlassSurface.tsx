import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface GlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  /** Animate a liquid highlight sweep on mount */
  animateHighlight?: boolean;
  /** Extra padding variant */
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable liquid-glass surface panel.
 * Provides: semi-transparent bg, fine border, backdrop blur,
 * inner highlight, ambient shadow, and optional highlight sweep.
 *
 * Falls back gracefully when backdrop-filter is not supported:
 * the bg is opaque enough to remain readable without blur.
 */
export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  className = '',
  animateHighlight = false,
  padding = 'lg',
}) => {
  const highlightRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Trigger the liquid highlight sweep after mount
  useEffect(() => {
    if (!animateHighlight || reducedMotion) return;
    const el = highlightRef.current;
    if (!el) return;

    const delay = setTimeout(() => {
      el.classList.add('glass-highlight-sweep-active');
      const cleanup = () => {
        el.classList.remove('glass-highlight-sweep-active');
        el.removeEventListener('animationend', cleanup);
      };
      el.addEventListener('animationend', cleanup);

      // Repeat occasionally
      const interval = setInterval(() => {
        el.classList.add('glass-highlight-sweep-active');
        const ic = () => {
          el.classList.remove('glass-highlight-sweep-active');
          el.removeEventListener('animationend', ic);
        };
        el.addEventListener('animationend', ic);
      }, 8000);

      return () => clearInterval(interval);
    }, 600);

    return () => clearTimeout(delay);
  }, [animateHighlight, reducedMotion]);

  const paddingClass = {
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-8 sm:p-10',
  }[padding];

  return (
    <div className={`glass-surface ${paddingClass} ${className}`}>
      {/* Inner top highlight line */}
      <div className="glass-inner-highlight" aria-hidden="true" />
      {/* Liquid sweep highlight */}
      {animateHighlight && (
        <div ref={highlightRef} className="glass-highlight-sweep" aria-hidden="true" />
      )}
      {children}
    </div>
  );
};
