// ===========================================================================
// BRANDWAVES ONBOARDING QUESTION CONFIGURATION
// Typed, branching question engine. Add/reorder questions here without
// touching wizard components. Questions reference persona conditions to
// control visibility — no hardcoded branching in component code.
// ===========================================================================

import type { OnboardingStep, OnboardingQuestion } from './onboardingTypes';

// ---------------------------------------------------------------------------
// STEP 1: Persona Selection (shown to everyone)
// ---------------------------------------------------------------------------
export const PERSONA_STEP: OnboardingStep = {
  id: 'persona',
  title: "Let's shape your BrandWaves experience.",
  subtitle: "Tell us a little about yourself. We'll tailor the platform around what you want to achieve.",
  questions: [
    {
      id: 'persona',
      stepId: 'persona',
      label: 'Which best describes you?',
      inputType: 'persona_cards',
      required: true,
      options: [
        {
          value: 'creator',
          label: 'Creator / Influencer',
          description: 'I create content and collaborate with brands.',
          emoji: '🎨',
          icon: 'video-camera',
        },
        {
          value: 'brand',
          label: 'Brand Owner / Business',
          description: 'I want to promote my brand and launch campaigns.',
          emoji: '🏢',
          icon: 'building',
        },
        {
          value: 'student',
          label: 'Student',
          description: "I'm learning, building my portfolio and exploring opportunities.",
          emoji: '🎓',
          icon: 'graduation-cap',
        },
        {
          value: 'developer',
          label: 'Developer / Technical',
          description: 'I build products, tools or digital experiences.',
          emoji: '💻',
          icon: 'code',
        },
        {
          value: 'educator',
          label: 'Educator / Trainer',
          description: 'I teach, mentor or create educational content.',
          emoji: '📚',
          icon: 'book-open',
        },
        {
          value: 'marketing',
          label: 'Marketing / Agency',
          description: 'I manage campaigns, audiences or brand growth.',
          emoji: '📊',
          icon: 'trending-up',
        },
        {
          value: 'other',
          label: 'Other',
          description: 'My role is different.',
          emoji: '✨',
          icon: 'sparkles',
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// STEP 2A: Creator-specific questions
// ---------------------------------------------------------------------------
const CREATOR_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'creator_platforms',
    stepId: 'creator_details',
    label: 'Which platforms do you create for?',
    description: 'Select all that apply.',
    inputType: 'chips',
    multiSelect: true,
    required: true,
    minSelections: 1,
    showForPersonas: 'creator',
    options: [
      { value: 'instagram', label: 'Instagram', emoji: '📸' },
      { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
      { value: 'youtube', label: 'YouTube', emoji: '▶️' },
      { value: 'linkedin', label: 'LinkedIn', emoji: '💼' },
      { value: 'twitter', label: 'X / Twitter', emoji: '🐦' },
      { value: 'facebook', label: 'Facebook', emoji: '📘' },
      { value: 'other', label: 'Other', emoji: '🌐' },
    ],
  },
  {
    id: 'creator_content_type',
    stepId: 'creator_details',
    label: 'What type of content do you create?',
    description: 'Choose your main content categories.',
    inputType: 'chips',
    multiSelect: true,
    required: true,
    minSelections: 1,
    showForPersonas: 'creator',
    options: [
      { value: 'lifestyle', label: 'Lifestyle', emoji: '☀️' },
      { value: 'fashion', label: 'Fashion & Beauty', emoji: '👗' },
      { value: 'tech', label: 'Technology', emoji: '⚡' },
      { value: 'gaming', label: 'Gaming', emoji: '🎮' },
      { value: 'food', label: 'Food', emoji: '🍜' },
      { value: 'education', label: 'Education', emoji: '📖' },
      { value: 'travel', label: 'Travel', emoji: '✈️' },
      { value: 'fitness', label: 'Fitness', emoji: '💪' },
      { value: 'other', label: 'Other', emoji: '✨' },
    ],
  },
  {
    id: 'creator_stage',
    stepId: 'creator_details',
    label: "What's your current creator stage?",
    inputType: 'cards',
    required: true,
    showForPersonas: 'creator',
    options: [
      { value: 'starting', label: 'Just Starting', description: "Building my presence and finding my niche.", emoji: '🌱' },
      { value: 'growing', label: 'Growing', description: 'Building a real audience and momentum.', emoji: '📈' },
      { value: 'established', label: 'Established', description: 'I have an engaged following and brand deals.', emoji: '⭐' },
    ],
  },
  {
    id: 'creator_goal',
    stepId: 'creator_details',
    label: "What's your main goal on BrandWaves?",
    inputType: 'cards',
    required: true,
    showForPersonas: 'creator',
    options: [
      { value: 'brand_collabs', label: 'Get Brand Collaborations', emoji: '🤝' },
      { value: 'earn', label: 'Earn Through Campaigns', emoji: '💰' },
      { value: 'portfolio', label: 'Grow My Portfolio', emoji: '🗂️' },
      { value: 'improve', label: 'Improve My Content', emoji: '🎯' },
      { value: 'relationships', label: 'Build Long-Term Brand Relationships', emoji: '🌟' },
    ],
  },
  {
    id: 'creator_portfolio_url',
    stepId: 'creator_details',
    label: 'Share a portfolio or social profile link (optional)',
    description: 'A link to your best work or main social profile.',
    inputType: 'url',
    required: false,
    placeholder: 'https://instagram.com/yourhandle',
    showForPersonas: 'creator',
  },
];

// ---------------------------------------------------------------------------
// STEP 2B: Brand-specific questions
// ---------------------------------------------------------------------------
const BRAND_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'brand_name',
    stepId: 'brand_details',
    label: "What's your brand or business name?",
    inputType: 'text',
    required: true,
    placeholder: 'Acme Co.',
    showForPersonas: 'brand',
  },
  {
    id: 'brand_industry',
    stepId: 'brand_details',
    label: 'Which industry best describes your business?',
    inputType: 'chips',
    required: true,
    showForPersonas: 'brand',
    options: [
      { value: 'fashion', label: 'Fashion', emoji: '👗' },
      { value: 'food', label: 'Food & Beverage', emoji: '🍜' },
      { value: 'beauty', label: 'Beauty', emoji: '💄' },
      { value: 'tech', label: 'Technology', emoji: '⚡' },
      { value: 'education', label: 'Education', emoji: '📖' },
      { value: 'lifestyle', label: 'Lifestyle', emoji: '☀️' },
      { value: 'gaming', label: 'Gaming', emoji: '🎮' },
      { value: 'health', label: 'Health & Wellness', emoji: '💚' },
      { value: 'other', label: 'Other', emoji: '✨' },
    ],
  },
  {
    id: 'brand_stage',
    stepId: 'brand_details',
    label: "What's your business stage?",
    inputType: 'cards',
    required: true,
    showForPersonas: 'brand',
    options: [
      { value: 'new', label: 'New Business', description: "We're just getting started.", emoji: '🌱' },
      { value: 'growing', label: 'Growing Business', description: 'Scaling up with real traction.', emoji: '📈' },
      { value: 'established', label: 'Established Brand', description: 'Known and trusted in our market.', emoji: '⭐' },
    ],
  },
  {
    id: 'brand_goal',
    stepId: 'brand_details',
    label: "What are you looking to achieve?",
    description: 'Select all that apply.',
    inputType: 'chips',
    multiSelect: true,
    required: true,
    showForPersonas: 'brand',
    options: [
      { value: 'campaigns', label: 'Launch Creator Campaigns', emoji: '🚀' },
      { value: 'ugc', label: 'Generate UGC Content', emoji: '📱' },
      { value: 'awareness', label: 'Increase Brand Awareness', emoji: '📣' },
      { value: 'discovery', label: 'Find Suitable Creators', emoji: '🔍' },
      { value: 'performance', label: 'Measure Campaign Performance', emoji: '📊' },
    ],
  },
  {
    id: 'brand_platforms',
    stepId: 'brand_details',
    label: 'Which platforms are important to your brand?',
    inputType: 'chips',
    multiSelect: true,
    required: false,
    showForPersonas: 'brand',
    options: [
      { value: 'instagram', label: 'Instagram', emoji: '📸' },
      { value: 'tiktok', label: 'TikTok', emoji: '🎵' },
      { value: 'youtube', label: 'YouTube', emoji: '▶️' },
      { value: 'linkedin', label: 'LinkedIn', emoji: '💼' },
    ],
  },
  {
    id: 'brand_website',
    stepId: 'brand_details',
    label: 'Your website or social media URL (optional)',
    inputType: 'url',
    required: false,
    placeholder: 'https://yourbrand.com',
    showForPersonas: 'brand',
  },
];

// ---------------------------------------------------------------------------
// STEP 2C: Student questions
// ---------------------------------------------------------------------------
const STUDENT_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'student_field',
    stepId: 'student_details',
    label: "What are you currently studying?",
    inputType: 'chips',
    required: true,
    showForPersonas: 'student',
    options: [
      { value: 'cs', label: 'Computer Science / IT', emoji: '💻' },
      { value: 'design', label: 'Design', emoji: '🎨' },
      { value: 'marketing', label: 'Marketing', emoji: '📊' },
      { value: 'business', label: 'Business', emoji: '💼' },
      { value: 'media', label: 'Media / Communications', emoji: '📺' },
      { value: 'other', label: 'Other', emoji: '✨' },
    ],
  },
  {
    id: 'student_interests',
    stepId: 'student_details',
    label: "What are you interested in learning or building?",
    description: 'Select all that apply.',
    inputType: 'chips',
    multiSelect: true,
    required: true,
    showForPersonas: 'student',
    options: [
      { value: 'content', label: 'Content Creation', emoji: '🎬' },
      { value: 'webdev', label: 'Web Development', emoji: '🌐' },
      { value: 'marketing', label: 'Marketing', emoji: '📣' },
      { value: 'uiux', label: 'UI/UX Design', emoji: '🖌️' },
      { value: 'video', label: 'Video Editing', emoji: '🎞️' },
      { value: 'branding', label: 'Branding', emoji: '✨' },
      { value: 'entrepreneurship', label: 'Entrepreneurship', emoji: '🚀' },
      { value: 'other', label: 'Other', emoji: '🌟' },
    ],
  },
  {
    id: 'student_goal',
    stepId: 'student_details',
    label: 'What would you like to achieve?',
    inputType: 'cards',
    required: true,
    showForPersonas: 'student',
    options: [
      { value: 'portfolio', label: 'Build a Portfolio', emoji: '🗂️' },
      { value: 'skills', label: 'Learn Practical Skills', emoji: '🧠' },
      { value: 'brands', label: 'Work With Brands', emoji: '🤝' },
      { value: 'opportunities', label: 'Find Opportunities', emoji: '🔍' },
      { value: 'career', label: 'Explore a Career', emoji: '🌟' },
    ],
  },
];

