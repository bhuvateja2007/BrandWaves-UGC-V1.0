import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { AnimatedSky } from '../footer/AnimatedSky';
import { CrowdAnimation } from '../footer/CrowdAnimation';

export const SkyCommunityMotionSection: React.FC = () => {
  return (
    <section 
      className="relative w-full overflow-hidden select-none"
      aria-label="BrandWaves Creator Community Atmosphere"
    >
      {/* Container with cinematic height: 420px desktop, 360px tablet/mobile */}
      <div className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] overflow-hidden">
        {/* Layer A — Animated Expansive Sky with Clouds & Atmospheric Light */}
        <AnimatedSky />

        {/* Top Seamless Horizon Blend from Porcelain Page Canvas */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#F9F7F7] via-[#F9F7F7]/80 to-transparent z-10 pointer-events-none" />

        {/* Layer B — Living Monochrome Animated Crowd Canvas */}
        <CrowdAnimation />

        {/* Content Overlay — Restrained Editorial Messaging & Actions */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-start pt-10 sm:pt-14 pointer-events-auto">
          <div className="max-w-2xl bg-white/75 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-white/80 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#112D4E] text-white text-[11px] font-bold uppercase tracking-wider">
                <Users className="w-3 h-3 text-[#BFE8FA]" />
                Living Creator Scale
              </span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-xs text-[#3F72AF] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Verified Community
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight leading-tight">
              Where authentic creator voices meet visionary brands.
            </h2>

            <p className="text-xs sm:text-sm text-gray-700 mt-2 leading-relaxed">
              Every day, creators and product brands collaborate on BrandWaves with guaranteed escrow protection, clear briefs, and automated milestone tracking.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                to="/creators"
                className="px-4 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 btn-tactile btn-glow"
              >
                <span>Explore Creators</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/campaigns"
                className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-[#112D4E] border border-[#DBE2EF] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 btn-tactile"
              >
                <span>Browse Campaigns</span>
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-600 font-medium ml-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero platform commission on first brief</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layer C — Smooth porcelain horizon baseline fade into footer */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[#F9F7F7] z-10 pointer-events-none" />
      </div>
    </section>
  );
};
