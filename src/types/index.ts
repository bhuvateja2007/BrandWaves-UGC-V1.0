export type PublicRole = 'customer' | 'creator' | 'brand_owner';

export type UserRole = 
  | 'admin' 
  | 'moderator' 
  | 'brand_admin' 
  | 'brand_owner' 
  | 'creator' 
  | 'customer' 
  | 'user';

export interface User {
  id: string;
  email?: string;
  name: string;
  handle: string;
  role: UserRole;
  roles?: UserRole[];
  avatar: string;
  tier?: string;
  brandName?: string;
  brandId?: string;
  authorizedBrandIds?: string[];
  bio?: string;
  accountStatus?: 'active' | 'suspended' | 'restricted';
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  title: string;
  brandName: string;
  brandLogo?: string;
  category: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Multi-platform';
  format: string;
  description: string;
  requirements: string[];
  rewardType: 'fixed' | 'rev_share' | 'gifted_product';
  rewardAmount: string;
  spotsTotal: number;
  spotsFilled: number;
  deadline: string;
  status: CampaignStatus;
  eligibleTiers: string[];
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'revision_requested' | 'rejected';

export interface SubmissionRevision {
  revisionNumber: number;
  videoUrl: string;
  videoTitle?: string;
  caption?: string;
  submittedAt: string;
  reviewerNotes?: string;
  reviewedAt?: string;
  status: SubmissionStatus;
}

export type RequirementCheckStatus = 'pass' | 'fail' | 'needs_review' | 'missing_information' | 'not_assessed';

export interface RequirementCheckResult {
  id: string;
  title: string;
  type: 'verifiable' | 'ai_observation' | 'human_judgment';
  status: RequirementCheckStatus;
  evidence: string;
  explanation: string;
  confidence?: number;
}

export interface SmartReviewResult {
  submissionId: string;
  campaignId: string;
  summary: string;
  verifiableChecks: RequirementCheckResult[];
  aiObservations: RequirementCheckResult[];
  humanChecklist: string[];
  suggestedFeedback: string;
  suggestedQuestions: string[];
  mediaAnalysisNotice: string;
  isLiveAI: boolean;
  modelUsed: string;
  reviewedAt: string;
}

export interface Submission {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube';
  videoUrl: string;
  videoTitle: string;
  thumbnail: string;
  mediaStoragePath?: string;
  duration?: string;
  caption?: string;
  tags?: string[];
  status: SubmissionStatus;
  reviewerNotes?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  revisions?: SubmissionRevision[];
  smartReview?: SmartReviewResult;
  createdAt: string;
  updatedAt: string;
}

export type PublicationStatus = 'published' | 'draft' | 'unpublished' | 'moderated';
export type MediaVisibility = 'public' | 'private' | 'restricted';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  title: string;
  caption?: string;
  category: string;
  mediaStoragePath?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  campaignId?: string;
  campaignTitle?: string;
  brandName?: string;
  publicationStatus: PublicationStatus;
  visibility: MediaVisibility;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityDay {
  date: string;
  count: number;
  level: number;
}

export interface HeatmapData {
  days: ActivityDay[];
  totalActivities: number;
  longestStreak: number;
  currentStreak: number;
  periodDays: number;
}

export interface AnalyticsOverview {
  totalSubmissions: number;
  activeCampaigns: number;
  pendingReviews: number;
  approvalRate: number;
  weeklyVelocity: string;
  velocityChange: string;
  totalUsers?: number;
  totalPosts?: number;
}

export interface CreatorStats {
  activeSubmissions: number;
  approvedSubmissions: number;
  revisionRequests: number;
  campaignsJoined: number;
  pendingValidationCount: number;
  actionRequiredCount: number;
  myPostsCount?: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  handle: string;
  avatar: string;
  tier: string;
  approvedCount: number;
  totalEarnings: number;
  approvalRate: number;
  score: number;
}

export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed' | 'resolved';

export interface Report {
  id: string;
  reporterId: string;
  reporterName?: string;
  targetType: 'post' | 'submission' | 'user';
  targetId: string;
  targetTitle?: string;
  reason: string;
  status: ReportStatus;
  actionTaken?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface ModerationAction {
  id: string;
  actorId: string;
  actorName: string;
  targetType: 'post' | 'submission' | 'user' | 'campaign';
  targetId: string;
  action: 'unpublish' | 'republish' | 'suspend_user' | 'reinstate_user' | 'approve_submission' | 'reject_submission' | 'request_revision' | 'delete_post';
  reason?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'approval' | 'revision' | 'submission' | 'system';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}