// ---------------------------------------------------------------------------
// STEP 2D: Developer questions
// ---------------------------------------------------------------------------
const DEVELOPER_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'dev_focus',
    stepId: 'dev_details',
    label: "What best describes your technical focus?",
    inputType: 'chips',
    required: true,
    showForPersonas: 'developer',
    options: [
      { value: 'frontend', label: 'Frontend', emoji: '🖥️' },
      { value: 'backend', label: 'Backend', emoji: '⚙️' },
      { value: 'fullstack', label: 'Full Stack', emoji: '🔄' },
      { value: 'ai', label: 'AI / Machine Learning', emoji: '🤖' },
      { value: 'mobile', label: 'Mobile', emoji: '📱' },
      { value: 'uiux', label: 'UI/UX Engineering', emoji: '🎨' },
      { value: 'other', label: 'Other', emoji: '✨' },
    ],
  },
  {
    id: 'dev_experience',
    stepId: 'dev_details',
    label: "What's your current experience level?",
    inputType: 'cards',
    required: true,
    showForPersonas: 'developer',
    options: [
      { value: 'learning', label: 'Still Learning', description: "Actively studying and building.", emoji: '📚' },
      { value: 'beginner', label: 'Beginner', description: "I've built a few things.", emoji: '🌱' },
      { value: 'intermediate', label: 'Intermediate', description: "Comfortable with most concepts.", emoji: '⚡' },
      { value: 'experienced', label: 'Experienced', description: "Years of professional work.", emoji: '🚀' },
    ],
  },
  {
    id: 'dev_goal',
    stepId: 'dev_details',
    label: 'What is your main goal on BrandWaves?',
    inputType: 'cards',
    required: true,
    showForPersonas: 'developer',
    options: [
      { value: 'projects', label: 'Build Projects', emoji: '🔧' },
      { value: 'portfolio', label: 'Grow Technical Portfolio', emoji: '🗂️' },
      { value: 'collaborate', label: 'Collaborate with Creators', emoji: '🤝' },
      { value: 'brands', label: 'Work with Brands', emoji: '🏢' },
      { value: 'explore', label: 'Explore Opportunities', emoji: '🔍' },
    ],
  },
];

