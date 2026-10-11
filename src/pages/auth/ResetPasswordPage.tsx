import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AuthCard } from '../../components/auth/AuthCard';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { validatePassword, validatePasswordConfirmation, formatAuthError } from '../../lib/authValidation';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      setError(passCheck.error || 'Password is invalid.');
      return;
    }

    const confirmCheck = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmCheck.isValid) {
      setError(confirmCheck.error || 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error: updateErr } = await supabase.auth.updateUser({
          password,
        });

        if (updateErr) throw updateErr;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      badge="Password Recovery"
      title="Create New Password"
      subtitle="Enter and confirm your new secure password."
      footer={
        <p className="text-xs text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-[#3F72AF] hover:underline">
            Back to Sign In
          </Link>
        </p>
      }
    >
      {success ? (
        <div className="space-y-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#112D4E]">Password Updated!</h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your password has been changed successfully. Redirecting you to sign in...
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs rounded-xl shadow-md block text-center"
            >
              Sign In with New Password
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
              htmlFor="reset-pass" 
              className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="reset-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-sm text-[#112D4E] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 focus:border-[#3F72AF]"
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor="reset-confirm-pass" 
              className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="reset-confirm-pass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
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
              <span>Update Password</span>
            )}
          </button>
        </form>
      )}
    </AuthCard>
  );
};
