import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PublicRole } from '../../types';
import { AuthCard } from '../../components/auth/AuthCard';
import { EmailPasswordLoginForm } from '../../components/auth/EmailPasswordLoginForm';
import { getRoleDisplayName, getRoleLandingRoute } from '../../lib/authValidation';
import { AlertCircle, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

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
      signUpLink: '/register',
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

  return (
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
        </div>
      }
    >
      <EmailPasswordLoginForm
        expectedRole={audience.role}
        signUpLink={audience.signUpLink}
        submitLabel={`Sign in as ${audience.role ? getRoleDisplayName(audience.role) : 'User'}`}
      />
    </AuthCard>
  );
};
