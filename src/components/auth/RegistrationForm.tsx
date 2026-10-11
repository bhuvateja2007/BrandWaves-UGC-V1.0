import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PublicRole } from '../../types';
import { 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ShoppingBag,
  Camera,
  Briefcase
} from 'lucide-react';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordConfirmation, 
  validatePublicRole,
  ALLOWED_PUBLIC_ROLES
} from '../../lib/authValidation';

interface RegistrationFormProps {
  defaultRole?: PublicRole;
  lockRole?: boolean;
  loginLink?: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  defaultRole = 'customer',
  lockRole = false,
  loginLink = '/login',
}) => {
  const { signUp, resendVerificationEmail, isSupabaseMode } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<PublicRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Field-level error state
  const [errors, setErrors] = useState<{
    role?: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});

  // Verification and success states after submission
  const [verificationPending, setVerificationPending] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const roleDescriptions: Record<PublicRole, { label: string; desc: string; icon: React.ReactNode }> = {
    customer: {
      label: 'Customer',
      desc: 'Discover products tested by creators, save items & follow trends.',
      icon: <ShoppingBag className="w-4 h-4 text-[#3F72AF]" />,
    },
    creator: {
      label: 'Creator',
      desc: 'Pitch to brands, publish UGC deliverables & earn rewards.',
      icon: <Camera className="w-4 h-4 text-[#3F72AF]" />,
    },
    brand_owner: {
      label: 'Brand Owner',
      desc: 'Launch campaigns, review creator submissions & scale influence.',
      icon: <Briefcase className="w-4 h-4 text-[#3F72AF]" />,
    },
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendStatus(null);
    try {
      const res = await resendVerificationEmail(email);
      setResendStatus(res.message);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setResendStatus(err.message || 'Could not send verification email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // 1. Validate fields
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      newErrors.email = emailCheck.error;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      newErrors.password = passwordCheck.error;
    }

    const confirmCheck = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmCheck.isValid) {
      newErrors.confirmPassword = confirmCheck.error;
    }

    const roleCheck = validatePublicRole(role);
    if (!roleCheck.isValid) {
      newErrors.role = roleCheck.error;
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must accept the terms of service and marketplace standards to continue.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. Submit registration
    setLoading(true);

    try {
      const handle = `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '')}`;
      const res = await signUp(email.trim(), password, name.trim(), handle, role);

      if (res.needsVerification) {
        setVerificationPending(true);
      } else {
        setCreationSuccess(true);
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Registration failed. Please review your details and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Immediate Account Creation Success Screen
  if (creationSuccess) {
    return (
      <div className="space-y-6 text-center animate-fadeIn py-2">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#112D4E]">
            Your account was created successfully!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            Your BrandWaves account has been created. You can continue to the next step.
          </p>
        </div>

        <div className="p-4 bg-[#F9F7F7] rounded-2xl border border-[#DBE2EF] text-left text-xs space-y-2 text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Profile established as <strong>{roleDescriptions[role].label}</strong>.</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3F72AF] shrink-0 mt-0.5" />
            <span>Your session is authenticated and protected by Row Level Security.</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/onboarding', { replace: true })}
            className="w-full py-3.5 px-4 bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // If email confirmation is required by Supabase configuration
  if (verificationPending) {
    return (
      <div className="space-y-6 text-center animate-fadeIn py-2">
        <div className="w-16 h-16 rounded-3xl bg-[#DBE2EF] text-[#3F72AF] flex items-center justify-center mx-auto shadow-sm">
          <Mail className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#112D4E]">
            Verify your email to continue
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            Your account registration was accepted. Check your inbox for a confirmation link before signing in.
          </p>
        </div>

        <div className="p-4 bg-[#F9F7F7] rounded-2xl border border-[#DBE2EF] text-left text-xs space-y-2 text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Links remain valid for 24 hours. Please check your junk/spam folder if delayed.</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3F72AF] shrink-0 mt-0.5" />
            <span>Unverified accounts cannot access campaign submissions or commercial brand management.</span>
          </div>
        </div>

        {resendStatus && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-[#112D4E] text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3F72AF] shrink-0" />
            <span>{resendStatus}</span>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#F9F7F7] text-[#112D4E] border border-[#DBE2EF] font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend confirmation link'}
          </button>

          <Link
            to={loginLink}
            className="w-full py-2.5 px-4 bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs rounded-xl shadow-md block text-center"
          >
            Proceed to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {errors.general && (
        <div 
          role="alert" 
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5 animate-shake"
        >
          <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Your account wasn't created</span>
          </div>
          <p className="leading-relaxed text-rose-700 pl-6">{errors.general}</p>
        </div>
      )}

      {/* Account Type / Role Selection */}
      {!lockRole && (
        <div>
          <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ALLOWED_PUBLIC_ROLES.map((r) => {
              const info = roleDescriptions[r];
              const isSelected = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-2xl border text-left flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#3F72AF] bg-[#DBE2EF]/50 ring-2 ring-[#3F72AF]/20'
                      : 'border-[#DBE2EF] bg-[#F9F7F7] hover:bg-white text-gray-600'
                  }`}
                >
                  <div className="mb-1">{info.icon}</div>
                  <span className="text-xs font-bold text-[#112D4E] block">{info.label}</span>
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.role}</p>
          )}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label 
          htmlFor="reg-name" 
          className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5"
        >
          Full Name
        </label>
        <div className="relative">
          <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="reg-name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
            placeholder="Aarav Sharma"
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F7F7] border text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 transition-colors ${
              errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-[#DBE2EF] focus:border-[#3F72AF]'
            }`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
        )}
      </div>

      {/* Email Address */}
      <div>
        <label 
          htmlFor="reg-email" 
          className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5"
        >
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="reg-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder="you@domain.com"
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F7F7] border text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 transition-colors ${
              errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-[#DBE2EF] focus:border-[#3F72AF]'
            }`}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label 
          htmlFor="reg-password" 
          className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }}
            placeholder="At least 8 characters"
            className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/70 border text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:bg-white transition-all ${
              errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-[#DBE2EF] focus:border-[#3F72AF]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#112D4E] rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label 
          htmlFor="reg-confirm-password" 
          className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="reg-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirm-password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
            placeholder="Re-enter password"
            className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/70 border text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:bg-white transition-all ${
              errors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-[#DBE2EF] focus:border-[#3F72AF]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#112D4E] rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Standards acceptance */}
      <div>
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="reg-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked);
              if (errors.terms) setErrors(prev => ({ ...prev, terms: undefined }));
            }}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#3F72AF] focus:ring-[#3F72AF] cursor-pointer"
          />
          <label htmlFor="reg-terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
            I agree to the BrandWaves Marketplace Terms of Service, Community Standards, and Privacy Policy.
          </label>
        </div>
        {errors.terms && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.terms}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-60 cursor-pointer mt-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Create {roleDescriptions[role].label} Account</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      {/* Secondary Sign In Link & FAQ */}
      <div className="text-center pt-2 space-y-1.5">
        <p className="text-xs text-gray-500">
          Already registered?{' '}
          <Link to={loginLink} className="font-bold text-[#112D4E] hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-[11px] text-gray-400">
          Have questions about onboarding?{' '}
          <Link to="/faq" className="text-[#3F72AF] font-semibold hover:underline">
            Read the FAQ
          </Link>
        </p>
      </div>
    </form>
  );
};
