export interface CreatorPortfolioItem {
  id: string;
  title: string;
  format: 'Reel' | 'Short Video' | 'YouTube Video' | 'Photo Carousel' | 'Story';
  thumbnail: string;
  views: string;
  engagement: string;
  date: string;
  relatedBrandId?: string;
  relatedProductId?: string;
  relatedCampaignId?: string;
}

export interface CreatorSimulatedMetrics {
  followersCount: string;
  avgViews: string;
  collabRate: string;
  completedCampaigns: number;
  engagementRate: string;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage?: string;
  location: string;
  country: 'India' | 'UK' | 'USA';
  niche: string;
  bio: string;
  languages: string[];
  formats: string[];
  simulatedMetrics: CreatorSimulatedMetrics;
  portfolio: CreatorPortfolioItem[];
  relatedProductIds: string[];
  relatedCampaignIds: string[];
  isFeatured?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  logo: string;
  coverImage: string;
  location: string;
  website?: string;
  values?: string[];
  productIds: string[];
  campaignIds: string[];
  creatorIds: string[];
  isFeatured?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  category: string;
  description: string;
  price: number;
  currency: string; // e.g. '₹' or '$'
  priceFormatted: string;
  image: string;
  gallery?: string[];
  features?: string[];
  isFeatured?: boolean;
  externalPurchaseUrl?: string;
  relatedCreatorIds?: string[];
}

export type MarketplaceCampaignStatus = 'open' | 'in_progress' | 'completed' | 'closed';

export interface MarketplaceCampaign {
  id: string;
  title: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  productId?: string;
  productName?: string;
  category: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Multi-platform';
  format: string;
  description: string;
  brief: string;
  objective: string;
  targetNiches: string[];
  requiredFormats: string[];
  deliverables: string[];
  eligibility: string[];
  deadline: string;
  rewardType: 'fixed' | 'rev_share' | 'gifted_product';
  rewardAmount: string;
  status: MarketplaceCampaignStatus;
  spotsTotal: number;
  spotsFilled: number;
  isFeatured?: boolean;
  relatedCreatorIds: string[];
}
