import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brand } from '../../types/marketplace';
import { brandOwnerService } from '../../services/brandOwnerService';
import { brandCampaignService } from '../../services/brandCampaignService';
import { brandProductService, ExtendedProduct } from '../../services/brandProductService';
import { 
  Compass, 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Plus, 
  X, 
  Calendar, 
  Gift, 
  Users, 
  Layers,
  Sparkles,
  Wand2,
  CheckCircle2
} from 'lucide-react';
import { AICopilotModal } from '../../components/brand/AICopilotModal';
import { GeneratedCampaignBrief } from '../../services/campaignCopilotService';

export const BrandCampaignCreatePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState<'Instagram' | 'TikTok' | 'YouTube' | 'Multi-platform'>('Instagram');
  const [format, setFormat] = useState('9:16 Vertical Reel');
  const [productId, setProductId] = useState<string>('');
  const [deliverables, setDeliverables] = useState<string[]>([
    '1x 60s High-energy Vertical Reel',
    '2x Story frame tags with link sticker',
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [eligibility, setEligibility] = useState<string[]>([
    'Minimum 5,000 engaged audience',
    'Demonstrated video styling aesthetic',
  ]);
  const [newEligibilityInput, setNewEligibilityInput] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [rewardType, setRewardType] = useState<'fixed' | 'rev_share' | 'gifted_product'>('fixed');
  const [rewardAmount, setRewardAmount] = useState('₹18,000 Fixed');
  const [spotsTotal, setSpotsTotal] = useState<number>(10);
  const [status, setStatus] = useState<'open' | 'closed'>('open');

  // AI Copilot State
  const [copilotModalOpen, setCopilotModalOpen] = useState(false);
  const [appliedFromAI, setAppliedFromAI] = useState(false);

  const handleApplyCopilotDraft = (draft: GeneratedCampaignBrief, selectedProdId?: string) => {
    if (draft.recommendedTitle) {
      setTitle(draft.recommendedTitle);
    } else if (draft.titleSuggestions && draft.titleSuggestions.length > 0) {
      setTitle(draft.titleSuggestions[0]);
    }

    if (draft.brief) {
      setBrief(draft.brief);
    }

    const compiledDescription = [
      draft.overview,
      '\n--- Creative Concepts ---',
      ...draft.creativeConcepts.map(
        (c) => `• ${c.title} (${c.suggestedFormat}): ${c.hook} — ${c.description}`
      ),
      '\n--- Brand Safety Guidelines ---',
      ...draft.brandSafeGuidelines.map((g) => `• ${g}`),
    ].join('\n');

    setDescription(compiledDescription);

    if (draft.objectives && draft.objectives.length > 0) {
      setObjective(draft.objectives.join('; '));
    }

    if (draft.deliverables && draft.deliverables.length > 0) {
      setDeliverables(draft.deliverables);
    }

    if (draft.eligibilityRequirements && draft.eligibilityRequirements.length > 0) {
      setEligibility(draft.eligibilityRequirements);
    }

    if (selectedProdId) {
      setProductId(selectedProdId);
    }

    setAppliedFromAI(true);
    setCopilotModalOpen(false);
  };

  useEffect(() => {
    if (!currentUser) return;
    const brand = brandOwnerService.getActiveBrand(currentUser);
    setActiveBrand(brand);
    if (brand) {
      setCategory(brand.category);
      const prods = brandProductService.getProductsForBrand(brand.id);
      setProducts(prods);
      if (prods.length > 0) {
        setProductId(prods[0].id);
      }
    }
  }, [currentUser]);

  const handleAddDeliverable = () => {
    const t = newDeliverableInput.trim();
    if (!t || deliverables.includes(t)) return;
    setDeliverables([...deliverables, t]);
    setNewDeliverableInput('');
  };

  const handleRemoveDeliverable = (idx: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  };

  const handleAddEligibility = () => {
    const t = newEligibilityInput.trim();
    if (!t || eligibility.includes(t)) return;
    setEligibility([...eligibility, t]);
    setNewEligibilityInput('');
  };

  const handleRemoveEligibility = (idx: number) => {
    setEligibility(eligibility.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeBrand) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (!title.trim() || title.trim().length < 3) {
        throw new Error('Campaign title must be at least 3 characters.');
      }
      if (!brief.trim() || brief.trim().length < 15) {
        throw new Error('Creative brief must be at least 15 characters.');
      }
      if (!description.trim() || description.trim().length < 20) {
        throw new Error('Campaign description must be at least 20 characters.');
      }
      if (deliverables.length === 0) {
        throw new Error('Please outline at least one required deliverable.');
      }
      if (!deadline) {
        throw new Error('Application deadline is required.');
      }

      await brandCampaignService.createCampaign(currentUser, {
        brandId: activeBrand.id,
        title: title.trim(),
        brief: brief.trim(),
        description: description.trim(),
        objective: objective.trim() || brief.trim(),
        category: category.trim(),
        platform,
        format,
        productId: productId || undefined,
        deliverables,
        eligibility,
        deadline,
        rewardType,
        rewardAmount: rewardAmount.trim(),
        spotsTotal: Number(spotsTotal),
        status: status as any,
      });

      navigate('/brand/campaigns');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to launch campaign brief.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/brand/campaigns"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#112D4E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </Link>
        <span className="text-xs font-extrabold uppercase text-[#3F72AF]">
          {activeBrand?.name}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DBE2EF] shadow-subtle">
        <div className="flex items-center gap-3 pb-6 border-b border-[#DBE2EF] mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#DBE2EF] text-[#112D4E] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#112D4E] tracking-tight">
              Launch Campaign Brief
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Publish structured requirements and deliverables for creators on the BrandWaves marketplace.
            </p>
          </div>
        </div>

        {/* AI Campaign Copilot Hero Banner */}
        <div className="mb-6 p-5 rounded-2xl bg-[#DBE2EF]/50 border border-[#DBE2EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#3F72AF] flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#112D4E] flex items-center gap-2">
                <span>AI Campaign Copilot</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white text-[#3F72AF] border border-[#DBE2EF]">
                  Editable Draft Assistant
                </span>
              </h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed max-w-xl">
                Convert your brand and product goals into structured titles, creative hooks, mandatory deliverables, eligibility rules, and brand safety guidelines. Review and edit every field before publishing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCopilotModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Wand2 className="w-4 h-4" />
            <span>Generate Brief with Copilot</span>
          </button>
        </div>

        {appliedFromAI && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 mb-6 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              AI Campaign draft applied into form! Review and fine-tune all fields below before submitting. (AI never publishes campaigns automatically).
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Campaign Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Terrace Botanical Pour Challenge"
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            {/* Associated Product */}
            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Featured Product
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="">No specific product (General brand)</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.priceFormatted})
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Content Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Beverages, Lifestyle, Tech..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            {/* Platform & Format */}
            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Target Platform <span className="text-rose-500">*</span>
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Multi-platform">Multi-platform</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Deliverable Format <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="e.g. 9:16 Vertical Reel"
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            {/* Creative Brief */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Creative Brief Summary <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Summarize the core creative direction in 1-2 sentences..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            {/* Full Description & Guidelines */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Detailed Campaign Description & Do's / Don'ts <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide complete instructions: hooks, audio guidelines, lighting, required hashtags, disclosure requirements..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            {/* Deliverables List */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Required Deliverables <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newDeliverableInput}
                  onChange={(e) => setNewDeliverableInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                  placeholder="e.g. 1x 60s Reel with audio soundscape..."
                  className="flex-1 px-4 py-2 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  className="px-4 py-2 bg-[#112D4E] text-white text-xs font-bold rounded-xl hover:bg-[#112D4E]/90 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {deliverables.map((deliv, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#F9F7F7] border border-[#DBE2EF] flex items-center justify-between text-xs font-semibold text-[#112D4E]"
                  >
                    <span>{deliv}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility Requirements */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Creator Eligibility Requirements
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newEligibilityInput}
                  onChange={(e) => setNewEligibilityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEligibility();
                    }
                  }}
                  placeholder="e.g. Minimum 10k reach, India based..."
                  className="flex-1 px-4 py-2 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddEligibility}
                  className="px-4 py-2 bg-[#112D4E] text-white text-xs font-bold rounded-xl hover:bg-[#112D4E]/90 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {eligibility.map((el, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-[#DBE2EF]/60 text-[#112D4E] text-xs font-bold flex items-center gap-2 border border-[#DBE2EF]"
                  >
                    <span>{el}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEligibility(idx)}
                      className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Compensation & Quota */}
            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Reward Model
              </label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              >
                <option value="fixed">Fixed Escrow Compensation</option>
                <option value="gifted_product">Gifted Product + Flat Fee</option>
                <option value="rev_share">Revenue Share / Affiliate Commission</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Compensation Label <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder="e.g. ₹18,000 Fixed or $600 Fixed"
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Creator Spots Total <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={spotsTotal}
                onChange={(e) => setSpotsTotal(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                Application Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#DBE2EF] bg-[#F9F7F7] text-xs font-medium text-[#112D4E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-[#DBE2EF] flex items-center justify-end gap-3">
            <Link
              to="/brand/campaigns"
              className="px-5 py-2.5 rounded-xl border border-[#DBE2EF] bg-white hover:bg-[#F9F7F7] text-xs font-bold text-gray-600 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Launching...' : 'Publish Campaign Brief'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* AI Campaign Copilot Modal */}
      {activeBrand && (
        <AICopilotModal
          isOpen={copilotModalOpen}
          onClose={() => setCopilotModalOpen(false)}
          brand={activeBrand}
          products={products}
          onApplyDraft={handleApplyCopilotDraft}
        />
      )}
    </div>
  );
};