// ---------------------------------------------------------------------------
// STEP 2E: Educator questions
// ---------------------------------------------------------------------------
const EDUCATOR_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'educator_subjects',
    stepId: 'educator_details',
    label: 'What subjects do you teach?',
    inputType: 'chips',
    multiSelect: true,
    required: false,
    showForPersonas: 'educator',
    options: [
      { value: 'design', label: 'Design', emoji: '🎨' },
      { value: 'marketing', label: 'Marketing', emoji: '📊' },
      { value: 'tech', label: 'Technology', emoji: '💻' },
      { value: 'business', label: 'Business', emoji: '💼' },
      { value: 'content', label: 'Content Creation', emoji: '🎬' },
      { value: 'other', label: 'Other', emoji: '✨' },
    ],
  },
  {
    id: 'educator_audience',
    stepId: 'educator_details',
    label: "Who is your intended audience?",
    inputType: 'chips',
    multiSelect: true,
    required: false,
    showForPersonas: 'educator',
    options: [
      { value: 'students', label: 'Students', emoji: '🎓' },
      { value: 'professionals', label: 'Professionals', emoji: '💼' },
      { value: 'creators', label: 'Creators', emoji: '🎨' },
      { value: 'businesses', label: 'Businesses', emoji: '🏢' },
      { value: 'general', label: 'General Public', emoji: '🌎' },
    ],
  },
  {
    id: 'educator_creates_content',
    stepId: 'educator_details',
    label: 'Do you create educational content online?',
    inputType: 'cards',
    required: false,
    showForPersonas: 'educator',
    options: [
      { value: 'yes_active', label: 'Yes, actively', emoji: '✅' },
      { value: 'yes_starting', label: "Yes, I'm starting", emoji: '🌱' },
      { value: 'no', label: 'Not yet', emoji: '💭' },
    ],
  },
  {
    id: 'educator_goal',
    stepId: 'educator_details',
    label: "What's your primary goal?",
    inputType: 'cards',
    required: true,
    showForPersonas: 'educator',
    options: [
      { value: 'share', label: 'Share Educational Resources', emoji: '📚' },
      { value: 'presence', label: 'Build a Professional Presence', emoji: '🌟' },
      { value: 'collaborate', label: 'Collaborate with Brands', emoji: '🤝' },
      { value: 'community', label: 'Grow a Learning Community', emoji: '🤗' },
    ],
  },
];

