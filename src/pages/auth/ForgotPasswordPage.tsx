import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthCard } from '../../components/auth/AuthCard';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { validateEmail } from '../../lib/authValidation';

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await sendPasswordReset(email.trim());
      setSubmitted(true);
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Could not send recovery link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      badge="Account Recovery"
      title="Reset Your Password"
      subtitle="Enter your registered email address to receive secure recovery instructions."
      footer={
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <ArrowLeft className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/login" className="font-bold text-[#3F72AF] hover:underline">
            Back to Sign In
          </Link>
        </div>
      }
    >
      {submitted ? (
        <div className="space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#112D4E]">Recovery link sent</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              {message || `If an account with ${email} exists, password reset instructions have been dispatched.`}
            </p>
          </div>

          <div className="p-3.5 bg-[#F9F7F7] rounded-xl border border-[#DBE2EF] text-xs text-gray-500 text-left">
            <span>Please check your inbox and click the recovery link to set a new password. The link will remain active for 1 hour.</span>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs rounded-xl shadow-md block text-center"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div 
              role="alert" 
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label 
              htmlFor="forgot-email" 
              className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5"
            >
              Account Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="forgot-email"
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
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Send Password Reset Link</span>
            )}
          </button>
        </form>
      )}
    </AuthCard>
  );
};
