import { Creator, MarketplaceCampaign } from '../types/marketplace';
import { api } from '../api/client';
import { CREATORS } from '../data/marketplaceData';

export interface CreatorMatchBreakdown {
  nicheScore: number;
  formatScore: number;
  portfolioScore: number;
  locationScore: number;
  languageScore: number;
  eligibilityScore: number;
}

export interface MatchRationale {
  summary: string;
  strengths: string[];
  considerations: string[];
  recommendedDeliverableAngle?: string;
  isLiveAI: boolean;
}

export interface CreatorMatchRecommendation {
  creatorId: string;
  creator: Creator;
  overallScore: number;
  breakdown: CreatorMatchBreakdown;
  rationale: MatchRationale;
  metCriteria: string[];
  unmetCriteria: string[];
  missingInfo: string[];
  relevantPortfolioIds: string[];
}

export interface MatchmakerFilterOptions {
  niche?: string;
  country?: string;
  format?: string;
  language?: string;
  minScore?: number;
  searchQuery?: string;
}

/**
 * Local client-side evaluation fallback (mirrors server rules for offline support)
 */
function evaluateLocalMatch(creator: Creator, campaign: MarketplaceCampaign): CreatorMatchRecommendation {
  const metCriteria: string[] = [];
  const unmetCriteria: string[] = [];
  const missingInfo: string[] = [];
  const relevantPortfolioIds: string[] = [];

  // 1. Niche alignment
  let nicheScore = 30;
  const cNiche = (creator.niche || '').toLowerCase();
  const campCat = (campaign.category || '').toLowerCase();
  const targetNiches = (campaign.targetNiches || []).map((n) => n.toLowerCase());

  if (cNiche && campCat && (cNiche.includes(campCat) || campCat.includes(cNiche))) {
    nicheScore = 100;
    metCriteria.push(`Exact category match: Creator specializes in ${creator.niche}`);
  } else if (targetNiches.some((tn) => tn.includes(cNiche) || cNiche.includes(tn))) {
    nicheScore = 90;
    metCriteria.push(`Target niche alignment with ${creator.niche}`);
  } else {
    unmetCriteria.push(`Primary niche is ${creator.niche} (campaign seeks ${campaign.category})`);
  }

  // 2. Format alignment
  let formatScore = 40;
  const creatorFormats = creator.formats || [];
  const reqFormats = campaign.requiredFormats || [campaign.format || '9:16 Vertical Video'];

  if (creatorFormats.length === 0) {
    missingInfo.push('No content formats listed');
    formatScore = 20;
  } else {
    const matched = creatorFormats.filter((cf) =>
      reqFormats.some((rf) => cf.toLowerCase().includes(rf.toLowerCase()) || rf.toLowerCase().includes(cf.toLowerCase()))
    );
    if (matched.length > 0) {
      formatScore = Math.min(100, 60 + matched.length * 20);
      metCriteria.push(`Supports format: ${matched.join(', ')}`);
    } else {
      unmetCriteria.push(`Does not produce ${reqFormats.join(', ')}`);
    }
  }

  // 3. Portfolio alignment
  let portfolioScore = 30;
  const portfolio = creator.portfolio || [];
  if (portfolio.length === 0) {
    missingInfo.push('Zero verified portfolio samples on record');
    portfolioScore = 0;
  } else {
    portfolio.forEach((p) => {
      const title = (p.title || '').toLowerCase();
      if (title.includes(campCat) || cNiche.includes(campCat) || p.relatedBrandId === campaign.brandId) {
        relevantPortfolioIds.push(p.id);
      }
    });

    if (relevantPortfolioIds.length > 0) {
      portfolioScore = Math.min(100, 70 + relevantPortfolioIds.length * 15);
      metCriteria.push(`${relevantPortfolioIds.length} relevant category samples in portfolio`);
    } else {
      portfolioScore = 55;
      metCriteria.push(`${portfolio.length} verified portfolio deliverables`);
    }
  }

  // 4. Location & Language
  const locationScore = creator.location ? 95 : 50;
  if (creator.location) metCriteria.push(`Based in ${creator.location}`);
  const languageScore = creator.languages?.length ? 95 : 50;

  // 5. Reliability / Completed briefs
  const completed = creator.simulatedMetrics?.completedCampaigns || 0;
  const eligibilityScore = completed >= 3 ? 100 : completed >= 1 ? 85 : 70;
  if (completed > 0) metCriteria.push(`${completed} previously completed brand briefs`);

  const overall = Math.round(
    nicheScore * 0.30 +
    formatScore * 0.25 +
    portfolioScore * 0.20 +
    locationScore * 0.10 +
    languageScore * 0.10 +
    eligibilityScore * 0.05
  );

  const summary = overall >= 80
    ? `${creator.name} is a high-confidence match (${overall}%) with proven expertise in ${creator.niche} and direct format capabilities.`
    : overall >= 60
    ? `${creator.name} demonstrates solid crossover potential (${overall}%) with strong visual presentation.`
    : `${creator.name} is a creative alternative (${overall}%) worth considering for broader reach outside conventional category bounds.`;

  return {
    creatorId: creator.id,
    creator,
    overallScore: Math.min(100, Math.max(0, overall)),
    breakdown: {
      nicheScore,
      formatScore,
      portfolioScore,
      locationScore,
      languageScore,
      eligibilityScore,
    },
    rationale: {
      summary,
      strengths: metCriteria.slice(0, 3),
      considerations: unmetCriteria.slice(0, 2),
      recommendedDeliverableAngle: `Focus on ${creator.name}'s genuine reaction to the featured product in a 45s vertical reel.`,
      isLiveAI: false,
    },
    metCriteria,
    unmetCriteria,
    missingInfo,
    relevantPortfolioIds,
  };
}

