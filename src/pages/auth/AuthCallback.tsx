import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { AuthCard } from '../../components/auth/AuthCard';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your credentials and establishing secure session...');

  useEffect(() => {
    const handleAuthExchange = async () => {
      try {
        if (!isSupabaseConfigured) {
          setStatus('success');
          setMessage('Local environment session verified.');
          setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
          return;
        }

        // Supabase auto-detects hash tokens or code query params
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        // Check hash or search params for password recovery type
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const type = hashParams.get('type') || new URLSearchParams(location.search).get('type');

        if (type === 'recovery') {
          setStatus('success');
          setMessage('Password recovery token validated. You may now reset your password.');
          setTimeout(() => navigate('/reset-password', { replace: true }), 1000);
          return;
        }

        if (session) {
          await refreshUser();
          setStatus('success');
          setMessage('Email confirmed and session successfully restored! Redirecting to your dashboard...');
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        } else {
          // If no session detected yet, listen for the event
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
              await refreshUser();
              setStatus('success');
              setMessage('Authentication confirmed! Redirecting...');
              subscription.unsubscribe();
              setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
            }
          });

          // Timeout fallback in case link is invalid or expired
          setTimeout(() => {
            if (status === 'verifying') {
              setStatus('error');
              setMessage('The verification link has expired or has already been used. Please request a new link.');
            }
          }, 6000);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setMessage(err.message || 'Authentication exchange failed. Please sign in again.');
      }
    };

    handleAuthExchange();
  }, [location, navigate, refreshUser]);

  return (
    <AuthCard
      badge="Identity Verification"
      title={status === 'error' ? 'Verification Failed' : 'Authenticating...'}
      subtitle={status === 'error' ? 'Session could not be established' : 'Securing your account session'}
    >
      <div className="space-y-6 text-center py-4">
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#DBE2EF] border-t-[#3F72AF] rounded-full animate-spin" />
            <p className="text-xs text-gray-600 max-w-xs">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-emerald-800 font-semibold max-w-xs">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Token expired or invalid</span>
                <p className="text-gray-600 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                className="w-full py-3 px-4 bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs rounded-xl shadow-md block text-center"
              >
                Go to Sign In
              </Link>
              <Link
                to="/auth/verify"
                className="w-full py-2.5 px-4 bg-white hover:bg-[#F9F7F7] text-[#112D4E] border border-[#DBE2EF] font-bold text-xs rounded-xl block text-center"
              >
                Resend Verification Email
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthCard>
  );
};
