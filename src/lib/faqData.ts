export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  role: 'customer' | 'creator' | 'brand' | 'admin' | 'all';
}

export const FAQS: FaqItem[] = [
  // -------------------------------------------------------------------------
  // CORE AUTHENTICATION, ONBOARDING & ACCOUNT FAQS (Accessible across all roles)
  // -------------------------------------------------------------------------
  {
    id: 'auth-faq-1',
    role: 'all',
    category: 'Registration & Login',
    question: 'How does signup work?',
    answer: 'Select your account persona (Customer, Creator, or Brand Owner), provide your full name, email address, and a secure password of at least 8 characters. After agreeing to the Marketplace Terms of Service and Privacy Policy, your registration is submitted directly to Supabase Auth. If email confirmation is enabled, check your inbox for an activation link before signing in.'
  },
  {
    id: 'auth-faq-demo-access',
    role: 'all',
    category: 'Registration & Login',
    question: 'How does demo account access work?',
    answer: 'Visitors, evaluators, and hackathon judges can explore BrandWaves without creating an account by using our preconfigured public demo credentials on the login page (/login). Dedicated demo accounts are provided for Creators (creator@brandwaves.io), Brand Owners (brand@brandwaves.io), and Customers (customer@brandwaves.io). Demo accounts are shared sandboxes and sample submissions may be reset periodically. Administrator accounts are strictly private and not published publicly.'
  },
  {
    id: 'auth-faq-campaign-apps',
    role: 'all',
    category: 'Onboarding',
    question: 'How do campaign applications and submissions work?',
    answer: 'Creators browse active briefs in the Explore Campaigns marketplace (/campaigns) and submit a pitch application. Once accepted by the brand partner, creators record their UGC video deliverables and submit them through the Submission Portal (/submit). Brand partners review submissions in their review queue, request revisions if needed, or approve the deliverable to release payment.'
  },
  {
    id: 'auth-faq-2',
    role: 'all',
    category: 'Registration & Login',
    question: 'Why must I confirm my email?',
    answer: 'Email confirmation verifies account ownership and safeguards creators and brand partners against automated spam, spoofed identities, and credential theft. Unconfirmed accounts cannot publish campaign deliverables or access commercial brand dashboards.'
  },
  {
    id: 'auth-faq-3',
    role: 'all',
    category: 'Registration & Login',
    question: 'What if I forget my password?',
    answer: 'Navigate to the Forgot Password page (/forgot-password), enter your registered email address, and click "Send Password Reset Link". You will receive a secure token valid for 1 hour that directs you to the reset page (/reset-password) where you can establish a new password.'
  },
  {
    id: 'auth-faq-4',
    role: 'all',
    category: 'Registration & Login',
    question: "Why can't I access my dashboard?",
    answer: 'Dashboard access requires an authenticated session and verified credentials. If you encounter an Access Restricted screen, verify that your email has been confirmed and that you have completed required onboarding steps. Brand partner accounts also require administrative verification before accessing commercial campaign management.'
  },
  {
    id: 'auth-faq-5',
    role: 'all',
    category: 'Profile & Settings',
    question: 'How can I update my profile?',
    answer: 'Visit Profile Settings (/profile or role-specific hubs like /customer/profile, /creator/profile, /brand/profile). You can update your display name, biography, avatar photo, and social links. Changes are securely saved to your profile record in Supabase PostgreSQL.'
  },
  {
    id: 'auth-faq-6',
    role: 'creator',
    category: 'Onboarding',
    question: 'How does creator onboarding work?',
    answer: 'After creating your creator account, you will be guided through a multi-step onboarding wizard. You will share your content niches, platforms (Instagram, TikTok, YouTube), optional audience size range, and creative goals. Your responses customize your campaign discovery and pitch recommendations.'
  },
  {
    id: 'auth-faq-7',
    role: 'brand',
    category: 'Onboarding',
    question: 'How does brand approval work?',
    answer: 'To prevent unauthorized brand impersonation and ensure creator compensation safety, brand partner registrations undergo manual compliance verification by BrandWaves platform administrators. Once verified, commercial campaign creation and deliverable review permissions are activated.'
  },
  {
    id: 'auth-faq-8',
    role: 'all',
    category: 'Onboarding',
    question: 'Where are my onboarding answers saved?',
    answer: 'Your onboarding answers are stored securely in the user_onboarding (and onboarding_responses) table in Supabase PostgreSQL, linked directly to your authenticated user UUID. They are protected by Row Level Security (RLS) policies so only you and authorized platform administrators can access them.'
  },
  {
    id: 'auth-faq-9',
    role: 'all',
    category: 'Privacy',
    question: 'How can I request account deletion?',
    answer: 'You can request account deletion at any time by contacting privacy@brandwaves.io or submitting a support request. In accordance with GDPR and CCPA privacy standards, your personal data, profile records, and saved preferences will be permanently purged.'
  },
  {
    id: 'auth-faq-10',
    role: 'all',
    category: 'Privacy',
    question: 'Who can see my profile and onboarding answers?',
    answer: 'Public profile elements (display name, public handle, avatar, and published creator portfolios or brand storefronts) are visible across the marketplace. Your private onboarding questionnaire answers, password hashes, and email address are strictly private and accessible only by you and authorized platform governance staff.'
  },

  // -------------------------------------------------------------------------
  // CUSTOMER FAQS
  // -------------------------------------------------------------------------
  {
    id: 'cust-1',
    role: 'customer',
    category: 'General',
    question: 'What is BrandWaves?',
    answer: 'BrandWaves is a creator-brand collaboration marketplace that connects authentic UGC (User-Generated Content) creators with emerging and established brands. Consumers can discover standout products, view authentic creator media, and submit genuine product reviews.'
  },
  {
    id: 'cust-2',
    role: 'customer',
    category: 'Discovery',
    question: 'How do I discover new brands and products?',
    answer: 'You can explore our Standout Products catalog and Brand Directory through the navigation menu. Browse by category, search by product name or keyword, and view detailed showcase pages featuring authentic creator videos and photos.'
  },
  {
    id: 'cust-3',
    role: 'customer',
    category: 'Reviews',
    question: 'How can I review a product?',
    answer: 'Navigate to any product detail page in the catalog and locate the Customer Reviews section. Click "Write a Review" to provide a star rating (1 to 5 stars) and your written feedback. Your review helps other community members make informed purchasing decisions.'
  },
  {
    id: 'cust-4',
    role: 'customer',
    category: 'Profile & Settings',
    question: 'Can I edit my profile and saved preferences?',
    answer: 'Yes. Visit your Customer Profile settings to update your display name, bio, preferred categories, and notification settings at any time.'
  },
  {
    id: 'cust-5',
    role: 'customer',
    category: 'Privacy',
    question: 'How is my personal information used?',
    answer: 'Your information is used solely to personalize your marketplace discovery experience, remember saved products, and authenticate your customer reviews. We never sell your personal data or share private credentials with third parties.'
  },
  {
    id: 'cust-6',
    role: 'customer',
    category: 'Support',
    question: 'How do I contact support or report an issue?',
    answer: 'If you encounter an issue with a listing or notice inappropriate content, use the "Report" button on the listing page or contact our support team at support@brandwaves.io.'
  },

  // -------------------------------------------------------------------------
  // CREATOR FAQS
  // -------------------------------------------------------------------------
  {
    id: 'creat-1',
    role: 'creator',
    category: 'Profile',
    question: 'How do I create and optimize my creator profile?',
    answer: 'Complete your Creator Onboarding and visit Creator Profile settings. Select your niche categories, upload a high-resolution avatar, write a concise bio highlighting your style, and add your social media handles so brands can evaluate your aesthetic.'
  },
  {
    id: 'creat-2',
    role: 'creator',
    category: 'Social Channels',
    question: 'Why should I add my Instagram and TikTok handles?',
    answer: 'Adding your public handles allows brand managers to review your existing content style and past collaborations. Handles are labeled as user-provided and unverified until official platform verification is completed.'
  },
  {
    id: 'creat-3',
    role: 'creator',
    category: 'Campaigns',
    question: 'How do I discover campaigns and active briefs?',
    answer: 'Navigate to Campaign Discovery or Active Briefs in your sidebar. Filter campaigns by niche category, content format (Reel, Short Video, Photo Carousel), and compensation budget to find briefs matching your expertise.'
  },
  {
    id: 'creat-4',
    role: 'creator',
    category: 'Applications',
    question: 'How do I apply to an open campaign?',
    answer: 'Open any campaign brief and click "Apply to Campaign". Write a tailored pitch explaining your creative concept, your proposed rate, and why your audience fits the brand. Once submitted, the brand manager will review your application.'
  },
  {
    id: 'creat-5',
    role: 'creator',
    category: 'Submissions',
    question: 'How do I submit deliverables once accepted?',
    answer: 'Go to My Deliverables or the Submission Portal. Select the active campaign, provide your deliverable link (YouTube, Vimeo, MP4, or cloud storage URL), enter a descriptive title and caption, and submit. The brand will receive notification to evaluate your submission.'
  },
  {
    id: 'creat-6',
    role: 'creator',
    category: 'Revisions',
    question: 'What happens when a brand requests revisions?',
    answer: 'If a brand requests changes, your deliverable status changes to "Revision Requested" with detailed reviewer feedback. You can review the notes in My Deliverables, make the adjustments, and resubmit an updated version directly through the portal.'
  },
  {
    id: 'creat-7',
    role: 'creator',
    category: 'Status',
    question: 'Where can I track the status of my submissions?',
    answer: 'Your My Deliverables dashboard lists all past and active submissions categorized by status: Submitted, Under Review, Approved, or Revision Requested, along with review timestamps.'
  },
  {
    id: 'creat-8',
    role: 'creator',
    category: 'Analytics',
    question: 'How are creator metrics and approval rates calculated?',
    answer: 'Approval rates are mathematically calculated from all finalized review decisions: (Approved Deliverables / (Approved Deliverables + Rejected Deliverables)) * 100. Pending deliverables and active revisions are strictly excluded from the calculation.'
  },
  {
    id: 'creat-9',
    role: 'creator',
    category: 'Portfolio',
    question: 'Can I showcase previous work in my portfolio?',
    answer: 'Yes! Visit Showcase Portfolio in your creator studio to upload sample video reels, photos, and past collaborative deliverables with view counts and engagement highlights.'
  },

  // -------------------------------------------------------------------------
  // BRAND FAQS
  // -------------------------------------------------------------------------
  {
    id: 'brand-1',
    role: 'brand',
    category: 'Brand Setup',
    question: 'How do I set up and manage my brand profile?',
    answer: 'Complete Brand Onboarding and visit Brand Profile. Add your business logo, brand description, website link, primary category, and brand values. This information is displayed on your public Brand Showcase.'
  },
  {
    id: 'brand-2',
    role: 'brand',
    category: 'Campaign Creation',
    question: 'How do I create and publish a campaign brief?',
    answer: 'In your Brand Workspace, click "Create Campaign". Provide a compelling title, budget, required deliverables (format and quantity), target completion deadline, and detailed creative brief guidelines. You can save as draft or publish immediately.'
  },
  {
    id: 'brand-3',
    role: 'brand',
    category: 'Applications',
    question: 'How do I review creator applications and pitches?',
    answer: 'Under Brand Workspace > Applications, you can review incoming pitches from creators who applied to your campaigns. Inspect their portfolio samples, proposed rates, and accept or decline with a single click.'
  },
  {
    id: 'brand-4',
    role: 'brand',
    category: 'Review Queue',
    question: 'How do I evaluate submitted deliverables in the Review Queue?',
    answer: 'Navigate to Review Queue (/review). Deliverables awaiting review display direct media links, caption previews, and creator information. You can either "Approve Deliverable" or "Request Revision" with structured feedback notes.'
  },
  {
    id: 'brand-5',
    role: 'brand',
    category: 'Revisions',
    question: 'How do revision requests work for brands?',
    answer: 'When you request a revision, the creator receives your specific feedback notes and can resubmit an updated deliverable. The deliverable history archives prior versions so you can track improvements before granting final approval.'
  },
  {
    id: 'brand-6',
    role: 'brand',
    category: 'Analytics',
    question: 'How are campaign velocity and analytics calculated?',
    answer: 'Submission Velocity tracks the rolling 28-day submission volume across 4 weekly buckets (W1 to W4). Campaign approval rate, total active creators, and deliverable counts are computed directly from verified Supabase records without artificial inflation.'
  },
  {
    id: 'brand-7',
    role: 'brand',
    category: 'Products',
    question: 'How do I add products to my brand catalog?',
    answer: 'Navigate to Brand Products in your sidebar. Click "Add New Product" to specify the title, description, category, MSRP price, and media showcase image. Published products appear in the public discovery catalog.'
  },
  {
    id: 'brand-8',
    role: 'brand',
    category: 'Security',
    question: 'Is my brand campaign data isolated from other brands?',
    answer: 'Yes. PostgreSQL Row-Level Security (RLS) strictly isolates campaigns, applications, and deliverable reviews to your authenticated brand account. Peer brands cannot access your private submissions or analytics.'
  },

  // -------------------------------------------------------------------------
  // ADMIN FAQS (Internal Operational Documentation)
  // -------------------------------------------------------------------------
  {
    id: 'admin-1',
    role: 'admin',
    category: 'Operations',
    question: 'How does the Global Submission Queue function?',
    answer: 'The Global Submission Queue in the Admin OS allows platform operators to inspect campaign deliverables across all registered brands, audit deliverable URLs for platform safety, and review moderation status.'
  },
  {
    id: 'admin-2',
    role: 'admin',
    category: 'Moderation',
    question: 'How are community posts moderated?',
    answer: 'Content Moderation displays community posts across all channels. Administrators can inspect post content, author profile, and change publication status between published, pending, and hidden.'
  },
  {
    id: 'admin-3',
    role: 'admin',
    category: 'View Switching',
    question: 'How does Switch to User View work?',
    answer: 'The "Switch to User View" action in the admin top navigation allows administrators to preview the user-facing marketplace, customer hub, creator studio, or brand workspace while preserving their full administrative session and database permissions.'
  },
  {
    id: 'admin-4',
    role: 'admin',
    category: 'Security',
    question: 'How is Row-Level Security enforced for administrators?',
    answer: 'Administrators have platform-wide audit access governed by public.is_admin() and database policies. Any administrative action is logged to the system audit trail with timestamps and user identifiers.'
  },
  {
    id: 'admin-5',
    role: 'admin',
    category: 'Analytics',
    question: 'How are platform-level analytics generated?',
    answer: 'Platform analytics aggregate real-time metrics across all brands and creators from Supabase PostgreSQL, including weekly submission timestamps, active campaign counts, and total verified deliverables.'
  }
];

