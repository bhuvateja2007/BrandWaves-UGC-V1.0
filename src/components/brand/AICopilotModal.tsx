import React, { useState } from 'react';
import { Brand } from '../../types/marketplace';
import { ExtendedProduct } from '../../services/brandProductService';
import { campaignCopilotService, GeneratedCampaignBrief } from '../../services/campaignCopilotService';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Lightbulb,
  CheckSquare,
  Clock,
  Layers,
  Wand2
} from 'lucide-react';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand;
  products: ExtendedProduct[];
  onApplyDraft: (draft: GeneratedCampaignBrief, selectedProductId?: string) => void;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  brand,
  products,
  onApplyDraft,
}) => {
  // Goal Input Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.length > 0 ? products[0].id : ''
  );
  const [objective, setObjective] = useState<string>('Drive authentic consideration and community buzz for our product');
  const [targetAudience, setTargetAudience] = useState<string>('Urban millennials & Gen Z seeking authentic quality');
  const [category, setCategory] = useState<string>(brand.category || 'Lifestyle');
  const [format, setFormat] = useState<string>('9:16 Vertical Video');
  const [tone, setTone] = useState<string>('Authentic, candid, and visually engaging');
  const [timelineDays, setTimelineDays] = useState<number>(30);
  const [restrictions, setRestrictions] = useState<string>('Focus on real impressions. Must feature packaging clearly.');

  // Generation & Review State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedCampaignBrief | null>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Selected editable title
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const prod = products.find((p) => p.id === selectedProductId);

      const res = await campaignCopilotService.generateBrief({
        brandId: brand.id,
        brandName: brand.name,
        productName: prod?.name,
        productDescription: prod?.description,
        objective,
        targetAudience,
        category,
        format,
        tone,
        timelineDays,
        restrictions,
      });

      setGeneratedDraft(res.draft);
      setSelectedTitle(res.draft.recommendedTitle || res.draft.titleSuggestions[0]);
      setAiStatus(res.aiStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to generate campaign brief draft');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToForm = () => {
    if (!generatedDraft) return;

    // Apply the chosen title
    const finalDraft = {
      ...generatedDraft,
      recommendedTitle: selectedTitle || generatedDraft.recommendedTitle,
    };

    onApplyDraft(finalDraft, selectedProductId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-modal border border-[#DBE2EF] overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#DBE2EF] flex items-center justify-between bg-[#F9F7F7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3F72AF] text-white flex items-center justify-center shadow-subtle">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#112D4E]">
                  AI Campaign Copilot
                </h3>
                {aiStatus && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      aiStatus.isConfigured
                        ? 'bg-green-100 text-green-800'
                        : 'bg-[#DBE2EF] text-[#112D4E]'
                    }`}
                  >
                    {aiStatus.isConfigured ? 'Live AI Mode' : 'Deterministic Demo Mode'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Transform brand goals into a structured, editable creator campaign brief for{' '}
                <strong className="text-[#3F72AF]">{brand.name}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-[#112D4E] p-1 rounded-xl hover:bg-[#DBE2EF]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!generatedDraft ? (
            /* Input Goal Form */
            <form onSubmit={handleGenerate} className="flex flex-col gap-5">
              <div className="p-4 rounded-2xl bg-[#DBE2EF]/40 border border-[#DBE2EF] text-xs text-[#112D4E] flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-[#3F72AF] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Provide your creative objectives and product focus below. The Copilot will generate tailored hooks, storytelling angles, deliverables, and pre-publication checklists. You can review and edit every field before applying it to your campaign form.
                </p>
              </div>

              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                  Featured Product Focus *
                </label>
                {products.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">
                    No products added yet. The Copilot will generate a brand-level brief.
                  </p>
                ) : (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs font-semibold text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Objective */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#112D4E]">
                    Campaign Objective *
                  </label>
                  <span className="text-[10px] text-gray-400 font-semibold">What is your primary goal?</span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="e.g. Introduce our new botanical tonic to health-conscious foodies with authentic taste-test reactions."
                  className="w-full px-4 py-2.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
                {/* Quick Objective Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'Product Launch & First Impressions',
                    'Aesthetic Lifestyle Integration',
                    'How-To Routine & Tutorial',
                    'Authentic Customer Review & Unboxing',
                  ].map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setObjective(pill)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F9F7F7] hover:bg-[#DBE2EF] text-gray-600 hover:text-[#112D4E] border border-[#DBE2EF] cursor-pointer transition-colors"
                    >
                      + {pill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                    Target Demographic
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Urban coffee lovers, home baristas"
                    className="w-full px-4 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                    Preferred Content Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-4 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  >
                    <option value="9:16 Vertical Video">9:16 Vertical Video (Reels / TikTok)</option>
                    <option value="Short Video (30-60s)">Short Video (30-60s)</option>
                    <option value="Photo Carousel + Story">Photo Carousel + Story</option>
                    <option value="Cinematic Studio Tour">Cinematic Studio Tour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                    Tone & Creative Direction
                  </label>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="e.g. Candid, high-energy, cinematic, minimalist"
                    className="w-full px-4 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                    Campaign Timeline Window
                  </label>
                  <select
                    value={timelineDays}
                    onChange={(e) => setTimelineDays(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  >
                    <option value={14}>14 Days (Fast sprint)</option>
                    <option value={30}>30 Days (Standard campaign)</option>
                    <option value={45}>45 Days (Extended collaboration)</option>
                  </select>
                </div>
              </div>

              {/* Restrictions */}
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                  Brand Guidelines & Restrictions
                </label>
                <input
                  type="text"
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                  placeholder="e.g. Clear lighting, no competitor branding, proper #ad disclosure"
                  className="w-full px-4 py-2 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              {/* Generate Button */}
              <div className="pt-4 border-t border-[#DBE2EF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] text-xs font-bold text-gray-600 hover:bg-[#F9F7F7] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Draft Brief...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generate Structured Brief</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Review & Edit Generated Draft */
            <div className="flex flex-col gap-6">
              {/* Draft Status Banner */}
              <div className="p-4 rounded-2xl bg-[#DBE2EF]/50 border border-[#DBE2EF] flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#112D4E]">
                      Draft Generated — Human Review Required
                    </h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Review and customize the suggested concepts below. When satisfied, click <strong>"Apply to Campaign Form"</strong> to populate your draft brief for final validation and publication.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratedDraft(null)}
                  className="text-xs font-bold text-[#3F72AF] hover:underline flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
              </div>

              {/* Suggested Titles */}
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-2">
                  Suggested Campaign Titles (Select preferred)
                </label>
                <div className="flex flex-col gap-2">
                  {generatedDraft.titleSuggestions.map((title, idx) => (
                    <label
                      key={idx}
                      className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                        selectedTitle === title
                          ? 'bg-blue-50/70 border-[#3F72AF] ring-2 ring-[#3F72AF]/20'
                          : 'bg-[#F9F7F7] border-[#DBE2EF] hover:bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="campaign_title"
                        checked={selectedTitle === title}
                        onChange={() => setSelectedTitle(title)}
                        className="text-[#3F72AF] focus:ring-[#3F72AF]"
                      />
                      <span className="text-xs font-bold text-[#112D4E]">{title}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Editable Overview */}
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                  Campaign Overview & Description
                </label>
                <textarea
                  rows={3}
                  value={generatedDraft.overview}
                  onChange={(e) =>
                    setGeneratedDraft({ ...generatedDraft, overview: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              {/* Creative Brief */}
              <div>
                <label className="block text-xs font-bold text-[#112D4E] mb-1.5">
                  Creative Direction & Brief Instructions
                </label>
                <textarea
                  rows={4}
                  value={generatedDraft.brief}
                  onChange={(e) =>
                    setGeneratedDraft({ ...generatedDraft, brief: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#F9F7F7] border border-[#DBE2EF] rounded-xl text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              {/* Suggested Creative Concepts */}
              {generatedDraft.creativeConcepts && generatedDraft.creativeConcepts.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#112D4E] mb-2">
                    Suggested Storyboard Angles & Hooks
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {generatedDraft.creativeConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF] flex flex-col justify-between gap-2"
                      >
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#3F72AF] tracking-wider block mb-1">
                            {concept.title}
                          </span>
                          <p className="text-xs font-bold text-[#112D4E] italic mb-1.5">
                            "{concept.hook}"
                          </p>
                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            {concept.description}
                          </p>
                        </div>
                        <span className="text-[9px] font-semibold text-gray-400">
                          {concept.suggestedFormat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables & Pre-Publication Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]">
                  <span className="text-xs font-extrabold text-[#112D4E] block mb-2">
                    Recommended Deliverables
                  </span>
                  <ul className="flex flex-col gap-1.5 text-xs text-gray-700">
                    {generatedDraft.deliverables.map((d, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckSquare className="w-3.5 h-3.5 text-[#3F72AF] shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#F9F7F7] border border-[#DBE2EF]">
                  <span className="text-xs font-extrabold text-[#112D4E] block mb-2">
                    Brand Safety Guidelines
                  </span>
                  <ul className="flex flex-col gap-1.5 text-xs text-gray-700">
                    {generatedDraft.brandSafeGuidelines.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#DBE2EF] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setGeneratedDraft(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] text-xs font-bold text-gray-600 hover:bg-[#F9F7F7] cursor-pointer"
                >
                  Adjust Goals & Re-run
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-[#112D4E] cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyToForm}
                    className="px-6 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-2 cursor-pointer"
                  >
                    <span>Apply to Campaign Form</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
