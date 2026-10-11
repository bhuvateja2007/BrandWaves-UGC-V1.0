import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Sparkles, 
  Globe, 
  Camera, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Layers,
  Video,
  Languages
} from 'lucide-react';
import { ProfileCompletionCard, CompletionItem } from '../../components/common';

const AVAILABLE_NICHES = [
  'Technology & Audio',
  'Beauty & Skincare',
  'Fitness & Activewear',
  'Fashion & Streetwear',
  'Food & Beverage',
  'Sustainable Lifestyle',
  'Travel & Luggage',
  'Home & Living',
];

const AVAILABLE_FORMATS = [
  'Reel',
  'Short Video',
  'YouTube Video',
  'Photo Carousel',
  'Story',
];

const AVAILABLE_LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Spanish',
  'French',
];

const CREATOR_META_STORAGE_PREFIX = 'brandwaves_creator_meta_';

export const CreatorProfilePage: React.FC = () => {
  const { currentUser, updateProfile, signOut } = useAuth();

  const [name, setName] = useState<string>(currentUser?.name || '');
  const [avatar, setAvatar] = useState<string>(currentUser?.avatar || '');
  const [bio, setBio] = useState<string>(currentUser?.bio || '');
  const [location, setLocation] = useState<string>('Bengaluru, India');
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['Technology & Audio', 'Fitness & Activewear']);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['Reel', 'Short Video']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Hindi']);
  
  // Social links
  const [instagramHandle, setInstagramHandle] = useState<string>('@alexcreates');
  const [tiktokHandle, setTiktokHandle] = useState<string>('@alex.creates');
  const [youtubeChannel, setYoutubeChannel] = useState<string>('AlexCreatesTech');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');

  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name || '');
    setAvatar(currentUser.avatar || '');
    setBio(currentUser.bio || '');

    // Load persisted creator metadata
    try {
      const key = `${CREATOR_META_STORAGE_PREFIX}${currentUser.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.niches) setSelectedNiches(parsed.niches);
        if (parsed.formats) setSelectedFormats(parsed.formats);
        if (parsed.languages) setSelectedLanguages(parsed.languages);
        if (parsed.instagramHandle) setInstagramHandle(parsed.instagramHandle);
        if (parsed.tiktokHandle) setTiktokHandle(parsed.tiktokHandle);
        if (parsed.youtubeChannel) setYoutubeChannel(parsed.youtubeChannel);
        if (parsed.websiteUrl) setWebsiteUrl(parsed.websiteUrl);
      }
    } catch (err) {
      console.warn('Failed reading creator metadata:', err);
    }
  }, [currentUser]);

  const toggleNiche = (niche: string) => {
    setSelectedNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  };

  const toggleFormat = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validation
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Display name must be at least 2 characters long.');
      setSaving(false);
      return;
    }

    if (selectedNiches.length === 0) {
      setErrorMessage('Please select at least one creative niche.');
      setSaving(false);
      return;
    }

    if (websiteUrl.trim() && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      setErrorMessage('Website URL must start with http:// or https://');
      setSaving(false);
      return;
    }

    try {
      // 1. Update core profile fields via AuthContext
      // Notice: Security boundary enforced: only name, bio, avatar can be updated.
      // id, role, email, accountStatus are strictly preserved!
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim() || currentUser?.avatar,
      });

      // 2. Persist extended creator metadata
      if (currentUser?.id) {
        const key = `${CREATOR_META_STORAGE_PREFIX}${currentUser.id}`;
        localStorage.setItem(
          key,
          JSON.stringify({
            location,
            niches: selectedNiches,
            formats: selectedFormats,
            languages: selectedLanguages,
            instagramHandle,
            tiktokHandle,
            youtubeChannel,
            websiteUrl,
            updatedAt: new Date().toISOString(),
          })
        );
      }

      setSuccessMessage('Creator profile and discovery preferences updated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic profile completion tasks derived from current editor inputs
  const completionTasks: CompletionItem[] = [
    {
      id: 'name',
      label: 'Display Name',
      description: 'Your verified public creator alias',
      isComplete: Boolean(name.trim().length >= 2),
      actionUrl: '#name-field',
      actionLabel: 'Edit',
    },
    {
      id: 'avatar',
      label: 'Profile Photo',
      description: 'High-resolution headshot or studio portrait',
      isComplete: Boolean(avatar.trim() && !avatar.includes('placeholder')),
      actionUrl: '#avatar-field',
      actionLabel: 'Set Photo',
    },
    {
      id: 'bio',
      label: 'Creator Bio & Voice',
      description: 'At least 20 characters describing your style',
      isComplete: Boolean(bio.trim().length >= 20),
      actionUrl: '#bio-field',
      actionLabel: 'Write Bio',
    },
    {
      id: 'location',
      label: 'Creator Location',
      description: 'City and country for regional discovery',
      isComplete: Boolean(location.trim().length > 0),
      actionUrl: '#location-field',
      actionLabel: 'Set City',
    },
    {
      id: 'niches',
      label: 'Content Niches',
      description: 'Select at least one creative niche',
      isComplete: selectedNiches.length > 0,
      actionUrl: '#niches-field',
      actionLabel: 'Select',
    },
    {
      id: 'formats',
      label: 'Content Formats',
      description: 'Select supported deliverable formats',
      isComplete: selectedFormats.length > 0,
      actionUrl: '#formats-field',
      actionLabel: 'Select',
    },
    {
      id: 'social',
      label: 'Social Channel Links',
      description: 'Connect Instagram, TikTok, or YouTube',
      isComplete: Boolean(instagramHandle.trim() || tiktokHandle.trim() || youtubeChannel.trim()),
      actionUrl: '#social-field',
      actionLabel: 'Connect',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#DBE2EF]/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DBE2EF] text-[#112D4E] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Creator Profile Editor</span>
          </div>
          <h1 className="text-3xl font-black text-[#112D4E] tracking-tight">
            Manage Public Presence
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Configure your creator bio, creative niches, supported content formats, and social links.
          </p>
        </div>

        <button
          onClick={() => signOut()}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
        >
          Sign Out
        </button>
      </section>

      {/* Profile Completion & Strength Progress */}
      <ProfileCompletionCard
        type="creator"
        items={completionTasks}
      />

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Account Verification & Security Ledger Card */}
      <section className="bg-white p-6 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3F72AF]" />
            <h3 className="text-xs font-bold text-[#112D4E] uppercase tracking-wider">
              Security & Role Authority
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            ID: {currentUser?.id ? `${currentUser.id.slice(0, 12)}...` : 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]/60">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Authoritative Role</span>
            <span className="text-xs font-black text-[#112D4E] uppercase mt-0.5 block">{currentUser?.role || 'creator'}</span>
            <span className="text-[10px] text-gray-500">Locked to account tier</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]/60">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Email Address</span>
            <span className="text-xs font-bold text-[#112D4E] truncate mt-0.5 block">{currentUser?.email || 'N/A'}</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Verified</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]/60">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Creator Tier</span>
            <span className="text-xs font-black text-[#3F72AF] mt-0.5 block">{currentUser?.tier || 'Verified Pro'}</span>
            <span className="text-[10px] text-gray-500">Tier benefits active</span>
          </div>
        </div>
      </section>

      {/* Form Editor */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity Section */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-6">
          <h2 className="text-base font-black text-[#112D4E] border-b border-[#DBE2EF]/60 pb-3">
            Core Identity
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-2">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt="Avatar Preview"
                className="w-24 h-24 rounded-2xl object-cover ring-2 ring-[#DBE2EF] shadow-xs"
              />
              <span className="text-[10px] text-gray-400 font-semibold">Preview</span>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="text-xs font-bold text-[#112D4E] block mb-1">
                  Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
                  placeholder="e.g. Alex Rivera"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#112D4E] block mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#112D4E] block mb-1">
                  Location & Primary Country
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
                  placeholder="e.g. Bengaluru, India or London, UK"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#112D4E]">
                    Creator Bio
                  </label>
                  <span className="text-[10px] text-gray-400">{bio.length} / 300</span>
                </div>
                <textarea
                  rows={3}
                  value={bio}
                  maxLength={300}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all resize-none"
                  placeholder="Brief narrative highlighting your creative style, audience niche, and aesthetic..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Niche & Category Preferences */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-6">
          <div className="border-b border-[#DBE2EF]/60 pb-3">
            <h2 className="text-base font-black text-[#112D4E]">
              Creative Niches & Capabilities
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select the categories where you actively produce content to receive relevant brand briefs.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-[#112D4E] block mb-2">
                Primary Niches:
              </span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_NICHES.map((niche) => {
                  const selected = selectedNiches.includes(niche);
                  return (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => toggleNiche(niche)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selected
                          ? 'bg-[#112D4E] text-white shadow-xs'
                          : 'bg-[#F9F7F7] text-gray-600 border border-[#DBE2EF] hover:bg-[#DBE2EF]/60'
                      }`}
                    >
                      {niche}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#112D4E] block mb-2">
                Supported Content Formats:
              </span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_FORMATS.map((fmt) => {
                  const selected = selectedFormats.includes(fmt);
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => toggleFormat(fmt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selected
                          ? 'bg-[#3F72AF] text-white shadow-xs'
                          : 'bg-[#F9F7F7] text-gray-600 border border-[#DBE2EF] hover:bg-[#DBE2EF]/60'
                      }`}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#112D4E] block mb-2">
                Languages Spoken:
              </span>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const selected = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-[#F9F7F7] text-gray-600 border border-[#DBE2EF] hover:bg-[#DBE2EF]/60'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Social Channels & Links */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DBE2EF] shadow-xs space-y-6">
          <div className="border-b border-[#DBE2EF]/60 pb-3">
            <h2 className="text-base font-black text-[#112D4E]">
              Connected Social Channels
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Brand partners verify channel authenticity and aesthetic consistency prior to accepting campaign applications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#112D4E] block mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#112D4E] block mb-1">
                TikTok Handle
              </label>
              <input
                type="text"
                value={tiktokHandle}
                onChange={(e) => setTiktokHandle(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#112D4E] block mb-1">
                YouTube Channel
              </label>
              <input
                type="text"
                value={youtubeChannel}
                onChange={(e) => setYoutubeChannel(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
                placeholder="Channel Name / URL"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#112D4E] block mb-1">
                External Portfolio URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-[#112D4E] focus:bg-white focus:border-[#3F72AF] focus:outline-none transition-all"
                placeholder="https://..."
              />
            </div>
          </div>
        </section>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 btn-tactile"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
