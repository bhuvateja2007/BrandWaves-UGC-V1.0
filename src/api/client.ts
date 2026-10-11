import { 
  Campaign, 
  Submission, 
  User, 
  Post,
  Report,
  ModerationAction,
  Notification,
  HeatmapData, 
  AnalyticsOverview, 
  CreatorStats, 
  LeaderboardEntry,
  SmartReviewResult
} from '../types';
import { TrafficIntelligencePayload, TimeRange } from '../types/traffic';

const API_BASE = '/api';

export const api = {
  // Auth & Profile
  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`);
    const data = await res.json();
    return data.user;
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    const data = await res.json();
    return data.users;
  },

  async registerUser(payload: { email: string; name: string; handle: string; bio?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register account');
    return data.user;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data.user;
  },

  async switchUser(userId: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to switch user');
    return data.user;
  },

  // Campaigns
  async getCampaigns(filters?: { category?: string; platform?: string; status?: string }): Promise<Campaign[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.status) params.append('status', filters.status);
    
    const res = await fetch(`${API_BASE}/campaigns?${params.toString()}`);
    const data = await res.json();
    return data.campaigns;
  },

  async getCampaign(id: string): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/campaigns/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Campaign not found');
    return data.campaign;
  },

  async createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
    return data.campaign;
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update campaign');
    return data.campaign;
  },

  // Community Posts (Workflow A: Immediate Publishing)
  async getPosts(filters?: { authorId?: string; category?: string; status?: string }): Promise<Post[]> {
    const params = new URLSearchParams();
    if (filters?.authorId) params.append('authorId', filters.authorId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);

    const res = await fetch(`${API_BASE}/posts?${params.toString()}`);
    const data = await res.json();
    return data.posts;
  },

  async getPost(id: string): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Post not found');
    return data.post;
  },

  // Persistent Remote Media Upload to Supabase Storage ('brandwaves-media')
  async uploadMedia(file: File, userId?: string, isPrivate?: boolean): Promise<{
    storagePath: string;
    publicUrl: string;
    size: number;
    mimeType: string;
  }> {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: base64,
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
        userId,
        isPrivate,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Media upload to remote storage failed');
    }

    return {
      storagePath: data.storagePath,
      publicUrl: data.publicUrl,
      size: data.size,
      mimeType: data.mimeType,
    };
  },

  async createPost(payload: {
    title: string;
    caption?: string;
    category?: string;
    mediaUrl: string;
    mediaType?: 'image' | 'video';
    mediaStoragePath?: string;
    campaignId?: string;
  }): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to publish post');
    return data.post;
  },

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update post');
    return data.post;
  },

  async deletePost(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete post');
  },

  async unpublishPost(id: string, reason: string): Promise<Post> {
    const res = await fetch(`${API_BASE}/posts/${id}/unpublish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to unpublish post');
    return data.post;
  },

  async reportContent(targetType: 'post' | 'submission' | 'user', targetId: string, reason: string): Promise<Report> {
    const res = await fetch(`${API_BASE}/posts/${targetId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, targetType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit report');
    return data.report;
  },

  // Submissions (Workflow B: Brand Review Queue)
  async getSubmissions(filters?: { status?: string; platform?: string; creatorId?: string; campaignId?: string }): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.creatorId) params.append('creatorId', filters.creatorId);
    if (filters?.campaignId) params.append('campaignId', filters.campaignId);

    const res = await fetch(`${API_BASE}/submissions?${params.toString()}`);
    const data = await res.json();
    return data.submissions;
  },

  async getCreatorSubmissions(filters?: { status?: string; platform?: string }): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.platform) params.append('platform', filters.platform);

    const res = await fetch(`${API_BASE}/submissions/creator?${params.toString()}`);
    const data = await res.json();
    return data.submissions;
  },

  async getSubmission(id: string): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Submission not found');
    return data.submission;
  },

  async createSubmission(payload: {
    campaignId: string;
    platform: string;
    videoUrl: string;
    videoTitle: string;
    thumbnail?: string;
    mediaStoragePath?: string;
    caption?: string;
    tags?: string[];
  }): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create submission');
    return data.submission;
  },

  async reviewSubmission(
    id: string, 
    review: { 
      status: 'approved' | 'revision_requested' | 'rejected'; 
      reviewerNotes: string;
      smartReview?: any;
    }
  ): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to review submission');
    return data.submission;
  },

  async getSubmissionSmartReview(id: string): Promise<SmartReviewResult> {
    const res = await fetch(`${API_BASE}/submissions/${id}/smart-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to evaluate smart submission review');
    }
    return data.smartReview;
  },

  async resubmitSubmission(
    id: string,
    updates: { videoUrl?: string; caption?: string; videoTitle?: string }
  ): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions/${id}/resubmit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resubmit deliverable');
    return data.submission;
  },

  // Admin Portal API
  async getAdminOverview(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/overview`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load admin overview');
    return data.stats;
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load users');
    return data.users;
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended' | 'restricted'): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user status');
    return data.user;
  },

  async getAdminReports(status?: string): Promise<Report[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/admin/reports?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load reports');
    return data.reports;
  },

  async resolveReport(id: string, actionTaken: string): Promise<Report> {
    const res = await fetch(`${API_BASE}/admin/reports/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionTaken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resolve report');
    return data.report;
  },

  async getAdminAuditLogs(): Promise<ModerationAction[]> {
    const res = await fetch(`${API_BASE}/admin/moderation/actions`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load audit logs');
    return data.actions;
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications`);
    const data = await res.json();
    return data.notifications || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
  },

  // Analytics
  async getOverviewAnalytics(): Promise<AnalyticsOverview> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    const data = await res.json();
    return data.analytics;
  },

  async getHeatmap(days = 365, userId?: string): Promise<HeatmapData> {
    const params = new URLSearchParams({ days: days.toString() });
    if (userId) params.append('userId', userId);
    const res = await fetch(`${API_BASE}/analytics/heatmap?${params.toString()}`);
    const data = await res.json();
    return data.heatmap;
  },

  async getCreatorStats(): Promise<CreatorStats> {
    const res = await fetch(`${API_BASE}/analytics/creator-summary`);
    const data = await res.json();
    return data.stats;
  },

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const res = await fetch(`${API_BASE}/leaderboard`);
    const data = await res.json();
    return data.leaderboard;
  },

  // Cyber Cell Traffic Intelligence
  async getTrafficAnalytics(range: TimeRange = '24h', mode: 'live' | 'demo' = 'demo'): Promise<TrafficIntelligencePayload> {
    const params = new URLSearchParams({ range, mode });
    const res = await fetch(`${API_BASE}/analytics/traffic?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch traffic intelligence');
    return data.data;
  },

  async pingTraffic(path: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/analytics/traffic/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
    } catch {
      // Non-blocking telemetry ping
    }
  },

  // Phase 6: AI Creator Matchmaker & Campaign Copilot
  async getAIStatus(): Promise<{
    isConfigured: boolean;
    provider: string;
    model: string;
    mode: 'live' | 'deterministic_demo';
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/ai/status`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        isConfigured: false,
        provider: 'none',
        model: 'deterministic-rules-engine',
        mode: 'deterministic_demo',
        message: 'AI Provider service offline. Using deterministic engine.',
      };
    }
    return data.status;
  },

  async matchCreators(payload: {
    campaignId?: string;
    campaign?: any;
    brandId: string;
    filters?: any;
  }): Promise<{
    campaignId: string;
    campaignTitle: string;
    count: number;
    recommendations: any[];
    aiStatus: any;
  }> {
    const res = await fetch(`${API_BASE}/ai/match-creators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to evaluate creator matches');
    }
    return data;
  },

  async generateCampaignBrief(payload: {
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
  }): Promise<{
    draft: any;
    aiStatus: any;
  }> {
    const res = await fetch(`${API_BASE}/ai/generate-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate campaign brief draft');
    }
    return data;
  },
};
