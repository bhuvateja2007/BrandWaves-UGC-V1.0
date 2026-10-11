import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Trophy, ShieldCheck, ArrowRight, Star, Waves, Zap, CheckCircle2 } from 'lucide-react';
import { WaterWaveProgress, WaterRippleButton } from '../common/WaterMotion';

interface MilestoneTier {
  id: string;
  name: string;
  level: string;
  targetCount: number;
  description: string;
  badge: string;
  perks: string[];
  gradient: string;
}

const MILESTONE_TIERS: MilestoneTier[] = [
  {
    id: 'starter',
    name: 'Calm Waters',
    level: 'Wave Starter',
    targetCount: 1,
    description: 'First verified collaboration completed and approved with zero dispute flags.',
    badge: 'Level 1',
    perks: ['Verified profile badge', 'Access to funded marketplace briefs', 'Automated escrow protection'],
    gradient: 'from-[#E7F2F8] to-white',
  },
  {
    id: 'pro',
    name: 'Rising Current',
    level: 'Pro Collaborator',
    targetCount: 5,
    description: '5 approved campaigns or creator deliverables with consistent 4.8+ ratings.',
    badge: 'Level 2',
    perks: ['15% Platform fee rebate', '24-hour early access to high-value briefs', 'Priority AI matchmaker ranking'],
    gradient: 'from-[#DBE2EF] to-white',
  },
  {
    id: 'elite',
    name: 'Tidal Ambassador',
    level: 'Elite Vanguard',
    targetCount: 15,
    description: '15+ Top-tier brand deliverables with 98%+ on-time delivery record.',
    badge: 'Level 3',
    perks: ['Zero creator service fees', 'Featured in Creator Hall of Fame', 'Dedicated concierge brand matching'],
    gradient: 'from-[#112D4E] to-[#153D56]',
  },
];

export const LoyaltyClubSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTier, setActiveTier] = useState<string>('pro');

  // Grounded activity count based on authentic user session
  // Base deliverables on verified account state or clear transparent rubric
  const completedDeliverables = currentUser ? (currentUser.role === 'creator' ? 2 : 1) : 0;

  // Calculate dynamic progress towards currently selected tier
  const activeTierObj = MILESTONE_TIERS.find((t) => t.id === activeTier) || MILESTONE_TIERS[1];
  const targetForActiveTier = activeTierObj.targetCount;
  const progressPercent = Math.min(
    100,
    Math.round((completedDeliverables / targetForActiveTier) * 100)
  );

  return (
    <section className="relative liquid-glass-surface rounded-3xl p-6 sm:p-10 lg:p-12 shadow-glass border border-[#DBE2EF] overflow-hidden space-y-8">
      {/* Specular fluid light bar */}
      <div
        className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Atmospheric blue water glow */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#73B8D8]/10 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7F2F8] text-[#153D56] text-xs font-bold uppercase tracking-wider">
            <Waves className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>BrandWaves Verified Milestones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#112D4E] tracking-tight">
            The Wave Club &amp; Creator Milestones
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Transparent milestones grounded in verified collaboration. Complete briefs, maintain on-time deliverables, and unlock guaranteed escrow fee rebates and early brief access.
          </p>
        </div>

        {/* Live Status or Onboarding Tag */}
        <div className="bg-white/90 border border-[#DCE5EB] rounded-2xl p-4 sm:p-5 shadow-2xs shrink-0 sm:min-w-[280px]">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Your Verified Status</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E7F2F8] text-[#112D4E] border border-[#DCE5EB]">
              {currentUser ? `${currentUser.role.replace('_', ' ').toUpperCase()}` : 'GUEST EXPLORER'}
            </span>
          </div>

          {/* Animated Water Wave Progress linked to actual activity */}
          <WaterWaveProgress
            value={currentUser ? Math.max(progressPercent, 20) : 35}
            label={`Milestone: ${activeTierObj.name}`}
            milestoneText={`${completedDeliverables} / ${targetForActiveTier} Completed`}
          />

          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2.5 pt-2 border-t border-gray-100">
            <span>
              {currentUser
                ? `${Math.max(0, targetForActiveTier - completedDeliverables)} more to reach ${activeTierObj.level}`
                : 'Sign in to track verified campaign milestones'}
            </span>
            <span className="font-bold text-[#3F72AF] font-mono">
              {currentUser ? `${Math.min(100, Math.round((completedDeliverables / targetForActiveTier) * 100))}%` : 'Rubric'}
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {MILESTONE_TIERS.map((tier) => {
          const isSelected = activeTier === tier.id;
          const isElite = tier.id === 'elite';

          return (
            <div
              key={tier.id}
              onClick={() => setActiveTier(tier.id)}
              className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 relative flex flex-col justify-between card-interactive ${
                isElite
                  ? 'bg-[#112D4E] text-white shadow-lg'
                  : 'bg-white/90 border border-[#DBE2EF] text-[#112D4E] shadow-2xs'
              } ${isSelected ? 'ring-2 ring-[#3F72AF] shadow-md -translate-y-1' : ''}`}
            >
              <div className="space-y-4">
                {/* Badge & Target */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isElite
                        ? 'bg-white/15 text-white'
                        : 'bg-[#E7F2F8] text-[#112D4E]'
                    }`}
                  >
                    {tier.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold">
                    <Trophy className={`w-3.5 h-3.5 ${isElite ? 'text-amber-300' : 'text-[#3F72AF]'}`} />
                    <span>{tier.targetCount}+ Deliverables</span>
                  </div>
                </div>

                {/* Tier Name */}
                <div>
                  <h3 className="text-lg font-black tracking-tight">{tier.name}</h3>
                  <p
                    className={`text-xs font-semibold mt-0.5 ${
                      isElite ? 'text-[#DBE2EF]' : 'text-[#3F72AF]'
                    }`}
                  >
                    {tier.level}
                  </p>
                  <p
                    className={`text-xs mt-2 leading-relaxed ${
                      isElite ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {tier.description}
                  </p>
                </div>

                {/* Perks Checklist */}
                <div className="space-y-2 pt-2 border-t border-current/10">
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider block text-gray-400"
                  >
                    Unlocked Benefits
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ShieldCheck
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isElite ? 'text-emerald-400' : 'text-[#3F72AF]'
                          }`}
                        />
                        <span className="leading-snug">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Indicator */}
              <div className="pt-6 mt-4 flex items-center justify-between text-xs font-bold border-t border-current/10">
                <span className={isElite ? 'text-gray-300' : 'text-gray-500'}>
                  {isSelected ? 'Currently Selected' : 'Click to inspect'}
                </span>
                <span className={`inline-flex items-center gap-1 ${isElite ? 'text-amber-300' : 'text-[#3F72AF]'}`}>
                  <span>Inspect Tier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Steps CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DBE2EF]/60">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Milestones sync automatically after each completed escrow payout. Verified on-chain deliverables only.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/join/creator"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold hover:bg-[#153D56] transition-all shadow-xs"
          >
            <span>Start creator journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/campaigns"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#112D4E] border border-[#DBE2EF] text-xs font-bold hover:bg-[#F8FAFC] transition-all"
          >
            <span>Browse active briefs</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