export const FAQ_CATEGORIES = {
  customer: ['All', 'Registration & Login', 'Onboarding', 'General', 'Discovery', 'Reviews', 'Profile & Settings', 'Privacy', 'Support'],
  creator: ['All', 'Registration & Login', 'Onboarding', 'Profile', 'Social Channels', 'Campaigns', 'Applications', 'Submissions', 'Revisions', 'Analytics', 'Portfolio'],
  brand: ['All', 'Registration & Login', 'Onboarding', 'Brand Setup', 'Campaign Creation', 'Applications', 'Review Queue', 'Revisions', 'Analytics', 'Products', 'Security'],
  admin: ['All', 'Operations', 'Moderation', 'View Switching', 'Security', 'Analytics']
};

export const FAQ_ITEMS = FAQS;

export function getFaqsForRole(role?: string | null): FaqItem[] {
  if (!role) return FAQS.filter(f => f.role === 'customer' || f.role === 'all');
  const normalized = role === 'brand_owner' || role === 'brand_admin' ? 'brand' : role;
  return FAQS.filter(f => f.role === normalized || f.role === 'all');
}

export function getFaqCategoriesForRole(role?: string | null): string[] {
  if (!role) return FAQ_CATEGORIES.customer;
  const normalized = (role === 'brand_owner' || role === 'brand_admin' ? 'brand' : role) as keyof typeof FAQ_CATEGORIES;
  return FAQ_CATEGORIES[normalized] || ['All'];
}
