import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthCard } from '../../components/auth/AuthCard';
import { Mail, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { validateEmail } from '../../lib/authValidation';

export const AuthVerify: React.FC = () => {
  const { currentUser, resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState(currentUser?.email || '');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setStatusMessage(emailCheck.error || 'Please enter a valid email.');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await resendVerificationEmail(email.trim());
      setIsSuccess(res.success);
      setStatusMessage(res.message);

      if (res.success) {
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage(err.message || 'Failed to dispatch verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      badge="Account Activation"
      title="Verify Your Email"
      subtitle="Complete email confirmation to unlock full marketplace permissions."
      footer={
        <p className="text-xs text-gray-500">
          Already confirmed your email?{' '}
          <Link to="/login" className="font-bold text-[#3F72AF] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        <div className="p-4 bg-[#F9F7F7] rounded-2xl border border-[#DBE2EF] text-xs space-y-2 text-gray-600">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3F72AF] shrink-0 mt-0.5" />
            <span>
              BrandWaves requires verified email addresses to protect creators and brand partners against impersonation.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Activation links expire in 24 hours. Check your spam/junk folder if the email does not appear immediately.
            </span>
          </div>
        </div>

        {statusMessage && (
          <div 
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              isSuccess 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleResend} className="space-y-4">
          <div>
            <label 
              htmlFor="verify-email" 
              className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5"
            >
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="verify-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:border-[#3F72AF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full py-3 px-4 bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : cooldown > 0 ? (
              <span>Resend available in {cooldown}s</span>
            ) : (
              <span>Resend Verification Email</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link to="/" className="text-xs text-gray-500 hover:text-[#112D4E] hover:underline">
            Return to Public Marketplace
          </Link>
        </div>
      </div>
    </AuthCard>
  );
};
