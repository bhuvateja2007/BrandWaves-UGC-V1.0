import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Sparkles, Waves, ArrowRight, Droplets, CheckCircle2 } from 'lucide-react';
import { getFeaturedCreators } from '../../data/marketplaceData';

/* --------------------------------------------------------------------------
   ORGANIC SVG CLOUD FORMATIONS
   -------------------------------------------------------------------------- */

const CloudFormationA: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 360 140" className={className} fill="currentColor">
    <path d="M40,110 Q20,110 20,90 Q20,65 45,65 Q55,30 95,30 Q120,30 135,45 Q160,15 205,15 Q255,15 275,55 Q305,50 325,75 Q345,95 325,110 Z" />
  </svg>
);

const CloudFormationB: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 420 150" className={className} fill="currentColor">
    <path d="M50,120 Q15,120 15,95 Q15,70 45,70 Q55,40 90,40 Q115,40 130,55 Q165,20 220,20 Q275,20 300,60 Q340,55 365,85 Q390,110 365,120 Z" />
  </svg>
);

const CloudFormationC: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 280 110" className={className} fill="currentColor">
    <path d="M30,90 Q10,90 10,70 Q10,50 35,50 Q45,25 80,25 Q110,25 125,40 Q150,15 190,15 Q230,15 245,50 Q265,55 265,75 Q265,90 240,90 Z" />
  </svg>
);

/* --------------------------------------------------------------------------
   MAIN SKY-TO-OCEAN WATER-INSPIRED MOTION COMPONENT
   Replaces the disconnected black-and-white silhouette parade with a cohesive,
   fluid oceanic motion system that reinforces BrandWaves identity.
   -------------------------------------------------------------------------- */

