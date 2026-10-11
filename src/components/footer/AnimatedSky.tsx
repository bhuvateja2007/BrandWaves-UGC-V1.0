import React from 'react';

/**
 * AnimatedSky — Atmospheric Sky-Blue Layer
 * 
 * Features:
 * - Restrained BrandWaves atmospheric sky palette:
 *   #87CEEB (Sky Blue), #BFE8FA (Light Sky), #DDF3FC (Atmospheric Blue)
 * - Soft layered parallax clouds drifting independently
 * - Soft sun / horizon ambient glow
 * - Seamless looping without visible snaps
 * - Honors prefers-reduced-motion
 */
export const AnimatedSky: React.FC = () => {
  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* 1. Base Atmospheric Sky Gradient (Soft porcelain -> pale atmospheric blue -> subtle sky blue) */}
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#F9F7F7] via-[#DDF3FC]/80 via-[#BFE8FA]/70 via-[#87CEEB]/55 to-[#F9F7F7]"
      />

      {/* 2. Soft Atmospheric Ambient Sun Glow */}
      <div 
        className="absolute top-[-10%] right-[25%] w-[500px] h-[350px] rounded-full bg-white/45 blur-[80px]"
      />
      <div 
        className="absolute top-[15%] left-[10%] w-[400px] h-[250px] rounded-full bg-white/30 blur-[90px]"
      />

      {/* 3. Deep Parallax Cloud Layer 1 (Far, High, Slowest) */}
      <div className="absolute inset-0 w-full h-full opacity-60 overflow-hidden">
        <div className="cloud-drift-slow flex w-[200%] h-full">
          <svg 
            className="w-1/2 h-44 mt-6 text-white/50 shrink-0" 
            viewBox="0 0 1200 180" 
            fill="currentColor"
            preserveAspectRatio="none"
          >
            <path d="M150 90 Q 220 30, 310 70 Q 380 20, 470 60 Q 560 30, 640 80 Q 720 40, 810 75 Q 920 25, 1020 85 Q 1120 40, 1200 90 L 1200 180 L 0 180 L 0 90 Z" />
          </svg>
          <svg 
            className="w-1/2 h-44 mt-6 text-white/50 shrink-0" 
            viewBox="0 0 1200 180" 
            fill="currentColor"
            preserveAspectRatio="none"
          >
            <path d="M150 90 Q 220 30, 310 70 Q 380 20, 470 60 Q 560 30, 640 80 Q 720 40, 810 75 Q 920 25, 1020 85 Q 1120 40, 1200 90 L 1200 180 L 0 180 L 0 90 Z" />
          </svg>
        </div>
      </div>

      {/* 4. Midground Parallax Cloud Layer 2 (Mid-depth, Fluid Billows) */}
      <div className="absolute inset-0 w-full h-full opacity-75 overflow-hidden">
        <div className="cloud-drift-mid flex w-[200%] h-full">
          <svg 
            className="w-1/2 h-48 mt-16 text-white/70 shrink-0" 
            viewBox="0 0 1400 200" 
            fill="currentColor"
            preserveAspectRatio="none"
          >
            <path d="M0 120 C 120 70, 200 60, 280 100 C 360 50, 480 40, 580 90 C 680 50, 780 45, 880 95 C 980 55, 1100 45, 1220 90 C 1320 60, 1380 80, 1400 110 L 1400 200 L 0 200 Z" />
          </svg>
          <svg 
            className="w-1/2 h-48 mt-16 text-white/70 shrink-0" 
            viewBox="0 0 1400 200" 
            fill="currentColor"
            preserveAspectRatio="none"
          >
            <path d="M0 120 C 120 70, 200 60, 280 100 C 360 50, 480 40, 580 90 C 680 50, 780 45, 880 95 C 980 55, 1100 45, 1220 90 C 1320 60, 1380 80, 1400 110 L 1400 200 L 0 200 Z" />
          </svg>
        </div>
      </div>

      {/* 5. Near Horizon Mist Layer 3 (Softest, Atmospheric Baseline Blend) */}
      <div className="absolute inset-x-0 bottom-0 h-40 w-full overflow-hidden opacity-90">
        <div className="cloud-drift-fast flex w-[200%] h-full">
          <svg 
            className="w-1/2 h-36 mt-4 text-[#F9F7F7]/85 shrink-0" 
            viewBox="0 0 1600 160" 
            fill="currentColor"
            preserveAspectRatio="none"
          >
            <path d="M0 90 Q 200 40, 400 75 Q 600 30, 800 70 Q 1000 35, 1200 65 Q 1400 30, 1600 80 L 1600 160 L 0 160 Z" />
          </svg>
          <svg 
            className="w-1/2 h-36 mt-4 text-[#F9F7F7]/85 shrink-0" 
            viewBox="0 0 1600 160" 
            fill="currentColor"
            preserveAspectRatio="none"
          >
            <path d="M0 90 Q 200 40, 400 75 Q 600 30, 800 70 Q 1000 35, 1200 65 Q 1400 30, 1600 80 L 1600 160 L 0 160 Z" />
          </svg>
        </div>
      </div>

      {/* 6. Soft Pale Horizon Gradient Fade into Porcelain (#F9F7F7) */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F9F7F7] via-[#F9F7F7]/70 to-transparent" />

      {/* Custom Keyframe Styles */}
      <style>{`
        @keyframes cloudDriftSlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes cloudDriftMid {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes cloudDriftFast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .cloud-drift-slow {
          animation: cloudDriftSlow 120s linear infinite;
        }
        .cloud-drift-mid {
          animation: cloudDriftMid 75s linear infinite;
        }
        .cloud-drift-fast {
          animation: cloudDriftFast 45s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .cloud-drift-slow,
          .cloud-drift-mid,
          .cloud-drift-fast {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