// ---------------------------------------------------------------------------
// STEP 2F: Marketing/Agency questions
// ---------------------------------------------------------------------------
const MARKETING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'marketing_role',
    stepId: 'marketing_details',
    label: "What best describes your work?",
    inputType: 'chips',
    required: true,
    showForPersonas: 'marketing',
    options: [
      { value: 'digital', label: 'Digital Marketing', emoji: '📱' },
      { value: 'social', label: 'Social Media Management', emoji: '📣' },
      { value: 'influencer', label: 'Influencer Marketing', emoji: '⭐' },
      { value: 'creative', label: 'Creative Agency', emoji: '🎨' },
      { value: 'performance', label: 'Performance Marketing', emoji: '📈' },
      { value: 'brand_strategy', label: 'Brand Strategy', emoji: '💡' },
    ],
  },
  {
    id: 'marketing_represents',
    stepId: 'marketing_details',
    label: 'Who do you represent?',
    inputType: 'cards',
    required: true,
    showForPersonas: 'marketing',
    options: [
      { value: 'own', label: 'My own business', emoji: '💼' },
      { value: 'clients', label: 'Clients', emoji: '🤝' },
      { value: 'agency', label: 'An agency', emoji: '🏢' },
      { value: 'multiple', label: 'Multiple brands', emoji: '🌐' },
    ],
  },
  {
    id: 'marketing_needs',
    stepId: 'marketing_details',
    label: 'What do you need most?',
    description: 'Select all that apply.',
    inputType: 'chips',
    multiSelect: true,
    required: true,
    showForPersonas: 'marketing',
    options: [
      { value: 'discovery', label: 'Creator Discovery', emoji: '🔍' },
      { value: 'management', label: 'Campaign Management', emoji: '📋' },
      { value: 'content', label: 'Content Production', emoji: '🎬' },
      { value: 'reporting', label: 'Reporting & Analytics', emoji: '📊' },
      { value: 'client', label: 'Client Collaboration', emoji: '🤝' },
    ],
  },
];

// ---------------------------------------------------------------------------
// STEP 2G: Other clarification
// ---------------------------------------------------------------------------
const OTHER_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'other_description',
    stepId: 'other_details',
    label: 'Tell us a bit about what you do',
    description: "We'd love to understand how BrandWaves can help you.",
    inputType: 'textarea',
    required: false,
    placeholder: "I'm a podcast host interested in brand partnerships...",
    showForPersonas: 'other',
  },
  {
    id: 'other_goal',
    stepId: 'other_details',
    label: "What would you like to do on BrandWaves?",
    inputType: 'chips',
    multiSelect: true,
    required: false,
    showForPersonas: 'other',
    options: [
      { value: 'campaigns', label: 'Explore Campaigns', emoji: '🚀' },
      { value: 'community', label: 'Join the Community', emoji: '🤗' },
      { value: 'content', label: 'Share Content', emoji: '🎬' },
      { value: 'brands', label: 'Work with Brands', emoji: '🤝' },
      { value: 'explore', label: 'Just Exploring', emoji: '🔍' },
    ],
  },
];

