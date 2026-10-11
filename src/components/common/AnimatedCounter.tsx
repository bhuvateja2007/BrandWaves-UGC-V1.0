import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  formatFn?: (val: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 750,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  formatFn,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const prefersReducedMotion = useReducedMotion();
  const prevValueRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // If reduced motion is requested, instantly set the target value without animation
    if (prefersReducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current;
    const targetValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (targetValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        prevValueRef.current = targetValue;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, prefersReducedMotion]);

  const formatted = formatFn
    ? formatFn(displayValue)
    : decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={`tabular-nums font-inherit ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
