import { api } from '../api/client';

export interface GenerateBriefParams {
  brandId: string;
  brandName?: string;
  productName?: string;
  productDescription?: string;
  objective: string;
  targetAudience?: string;
  category: string;
  preferredPlatform?: string;
  format?: string;
  desiredDeliverables?: string[];
  tone?: string;
  compensation?: string;
  restrictions?: string;
  timelineDays?: number;
}

export interface CreativeConcept {
  title: string;
  hook: string;
  description: string;
  suggestedFormat: string;
}

export interface GeneratedCampaignBrief {
  titleSuggestions: string[];
  recommendedTitle: string;
  overview: string;
  brief: string;
  objectives: string[];
  creativeConcepts: CreativeConcept[];
  deliverables: string[];
  eligibilityRequirements: string[];
  suggestedApplicationQuestions: string[];
  brandSafeGuidelines: string[];
  prePublicationChecklist: string[];
  suggestedTimeline: {
    applicationWindowDays: number;
    productionWindowDays: number;
    reviewWindowDays: number;
  };
  isLiveAI: boolean;
  modelUsed: string;
}

export const campaignCopilotService = {
  /**
   * Generates a structured campaign brief draft
   */
  async generateBrief(params: GenerateBriefParams): Promise<{
    draft: GeneratedCampaignBrief;
    aiStatus: { isConfigured: boolean; provider: string; model: string; mode: string; message: string };
  }> {
    try {
      const res = await api.generateCampaignBrief(params);
      return {
        draft: res.draft,
        aiStatus: res.aiStatus,
      };
    } catch (err) {
      console.warn('[CampaignCopilotService] Server call failed, using client fallback:', err);

      const brand = params.brandName || 'Brand';
      const product = params.productName || `${brand} Highlight`;
      const category = params.category || 'Lifestyle';
      const format = params.format || '9:16 Vertical Video';

      const draft: GeneratedCampaignBrief = {
        titleSuggestions: [
          `${product}: The ${category} Creator Challenge`,
          `How I Use ${product} Every Day`,
          `${brand} Community Spotlight: Authentic Review`,
        ],
        recommendedTitle: `${product}: The ${category} Creator Challenge`,
        overview: `${brand} invites content creators in ${category} to showcase real experiences with ${product}. Focus on genuine everyday moments, practical utility, and creative storytelling that connects with modern audiences.`,
        brief: `Produce engaging vertical video content spotlighting ${product}. Demonstrate its standout features through clear unboxing, authentic first impressions, or seamless routine integration. Maintain high-resolution visuals, clean audio, and natural creator pacing.`,
        objectives: [
          `Build organic consideration for ${product}`,
          `Demonstrate practical lifestyle use cases`,
          `Engage creator communities through authentic word-of-mouth`,
        ],
        creativeConcepts: [
          {
            title: 'Daily Routine Showcase',
            hook: `Here is why I integrated ${product} into my daily routine...`,
            description: `Walk through your real everyday routine showcasing how ${product} adds value.`,
            suggestedFormat: 'Reel / TikTok (30-45s)',
          },
          {
            title: 'Sensory Detail Breakdown',
            hook: 'Let us take a closer look at the craftsmanship...',
            description: 'Focus on close-up macro details, packaging aesthetics, and sensory impressions.',
            suggestedFormat: 'Cinematic Short',
          },
          {
            title: 'Honest User Review',
            hook: 'My honest thoughts after using this for 2 weeks.',
            description: 'Direct-to-camera candid review discussing pros and unique features.',
            suggestedFormat: 'Direct Pitch & Demo',
          },
        ],
        deliverables: params.desiredDeliverables && params.desiredDeliverables.length > 0
          ? params.desiredDeliverables
          : [`1x 9:16 ${format} (30-60s)`, '1x High-resolution product still photo'],
        eligibilityRequirements: [
          `Active creator in ${category} or lifestyle niches`,
          'Consistent record of high-quality vertical video deliverables',
          'Authentic engagement and clear audio presentation',
        ],
        suggestedApplicationQuestions: [
          `What creative angle would you use to introduce ${product}?`,
          'Link to your best-performing recent product review deliverable.',
        ],
        brandSafeGuidelines: [
          'Must include required disclosure tags (#ad, #collab)',
          'Product must be visible, properly lit, and handled with care',
          'No disparaging comments toward competitors',
        ],
        prePublicationChecklist: [
          'Brief reviewed and verified by brand owner',
          'Application deadline and spots quota configured',
          'Product reference linked correctly in BrandWaves catalog',
        ],
        suggestedTimeline: {
          applicationWindowDays: params.timelineDays ? Math.round(params.timelineDays / 3) : 10,
          productionWindowDays: params.timelineDays ? Math.round(params.timelineDays / 2) : 14,
          reviewWindowDays: 3,
        },
        isLiveAI: false,
        modelUsed: 'client-deterministic-fallback',
      };

      return {
        draft,
        aiStatus: {
          isConfigured: false,
          provider: 'none',
          model: 'client-deterministic-fallback',
          mode: 'deterministic_demo',
          message: 'Client-side brief generation active (offline demo mode).',
        },
      };
    }
  },
};