// ---------------------------------------------------------------------------
// STEP 3: Cross-role personalization preferences
// ---------------------------------------------------------------------------
const PERSONALIZATION_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'first_action',
    stepId: 'personalization',
    label: 'What do you want to accomplish first?',
    inputType: 'cards',
    required: false,
    options: [
      { value: 'explore_campaigns', label: 'Explore Campaigns', emoji: '🔍' },
      { value: 'setup_profile', label: 'Set Up My Profile', emoji: '✨' },
      { value: 'browse_community', label: 'Browse the Community', emoji: '🤗' },
      { value: 'submit_content', label: 'Submit Content', emoji: '🎬' },
      { value: 'learn_more', label: 'Learn How It Works', emoji: '📖' },
    ],
  },
  {
    id: 'opportunity_types',
    stepId: 'personalization',
    label: 'What type of opportunities interest you?',
    description: 'Select all that apply.',
    inputType: 'chips',
    multiSelect: true,
    required: false,
    showForPersonas: ['creator', 'student', 'developer', 'educator', 'other'],
    options: [
      { value: 'paid', label: 'Paid Campaigns', emoji: '💰' },
      { value: 'product', label: 'Product Gifting', emoji: '🎁' },
      { value: 'portfolio', label: 'Portfolio Building', emoji: '🗂️' },
      { value: 'community', label: 'Community Projects', emoji: '🤝' },
      { value: 'mentorship', label: 'Mentorship', emoji: '🌱' },
    ],
  },
];

// ---------------------------------------------------------------------------
// MASTER STEP LIST (ordered)
// ---------------------------------------------------------------------------
export const ONBOARDING_STEPS: OnboardingStep[] = [
  PERSONA_STEP,
  {
    id: 'creator_details',
    title: 'About your content',
    subtitle: "Help us understand what you create so we can match you with the right brands.",
    showForPersonas: 'creator',
    questions: CREATOR_QUESTIONS,
  },
  {
    id: 'brand_details',
    title: 'About your brand',
    subtitle: "Tell us about your business so we can connect you with the right creators.",
    showForPersonas: 'brand',
    questions: BRAND_QUESTIONS,
  },
  {
    id: 'student_details',
    title: 'Your learning journey',
    subtitle: "Let's find the best opportunities for where you are right now.",
    showForPersonas: 'student',
    questions: STUDENT_QUESTIONS,
  },
  {
    id: 'dev_details',
    title: 'Your technical background',
    subtitle: "Tell us about your skills and what you're looking to build.",
    showForPersonas: 'developer',
    questions: DEVELOPER_QUESTIONS,
  },
  {
    id: 'educator_details',
    title: 'Your teaching practice',
    subtitle: "Let's understand your educational focus and goals.",
    showForPersonas: 'educator',
    questions: EDUCATOR_QUESTIONS,
  },
  {
    id: 'marketing_details',
    title: 'Your marketing work',
    subtitle: "Tell us how you work so we can tailor BrandWaves for you.",
    showForPersonas: 'marketing',
    questions: MARKETING_QUESTIONS,
  },
  {
    id: 'other_details',
    title: 'A bit more about you',
    subtitle: "Help us understand how BrandWaves can work for you.",
    showForPersonas: 'other',
    questions: OTHER_QUESTIONS,
  },
  {
    id: 'personalization',
    title: 'Almost there',
    subtitle: "A few final touches to personalize your experience.",
    questions: PERSONALIZATION_QUESTIONS,
  },
];

/** Returns only the steps relevant to the selected persona */
export function getStepsForPersona(persona: string | null): OnboardingStep[] {
  return ONBOARDING_STEPS.filter((step) => {
    if (!step.showForPersonas) return true; // No condition = show always
    if (Array.isArray(step.showForPersonas)) {
      return step.showForPersonas.includes(persona as any);
    }
    return step.showForPersonas === persona;
  });
}

/** Returns only the questions visible for a given persona */
export function getQuestionsForPersona(
  questions: OnboardingQuestion[],
  persona: string | null
): OnboardingQuestion[] {
  return questions.filter((q) => {
    if (!q.showForPersonas) return true;
    if (Array.isArray(q.showForPersonas)) {
      return q.showForPersonas.includes(persona as any);
    }
    return q.showForPersonas === persona;
  });
}
