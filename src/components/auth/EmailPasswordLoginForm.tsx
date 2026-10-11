import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PublicRole } from '../../types';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateEmail, validatePassword, getRoleLandingRoute } from '../../lib/authValidation';

interface EmailPasswordLoginFormProps {
  expectedRole?: PublicRole;
  onRoleMismatch?: (detectedRole: string) => void;
  signUpLink?: string;
  submitLabel?: string;
}

export const EmailPasswordLoginForm: React.FC<EmailPasswordLoginFormProps> = ({
  expectedRole,
  onRoleMismatch,
  signUpLink = '/register',
  submitLabel = 'Sign in to Account',
}) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    const errors: { email?: string; password?: string } = {};
    if (!emailValidation.isValid) errors.email = emailValidation.error;
    if (!passwordValidation.isValid) errors.password = passwordValidation.error;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);
      if (result.success) {
        // Successful login: navigate directly to requested 'from' or authoritative role destination
        const loggedInUser = result.user;
        const targetRoute = from || (
          loggedInUser?.role 
            ? getRoleLandingRoute(loggedInUser.role) 
            : (expectedRole ? getRoleLandingRoute(expectedRole) : '/dashboard')
        );
        navigate(targetRoute, { replace: true });
      } else {
        setGeneralError(result.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {generalError && (
        <div 
          role="alert" 
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span className="leading-relaxed">{generalError}</span>
        </div>
      )}

      {/* 1. Email Field */}
      <div>
        <label 
          htmlFor="login-email" 
          className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5"
        >
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder="you@domain.com"
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:bg-white transition-all ${
              fieldErrors.email ? 'border-rose-400 focus:border-rose-500' : 'border-[#DBE2EF] focus:border-[#3F72AF]'
            }`}
          />
        </div>
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.email}</p>
        )}
      </div>

      {/* 2. Password Field with Visibility Toggle */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label 
            htmlFor="login-password" 
            className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider"
          >
            Password
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-[#3F72AF] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
            }}
            placeholder="••••••••••••"
            className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/70 border text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:bg-white transition-all ${
              fieldErrors.password ? 'border-rose-400 focus:border-rose-500' : 'border-[#DBE2EF] focus:border-[#3F72AF]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#112D4E] rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.password}</p>
        )}
      </div>

      {/* 3. Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-60 cursor-pointer mt-2 active:scale-[0.99]"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>{submitLabel}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      {/* 4. Secondary Sign Up Link */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          Don't have an account yet?{' '}
          <Link to={signUpLink} className="font-bold text-[#3F72AF] hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
};
