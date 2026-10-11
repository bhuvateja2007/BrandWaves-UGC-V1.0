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
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const API_BASE = '/api';

/**
 * Robust JSON request wrapper that validates HTTP status and Content-Type
 * before parsing JSON, preventing cryptic "Unexpected token 'T'" errors.
 */
async function safeRequest<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Build headers and attach active Supabase Bearer token when available
  const headersObj: Record<string, string> = {};
  if (options?.headers) {
    if (typeof Headers !== 'undefined' && options.headers instanceof Headers) {
      options.headers.forEach((v, k) => { headersObj[k] = v; });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([k, v]) => { headersObj[k] = v; });
    } else {
      Object.assign(headersObj, options.headers);
    }
  }

  if (isSupabaseConfigured && !headersObj['Authorization'] && !headersObj['authorization']) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        headersObj['Authorization'] = `Bearer ${data.session.access_token}`;
      }
    } catch {}
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers: headersObj,
  };

  let res: Response;
  try {
    res = await fetch(url, mergedOptions);
  } catch (netErr: any) {
    throw new Error(`Unable to connect to backend server on port 3001 (${netErr.message || 'Connection failed'}).`);
  }

  const contentType = res.headers.get('content-type') || '';

  // Handle non-JSON responses (e.g., HTML 404 / 502 / 504 from Vite proxy or static host)
  if (!contentType.includes('application/json')) {
    const rawText = await res.text().catch(() => '');
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`API endpoint not found (HTTP 404): ${endpoint}. Backend route may be unmounted.`);
      }
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(`Backend service unavailable (HTTP ${res.status}). Verify API server is active on port 3001.`);
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error(`Access Denied (HTTP ${res.status}): Unauthorized operation.`);
      }
      const cleanSnippet = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
      throw new Error(`Server returned non-JSON response (HTTP ${res.status}): ${cleanSnippet || 'Unexpected error'}`);
    }
    throw new Error(`Expected JSON response from ${endpoint} but received ${contentType || 'non-JSON payload'}.`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch (jsonErr: any) {
    throw new Error(`Invalid JSON received from ${endpoint}: ${jsonErr.message}`);
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `API request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth & Profile
  async getCurrentUser(): Promise<User> {
    const data = await safeRequest('/auth/me');
    return data.user;
  },

  async getUsers(): Promise<User[]> {
    const data = await safeRequest('/auth/users');
    return data.users;
  },

  async registerUser(payload: { email: string; name: string; handle: string; bio?: string }): Promise<User> {
    const data = await safeRequest('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.user;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const data = await safeRequest('/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  async switchUser(userId: string): Promise<User> {
    const data = await safeRequest('/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return data.user;
  },

  // Campaigns
  async getCampaigns(filters?: { category?: string; platform?: string; status?: string }): Promise<Campaign[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.status) params.append('status', filters.status);
    
    const data = await safeRequest(`/campaigns?${params.toString()}`);
    return data.campaigns || [];
  },

  async getCampaign(id: string): Promise<Campaign> {
    const data = await safeRequest(`/campaigns/${id}`);
    return data.campaign;
  },

  async createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
    const data = await safeRequest('/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.campaign;
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const data = await safeRequest(`/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return data.campaign;
  },

  // Community Posts
  async getPosts(filters?: { authorId?: string; category?: string; status?: string }): Promise<Post[]> {
    const params = new URLSearchParams();
    if (filters?.authorId) params.append('authorId', filters.authorId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);

    const data = await safeRequest(`/posts?${params.toString()}`);
    return data.posts || [];
  },

  async getPost(id: string): Promise<Post> {
    const data = await safeRequest(`/posts/${id}`);
    return data.post;
  },

  // Media Upload to Storage
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

    const data = await safeRequest('/upload', {
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
    const data = await safeRequest('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.post;
  },

  async deletePost(id: string): Promise<void> {
    await safeRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  },

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const data = await safeRequest(`/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return data.post;
  },

  async unpublishPost(id: string, reason?: string): Promise<Post> {
    const data = await safeRequest(`/posts/${id}/unpublish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return data.post;
  },

  async reportContent(targetType: 'post' | 'submission' | 'user', targetId: string, reason: string): Promise<Report> {
    const data = await safeRequest(`/posts/${targetId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, targetType }),
    });
    return data.report;
  },

  // Submissions (Workflow B: Brand Review Queue)
  async getSubmissions(filters?: { status?: string; platform?: string; creatorId?: string; campaignId?: string }): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.creatorId) params.append('creatorId', filters.creatorId);
    if (filters?.campaignId) params.append('campaignId', filters.campaignId);

    const data = await safeRequest(`/submissions?${params.toString()}`);
    return data.submissions || [];
  },

  async getCreatorSubmissions(filters?: { status?: string; platform?: string }): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.platform) params.append('platform', filters.platform);

    const data = await safeRequest(`/submissions/creator?${params.toString()}`);
    return data.submissions || [];
  },

  async getSubmission(id: string): Promise<Submission> {
    const data = await safeRequest(`/submissions/${id}`);
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
    const data = await safeRequest('/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
    const data = await safeRequest(`/submissions/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    return data.submission;
  },

  async getSubmissionSmartReview(id: string): Promise<SmartReviewResult> {
    const data = await safeRequest(`/submissions/${id}/smart-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return data.smartReview;
  },

  async resubmitSubmission(
    id: string,
    updates: { videoUrl?: string; caption?: string; videoTitle?: string }
  ): Promise<Submission> {
    const data = await safeRequest(`/submissions/${id}/resubmit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return data.submission;
  },

  // Admin Portal API
  async getAdminOverview(): Promise<any> {
    const data = await safeRequest('/admin/overview');
    return data.stats;
  },

  async getAdminUsers(): Promise<User[]> {
    const data = await safeRequest('/admin/users');
    return data.users || [];
  },

  async updateAdminUser(userId: string, updates: Partial<User>): Promise<User> {
    const data = await safeRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  async getAdminReports(status?: string): Promise<Report[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const data = await safeRequest(`/admin/reports?${params.toString()}`);
    return data.reports || [];
  },

  async resolveReport(id: string, actionTaken: string): Promise<Report> {
    const data = await safeRequest(`/admin/reports/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionTaken }),
    });
    return data.report;
  },

  async getAdminAuditLogs(): Promise<ModerationAction[]> {
    const data = await safeRequest('/admin/moderation/actions');
    return data.actions || [];
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended' | 'restricted'): Promise<User> {
    const data = await safeRequest(`/admin/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return data.user;
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const data = await safeRequest('/notifications');
    return data.notifications || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    await safeRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await safeRequest('/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Analytics
  async getOverviewAnalytics(brandId?: string): Promise<AnalyticsOverview> {
    const params = new URLSearchParams();
    if (brandId) params.append('brandId', brandId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const data = await safeRequest(`/analytics/overview${queryString}`);
    return data.analytics;
  },

  async getHeatmap(days = 365, userId?: string): Promise<HeatmapData> {
    const params = new URLSearchParams({ days: days.toString() });
    if (userId) params.append('userId', userId);
    const data = await safeRequest(`/analytics/heatmap?${params.toString()}`);
    return data.heatmap;
  },

  async getCreatorStats(): Promise<CreatorStats> {
    const data = await safeRequest('/analytics/creator-summary');
    return data.stats;
  },

  async pingTraffic(path?: string): Promise<void> {
    try {
      await safeRequest('/analytics/traffic/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: path || '/' }),
      });
    } catch {}
  },

  async getTrafficAnalytics(range = '24h', mode = 'demo'): Promise<any> {
    const data = await safeRequest(`/analytics/traffic?range=${encodeURIComponent(range)}&mode=${encodeURIComponent(mode)}`);
    return data.data;
  },

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const data = await safeRequest('/leaderboard');
    return data.leaderboard || [];
  },

  // Phase 6: AI Creator Matchmaker & Campaign Copilot
  async getAIStatus(): Promise<{
    isConfigured: boolean;
    provider: string;
    model: string;
    mode: 'live' | 'deterministic_demo';
    message: string;
  }> {
    try {
      const data = await safeRequest('/ai/status');
      return data.status;
    } catch {
      return {
        isConfigured: false,
        provider: 'none',
        model: 'deterministic-rules-engine',
        mode: 'deterministic_demo',
        message: 'AI Provider service offline. Using deterministic engine.',
      };
    }
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
    return await safeRequest('/ai/match-creators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
    return await safeRequest('/ai/generate-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
};