export const SkyCommunityMotionSection: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const featuredCreators = getFeaturedCreators().slice(0, 5);
  const [activeRipple, setActiveRipple] = useState<number | null>(null);

  return (
    <section 
      className="relative w-full overflow-hidden select-none"
      aria-label="BrandWaves Ocean Motion and Creative Universe"
    >
      {/* =========================================================================
          LAYER 1: EXPANSIVE SKY-TO-OCEAN ATMOSPHERIC ENVIRONMENT
          Sky Palette: #78C3EB -> #C7EDFB -> #DDF3FC -> Ocean Wave Deep Blue
          ========================================================================= */}
      <div 
        className="relative min-h-[480px] sm:min-h-[560px] lg:min-h-[640px] flex flex-col justify-between"
        style={{
          background: 'linear-gradient(180deg, #68BCE8 0%, #98D3F2 20%, #C4ECFA 42%, #E1F4FC 64%, #F2FAFE 82%, #F9F7F7 100%)',
        }}
      >
        {/* Soft luminous atmospheric light glow in upper-right sky */}
        <div 
          className="absolute top-[-10%] right-[15%] w-[520px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(221, 243, 252, 0.18) 50%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        {/* Floating atmospheric water vapor particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {[
            { top: '16%', left: '10%', size: '3px', delay: '0s', opacity: 0.5 },
            { top: '26%', left: '36%', size: '4px', delay: '2.5s', opacity: 0.6 },
            { top: '14%', left: '74%', size: '3px', delay: '1.2s', opacity: 0.45 },
            { top: '32%', left: '86%', size: '5px', delay: '3.8s', opacity: 0.55 },
            { top: '42%', left: '20%', size: '3px', delay: '1.8s', opacity: 0.4 },
            { top: '48%', left: '62%', size: '4px', delay: '4.2s', opacity: 0.5 },
          ].map((pt, i) => (
            <div
              key={i}
              className={`absolute rounded-full bg-white shadow-xs ${
                reducedMotion ? '' : 'animate-pulse'
              }`}
              style={{
                top: pt.top,
                left: pt.left,
                width: pt.size,
                height: pt.size,
                opacity: pt.opacity,
                animationDuration: '4s',
                animationDelay: pt.delay,
              }}
            />
          ))}
        </div>

        {/* -----------------------------------------------------------------------
            PARALLAX CLOUD CURRENT DRIFT
            ----------------------------------------------------------------------- */}
        <div 
          className="absolute top-[6%] inset-x-0 pointer-events-none overflow-hidden opacity-50"
          aria-hidden="true"
        >
          <div className={`flex w-[200%] ${reducedMotion ? '' : 'animate-cloud-slow'}`}>
            <div className="w-1/2 flex justify-around items-center text-white/70">
              <CloudFormationC className="w-56 h-auto blur-[1.5px]" />
              <CloudFormationA className="w-72 h-auto blur-[2px]" />
              <CloudFormationC className="w-48 h-auto blur-[1.5px]" />
            </div>
            <div className="w-1/2 flex justify-around items-center text-white/70">
              <CloudFormationC className="w-56 h-auto blur-[1.5px]" />
              <CloudFormationA className="w-72 h-auto blur-[2px]" />
              <CloudFormationC className="w-48 h-auto blur-[1.5px]" />
            </div>
          </div>
        </div>

        <div 
          className="absolute top-[20%] inset-x-0 pointer-events-none overflow-hidden opacity-70"
          aria-hidden="true"
        >
          <div className={`flex w-[200%] ${reducedMotion ? '' : 'animate-cloud-medium'}`}>
            <div className="w-1/2 flex justify-around items-center text-white/90">
              <CloudFormationB className="w-80 h-auto blur-[0.8px]" />
              <CloudFormationA className="w-64 h-auto blur-[0.5px]" />
              <CloudFormationB className="w-72 h-auto blur-[0.8px]" />
            </div>
            <div className="w-1/2 flex justify-around items-center text-white/90">
              <CloudFormationB className="w-80 h-auto blur-[0.8px]" />
              <CloudFormationA className="w-64 h-auto blur-[0.5px]" />
              <CloudFormationB className="w-72 h-auto blur-[0.8px]" />
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            SKY TYPOGRAPHY & STORYTELLING MESSAGE
            ----------------------------------------------------------------------- */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-16 sm:pt-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 backdrop-blur-md border border-white/80 text-[#112D4E] text-xs font-bold uppercase tracking-widest shadow-2xs mb-4">
            <Waves className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>BrandWaves Living Motion</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#112D4E] tracking-tight leading-[1.08] drop-shadow-2xs">
            Different creators. <br className="hidden sm:inline" />
            <span className="text-[#112D4E]">One creative current.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#112D4E]/80 font-medium max-w-xl mx-auto leading-relaxed">
            Where individual influence converges into high-converting brand momentum. Experience the fluid ecosystem connecting creators, brands, and shoppers.
          </p>
        </div>

        {/* =========================================================================
            LAYER 2: HARMONIC WATER WAVE MOTION & CREATOR RIPPLE BEACONS
            Replaces the black-and-white silhouette parade with fluid ocean layers
            ========================================================================= */}
        <div className="relative z-20 w-full overflow-hidden mt-8 pb-0">
          {/* Oceanic Ripple Beacon Navigation Strip */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#153D56]/80 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#3F72AF]" />
                <span>Featured Creators in the Current</span>
              </span>
              <Link 
                to="/creators"
                className="text-xs font-bold text-[#3F72AF] hover:text-[#112D4E] flex items-center gap-1 group transition-colors"
              >
                <span>Explore all 18 creators</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Creator Wave Beacons - Horizontal responsive track with interactive ripple cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {featuredCreators.map((creator, idx) => (
                <Link
                  key={creator.id}
                  to={`/creators/${creator.id}`}
                  onMouseEnter={() => setActiveRipple(idx)}
                  onMouseLeave={() => setActiveRipple(null)}
                  className={`group relative liquid-glass-card rounded-2xl p-3 sm:p-3.5 transition-all duration-300 card-interactive text-left border border-white/80 hover:border-[#73B8D8] shadow-xs hover:shadow-md hover:-translate-y-1 ${
                    activeRipple === idx ? 'ring-2 ring-[#3F72AF]/50 bg-white/95' : 'bg-white/85'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#DBE2EF] group-hover:ring-[#3F72AF] transition-all"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#112D4E] truncate group-hover:text-[#3F72AF] transition-colors">
                        {creator.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono truncate">{creator.handle}</p>
                      <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#E7F2F8] text-[#153D56]">
                        {creator.niche}
                      </span>
                    </div>
                  </div>

                  {/* Water ripple highlight glow on hover */}
                  {activeRipple === idx && (
                    <span 
                      className="absolute inset-0 rounded-2xl pointer-events-none border border-[#73B8D8]/50 animate-pulse" 
                      aria-hidden="true" 
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* =========================================================================
              LAYER 3: MULTI-DEPTH LIQUID WAVE WATER CURTAINS
              Undulating organic waves with rhythmic offsets and specular reflections
              ========================================================================= */}
          <div className="relative h-28 sm:h-36 w-full overflow-hidden pointer-events-none">
            {/* Deep Water Undercurrent (Deep ocean blue, slowest sweep) */}
            <div 
              className={`absolute inset-x-0 bottom-0 h-28 w-[200%] opacity-25 ${
                reducedMotion ? '' : 'animate-cloud-slow'
              }`}
              style={{ color: '#1B3654' }}
            >
              <svg
                className="w-full h-full fill-current"
                viewBox="0 0 2400 120"
                preserveAspectRatio="none"
              >
                <path d="M0,40 C350,90 700,10 1050,45 C1400,80 1750,15 2100,50 C2450,85 2800,20 3150,50 L3150,120 L0,120 Z" />
              </svg>
            </div>

            {/* Midground Harmonic Wave (Bright ocean blue #3F72AF, moderate speed) */}
            <div 
              className={`absolute inset-x-0 bottom-0 h-24 w-[200%] opacity-45 ${
                reducedMotion ? '' : 'animate-cloud-medium'
              }`}
              style={{ color: '#3F72AF' }}
            >
              <svg
                className="w-full h-full fill-current"
                viewBox="0 0 2400 110"
                preserveAspectRatio="none"
              >
                <path d="M0,50 C300,15 600,80 900,45 C1200,10 1500,75 1800,40 C2100,10 2400,70 2700,45 L2700,110 L0,110 Z" />
              </svg>
            </div>

            {/* Foreground Luminous Wave (Cyan ocean crest #73B8D8, crisp cadence) */}
            <div 
              className={`absolute inset-x-0 bottom-0 h-20 w-[200%] opacity-65 ${
                reducedMotion ? '' : 'animate-cloud-fast'
              }`}
              style={{ color: '#73B8D8' }}
            >
              <svg
                className="w-full h-full fill-current"
                viewBox="0 0 2400 100"
                preserveAspectRatio="none"
              >
                <path d="M0,60 C250,30 500,85 750,55 C1000,25 1250,80 1500,50 C1750,20 2000,75 2250,45 L2250,100 L0,100 Z" />
              </svg>
            </div>

            {/* Porcelain Base Horizon Cap (Cleanly terminates into page background #F9F7F7) */}
            <div 
              className="absolute inset-x-0 bottom-0 h-10 w-full"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(249, 247, 247, 0.8) 60%, #F9F7F7 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