export const creatorMatchmakerService = {
  /**
   * Fetches creator match recommendations for a campaign
   */
  async getRecommendations(
    campaign: MarketplaceCampaign,
    brandId: string,
    filters?: MatchmakerFilterOptions
  ): Promise<{
    recommendations: CreatorMatchRecommendation[];
    aiStatus: { isConfigured: boolean; provider: string; model: string; mode: string; message: string };
  }> {
    try {
      const res = await api.matchCreators({
        campaignId: campaign.id,
        campaign,
        brandId,
        filters,
      });

      return {
        recommendations: res.recommendations,
        aiStatus: res.aiStatus,
      };
    } catch (err) {
      console.warn('[CreatorMatchmakerService] Server evaluation failed, using local engine:', err);

      // Local fallback
      let recs = CREATORS.map((c) => evaluateLocalMatch(c, campaign));

      if (filters?.niche && filters.niche !== 'all') {
        recs = recs.filter((r) => r.creator.niche === filters.niche);
      }
      if (filters?.country && filters.country !== 'all') {
        recs = recs.filter((r) => r.creator.country === filters.country);
      }
      if (filters?.format && filters.format !== 'all') {
        recs = recs.filter((r) => r.creator.formats?.includes(filters.format!));
      }
      if (filters?.language && filters.language !== 'all') {
        recs = recs.filter((r) => r.creator.languages?.includes(filters.language!));
      }
      if (filters?.minScore) {
        recs = recs.filter((r) => r.overallScore >= filters.minScore!);
      }
      if (filters?.searchQuery?.trim()) {
        const q = filters.searchQuery.trim().toLowerCase();
        recs = recs.filter(
          (r) =>
            r.creator.name.toLowerCase().includes(q) ||
            r.creator.handle.toLowerCase().includes(q) ||
            r.creator.bio.toLowerCase().includes(q)
        );
      }

      recs.sort((a, b) => b.overallScore - a.overallScore);

      return {
        recommendations: recs,
        aiStatus: {
          isConfigured: false,
          provider: 'none',
          model: 'deterministic-rules-engine',
          mode: 'deterministic_demo',
          message: 'Client-side deterministic scoring active (Backend API offline or unreachable).',
        },
      };
    }
  },
  matchCreators(campaign: MarketplaceCampaign, brandId: string, filters?: MatchmakerFilterOptions) {
    return this.getRecommendations(campaign, brandId, filters);
  },
};
