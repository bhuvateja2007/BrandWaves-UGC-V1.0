import React, { useRef, useState, useCallback } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface MotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  magnetic?: boolean;
  ripple?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

interface RippleData {
  x: number;
  y: number;
  size: number;
  id: number;
}

export const MotionButton: React.FC<MotionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  magnetic = false,
  ripple = true,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  onClick,
  onMouseMove,
  onMouseLeave,
  children,
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [magneticOffset, setMagneticOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  // Create localized ripple on click
  const triggerRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || prefersReducedMotion || disabled || loading) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple: RippleData = {
      x,
      y,
      size,
      id: Date.now() + Math.random(),
    };

    setRipples((prev) => [...prev.slice(-3), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 500);
  }, [ripple, prefersReducedMotion, disabled, loading]);

  // Subtle magnetic attraction for desktop pointer
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || prefersReducedMotion || disabled || loading) return;

    // Check if device supports fine hover (not touch)
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Max 3px movement for subtle, non-intrusive tactile pull
    const deltaX = (e.clientX - centerX) * 0.12;
    const deltaY = (e.clientY - centerY) * 0.12;
    const clampedX = Math.max(-3, Math.min(3, deltaX));
    const clampedY = Math.max(-3, Math.min(3, deltaY));

    setMagneticOffset({ x: clampedX, y: clampedY });

    if (onMouseMove) onMouseMove(e);
  }, [magnetic, prefersReducedMotion, disabled, loading, onMouseMove]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setMagneticOffset({ x: 0, y: 0 });
    if (onMouseLeave) onMouseLeave(e);
  }, [onMouseLeave]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerRipple(e);
    if (onClick) onClick(e);
  };

  // Keyboard Enter / Space ripple trigger
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !loading && !prefersReducedMotion && ripple) {
      const button = buttonRef.current;
      if (button) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.5;
        const newRipple: RippleData = {
          x: rect.width / 2 - size / 2,
          y: rect.height / 2 - size / 2,
          size,
          id: Date.now(),
        };
        setRipples((prev) => [...prev.slice(-3), newRipple]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 500);
      }
    }
    if (rest.onKeyDown) rest.onKeyDown(e);
  };

  // Size styling
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base rounded-xl gap-2.5',
  }[size];

  // Variant styling adhering to BrandWaves palette
  const variantClasses = {
    primary:
      'bg-[#3F72AF] hover:bg-[#112D4E] text-white border border-transparent shadow-xs btn-glow',
    secondary:
      'bg-[#112D4E] hover:bg-[#112D4E]/90 text-white border border-transparent shadow-xs btn-glow',
    outline:
      'bg-white hover:bg-[#F9F7F7] text-[#112D4E] border border-[#DBE2EF] hover:border-[#3F72AF]/40 shadow-2xs',
    ghost:
      'bg-transparent hover:bg-[#DBE2EF]/50 text-[#112D4E] border border-transparent',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent shadow-xs',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white border border-transparent shadow-xs',
  }[variant];

  const transformStyle = magnetic && !prefersReducedMotion && (magneticOffset.x !== 0 || magneticOffset.y !== 0)
    ? { transform: `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0)` }
    : undefined;

  return (
    <button
      ref={buttonRef}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      style={transformStyle}
      className={`relative overflow-hidden inline-flex items-center justify-center font-bold tracking-tight select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none btn-tactile ${sizeClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {/* Ripple elements */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-effect"
          style={{
            left: `${r.x}px`,
            top: `${r.y}px`,
            width: `${r.size}px`,
            height: `${r.size}px`,
          }}
        />
      ))}

      {/* Loading state indicator */}
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="truncate">{children}</span>
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
