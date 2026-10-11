import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  LogOut, 
  Camera, 
  Save, 
  Sparkles,
  Phone
} from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { currentUser, updateProfile, signOut, resendVerificationEmail, isSupabaseMode } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  if (!currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({ name, bio, avatar });
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (!currentUser.email) return;
    setResending(true);
    try {
      const res = await resendVerificationEmail(currentUser.email);
      setMessage(res.message);
    } catch (err: any) {
      setMessage(err.message || 'Failed to resend verification');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#DBE2EF]/60 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
            Profile & Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your public identity, verified tier, and platform notifications.
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Account Verification & Tier Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#112D4E] uppercase tracking-wider">
          Verification & Trust Ledger
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]/60 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Account Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-sm text-emerald-700 capitalize">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {currentUser.accountStatus || 'Active'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]/60 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email Status</span>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${currentUser.emailVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                {currentUser.emailVerified ? 'Verified' : 'Verification Pending'}
              </span>
              {!currentUser.emailVerified && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="text-[11px] text-[#3F72AF] font-bold hover:underline"
                >
                  {resending ? 'Sending...' : 'Resend link'}
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]/60 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Reputation Tier</span>
            <span className="inline-flex items-center gap-1 font-bold text-sm text-[#112D4E]">
              <Star className="w-3.5 h-3.5 text-[#3F72AF]" />
              {currentUser.tier || 'Elite Partner'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-[#112D4E] uppercase tracking-wider">
          Public Creator Profile
        </h3>

        <div className="flex items-center gap-4">
          <img
            src={avatar || currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-[#DBE2EF]"
          />
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-xs text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5">
              Account Handle
            </label>
            <input
              type="text"
              disabled
              value={currentUser.handle}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 border border-[#DBE2EF] text-sm text-gray-500 font-mono cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5">
            Authoritative Account Role
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              disabled
              value={`${currentUser.role.toUpperCase()} (Authoritative)`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 border border-[#DBE2EF] text-sm text-[#3F72AF] font-bold cursor-not-allowed"
            />
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Role elevation is governed by PostgreSQL Row Level Security and cannot be changed through profile updates.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#112D4E] uppercase tracking-wider mb-1.5">
            Bio / Creator Statement
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell brand strategists about your content niche, gear setup, or creative philosophy..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:border-[#3F72AF]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#112D4E] hover:bg-[#112D4E]/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
