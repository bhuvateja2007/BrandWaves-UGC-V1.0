// ===========================================================================
// BRANDWAVES ROLE-SPECIFIC ONBOARDING QUESTIONS CONFIGURATION
// Typed, branching question engine for Customer, Creator, and Brand Owner.
// Absolutely zero emojis — uses clean Lucide icon identifiers.
// ===========================================================================

import type { OnboardingStep, OnboardingQuestion } from './onboardingTypes';

// ---------------------------------------------------------------------------
// 1. CUSTOMER ONBOARDING STEPS
// ---------------------------------------------------------------------------
export const CUSTOMER_STEPS: OnboardingStep[] = [
  {
    id: 'customer_profile',
    title: "Welcome to BrandWaves",
    subtitle: "Tell us about yourself to personalize your product and creator discovery.",
    questions: [
      {
        id: 'display_name',
        stepId: 'customer_profile',
        label: 'Full Name or Display Name',
        inputType: 'text',
        required: true,
        placeholder: 'e.g. Jane Doe'
      },
      {
        id: 'region',
        stepId: 'customer_profile',
        label: 'Country or Region',
        inputType: 'text',
        required: false,
        placeholder: 'e.g. United States, United Kingdom'
      },
      {
        id: 'preferred_language',
        stepId: 'customer_profile',
        label: 'Preferred Language',
        inputType: 'chips',
        required: false,
        options: [
          { value: 'english', label: 'English', icon: 'globe' },
          { value: 'spanish', label: 'Spanish', icon: 'globe' },
          { value: 'french', label: 'French', icon: 'globe' },
          { value: 'german', label: 'German', icon: 'globe' },
          { value: 'other', label: 'Other', icon: 'globe' }
        ]
      }
    ]
  },
  {
    id: 'customer_profession',
    title: "Your Professional Background",
    subtitle: "What best describes your current occupation or background?",
    questions: [
      {
        id: 'profession',
        stepId: 'customer_profession',
        label: 'What best describes you?',
        inputType: 'cards',
        required: false,
        options: [
          { value: 'student', label: 'Student', description: 'Enrolled in university, college, or school', icon: 'graduation-cap' },
          { value: 'working_professional', label: 'Working Professional', description: 'Employed in business, tech, or corporate sector', icon: 'briefcase' },
          { value: 'business_owner', label: 'Business Owner', description: 'Running an independent business or retail brand', icon: 'building' },
          { value: 'freelancer', label: 'Freelancer', description: 'Self-employed creative, writer, or consultant', icon: 'palette' },
          { value: 'creator', label: 'Creator or Influencer', description: 'Producing media content on social channels', icon: 'camera' },
          { value: 'educator', label: 'Educator or Trainer', description: 'Teaching, coaching, or mentoring others', icon: 'book-open' },
          { value: 'marketing_professional', label: 'Marketing Professional', description: 'Managing brand campaigns or audience growth', icon: 'trending-up' },
          { value: 'other', label: 'Other', description: 'A different background not listed above', icon: 'sparkles' },
          { value: 'prefer_not_to_say', label: 'Prefer not to say', description: 'Keep professional details private', icon: 'shield' }
        ]
      }
    ]
  },
  {
    id: 'customer_discovery',
    title: "How Did You Find Us?",
    subtitle: "Understanding where our community comes from helps us improve BrandWaves.",
    questions: [
      {
        id: 'discovery_source',
        stepId: 'customer_discovery',
        label: 'How did you hear about BrandWaves?',
        inputType: 'chips',
        required: false,
        options: [
          { value: 'instagram', label: 'Instagram', icon: 'camera' },
          { value: 'youtube', label: 'YouTube', icon: 'play' },
          { value: 'tiktok', label: 'TikTok', icon: 'music' },
          { value: 'linkedin', label: 'LinkedIn', icon: 'briefcase' },
          { value: 'google', label: 'Google Search', icon: 'search' },
          { value: 'friend_referral', label: 'Friend or Referral', icon: 'users' },
          { value: 'university', label: 'College or University', icon: 'graduation-cap' },
          { value: 'event_hackathon', label: 'Event or Hackathon', icon: 'award' },
          { value: 'creator_recommendation', label: 'Creator Recommendation', icon: 'video' },
          { value: 'online_community', label: 'Online Community', icon: 'globe' },
          { value: 'other', label: 'Other', icon: 'sparkles' },
          { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: 'shield' }
        ]
      },
      {
        id: 'discovery_source_other',
        stepId: 'customer_discovery',
        label: 'Please specify (optional)',
        inputType: 'text',
        required: false,
        placeholder: 'Tell us where you discovered BrandWaves'
      }
    ]
  },
  {
    id: 'customer_interests',
    title: "Product & Content Interests",
    subtitle: "Select the categories that interest you most to tailor your showcase feed.",
    questions: [
      {
        id: 'interests',
        stepId: 'customer_interests',
        label: 'Which categories do you enjoy exploring?',
        inputType: 'chips',
        multiSelect: true,
        required: false,
        options: [
          { value: 'technology', label: 'Technology', icon: 'code' },
          { value: 'beauty_skincare', label: 'Beauty and Skincare', icon: 'sparkles' },
          { value: 'fashion', label: 'Fashion', icon: 'shopping-bag' },
          { value: 'fitness_wellness', label: 'Fitness and Wellness', icon: 'heart' },
          { value: 'food_beverage', label: 'Food and Beverages', icon: 'coffee' },
          { value: 'travel', label: 'Travel', icon: 'compass' },
          { value: 'home_lifestyle', label: 'Home and Lifestyle', icon: 'building' },
          { value: 'pets', label: 'Pets', icon: 'heart' },
          { value: 'other', label: 'Other', icon: 'sparkles' }
        ]
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// 2. CREATOR / INFLUENCER ONBOARDING STEPS
// ---------------------------------------------------------------------------
export const CREATOR_STEPS: OnboardingStep[] = [
  {
    id: 'creator_profile',
    title: "Create Your Creator Profile",
    subtitle: "Highlight your creative style so brands can discover your talent.",
    questions: [
      {
        id: 'display_name',
        stepId: 'creator_profile',
        label: 'Public Creator Name or Alias',
        inputType: 'text',
        required: true,
        placeholder: 'e.g. Alex Rivera'
      },
      {
        id: 'creator_niches',
        stepId: 'creator_profile',
        label: 'Creator Niches',
        description: 'Select your primary content verticals (select 1 to 3)',
        inputType: 'chips',
        multiSelect: true,
        required: true,
        minSelections: 1,
        options: [
          { value: 'technology', label: 'Technology', icon: 'code' },
          { value: 'beauty_skincare', label: 'Beauty & Skincare', icon: 'sparkles' },
          { value: 'fashion', label: 'Fashion', icon: 'shopping-bag' },
          { value: 'fitness', label: 'Fitness', icon: 'heart' },
          { value: 'food', label: 'Food', icon: 'coffee' },
          { value: 'travel', label: 'Travel', icon: 'compass' },
          { value: 'lifestyle', label: 'Lifestyle', icon: 'heart' },
          { value: 'gaming', label: 'Gaming', icon: 'zap' },
          { value: 'education', label: 'Education', icon: 'book-open' },
          { value: 'pets', label: 'Pets', icon: 'heart' },
          { value: 'other', label: 'Other', icon: 'sparkles' }
        ]
      },
      {
        id: 'bio',
        stepId: 'creator_profile',
        label: 'Short Bio',
        description: 'Briefly describe your content aesthetic and strengths.',
        inputType: 'textarea',
        required: false,
        placeholder: 'UGC creator specializing in clean tech reviews and daily lifestyle reels...'
      },
      {
        id: 'region',
        stepId: 'creator_profile',
        label: 'Country or Region',
        inputType: 'text',
        required: false,
        placeholder: 'e.g. United States'
      },
      {
        id: 'experience_level',
        stepId: 'creator_profile',
        label: 'Experience Level',
        inputType: 'cards',
        required: false,
        options: [
          { value: 'beginner', label: 'Just Starting', description: 'Building my portfolio and seeking first collaborations', icon: 'sparkles' },
          { value: 'intermediate', label: 'Growing Creator', description: 'Regular content delivery with growing engagement', icon: 'trending-up' },
          { value: 'advanced', label: 'Established Creator', description: 'Experienced with commercial brand deliverables and briefs', icon: 'award' }
        ]
      }
    ]
  },
  {
    id: 'creator_socials',
    title: "Connected Social Channels",
    subtitle: "Add your public profiles. Note: Handles are user-provided and unverified.",
    questions: [
      {
        id: 'instagram_handle',
        stepId: 'creator_socials',
        label: 'Instagram Handle',
        description: 'Enter your handle (e.g. @alexcreates or alexcreates)',
        inputType: 'text',
        required: true,
        placeholder: '@alexcreates'
      },
      {
        id: 'tiktok_handle',
        stepId: 'creator_socials',
        label: 'TikTok Handle (optional)',
        inputType: 'text',
        required: false,
        placeholder: '@alexcreates'
      },
      {
        id: 'youtube_handle',
        stepId: 'creator_socials',
        label: 'YouTube Channel or Handle (optional)',
        inputType: 'text',
        required: false,
        placeholder: 'youtube.com/@alexcreates'
      },
      {
        id: 'portfolio_url',
        stepId: 'creator_socials',
        label: 'External Portfolio or Media Kit URL (optional)',
        inputType: 'url',
        required: false,
        placeholder: 'https://alexcreates.com'
      }
    ]
  },
  {
    id: 'creator_preferences',
    title: "Audience & Collaboration Preferences",
    subtitle: "Help brands match you with relevant campaigns and budgets.",
    questions: [
      {
        id: 'content_formats',
        stepId: 'creator_preferences',
        label: 'Preferred Content Formats',
        inputType: 'chips',
        multiSelect: true,
        required: true,
        minSelections: 1,
        options: [
          { value: 'short_video', label: 'Short Video (Reels / TikTok)', icon: 'video' },
          { value: 'long_video', label: 'Long-form YouTube', icon: 'play' },
          { value: 'carousel', label: 'Photo Carousels', icon: 'camera' },
          { value: 'unboxing', label: 'Product Unboxing', icon: 'package' },
          { value: 'livestream', label: 'Live Streaming', icon: 'tv' }
        ]
      },
      {
        id: 'audience_size',
        stepId: 'creator_preferences',
        label: 'Approximate Audience Size',
        inputType: 'cards',
        required: false,
        options: [
          { value: 'under_10k', label: 'Under 10K', description: 'Nano-creator focused on tight community engagement', icon: 'users' },
          { value: '10k_50k', label: '10K - 50K', description: 'Micro-creator with dedicated audience retention', icon: 'users' },
          { value: '50k_100k', label: '50K - 100K', description: 'Mid-tier creator with established reach', icon: 'award' },
          { value: '100k_plus', label: '100K+', description: 'Macro-creator with high impression volume', icon: 'crown' }
        ]
      },
      {
        id: 'collaboration_preferences',
        stepId: 'creator_preferences',
        label: 'Collaboration Preferences',
        inputType: 'chips',
        multiSelect: true,
        required: false,
        options: [
          { value: 'paid_campaigns', label: 'Paid Brand Campaigns', icon: 'dollar' },
          { value: 'gifting_pr', label: 'Product Gifting & PR', icon: 'package' },
          { value: 'ambassadorship', label: 'Long-Term Ambassadorship', icon: 'award' },
          { value: 'affiliate', label: 'Affiliate & Commission', icon: 'trending-up' }
        ]
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// 3. BRAND OWNER / BUSINESS ONBOARDING STEPS
// ---------------------------------------------------------------------------
export const BRAND_STEPS: OnboardingStep[] = [
  {
    id: 'brand_identity',
    title: "Register Your Brand Identity",
    subtitle: "Establish your brand profile to start creating UGC campaigns.",
    questions: [
      {
        id: 'brand_name',
        stepId: 'brand_identity',
        label: 'Brand or Business Name',
        inputType: 'text',
        required: true,
        placeholder: 'e.g. Lumina Skincare'
      },
      {
        id: 'brand_category',
        stepId: 'brand_identity',
        label: 'Business Category',
        inputType: 'chips',
        required: true,
        options: [
          { value: 'beauty_skincare', label: 'Beauty & Skincare', icon: 'sparkles' },
          { value: 'technology', label: 'Technology', icon: 'code' },
          { value: 'fashion_apparel', label: 'Fashion & Apparel', icon: 'shopping-bag' },
          { value: 'food_beverage', label: 'Food & Beverage', icon: 'coffee' },
          { value: 'health_wellness', label: 'Health & Wellness', icon: 'heart' },
          { value: 'home_lifestyle', label: 'Home & Living', icon: 'building' },
          { value: 'gaming', label: 'Gaming', icon: 'zap' },
          { value: 'other', label: 'Other', icon: 'sparkles' }
        ]
      },
      {
        id: 'brand_description',
        stepId: 'brand_identity',
        label: 'Brand Tagline & Mission',
        description: 'Explain what makes your products unique.',
        inputType: 'textarea',
        required: true,
        placeholder: 'Clean, dermatologist-approved skincare formulations designed for daily balance.'
      },
      {
        id: 'brand_website',
        stepId: 'brand_identity',
        label: 'Official Website URL (optional)',
        inputType: 'url',
        required: false,
        placeholder: 'https://luminaskincare.com'
      },
      {
        id: 'brand_region',
        stepId: 'brand_identity',
        label: 'Business Country or Headquarters',
        inputType: 'text',
        required: false,
        placeholder: 'e.g. United States'
      }
    ]
  },
  {
    id: 'brand_organization',
    title: "Organization & Marketing Profile",
    subtitle: "Help creators understand your business scale and campaign needs.",
    questions: [
      {
        id: 'business_type',
        stepId: 'brand_organization',
        label: 'Business Structure',
        inputType: 'cards',
        required: false,
        options: [
          { value: 'startup', label: 'Startup', description: 'Early-stage emerging brand', icon: 'zap' },
          { value: 'small_business', label: 'Small Business', description: 'Independent boutique or local commerce', icon: 'building' },
          { value: 'growing_brand', label: 'Growing Direct-To-Consumer', description: 'Scaling online eCommerce presence', icon: 'trending-up' },
          { value: 'agency', label: 'Marketing Agency', description: 'Managing campaigns on behalf of multiple client brands', icon: 'briefcase' },
          { value: 'established_enterprise', label: 'Established Enterprise', description: 'Nationally or globally recognized brand', icon: 'building' }
        ]
      },
      {
        id: 'org_size',
        stepId: 'brand_organization',
        label: 'Team Size',
        inputType: 'chips',
        required: false,
        options: [
          { value: '1_10', label: '1 - 10 employees', icon: 'users' },
          { value: '11_50', label: '11 - 50 employees', icon: 'users' },
          { value: '51_200', label: '51 - 200 employees', icon: 'building' },
          { value: '201_plus', label: '201+ employees', icon: 'building' }
        ]
      },
      {
        id: 'marketing_objectives',
        stepId: 'brand_organization',
        label: 'Primary Marketing Objectives',
        description: 'Select your main goals on BrandWaves',
        inputType: 'chips',
        multiSelect: true,
        required: false,
        options: [
          { value: 'ugc_library', label: 'Build UGC Content Library', icon: 'video' },
          { value: 'brand_awareness', label: 'Boost Brand Awareness', icon: 'trending-up' },
          { value: 'product_launch', label: 'Launch New Product', icon: 'package' },
          { value: 'conversion', label: 'Drive Direct Conversions', icon: 'dollar' },
          { value: 'community', label: 'Creator Community Building', icon: 'users' }
        ]
      }
    ]
  },
  {
    id: 'brand_campaign_preferences',
    title: "Campaign & Creator Preferences",
    subtitle: "Specify the creator niches and formats your brand values most.",
    questions: [
      {
        id: 'preferred_creator_niches',
        stepId: 'brand_campaign_preferences',
        label: 'Target Creator Niches',
        inputType: 'chips',
        multiSelect: true,
        required: false,
        options: [
          { value: 'technology', label: 'Technology', icon: 'code' },
          { value: 'beauty_skincare', label: 'Beauty & Skincare', icon: 'sparkles' },
          { value: 'fashion', label: 'Fashion', icon: 'shopping-bag' },
          { value: 'fitness', label: 'Fitness', icon: 'heart' },
          { value: 'food', label: 'Food', icon: 'coffee' },
          { value: 'travel', label: 'Travel', icon: 'compass' },
          { value: 'lifestyle', label: 'Lifestyle', icon: 'heart' }
        ]
      },
      {
        id: 'preferred_content_formats',
        stepId: 'brand_campaign_preferences',
        label: 'Required Content Formats',
        inputType: 'chips',
        multiSelect: true,
        required: false,
        options: [
          { value: 'short_video', label: 'TikTok / Reels Short Video', icon: 'video' },
          { value: 'youtube_video', label: 'YouTube Long-form', icon: 'play' },
          { value: 'photo_carousel', label: 'High-Res Photo Carousel', icon: 'camera' },
          { value: 'product_review', label: 'In-Depth Product Review', icon: 'award' }
        ]
      },
      {
        id: 'discovery_source',
        stepId: 'brand_campaign_preferences',
        label: 'How did your business discover BrandWaves?',
        inputType: 'chips',
        required: false,
        options: [
          { value: 'google', label: 'Google Search', icon: 'search' },
          { value: 'linkedin', label: 'LinkedIn', icon: 'briefcase' },
          { value: 'referral', label: 'Business Referral', icon: 'users' },
          { value: 'creator_recommendation', label: 'Creator Recommendation', icon: 'video' },
          { value: 'event_hackathon', label: 'Event or Hackathon', icon: 'award' },
          { value: 'other', label: 'Other', icon: 'sparkles' }
        ]
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// HELPER: Select steps for role or fallback
// ---------------------------------------------------------------------------
export function getStepsForRole(role?: string | null): OnboardingStep[] {
  switch (role) {
    case 'creator':
      return CREATOR_STEPS;
    case 'brand_owner':
    case 'brand_admin':
      return BRAND_STEPS;
    case 'customer':
    case 'user':
    default:
      return CUSTOMER_STEPS;
  }
}

/** Legacy helper compatibility */
export function getStepsForPersona(persona: string | null): OnboardingStep[] {
  return getStepsForRole(persona);
}

export function getQuestionsForPersona(questions: OnboardingQuestion[], _persona: string | null): OnboardingQuestion[] {
  return questions;
}
