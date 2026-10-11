import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PublicRole } from '../../types';
import { AuthCard } from '../../components/auth/AuthCard';
import { EmailPasswordLoginForm } from '../../components/auth/EmailPasswordLoginForm';
import { DemoAccountsSection } from '../../components/auth/DemoAccountsSection';
import { getRoleDisplayName, getRoleLandingRoute } from '../../lib/authValidation';
import { AlertCircle, ArrowRight, ShieldAlert, Sparkles, CheckCircle2, X } from 'lucide-react';

interface AudienceMeta {
  role?: PublicRole;
  badge: string;
  title: string;
  subtitle: string;
  signUpLink: string;
}

export const AudienceLoginPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isSupabaseMode } = useAuth();

  const [roleMismatch, setRoleMismatch] = useState<{
    expectedRole: PublicRole;
    actualRole: string;
  } | null>(null);

  // Derive audience context from URL
  const pathname = location.pathname;
  let audience: AudienceMeta;

  if (pathname.includes('/customer')) {
    audience = {
      role: 'customer',
      badge: 'Shopper & Customer Sign In',
      title: 'Sign in to BrandWaves',
      subtitle: 'Discover authentic creator reviews, follow favorite curators, and save standout products.',
      signUpLink: '/join/customer',
    };
  } else if (pathname.includes('/creator')) {
    audience = {
      role: 'creator',
      badge: 'Creator Workspace Access',
      title: 'Creator Portal Sign In',
      subtitle: 'Access campaign briefs, submit verified UGC deliverables, and track escrow earnings.',
      signUpLink: '/join/creator',
    };
  } else if (pathname.includes('/brand')) {
    audience = {
      role: 'brand_owner',
      badge: 'Brand Partner Sign In',
      title: 'Brand Owner Portal',
      subtitle: 'Manage active campaigns, review incoming UGC video submissions, and measure impact.',
      signUpLink: '/join/brand',
    };
  } else {
    audience = {
      badge: 'Secure Marketplace Sign In',
      title: 'Sign in to BrandWaves',
      subtitle: 'Where brands meet influence. Enter your email and password to access your dashboard.',
      signUpLink: '/signup',
    };
  }

  // Detect role mismatch if already logged in, or navigate to authorized workspace
  useEffect(() => {
    if (currentUser) {
      if (audience.role) {
        const isMismatch = (
          (audience.role === 'creator' && currentUser.role !== 'creator') ||
          (audience.role === 'brand_owner' && currentUser.role !== 'brand_owner' && currentUser.role !== 'brand_admin' && currentUser.role !== 'admin') ||
          (audience.role === 'customer' && currentUser.role !== 'customer' && currentUser.role !== 'user')
        );

        if (isMismatch) {
          setRoleMismatch({
            expectedRole: audience.role,
            actualRole: currentUser.role,
          });
          return;
        }
      }

      setRoleMismatch(null);
      // Already authenticated with valid role: navigate to intended destination or landing route
      const from = (location.state as any)?.from?.pathname;
      const target = from || getRoleLandingRoute(currentUser.role);
      navigate(target, { replace: true });
    }
  }, [currentUser, audience.role, navigate, location.state]);

  // If already authenticated and there is a role mismatch:
  if (currentUser && roleMismatch) {
    return (
      <AuthCard
        badge="Account Role Notice"
        title="Role Access Mismatch"
        subtitle={`You are currently signed in as a ${getRoleDisplayName(currentUser.role)}.`}
        footer={
          <p className="text-xs text-gray-500">
            Need a different account?{' '}
            <button
              onClick={() => navigate('/profile')}
              className="font-bold text-[#3F72AF] hover:underline"
            >
              Manage account
            </button>
          </p>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  This login page is dedicated to {getRoleDisplayName(roleMismatch.expectedRole)}s.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Your account has the authoritative role of <strong>{getRoleDisplayName(roleMismatch.actualRole)}</strong>. 
                  BrandWaves preserves your verified role and will not silently alter your account permissions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              to={getRoleLandingRoute(currentUser.role)}
              className="w-full py-3 px-4 bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Go to your {getRoleDisplayName(currentUser.role)} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/"
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F9F7F7] text-[#112D4E] border border-[#DBE2EF] font-bold text-xs rounded-xl block text-center transition-colors"
            >
              Explore Public Marketplace
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  const [prefilledCredentials, setPrefilledCredentials] = useState<{
    email: string;
    password: string;
    role: PublicRole;
  } | null>(null);
  const [prefillNotice, setPrefillNotice] = useState<string | null>(null);

  const handleSelectDemo = (demo: { email: string; password: string; role: PublicRole }) => {
    setPrefilledCredentials(demo);
    setPrefillNotice(`Demo credentials loaded for ${getRoleDisplayName(demo.role)}. Review credentials and click Sign In.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-auto py-6 sm:py-10 space-y-6 animate-fadeIn">
      {/* Top Banner Quick Links */}
      <div className="flex items-center justify-between px-2 text-xs text-gray-500">
        <Link to="/" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-[#112D4E] font-medium transition-colors">
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          <span>Back to Discovery Home</span>
        </Link>
        <Link to="/faq" className="inline-flex items-center gap-1 text-[#3F72AF] hover:text-[#112D4E] font-bold transition-colors">
          <span>Need help? Read FAQs</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Login Form Column */}
        <div className="lg:col-span-5 w-full">
          {prefillNotice && (
            <div className="mb-4 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[#112D4E] text-xs flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3F72AF] shrink-0" />
                <span className="font-medium text-[11px]">{prefillNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setPrefillNotice(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                aria-label="Dismiss notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <AuthCard
            badge={audience.badge}
            title={audience.title}
            subtitle={audience.subtitle}
            footer={
              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  Exploring BrandWaves?{' '}
                  <Link to="/" className="font-bold text-[#3F72AF] hover:underline">
                    Visit discovery homepage
                  </Link>
                </p>
                <div className="flex justify-center gap-3 text-[11px] text-gray-400">
                  <Link to="/login/customer" className="hover:text-[#112D4E]">Customer Login</Link>
                  <span>•</span>
                  <Link to="/login/creator" className="hover:text-[#112D4E]">Creator Login</Link>
                  <span>•</span>
                  <Link to="/login/brand" className="hover:text-[#112D4E]">Brand Login</Link>
                </div>
                <div className="pt-2 border-t border-[#DBE2EF]/60 text-center">
                  <Link to="/faq" className="text-xs font-bold text-[#3F72AF] hover:underline">
                    Questions about accounts or security? Visit FAQ
                  </Link>
                </div>
              </div>
            }
          >
            <EmailPasswordLoginForm
              expectedRole={prefilledCredentials?.role || audience.role}
              signUpLink={audience.signUpLink}
              submitLabel={`Sign in as ${
                prefilledCredentials?.role
                  ? getRoleDisplayName(prefilledCredentials.role)
                  : audience.role
                  ? getRoleDisplayName(audience.role)
                  : 'Account'
              }`}
              initialEmail={prefilledCredentials?.email || ''}
              initialPassword={prefilledCredentials?.password || ''}
            />
          </AuthCard>
        </div>

        {/* Demo Accounts Column */}
        <div className="lg:col-span-7 w-full">
          <DemoAccountsSection
            onSelectDemo={handleSelectDemo}
            selectedRole={prefilledCredentials?.role || audience.role}
          />
        </div>
      </div>
    </div>
  );
};
