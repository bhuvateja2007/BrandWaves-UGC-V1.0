import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Brand } from '../../types/marketplace';
import { brandOwnerService, isValidUrl } from '../../services/brandOwnerService';
import { BrandNavHeader } from '../../components/brand/BrandNavHeader';
import { ProfileCompletionCard, CompletionItem } from '../../components/common';
import { 
  Building2, 
  Save, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X, 
  MapPin, 
  Tag, 
  Image as ImageIcon 
} from 'lucide-react';

export const BrandProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);

  // Form states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [location, setLocation] = useState('');
  const [values, setValues] = useState<string[]>([]);
  const [newValueInput, setNewValueInput] = useState('');

  // Status states
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const brand = brandOwnerService.getActiveBrand(currentUser);
      setActiveBrand(brand);
      if (brand) {
        populateForm(brand);
      }
    }
  }, [currentUser]);

  const populateForm = (brand: Brand) => {
    setName(brand.name || '');
    setTagline(brand.tagline || '');
    setDescription(brand.description || '');
    setCategory(brand.category || '');
    setWebsite(brand.website || '');
    setLogo(brand.logo || '');
    setCoverImage(brand.coverImage || '');
    setLocation(brand.location || '');
    setValues(brand.values ? [...brand.values] : []);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleBrandChange = (brand: Brand) => {
    setActiveBrand(brand);
    populateForm(brand);
  };

  const handleAddValue = () => {
    const trimmed = newValueInput.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) return;
    setValues([...values, trimmed]);
    setNewValueInput('');
  };

  const handleRemoveValue = (indexToRemove: number) => {
    setValues(values.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeBrand) return;

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Validate
      if (!name.trim() || name.trim().length < 2) {
        throw new Error('Brand name must be at least 2 characters.');
      }
      if (!description.trim() || description.trim().length < 10) {
        throw new Error('Brand description must be at least 10 characters.');
      }
      if (website.trim() && !isValidUrl(website)) {
        throw new Error('Please enter a valid website URL starting with http:// or https://');
      }
      if (logo.trim() && !isValidUrl(logo)) {
        throw new Error('Please enter a valid logo image URL starting with http:// or https://');
      }
      if (coverImage.trim() && !isValidUrl(coverImage)) {
        throw new Error('Please enter a valid cover image URL starting with http:// or https://');
      }

      const updated = await brandOwnerService.updateBrandProfile(currentUser, activeBrand.id, {
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        category: category.trim(),
        website: website.trim() || undefined,
        logo: logo.trim(),
        coverImage: coverImage.trim() || undefined,
        location: location.trim(),
        values,
      });

      setActiveBrand(updated);
      setSuccessMessage('Brand profile successfully updated and synchronized.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update brand profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!activeBrand) {
    return (
      <div className="flex flex-col min-h-[60vh] items-center justify-center text-center p-6">
        <Building2 className="w-12 h-12 text-gray-400 mb-3" />
        <h2 className="text-xl font-bold text-[#112D4E]">Brand Record Not Found</h2>
        <p className="text-sm text-gray-500 mt-1">
          No authorized brand is selected. Please select a brand you are authorized to manage.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fadeIn">
      <BrandNavHeader
        activeBrand={activeBrand}
        onBrandChange={handleBrandChange}
        title="Brand Profile & Standards"
        subtitle="Manage your brand identity, product standards, and public-facing marketplace presence."
      />

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Brand Profile Strength & Completion Progress */}
      {activeBrand && (
        <ProfileCompletionCard
          type="brand"
          items={[
            {
              id: 'name',
              label: 'Brand Name',
              description: 'Official corporate title',
              isComplete: Boolean(name.trim().length >= 2),
              actionUrl: '#name-field',
              actionLabel: 'Edit',
            },
            {
              id: 'logo',
              label: 'Brand Logo',
              description: 'Square avatar for creator cards',
              isComplete: Boolean(logo.trim()),
              actionUrl: '#logo-field',
              actionLabel: 'Set Logo',
            },
            {
              id: 'cover',
              label: 'Storefront Cover',
              description: 'Wide banner for brand showcase',
              isComplete: Boolean(coverImage.trim()),
              actionUrl: '#cover-field',
              actionLabel: 'Set Cover',
            },
            {
              id: 'tagline',
              label: 'Brand Tagline',
              description: 'Catchy marketing phrase',
              isComplete: Boolean(tagline.trim().length >= 8),
              actionUrl: '#tagline-field',
              actionLabel: 'Write',
            },
            {
              id: 'description',
              label: 'Company Overview',
              description: 'At least 20 characters explaining mission',
              isComplete: Boolean(description.trim().length >= 20),
              actionUrl: '#description-field',
              actionLabel: 'Write',
            },
            {
              id: 'website',
              label: 'Official Website',
              description: 'Verified link to brand home',
              isComplete: Boolean(website.trim() && isValidUrl(website)),
              actionUrl: '#website-field',
              actionLabel: 'Link',
            },
            {
              id: 'values',
              label: 'Brand Values & Ethos',
              description: 'Keywords for AI matchmaker',
              isComplete: values.length > 0,
              actionUrl: '#values-field',
              actionLabel: 'Add Values',
            },
          ]}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Core Identity Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DBE2EF] shadow-subtle flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#DBE2EF]">
            <Building2 className="w-5 h-5 text-[#3F72AF]" />
            <div>
              <h2 className="text-base font-extrabold text-[#112D4E]">Core Brand Information</h2>
              <p className="text-xs text-gray-500">Public profile details displayed across the creator discovery hub.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Crimson Pop"
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Industry Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="Beverages">Beverages</option>
                <option value="Beauty & Skincare">Beauty & Skincare</option>
                <option value="Fashion & Streetwear">Fashion & Streetwear</option>
                <option value="Technology & Audio">Technology & Audio</option>
                <option value="Fitness & Activewear">Fitness & Activewear</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Travel & Luggage">Travel & Luggage</option>
                <option value="Home & Living">Home & Living</option>
                <option value="Sustainable Lifestyle">Sustainable Lifestyle</option>
                <option value="Pet Care & Lifestyle">Pet Care & Lifestyle</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Modern craft sodas brewed with real botanicals and zero artificial fillers."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Brand Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed overview of your brand story, manufacturing philosophy, and products..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                HQ Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Official Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://crimsonpop.demo.brandwaves.io"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Visual Assets Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DBE2EF] shadow-subtle flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#DBE2EF]">
            <ImageIcon className="w-5 h-5 text-[#3F72AF]" />
            <div>
              <h2 className="text-base font-extrabold text-[#112D4E]">Visual Assets</h2>
              <p className="text-xs text-gray-500">Brand logos and background covers used on public pages.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Logo */}
            <div className="flex flex-col gap-3">
              <label className="block text-xs font-bold text-[#112D4E]">
                Brand Logo URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
              {logo && isValidUrl(logo) && (
                <div className="flex items-center gap-3 p-3 bg-[#F9F7F7] rounded-xl border border-[#DBE2EF]">
                  <img
                    src={logo}
                    alt="Logo Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-[#DBE2EF]"
                  />
                  <span className="text-[11px] text-gray-500 font-medium">Logo Live Preview</span>
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div className="flex flex-col gap-3">
              <label className="block text-xs font-bold text-[#112D4E]">
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
              {coverImage && isValidUrl(coverImage) && (
                <div className="flex items-center gap-3 p-3 bg-[#F9F7F7] rounded-xl border border-[#DBE2EF]">
                  <img
                    src={coverImage}
                    alt="Cover Preview"
                    className="w-20 h-12 rounded-lg object-cover border border-[#DBE2EF]"
                  />
                  <span className="text-[11px] text-gray-500 font-medium">Cover Live Preview</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Brand Values & Certifications Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DBE2EF] shadow-subtle flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#DBE2EF]">
            <Tag className="w-5 h-5 text-[#3F72AF]" />
            <div>
              <h2 className="text-base font-extrabold text-[#112D4E]">Brand Values & Quality Standards</h2>
              <p className="text-xs text-gray-500">Key pillars creators mention in deliverables (e.g. 'Cruelty-free', 'Organic', '100% Cane sugar').</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newValueInput}
                onChange={(e) => setNewValueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddValue();
                  }
                }}
                placeholder="Add brand standard (e.g. 'Zero artificial colors')..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
              <button
                type="button"
                onClick={handleAddValue}
                className="px-4 py-2.5 bg-[#112D4E] text-white rounded-xl text-xs font-bold hover:bg-[#112D4E]/90 transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {values.map((val, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-[#DBE2EF]/60 text-[#112D4E] text-xs font-bold flex items-center gap-2 border border-[#DBE2EF]"
                >
                  <span>{val}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(idx)}
                    className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer btn-tactile disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
