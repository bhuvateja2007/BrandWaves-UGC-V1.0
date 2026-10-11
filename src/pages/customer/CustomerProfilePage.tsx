import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Lock, 
  Save, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DemoNotice } from '../../components/marketplace/DemoNotice';

const AVAILABLE_PREFERENCES = [
  'Beverage',
  'Skincare',
  'Streetwear',
  'Audio Hardware',
  'Specialty Coffee',
  'Wellness',
  'Footwear & Design',
  'Sustainable Lifestyle',
];

const PREFERRED_FORMATS = [
  'Short Video & Reels',
  'Detailed Video Reviews',
  'Photo Carousels & Lookbooks',
  'Technical Teardowns',
];

export const CustomerProfilePage: React.FC = () => {
  const { currentUser, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [handle, setHandle] = useState(currentUser?.handle || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // Discovery Preferences (stored in localStorage keyed by customer user id)
  const prefsKey = `brandwaves_discovery_prefs_${currentUser?.id || 'anon'}`;
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(prefsKey);
      return saved ? JSON.parse(saved) : ['Beverage', 'Skincare', 'Streetwear'];
    } catch {
      return ['Beverage', 'Skincare', 'Streetwear'];
    }
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: name.trim(),
        handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
        avatar: avatar.trim() || undefined,
        bio: bio.trim(),
      });

      // Persist preferences
      try {
        localStorage.setItem(prefsKey, JSON.stringify(selectedCategories));
      } catch (err) {
        console.warn('Failed to save local discovery preferences:', err);
      }

      setSuccessMessage('Profile and discovery preferences successfully updated.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F9F7F7] pb-20">
      {/* Editorial Header */}
      <div className="bg-gradient-to-b from-[#DBE2EF]/30 to-transparent border-b border-[#DBE2EF]/60 py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-3">
                <UserIcon className="w-3.5 h-3.5 text-[#3F72AF]" />
                Customer Account
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] tracking-tight">
                Profile & Discovery Settings
              </h1>
              <p className="text-base text-gray-600 mt-2">
                Manage your public customer identity, preferences, and account security.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Status Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Account Identity & Security Guardrails */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#DBE2EF] p-6 shadow-xs text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name || 'Customer'}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#DBE2EF] mx-auto shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              <h2 className="text-lg font-bold text-[#112D4E]">{currentUser?.name || 'Customer'}</h2>
              <p className="text-xs font-mono text-gray-500">{currentUser?.handle || '@customer'}</p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#DBE2EF] text-[#112D4E]">
                  <Shield className="w-3.5 h-3.5 text-[#3F72AF]" />
                  Role: {currentUser?.role}
                </span>
              </div>
            </div>

            {/* Read-Only Security Boundary Information */}
            <div className="bg-white rounded-2xl border border-[#DBE2EF] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                <Lock className="w-3.5 h-3.5 text-[#3F72AF]" />
                Security Boundaries
              </div>
              <ul className="space-y-2.5 text-xs text-gray-600">
                <li className="flex flex-col">
                  <span className="text-[11px] font-mono text-gray-400">Account ID:</span>
                  <span className="font-mono text-gray-800 break-all">{currentUser?.id || '—'}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-[11px] font-mono text-gray-400">Primary Email:</span>
                  <span className="text-gray-800 font-medium">{currentUser?.email || '—'}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    Email updates require secure identity re-verification.
                  </span>
                </li>
                <li className="flex flex-col">
                  <span className="text-[11px] font-mono text-gray-400">Verification Status:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Email
                  </span>
                </li>
                <li className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 leading-normal">
                  User ID, assigned role, and security privileges are strictly immutable through profile editing.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Editable Profile Fields & Preferences Form */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-[#DBE2EF] p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#112D4E] mb-5 pb-3 border-b border-gray-100">
                Edit Profile Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Handle / Username
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. @alexmercer"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Provide an image URL from Unsplash or your hosting provider.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Bio / Introduction
                    </label>
                    <span className="text-[11px] text-gray-400">{bio.length}/300</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share your interests, favorite product categories, or style approach..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] text-sm text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  />
                </div>
              </div>

              {/* Discovery Preferences Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sliders className="w-4 h-4 text-[#3F72AF]" />
                  <h4 className="text-sm font-bold text-[#112D4E]">Discovery Preferences</h4>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Select product categories you are most interested in exploring.
                </p>

                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_PREFERENCES.map((cat) => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          active
                            ? 'bg-[#3F72AF] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Action */}
              <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-16">
          <DemoNotice />
        </div>
      </div>
    </div>
  );
};
