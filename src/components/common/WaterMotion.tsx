import React, { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/* ============================================================================
   WATER WAVE DIVIDER (Organic SVG wave connecting sections)
   ============================================================================ */
interface WaterWaveDividerProps {
  className?: string;
  inverted?: boolean;
  color?: string; // hex or tailwind class
  height?: number;
}

export const WaterWaveDivider: React.FC<WaterWaveDividerProps> = ({
  className = '',
  inverted = false,
  color = '#DBE2EF',
  height = 48,
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`relative w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        className={`w-[200%] h-full text-[${color}] fill-current ${
          inverted ? 'rotate-180' : ''
        } ${reducedMotion ? '' : 'animate-cloud-slow'}`}
        viewBox="0 0 2400 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,45 C300,85 600,10 900,45 C1200,80 1500,15 1800,50 C2100,85 2400,20 2700,50 L2700,120 L0,120 Z"
          fill={color}
          fillOpacity="0.45"
        />
        <path
          d="M0,65 C320,25 640,95 960,60 C1280,25 1600,90 1920,55 C2240,20 2560,85 2880,55 L2880,120 L0,120 Z"
          fill={color}
          fillOpacity="0.75"
        />
      </svg>
    </div>
  );
};

/* ============================================================================
   WATER WAVE PROGRESS (Liquid progress bar with undulating crest for milestones)
   ============================================================================ */
interface WaterWaveProgressProps {
  value: number; // 0 to 100
  label?: string;
  milestoneText?: string;
  className?: string;
}

export const WaterWaveProgress: React.FC<WaterWaveProgressProps> = ({
  value,
  label,
  milestoneText,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const reducedMotion = useReducedMotion();

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || milestoneText) && (
        <div className="flex items-center justify-between text-xs font-semibold text-[#112D4E]">
          <span>{label}</span>
          <span className="font-mono text-[#3F72AF] font-bold">{milestoneText || `${clamped}%`}</span>
        </div>
      )}

      {/* Progress track */}
      <div className="relative h-3 w-full bg-[#DBE2EF]/60 rounded-full overflow-hidden p-0.5 border border-[#DBE2EF]">
        {/* Animated fluid fill */}
        <div
          className="h-full rounded-full relative overflow-hidden transition-all duration-700 ease-out"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, #3F72AF 0%, #73B8D8 50%, #3F72AF 100%)',
            backgroundSize: '200% 100%',
          }}
        >
          {/* Wave specular crest line */}
          {!reducedMotion && (
            <div
              className="absolute inset-0 opacity-60 animate-shimmer"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   WATER REVEAL CONTAINER
   Desktop: Smooth Left-to-Right wave sweep (450ms–650ms)
   Mobile: Fluid Top-to-Bottom cascade (320ms–480ms)
   ============================================================================ */
interface WaterRevealProps {
  children: React.ReactNode;
  triggerKey?: string | number;
  className?: string;
  delayMs?: number;
}

export const WaterReveal: React.FC<WaterRevealProps> = ({
  children,
  triggerKey,
  className = '',
  delayMs = 0,
}) => {
  const reducedMotion = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setIsRevealed(true);
      return;
    }

    setIsRevealed(false);
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, delayMs + 30);

    return () => clearTimeout(timer);
  }, [triggerKey, reducedMotion, delayMs]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Content wrapper with directional fluid reveal */}
      <div
        className={`transition-all duration-500 ease-out ${
          isRevealed
            ? 'opacity-100 translate-x-0 translate-y-0'
            : 'opacity-0 md:-translate-x-4 max-md:-translate-y-4'
        }`}
      >
        {children}
      </div>

      {/* Fluid wave curtain sweep */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none transition-transform duration-600 ease-in-out z-20 ${
          isRevealed
            ? 'md:translate-x-full max-md:translate-y-full opacity-0'
            : 'translate-x-0 translate-y-0 opacity-100'
        }`}
        style={{
          background:
            'linear-gradient(135deg, rgba(231,242,248,0.85) 0%, rgba(115,184,216,0.65) 50%, rgba(63,114,175,0.75) 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />
    </div>
  );
};

/* ============================================================================
   WATER RIPPLE BUTTON (Interactive tactile button with water drop refraction)
   ============================================================================ */
interface WaterRippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const WaterRippleButton: React.FC<WaterRippleButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const reducedMotion = useReducedMotion();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!reducedMotion && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { x, y, id: Date.now() };

      setRipples((prev) => [...prev.slice(-3), newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 500);
    }

    if (onClick) onClick(e);
  };

  const variantStyles = {
    primary:
      'bg-[#112D4E] hover:bg-[#153D56] text-white shadow-md hover:shadow-lg border border-[#112D4E]/20',
    secondary:
      'bg-white hover:bg-[#F8FAFC] text-[#112D4E] border border-[#DCE5EB] shadow-xs hover:border-[#73B8D8]',
    ghost:
      'bg-transparent hover:bg-[#E7F2F8]/70 text-[#112D4E] border border-transparent',
  };

  return (
    <button
      ref={buttonRef}
      className={`relative overflow-hidden font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] focus:ring-offset-2 ${variantStyles[variant]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple water drop rings */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full pointer-events-none animate-ripple"
          style={{
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            backgroundColor:
              variant === 'primary' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(63, 114, 175, 0.25)',
          }}
        />
      ))}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};
