import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Layers,
  HelpCircle
} from 'lucide-react';
import { DemoNotice } from '../../components/marketplace/DemoNotice';

interface AudienceContent {
  badge: string;
  title: string;
  subtitle: string;
  primaryAction: { label: string; to: string };
  secondaryAction: { label: string; to: string };
  highlights: { title: string; desc: string; icon: React.ReactNode }[];
  steps: { step: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

export const JoinAudiencePage: React.FC = () => {
  const location = useLocation();

  // Determine audience type from pathname
  const audienceType = location.pathname.includes('/creator')
    ? 'creator'
    : location.pathname.includes('/brand')
    ? 'brand'
    : 'customer';

  const content: AudienceContent = {
    customer: {
      badge: 'For Curious Shoppers & Audiences',
      title: 'Discover products tested by voices you trust.',
      subtitle:
        'Skip sponsored noise. Explore honest routines, transparent formulas, and independent brands reviewed by genuine creators.',
      primaryAction: { label: 'Explore Standout Products', to: '/products' },
      secondaryAction: { label: 'Discover Creators', to: '/creators' },
      highlights: [
        {
          title: 'Unfiltered Authenticity',
          desc: 'Real morning routines, durability stress-tests, and zero-filter camera demos.',
          icon: <ShieldCheck className="w-5 h-5 text-[#3F72AF]" />,
        },
        {
          title: 'Independent Craft Brands',
          desc: 'Curated direct-to-consumer labels crafting botanical sodas, barrier skincare, and selvedge denim.',
          icon: <ShoppingBag className="w-5 h-5 text-[#3F72AF]" />,
        },
        {
          title: 'Direct Brand Discovery',
          desc: 'Zero retail markups. Discover product stories and visit official brand storefronts with one click.',
          icon: <Sparkles className="w-5 h-5 text-[#3F72AF]" />,
        },
      ],
      steps: [
        { step: '01', title: 'Browse by Niche', desc: 'Find products across technology, beauty, fashion, fitness, and home.' },
        { step: '02', title: 'Watch Creator Tests', desc: 'See real application routines and genuine everyday wear.' },
        { step: '03', title: 'Buy with Confidence', desc: 'Click directly through to brand storefronts with zero third-party markups.' },
      ],
      faqs: [
        {
          q: 'Does BrandWaves charge customers a fee?',
          a: 'No. BrandWaves is completely free for customers and discoverers.',
        },
        {
          q: 'Are the products authentic?',
          a: 'All brands in BrandWaves are independently curated for ingredient transparency and design integrity.',
        },
      ],
    },
    creator: {
      badge: 'For Independent Creators',
      title: 'Turn your authentic perspective into funded campaigns.',
      subtitle:
        'Connect with premium brands that respect your creative autonomy. Earn guaranteed fixed payouts and showcase your portfolio to industry partners.',
      primaryAction: { label: 'Browse Active Campaigns', to: '/campaigns' },
      secondaryAction: { label: 'Create Creator Account', to: '/register' },
      highlights: [
        {
          title: 'Guaranteed Fixed Compensation',
          desc: 'No vague affiliate links or unpaid barter. Every campaign specifies upfront compensation.',
          icon: <DollarSign className="w-5 h-5 text-[#3F72AF]" />,
        },
        {
          title: 'Creative Autonomy',
          desc: 'Clear creative briefs that leave space for your personal voice, tone, and visual signature.',
          icon: <Sparkles className="w-5 h-5 text-[#3F72AF]" />,
        },
        {
          title: 'Curated Brand Partners',
          desc: 'Collaborate with innovative Indian and international labels your audience will genuinely love.',
          icon: <Users className="w-5 h-5 text-[#3F72AF]" />,
        },
      ],
      steps: [
        { step: '01', title: 'Explore Briefs', desc: 'Review deliverables, deadlines, and compensation for open brand campaigns.' },
        { step: '02', title: 'Submit Your Pitch', desc: 'Share your perspective and past portfolio work that aligns with the brief.' },
        { step: '03', title: 'Create & Get Paid', desc: 'Deliver authentic content, receive reviewer signoff, and unlock predictable payouts.' },
      ],
      faqs: [
        {
          q: 'What follower count do I need to join?',
          a: 'We welcome nano, micro, and established creators with strong engagement and authentic creative standards.',
        },
        {
          q: 'How does campaign compensation work?',
          a: 'Compensation amounts are locked in the campaign brief and paid upon approved deliverable completion.',
        },
      ],
    },
    brand: {
      badge: 'For Forward-Thinking Brands',
      title: 'Partner with creators who genuinely care about craft.',
      subtitle:
        'Launch targeted campaigns, gather high-impact user-generated content, and scale authentic word-of-mouth with zero agency bloat.',
      primaryAction: { label: 'Discover Creators', to: '/creators' },
      secondaryAction: { label: 'Register Your Brand', to: '/register' },
      highlights: [
        {
          title: 'Vetted Creator Directory',
          desc: 'Connect with creators specializing in technology, beauty, streetwear, fitness, and lifestyle.',
          icon: <Users className="w-5 h-5 text-[#3F72AF]" />,
        },
        {
          title: 'Predictable Production',
          desc: 'Structured briefs, clear deliverable timelines, and integrated review queues for brand feedback.',
          icon: <Briefcase className="w-5 h-5 text-[#3F72AF]" />,
        },
        {
          title: 'High-Impact Content Rights',
          desc: 'Receive organic social reach plus high-resolution video assets for brand whitelisting.',
          icon: <TrendingUp className="w-5 h-5 text-[#3F72AF]" />,
        },
      ],
      steps: [
        { step: '01', title: 'Define Your Brief', desc: 'Set your campaign objective, target niches, deliverables, and compensation.' },
        { step: '02', title: 'Review Creator Applications', desc: 'Evaluate applicant portfolios, audience fit, and creative proposals.' },
        { step: '03', title: 'Review & Launch', desc: 'Approve final content through BrandWaves and track live audience engagement.' },
      ],
      faqs: [
        {
          q: 'How quickly can our brand launch a campaign?',
          a: 'Campaigns can be configured with target deliverables and published within minutes.',
        },
        {
          q: 'Can we whitelist creator content for paid ads?',
          a: 'Yes, BrandWaves campaigns include delivery of raw 4K assets for approved brand promotional usage.',
        },
      ],
    },
  }[audienceType];

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      {/* Top Notice */}
      <div className="flex justify-end">
        <DemoNotice type="general" />
      </div>

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
          <span>{content.badge}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-[#112D4E] tracking-tight leading-[1.1]">
          {content.title}
        </h1>

        <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
          {content.subtitle}
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to={content.primaryAction.to}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#112D4E] text-white text-sm font-bold shadow-md hover:bg-[#112D4E]/90 hover:gap-3 transition-all active:scale-[0.98]"
          >
            <span>{content.primaryAction.label}</span>
            <ArrowRight className="w-4 h-4 text-[#DBE2EF]" />
          </Link>

          <Link
            to={content.secondaryAction.to}
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-[#112D4E] border border-[#DBE2EF] text-sm font-bold shadow-xs hover:bg-[#F9F7F7] transition-all"
          >
            {content.secondaryAction.label}
          </Link>
        </div>

        {/* Audience Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 pt-6">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-2">
            Explore other paths:
          </span>
          <Link
            to="/join/customer"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              audienceType === 'customer'
                ? 'bg-[#112D4E] text-white'
                : 'bg-white border border-[#DBE2EF] text-gray-600 hover:text-[#112D4E]'
            }`}
          >
            For Shoppers
          </Link>
          <Link
            to="/join/creator"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              audienceType === 'creator'
                ? 'bg-[#112D4E] text-white'
                : 'bg-white border border-[#DBE2EF] text-gray-600 hover:text-[#112D4E]'
            }`}
          >
            For Creators
          </Link>
          <Link
            to="/join/brand"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              audienceType === 'brand'
                ? 'bg-[#112D4E] text-white'
                : 'bg-white border border-[#DBE2EF] text-gray-600 hover:text-[#112D4E]'
            }`}
          >
            For Brands
          </Link>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.highlights.map((h, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-[#DBE2EF] shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#DBE2EF]/60 flex items-center justify-center">
              {h.icon}
            </div>
            <h3 className="text-base font-bold text-[#112D4E]">{h.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </section>

      {/* How It Works Steps */}
      <section className="bg-white rounded-3xl border border-[#DBE2EF] p-8 sm:p-12 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3F72AF]">
            Simple Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#112D4E]">
            How BrandWaves Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {content.steps.map((st) => (
            <div key={st.step} className="space-y-3 relative">
              <span className="text-3xl sm:text-4xl font-black text-[#DBE2EF] font-mono block">
                {st.step}
              </span>
              <h3 className="text-base font-bold text-[#112D4E]">{st.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 justify-center">
          <HelpCircle className="w-5 h-5 text-[#3F72AF]" />
          <h2 className="text-xl font-black text-[#112D4E]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {content.faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-[#DBE2EF] shadow-xs space-y-2"
            >
              <h3 className="text-sm font-bold text-[#112D4E]">{faq.q}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
