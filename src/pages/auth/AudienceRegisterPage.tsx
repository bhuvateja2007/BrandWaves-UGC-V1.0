import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PublicRole } from '../../types';
import { AuthCard } from '../../components/auth/AuthCard';
import { RegistrationForm } from '../../components/auth/RegistrationForm';
import { ShoppingBag, Camera, Briefcase, CheckCircle2 } from 'lucide-react';

interface AudienceRegisterMeta {
  role: PublicRole;
  badge: string;
  title: string;
  subtitle: string;
  loginLink: string;
  benefits: string[];
}

export const AudienceRegisterPage: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  let audience: AudienceRegisterMeta;

  if (pathname.includes('/customer')) {
    audience = {
      role: 'customer',
      badge: 'Shopper & Audience Registration',
      title: 'Join BrandWaves',
      subtitle: 'Create a free customer account to discover curated brands and creator-verified products.',
      loginLink: '/login/customer',
      benefits: [
        'Save favorite creator routines and product collections',
        'Direct links to official brand webstores with zero markups',
        'Honest, community-verified video reviews without filter distortion',
      ],
    };
  } else if (pathname.includes('/creator')) {
    audience = {
      role: 'creator',
      badge: 'Creator Roster Application',
      title: 'Join as a Creator',
      subtitle: 'Partner with standout brands, produce authentic UGC, and receive prompt escrow payouts.',
      loginLink: '/login/creator',
      benefits: [
        'Browse open briefs from verified premium brands',
        'Protected compensation held in escrow prior to submission',
        'Direct reviewer feedback and automated performance tracking',
      ],
    };
  } else if (pathname.includes('/brand')) {
    audience = {
      role: 'brand_owner',
      badge: 'Brand Partner Registration',
      title: 'Register as Brand Owner',
      subtitle: 'Scale your brand with high-converting creator UGC, orchestrated briefs, and licensed media.',
      loginLink: '/login/brand',
      benefits: [
        'Publish targeted campaign briefs across multi-platform niches',
        'Structured review queue with 1-click approvals and revision notes',
        'Full commercial usage rights on approved video deliverables',
      ],
    };
  } else {
    audience = {
      role: 'customer',
      badge: 'Marketplace Registration',
      title: 'Create Your Account',
      subtitle: 'Where brands meet influence. Choose your role and join the BrandWaves ecosystem.',
      loginLink: '/login',
      benefits: [
        'Secure email and password authentication',
        'Role-tailored dashboard and discovery feeds',
        'Full access to all BrandWaves public directories',
      ],
    };
  }

  const isLocked = pathname.includes('/join/');

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#DBE2EF] shadow-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#3F72AF] text-white shadow-md mb-4 hover:scale-105 transition-transform"
            aria-label="BrandWaves Home"
          >
            <span className="material-symbols-outlined text-[28px]">waves</span>
          </Link>

          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DBE2EF] text-[#112D4E]">
              {audience.badge}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#112D4E] tracking-tight">
            {audience.title}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
            {audience.subtitle}
          </p>
        </div>

        {/* Benefits Pill */}
        <div className="p-4 bg-[#F9F7F7] rounded-2xl border border-[#DBE2EF] space-y-2">
          <span className="text-[11px] font-bold text-[#112D4E] uppercase tracking-wider block">
            Included with your {audience.role} account:
          </span>
          <div className="space-y-1.5">
            {audience.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-[#3F72AF] shrink-0 mt-0.5" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <RegistrationForm
          defaultRole={audience.role}
          lockRole={isLocked}
          loginLink={audience.loginLink}
        />

        {/* Footer Navigation */}
        <div className="text-center pt-3 border-t border-[#DBE2EF]/60 space-y-2">
          <p className="text-xs text-gray-500">
            Want to register for another role?{' '}
            <Link to="/register" className="font-bold text-[#3F72AF] hover:underline">
              View all account types
            </Link>
          </p>
          <div className="flex justify-center gap-3 text-[11px] text-gray-400">
            <Link to="/join/customer" className="hover:text-[#112D4E]">Customer</Link>
            <span>•</span>
            <Link to="/join/creator" className="hover:text-[#112D4E]">Creator</Link>
            <span>•</span>
            <Link to="/join/brand" className="hover:text-[#112D4E]">Brand Owner</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
