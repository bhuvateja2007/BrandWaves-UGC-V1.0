import { Creator, MarketplaceCampaign } from '../../../src/types/marketplace';
import { aiProvider, MatchRationaleResult } from './aiProvider.js';

export interface CreatorMatchBreakdown {
  nicheScore: number;
  formatScore: number;
  portfolioScore: number;
  locationScore: number;
  languageScore: number;
  eligibilityScore: number;
}

export interface CreatorMatchRecommendation {
  creatorId: string;
  creator: Creator;
  overallScore: number;
  breakdown: CreatorMatchBreakdown;
  rationale: MatchRationaleResult;
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
}

// Category adjacency mapping for realistic niche relevance
const ADJACENT_NICHES: Record<string, string[]> = {
  Beverages: ['Food', 'Lifestyle', 'Health & Wellness', 'Travel'],
  'Beauty & Skincare': ['Lifestyle', 'Fashion', 'Wellness', 'Self Care'],
  'Fashion & Streetwear': ['Lifestyle', 'Photography', 'Art & Design', 'Music'],
  'Technology & Audio': ['Gaming', 'Productivity', 'Design', 'Lifestyle'],
  'Home & Living': ['Lifestyle', 'Design', 'Architecture', 'Cooking'],
  'Specialty Coffee': ['Food', 'Beverages', 'Lifestyle', 'Travel'],
  'Sustainable Goods': ['Lifestyle', 'Outdoor', 'Zero Waste', 'Fashion'],
  'Activewear & Fitness': ['Health & Wellness', 'Sports', 'Outdoor', 'Lifestyle'],
  'Artisan Snacks': ['Food', 'Beverages', 'Lifestyle'],
  'Pet Care & Lifestyle': ['Family', 'Lifestyle', 'Outdoor', 'Animals'],
};

/**
 * Calculates deterministic alignment scores for a creator against a campaign brief
 */
export function evaluateCreatorMatch(
  creator: Creator,
  campaign: MarketplaceCampaign
): {
  overallScore: number;
  breakdown: CreatorMatchBreakdown;
  metCriteria: string[];
  unmetCriteria: string[];
  missingInfo: string[];
  relevantPortfolioIds: string[];
} {
  const metCriteria: string[] = [];
  const unmetCriteria: string[] = [];
  const missingInfo: string[] = [];
  const relevantPortfolioIds: string[] = [];

  // 1. Niche Score (Weight: 30%)
  let nicheScore = 20;
  const creatorNiche = (creator.niche || '').toLowerCase();
  const campCategory = (campaign.category || '').toLowerCase();
  const targetNiches = (campaign.targetNiches || []).map((n) => n.toLowerCase());

  if (creatorNiche && campCategory && (creatorNiche.includes(campCategory) || campCategory.includes(creatorNiche))) {
    nicheScore = 100;
    metCriteria.push(`Exact category match: Creator specializes in ${creator.niche}`);
  } else if (targetNiches.some((tn) => tn.includes(creatorNiche) || creatorNiche.includes(tn))) {
    nicheScore = 90;
    metCriteria.push(`Target niche alignment with ${creator.niche}`);
  } else {
    // Check adjacency
    const adjacent = ADJACENT_NICHES[campaign.category] || [];
    if (adjacent.some((a) => a.toLowerCase() === creatorNiche)) {
      nicheScore = 65;
      metCriteria.push(`Adjacent category crossover (${creator.niche} & ${campaign.category})`);
    } else {
      unmetCriteria.push(`Different primary niche (${creator.niche} vs ${campaign.category})`);
    }
  }

  // 2. Format Score (Weight: 25%)
  let formatScore = 40;
  const creatorFormats = creator.formats || [];
  const requiredFormats = campaign.requiredFormats || [campaign.format || '9:16 Vertical Video'];

  if (creatorFormats.length === 0) {
    missingInfo.push('Creator has not listed preferred content formats');
    formatScore = 30;
  } else {
    const matchedFormats = creatorFormats.filter((cf) =>
      requiredFormats.some((rf) =>
        cf.toLowerCase().includes(rf.toLowerCase()) || rf.toLowerCase().includes(cf.toLowerCase())
      )
    );

    if (matchedFormats.length > 0) {
      formatScore = Math.min(100, 60 + matchedFormats.length * 20);
      metCriteria.push(`Supports required format: ${matchedFormats.join(', ')}`);
    } else {
      unmetCriteria.push(`Does not list required format (${requiredFormats.join(', ')})`);
      formatScore = 30;
    }
  }

  // 3. Portfolio Score (Weight: 20%)
  let portfolioScore = 40;
  const portfolio = creator.portfolio || [];

  if (portfolio.length === 0) {
    missingInfo.push('Creator portfolio has zero published deliverables on file');
    portfolioScore = 0;
  } else {
    // Check if any portfolio items relate to the campaign or brand
    portfolio.forEach((item) => {
      const title = (item.title || '').toLowerCase();
      const format = (item.format || '').toLowerCase();
      const matchesBrand = item.relatedBrandId === campaign.brandId;
      const matchesCategory = title.includes(campCategory) || creatorNiche.includes(campCategory);
      const matchesFormat = requiredFormats.some((rf) => format.includes(rf.toLowerCase()));

      if (matchesBrand || matchesCategory || matchesFormat) {
        relevantPortfolioIds.push(item.id);
      }
    });

    if (relevantPortfolioIds.length > 0) {
      portfolioScore = Math.min(100, 70 + relevantPortfolioIds.length * 15);
      metCriteria.push(`${relevantPortfolioIds.length} relevant portfolio samples matching format or category`);
    } else {
      portfolioScore = 55; // generic verified samples exist
      metCriteria.push(`Verified portfolio history (${portfolio.length} samples)`);
    }
  }

  // 4. Location Score (Weight: 10%)
  let locationScore = 70;
  if (!creator.location && !creator.country) {
    missingInfo.push('Creator location not verified');
    locationScore = 40;
  } else {
    // Both domestic (India) and international are supported in BrandWaves
    locationScore = 95;
    metCriteria.push(`Verified location: ${creator.location} (${creator.country})`);
  }

  // 5. Language Score (Weight: 10%)
  let languageScore = 80;
  const languages = creator.languages || [];
  if (languages.length > 0) {
    languageScore = 95;
    metCriteria.push(`Languages supported: ${languages.join(', ')}`);
  } else {
    missingInfo.push('Creator has not specified spoken languages');
    languageScore = 50;
  }

  // 6. Eligibility / Reliability Score (Weight: 5%)
  let eligibilityScore = 75;
  const completed = creator.simulatedMetrics?.completedCampaigns || 0;
  if (completed >= 5) {
    eligibilityScore = 100;
    metCriteria.push(`Proven reliability: ${completed} completed brand briefs`);
  } else if (completed >= 1) {
    eligibilityScore = 85;
    metCriteria.push(`${completed} previously completed brand brief`);
  }

  // Calculate Weighted Overall Score
  const overall = Math.round(
    nicheScore * 0.30 +
    formatScore * 0.25 +
    portfolioScore * 0.20 +
    locationScore * 0.10 +
    languageScore * 0.10 +
    eligibilityScore * 0.05
  );

  return {
    overallScore: Math.min(100, Math.max(0, overall)),
    breakdown: {
      nicheScore,
      formatScore,
      portfolioScore,
      locationScore,
      languageScore,
      eligibilityScore,
    },
    metCriteria,
    unmetCriteria,
    missingInfo,
    relevantPortfolioIds,
  };
}

