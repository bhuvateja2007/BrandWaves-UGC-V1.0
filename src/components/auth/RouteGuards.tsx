import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { getRoleDisplayName, getRoleLandingRoute } from '../../lib/authValidation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  allowAdminBypass?: boolean;
}

/**
 * Loading Skeleton displayed while initial session is resolving
 * Prevents redirect flicker on page reload
 */
export const SessionLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#3F72AF] flex items-center justify-center text-white shadow-md animate-pulse">
        <span className="material-symbols-outlined text-[28px]">waves</span>
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-[#112D4E]">Restoring Secure Session...</h2>
        <p className="text-xs text-gray-500">Checking credentials with BrandWaves security service</p>
      </div>
    </div>
  </div>
);

/**
 * Access Denied screen shown when user role lacks authorization
 */
export const AccessDeniedPage: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#DBE2EF] shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#112D4E]">Access Restricted</h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            This portal is restricted to accounts with the role of{' '}
            <strong className="text-[#112D4E]">
              {allowedRoles.map(r => getRoleDisplayName(r)).join(' or ')}
            </strong>.
          </p>
        </div>

        <div className="p-4 bg-[#F9F7F7] rounded-2xl border border-[#DBE2EF] text-left text-xs space-y-2 text-gray-600">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-[#3F72AF] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#112D4E] block">Your Current Role:</span>
              <span className="text-[#3F72AF] font-semibold">{getRoleDisplayName(currentUser?.role)}</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 leading-normal pt-1">
            Server-side Row Level Security policies enforce these boundaries at the database level.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            to={getRoleLandingRoute(currentUser?.role)}
            className="w-full py-3 px-4 bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Return to your authorized dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="w-full py-2.5 px-4 bg-white hover:bg-[#F9F7F7] text-[#112D4E] border border-[#DBE2EF] font-bold text-xs rounded-xl block text-center"
          >
            Go to Discovery Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Route guard requiring authenticated session
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SessionLoadingFallback />;
  }

  if (!currentUser) {
    // Preserve requested destination safely without open-redirect risk
    const returnPath = location.pathname.startsWith('/') ? location.pathname : '/dashboard';
    return <Navigate to="/login" state={{ from: { pathname: returnPath } }} replace />;
  }

  return <>{children}</>;
};

/**
 * Route guard requiring specific authoritative roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles,
  allowAdminBypass = true 
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SessionLoadingFallback />;
  }

  if (!currentUser) {
    const returnPath = location.pathname.startsWith('/') ? location.pathname : '/dashboard';
    return <Navigate to="/login" state={{ from: { pathname: returnPath } }} replace />;
  }

  // Check if user role satisfies any allowed role
  const userRole = currentUser.role;
  const isAuthorized = allowedRoles.includes(userRole) || (allowAdminBypass && userRole === 'admin');

  if (!isAuthorized) {
    return <AccessDeniedPage allowedRoles={allowedRoles} />;
  }

  return <>{children}</>;
};