/**
 * Evaluates and ranks all candidate creators for a campaign brief
 */
export async function matchCreatorsForCampaign(
  campaign: MarketplaceCampaign,
  candidates: Creator[],
  filters?: MatchmakerFilterOptions
): Promise<CreatorMatchRecommendation[]> {
  const recommendations: CreatorMatchRecommendation[] = [];

  for (const creator of candidates) {
    // Apply pre-filters if provided
    if (filters?.niche && filters.niche !== 'all' && creator.niche !== filters.niche) {
      continue;
    }
    if (filters?.country && filters.country !== 'all' && creator.country !== filters.country) {
      continue;
    }
    if (filters?.format && filters.format !== 'all' && !creator.formats?.includes(filters.format)) {
      continue;
    }
    if (filters?.language && filters.language !== 'all' && !creator.languages?.includes(filters.language)) {
      continue;
    }

    const evaluation = evaluateCreatorMatch(creator, campaign);

    if (filters?.minScore && evaluation.overallScore < filters.minScore) {
      continue;
    }

    // Generate executive rationale via AI provider interface
    const rationale = await aiProvider.generateMatchRationale({
      creator: {
        id: creator.id,
        name: creator.name,
        handle: creator.handle,
        niche: creator.niche,
        bio: creator.bio,
        location: creator.location,
        country: creator.country,
        languages: creator.languages,
        formats: creator.formats,
        portfolioTitles: creator.portfolio?.map((p) => p.title),
      },
      campaign: {
        id: campaign.id,
        title: campaign.title,
        category: campaign.category,
        brief: campaign.brief,
        deliverables: campaign.deliverables,
        format: campaign.format,
        productName: campaign.productName,
      },
      scores: {
        overall: evaluation.overallScore,
        niche: evaluation.breakdown.nicheScore,
        format: evaluation.breakdown.formatScore,
        portfolio: evaluation.breakdown.portfolioScore,
        location: evaluation.breakdown.locationScore,
        language: evaluation.breakdown.languageScore,
      },
    });

    recommendations.push({
      creatorId: creator.id,
      creator,
      overallScore: evaluation.overallScore,
      breakdown: evaluation.breakdown,
      rationale,
      metCriteria: evaluation.metCriteria,
      unmetCriteria: evaluation.unmetCriteria,
      missingInfo: evaluation.missingInfo,
      relevantPortfolioIds: evaluation.relevantPortfolioIds,
    });
  }

  // Sort by overall score descending
  return recommendations.sort((a, b) => b.overallScore - a.overallScore);
}
