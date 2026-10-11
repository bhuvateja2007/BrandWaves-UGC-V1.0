import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  Campaign, 
  Submission, 
  User, 
  Post, 
  Report, 
  ModerationAction, 
  Notification, 
  ActivityDay, 
  HeatmapData, 
  LeaderboardEntry,
  AnalyticsOverview,
  CreatorStats
} from '../types.js';
import { 
  defaultUsers, 
  defaultCampaigns, 
  defaultSubmissions,
  defaultPosts,
  defaultReports,
  defaultModerationActions,
  defaultNotifications
} from './seed.js';
import { supabaseServer, isServerSupabaseConfigured } from '../lib/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface LoggedActivity {
  id: string;
  date: string; // YYYY-MM-DD
  userId: string;
  type: 'submission' | 'approval' | 'revision' | 'rejection' | 'campaign_create' | 'post_create';
  campaignId?: string;
  description: string;
}

interface DatabaseSchema {
  users: User[];
  campaigns: Campaign[];
  submissions: Submission[];
  posts: Post[];
  reports: Report[];
  moderationActions: ModerationAction[];
  notifications: Notification[];
  activities: LoggedActivity[];
  currentUserId: string;
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure new collections exist even if loaded from older db.json
        if (!parsed.posts) parsed.posts = [...defaultPosts];
        if (!parsed.reports) parsed.reports = [...defaultReports];
        if (!parsed.moderationActions) parsed.moderationActions = [...defaultModerationActions];
        if (!parsed.notifications) parsed.notifications = [...defaultNotifications];
        return parsed;
      } catch (err) {
        console.error('Error reading db.json, generating fresh seed:', err);
      }
    }

    const fresh = this.createInitialSeed();
    this.save(fresh);
    return fresh;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  private createInitialSeed(): DatabaseSchema {
    const activities: LoggedActivity[] = [];
    const today = new Date();

    // Generate 365 days of activity distribution matching Stitch heatmaps
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Weekly cadence pattern: weekdays have higher activity
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const seedRand = (Math.sin(i * 9973 + 123) + 1) / 2;

      let count = 0;
      if (!isWeekend && seedRand > 0.42) {
        count = Math.floor(seedRand * 4) + 1;
      } else if (isWeekend && seedRand > 0.75) {
        count = 1;
      }

      for (let c = 0; c < count; c++) {
        activities.push({
          id: `act_${dateStr}_${c}`,
          date: dateStr,
          userId: 'user_alex',
          type: c % 3 === 0 ? 'submission' : 'approval',
          description: `Activity logged on ${dateStr}`,
        });
      }
    }

    return {
      users: [...defaultUsers],
      campaigns: [...defaultCampaigns],
      submissions: [...defaultSubmissions],
      posts: [...defaultPosts],
      reports: [...defaultReports],
      moderationActions: [...defaultModerationActions],
      notifications: [...defaultNotifications],
      activities,
      currentUserId: 'user_alex',
    };
  }

  // --- Auth & Users ---
  getCurrentUser(): User {
    const user = this.data.users.find(u => u.id === this.data.currentUserId);
    return user || this.data.users[0];
  }

  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  switchUser(userId: string): User {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    this.data.currentUserId = user.id;
    this.save();
    return user;
  }

  registerUser(payload: { email: string; name: string; handle: string; bio?: string }): User {
    const existing = this.data.users.find(u => u.email === payload.email || u.handle === payload.handle);
    if (existing) {
      throw new Error('A user with this email or handle already exists');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: payload.email,
      name: payload.name,
      handle: payload.handle.startsWith('@') ? payload.handle : `@${payload.handle}`,
      role: 'creator', // Default role is creator/user, never admin!
      roles: ['creator'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      tier: 'Rising Star',
      bio: payload.bio || '',
      accountStatus: 'active',
      emailVerified: true,
      phoneVerified: false,
    };

    this.data.users.push(newUser);
    this.data.currentUserId = newUser.id;
    this.save();
    return newUser;
  }

  updateUserProfile(userId: string, updates: Partial<User>): User {
    const index = this.data.users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');

    // Never allow updating role or account status via normal profile update!
    const { role, roles, accountStatus, ...safeUpdates } = updates;
    this.data.users[index] = { ...this.data.users[index], ...safeUpdates };
    this.save();
    return this.data.users[index];
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended' | 'restricted', adminId: string): User {
    const admin = this.getUserById(adminId);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'brand_admin')) {
      throw new Error('Unauthorized: Only administrators can modify user account status');
    }

    const index = this.data.users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');

    this.data.users[index].accountStatus = status;

    // Log moderation action
    this.data.moderationActions.push({
      id: `mod_${Date.now()}`,
      actorId: admin.id,
      actorName: admin.name,
      targetType: 'user',
      targetId: userId,
      action: status === 'suspended' ? 'suspend_user' : 'reinstate_user',
      reason: `Account status updated to ${status} by administrator`,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return this.data.users[index];
  }

  // --- Campaigns ---
  getCampaigns(filters?: { category?: string; platform?: string; status?: string }): Campaign[] {
    let list = this.data.campaigns;
    if (filters?.category) {
      list = list.filter(c => c.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.platform) {
      list = list.filter(c => c.platform.toLowerCase() === filters.platform!.toLowerCase());
    }
    if (filters?.status) {
      list = list.filter(c => c.status === filters.status);
    }
    return list;
  }

  getCampaign(id: string): Campaign | undefined {
    return this.data.campaigns.find(c => c.id === id);
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.getCampaign(id);
  }

  createCampaign(payload: Partial<Campaign>): Campaign {
    const current = this.getCurrentUser();
    if (current.role !== 'brand_admin' && current.role !== 'admin' && current.role !== 'brand_owner') {
      throw new Error('Unauthorized: Only Brand Owners and Administrators can create campaigns');
    }

    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      title: payload.title || 'Untitled Campaign',
      brandName: payload.brandName || current.brandName || 'Brand Partner',
      brandLogo: payload.brandLogo || current.avatar,
      category: payload.category || 'General',
      platform: (payload.platform as any) || 'TikTok',
      format: payload.format || '9:16 Vertical Video',
      description: payload.description || '',
      requirements: payload.requirements || ['Provide 1080p high-resolution cut', 'Include campaign tags'],
      rewardType: payload.rewardType || 'fixed',
      rewardAmount: payload.rewardAmount || '$500 Fixed',
      spotsTotal: payload.spotsTotal || 15,
      spotsFilled: 0,
      deadline: payload.deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'active',
      eligibleTiers: payload.eligibleTiers || ['Elite Partner', 'Verified Pro'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.campaigns.unshift(newCampaign);
    this.save();

    // Asynchronously persist to remote Supabase PostgreSQL
    if (isServerSupabaseConfigured) {
      const rewardNum = parseInt((newCampaign.rewardAmount || '500').replace(/[^0-9]/g, ''), 10) || 500;
      const budgetNum = rewardNum * (newCampaign.spotsTotal || 5);
      const defaultBrandId = 'eaf5fdfb-d71a-422e-a850-055631bfd8c4'; // Verified brand owner profile ID

      (async () => {
        try {
          const { error } = await supabaseServer
            .from('campaigns')
            .insert({
              brand_id: defaultBrandId,
              title: newCampaign.title,
              description: newCampaign.description || 'Authentic creator video campaign',
              brief: Array.isArray(newCampaign.requirements) ? newCampaign.requirements.join('. ') : (newCampaign.description || newCampaign.title),
              category: newCampaign.category || 'General',
              status: 'published',
              budget: budgetNum,
              reward_amount: rewardNum,
              slots: newCampaign.spotsTotal || 5,
              start_date: new Date().toISOString(),
              end_date: newCampaign.deadline ? new Date(newCampaign.deadline).toISOString() : new Date(Date.now() + 14 * 86400000).toISOString(),
              requirements: Array.isArray(newCampaign.requirements) ? newCampaign.requirements : ['High resolution vertical video'],
              cover_image_url: newCampaign.brandLogo || null,
            });

          if (error) {
            console.error('[Supabase Sync] Failed to persist new campaign remotely:', error.message);
          } else {
            console.log('[Supabase Sync] ✔ Campaign remotely persisted to Supabase PostgreSQL:', newCampaign.title);
          }
        } catch (err: any) {
          console.error('[Supabase Sync] Network exception syncing campaign:', err);
        }
      })();
    }

    return newCampaign;
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Campaign {
    const index = this.data.campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');

    this.data.campaigns[index] = {
      ...this.data.campaigns[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.campaigns[index];
  }

  // --- Community Posts (Workflow A: Immediate Publishing) ---
  getPosts(filters?: { authorId?: string; category?: string; status?: string }): Post[] {
    let list = this.data.posts;
    if (filters?.authorId) {
      list = list.filter(p => p.authorId === filters.authorId);
    }
    if (filters?.category && filters.category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.status) {
      list = list.filter(p => p.publicationStatus === filters.status);
    } else {
      // By default, public queries only return published posts
      list = list.filter(p => p.publicationStatus === 'published' && p.visibility === 'public');
    }
    return list;
  }

  getPost(id: string): Post | undefined {
    return this.data.posts.find(p => p.id === id);
  }

  createPost(payload: {
    title: string;
    caption?: string;
    category?: string;
    mediaUrl: string;
    mediaType?: 'image' | 'video';
    mediaStoragePath?: string;
    campaignId?: string;
  }): Post {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Authentication required to create a post');
    if (user.accountStatus === 'suspended') throw new Error('Account suspended from publishing content');

    let campaignTitle: string | undefined;
    let brandName: string | undefined;
    if (payload.campaignId) {
      const camp = this.getCampaign(payload.campaignId);
      if (camp) {
        campaignTitle = camp.title;
        brandName = camp.brandName;
      }
    }

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      authorHandle: user.handle,
      authorAvatar: user.avatar,
      title: payload.title,
      caption: payload.caption || '',
      category: payload.category || 'General',
      mediaUrl: payload.mediaUrl,
      mediaType: payload.mediaType || 'video',
      mediaStoragePath: payload.mediaStoragePath,
      campaignId: payload.campaignId,
      campaignTitle,
      brandName,
      publicationStatus: 'published', // Workflow A: Published immediately!
      visibility: 'public',
      viewsCount: 0,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.posts.unshift(newPost);

    // Notify author
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Post Published Live! 🚀',
      message: `"${newPost.title}" is now published and visible on the BrandWaves Community Feed.`,
      type: 'info',
      read: false,
      actionUrl: '/feed',
      createdAt: new Date().toISOString(),
    });

    // Log activity to heatmap
    this.logActivity({
      userId: user.id,
      type: 'post_create',
      description: `Published community post: ${newPost.title}`,
    });

    this.save();
    return newPost;
  }

  updatePost(id: string, updates: Partial<Post>): Post {
    const user = this.getCurrentUser();
    const index = this.data.posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');

    const post = this.data.posts[index];
    if (post.authorId !== user.id && user.role !== 'admin') {
      throw new Error('Unauthorized: You can only edit your own posts');
    }
    if (post.publicationStatus === 'moderated' && user.role !== 'admin') {
      throw new Error('This post was restricted by a platform administrator and cannot be modified');
    }

    this.data.posts[index] = {
      ...post,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.posts[index];
  }

  deletePost(id: string): { success: boolean } {
    const user = this.getCurrentUser();
    const index = this.data.posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');

    const post = this.data.posts[index];
    if (post.authorId !== user.id && user.role !== 'admin') {
      throw new Error('Unauthorized: You can only delete your own posts');
    }

    this.data.posts.splice(index, 1);
    this.save();
    return { success: true };
  }

  unpublishPost(id: string, reason: string, adminId: string): Post {
    const admin = this.getUserById(adminId);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'brand_admin')) {
      throw new Error('Unauthorized: Only administrators can moderate and unpublish posts');
    }

    const index = this.data.posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');

    this.data.posts[index].publicationStatus = 'moderated';
    this.data.posts[index].visibility = 'restricted';
    this.data.posts[index].updatedAt = new Date().toISOString();

    // Audit action
    this.data.moderationActions.unshift({
      id: `mod_${Date.now()}`,
      actorId: admin.id,
      actorName: admin.name,
      targetType: 'post',
      targetId: id,
      action: 'unpublish',
      reason,
      createdAt: new Date().toISOString(),
    });

    // Notify author of moderation decision
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: this.data.posts[index].authorId,
      title: 'Content Moderation Notice',
      message: `Your post "${this.data.posts[index].title}" was unpublished by a moderator: ${reason}`,
      type: 'system',
      read: false,
      actionUrl: '/my-posts',
      createdAt: new Date().toISOString(),
    });

    this.save();
    return this.data.posts[index];
  }

  // --- Submissions (Workflow B: Brand Review Queue) ---
  getSubmissions(filters?: { status?: string; platform?: string; creatorId?: string; campaignId?: string }): Submission[] {
    let list = this.data.submissions;
    if (filters?.status) {
      list = list.filter(s => s.status === filters.status);
    }
    if (filters?.platform) {
      list = list.filter(s => s.platform.toLowerCase() === filters.platform!.toLowerCase());
    }
    if (filters?.creatorId) {
      list = list.filter(s => s.creatorId === filters.creatorId);
    }
    if (filters?.campaignId) {
      list = list.filter(s => s.campaignId === filters.campaignId);
    }
    return list;
  }

  getSubmission(id: string): Submission | undefined {
    return this.data.submissions.find(s => s.id === id);
  }

  getSubmissionById(id: string): Submission | undefined {
    return this.getSubmission(id);
  }

  createSubmission(payload: {
    campaignId: string;
    platform: string;
    videoUrl: string;
    videoTitle: string;
    thumbnail?: string;
    mediaStoragePath?: string;
    duration?: string;
    caption?: string;
    tags?: string[];
  }): Submission {
    const creator = this.getCurrentUser();
    const campaign = this.getCampaign(payload.campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const newSubmission: Submission = {
      id: `sub_${Date.now()}`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      brandName: campaign.brandName,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorHandle: creator.handle,
      creatorAvatar: creator.avatar,
      platform: (payload.platform as any) || 'TikTok',
      videoUrl: payload.videoUrl,
      videoTitle: payload.videoTitle,
      thumbnail: payload.thumbnail || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
      mediaStoragePath: payload.mediaStoragePath,
      duration: payload.duration || '0:30',
      caption: payload.caption || '',
      tags: payload.tags || ['#BrandWaves', `#${campaign.brandName.replace(/\s+/g, '')}`],
      status: 'pending', // Starts pending in brand review queue
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.submissions.unshift(newSubmission);

    // Notify creator that submission is in review queue
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: creator.id,
      title: 'Submission Received! 📋',
      message: `Your deliverable for ${campaign.title} has entered the brand review queue.`,
      type: 'submission',
      read: false,
      actionUrl: '/submissions',
      createdAt: new Date().toISOString(),
    });

    this.logActivity({
      userId: creator.id,
      type: 'submission',
      campaignId: campaign.id,
      description: `Submitted video for ${campaign.title}`,
    });

    this.save();
    return newSubmission;
  }

  reviewSubmission(
    id: string, 
    review: { 
      status: 'approved' | 'revision_requested' | 'rejected'; 
      reviewerNotes: string;
      smartReview?: any;
    }
  ): Submission {
    const reviewer = this.getCurrentUser();
    if (reviewer.role !== 'brand_admin' && reviewer.role !== 'admin' && reviewer.role !== 'brand_owner') {
      throw new Error('Unauthorized: Only Brand Owners and Administrators can review submissions');
    }

    const sub = this.data.submissions.find(s => s.id === id);
    if (!sub) throw new Error('Submission not found');

    // Rule: Creators cannot review their own submissions
    if (sub.creatorId === reviewer.id) {
      throw new Error('Unauthorized: Creators cannot review or approve their own submissions');
    }

    // Rule: Validate allowed workflow transitions
    if (sub.status === review.status) {
      throw new Error(`Submission is already in status '${review.status}'`);
    }

    if (sub.status === 'approved' && reviewer.role !== 'admin') {
      throw new Error('Workflow Guard: Approved deliverables cannot be modified by non-admin reviewers');
    }

    sub.status = review.status;
    sub.reviewerNotes = review.reviewerNotes;
    sub.reviewerId = reviewer.id;
    sub.reviewerName = reviewer.name;
    sub.reviewedAt = new Date().toISOString();
    sub.updatedAt = new Date().toISOString();

    if (review.smartReview) {
      sub.smartReview = review.smartReview;
    }

    // If approved, increment campaign spots filled
    if (review.status === 'approved') {
      const camp = this.getCampaign(sub.campaignId);
      if (camp) {
        camp.spotsFilled = Math.min(camp.spotsTotal, camp.spotsFilled + 1);
      }
    }

    // Notify creator
    const notifTitle = review.status === 'approved' 
      ? 'Deliverable Approved! 🎉' 
      : review.status === 'revision_requested'
      ? 'Revision Requested ✍️'
      : 'Deliverable Rejected ❌';

    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: sub.creatorId,
      title: notifTitle,
      message: `${reviewer.name} reviewed your submission for ${sub.campaignTitle}: ${review.reviewerNotes}`,
      type: review.status === 'approved' ? 'approval' : 'revision',
      read: false,
      actionUrl: '/submissions',
      createdAt: new Date().toISOString(),
    });

    this.logActivity({
      userId: reviewer.id,
      type: review.status === 'approved' ? 'approval' : 'revision',
      campaignId: sub.campaignId,
      description: `Reviewed deliverable (${review.status}) for ${sub.creatorName}`,
    });

    this.save();
    return sub;
  }

  resubmitSubmission(id: string, updates: { videoUrl?: string; caption?: string; videoTitle?: string }): Submission {
    const creator = this.getCurrentUser();
    const sub = this.data.submissions.find(s => s.id === id);
    if (!sub) throw new Error('Submission not found');
    if (sub.creatorId !== creator.id) {
      throw new Error('Unauthorized: You can only resubmit your own submissions');
    }

    // Rule: Resubmission is only allowed when revision is requested or rejected
    if (sub.status !== 'revision_requested' && sub.status !== 'rejected') {
      throw new Error(`Deliverable is not eligible for resubmission. Current status is '${sub.status}'.`);
    }

    // Archive previous version to revision history
    if (!sub.revisions) {
      sub.revisions = [];
    }
    const revisionNumber = sub.revisions.length + 1;
    sub.revisions.push({
      revisionNumber,
      videoUrl: sub.videoUrl,
      videoTitle: sub.videoTitle,
      caption: sub.caption,
      submittedAt: sub.updatedAt || sub.createdAt,
      reviewerNotes: sub.reviewerNotes,
      reviewedAt: sub.reviewedAt,
      status: sub.status,
    });

    // Reset status to pending for brand re-review
    sub.status = 'pending';
    if (updates.videoUrl) sub.videoUrl = updates.videoUrl;
    if (updates.caption !== undefined) sub.caption = updates.caption;
    if (updates.videoTitle !== undefined) sub.videoTitle = updates.videoTitle;
    sub.reviewerNotes = undefined;
    sub.reviewedAt = undefined;
    sub.reviewerId = undefined;
    sub.reviewerName = undefined;
    sub.updatedAt = new Date().toISOString();

    this.logActivity({
      userId: creator.id,
      type: 'submission',
      campaignId: sub.campaignId,
      description: `Resubmitted revised deliverable (Revision #${revisionNumber + 1}) for ${sub.campaignTitle}`,
    });

    this.save();
    return sub;
  }

  saveSubmissionSmartReview(id: string, smartReview: any): Submission {
    const sub = this.data.submissions.find(s => s.id === id);
    if (!sub) throw new Error('Submission not found');
    sub.smartReview = smartReview;
    sub.updatedAt = new Date().toISOString();
    this.save();
    return sub;
  }

  // --- Reports & Moderation ---
  getReports(status?: string): Report[] {
    if (status) return this.data.reports.filter(r => r.status === status);
    return this.data.reports;
  }

  createReport(payload: { targetType: 'post' | 'submission' | 'user'; targetId: string; reason: string }): Report {
    const user = this.getCurrentUser();
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: user.id,
      reporterName: user.name,
      targetType: payload.targetType,
      targetId: payload.targetId,
      reason: payload.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.data.reports.unshift(newReport);
    this.save();
    return newReport;
  }

  resolveReport(id: string, actionTaken: string, adminId: string): Report {
    const admin = this.getUserById(adminId);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'brand_admin')) {
      throw new Error('Unauthorized: Only administrators can resolve reports');
    }

    const report = this.data.reports.find(r => r.id === id);
    if (!report) throw new Error('Report not found');

    report.status = 'resolved';
    report.actionTaken = actionTaken;
    report.resolvedBy = admin.id;
    report.resolvedAt = new Date().toISOString();

    this.save();
    return report;
  }

  getModerationActions(): ModerationAction[] {
    return this.data.moderationActions;
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  markNotificationRead(id: string, userId: string): { success: boolean } {
    const notif = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      this.save();
    }
    return { success: true };
  }

  // --- Heatmap & Activity ---
  logActivity(act: Omit<LoggedActivity, 'id' | 'date'> & { date?: string }) {
    const dateStr = act.date || new Date().toISOString().split('T')[0];
    this.data.activities.push({
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date: dateStr,
      userId: act.userId,
      type: act.type,
      campaignId: act.campaignId,
      description: act.description,
    });
    this.save();
  }

  getHeatmap(days = 365, userId?: string): HeatmapData {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - (days - 1));

    const countsByDate = new Map<string, number>();
    for (const act of this.data.activities) {
      if (userId && act.userId !== userId) continue;
      countsByDate.set(act.date, (countsByDate.get(act.date) || 0) + 1);
    }

    const activityDays: ActivityDay[] = [];
    const totalDaysToGenerate = 364; // Exactly 52 full weeks

    for (let i = totalDaysToGenerate - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = countsByDate.get(dateStr) || 0;

      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count >= 4) level = 4;

      activityDays.push({ date: dateStr, count, level });
    }

    const totalActivities = activityDays.reduce((acc, curr) => acc + curr.count, 0);

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = activityDays.length - 1; i >= 0; i--) {
      if (activityDays[i].count > 0) {
        if (i === activityDays.length - 1 || currentStreak > 0) {
          currentStreak++;
        }
      } else {
        if (i === activityDays.length - 1) currentStreak = 0;
        break;
      }
    }

    for (const day of activityDays) {
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    return {
      days: activityDays,
      totalActivities,
      longestStreak,
      currentStreak,
      periodDays: days,
    };
  }

  // --- Analytics & Leaderboard ---
  getAnalyticsOverview(): AnalyticsOverview {
    const submissions = this.data.submissions;
    const campaigns = this.data.campaigns;

    const totalSubmissions = submissions.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const pendingReviews = submissions.filter(s => s.status === 'pending').length;

    const approvedCount = submissions.filter(s => s.status === 'approved').length;
    const rejectedCount = submissions.filter(s => s.status === 'rejected').length;
    const reviewedTotal = approvedCount + rejectedCount;

    const approvalRate = reviewedTotal > 0
      ? Math.round((approvedCount / reviewedTotal) * 100)
      : 100;

    return {
      totalSubmissions,
      activeCampaigns,
      pendingReviews,
      approvalRate,
      weeklyVelocity: '14.2h',
      velocityChange: '+24%',
      totalUsers: this.data.users.length,
      totalPosts: this.data.posts.length,
    };
  }

  getCreatorStats(userId?: string): CreatorStats {
    const targetUserId = userId || this.data.currentUserId;
    const subs = this.data.submissions.filter(s => s.creatorId === targetUserId);
    const posts = this.data.posts.filter(p => p.authorId === targetUserId);

    const activeSubmissions = subs.filter(s => s.status === 'pending').length;
    const approvedSubmissions = subs.filter(s => s.status === 'approved').length;
    const revisionRequests = subs.filter(s => s.status === 'revision_requested').length;
    const uniqueCampaigns = new Set(subs.map(s => s.campaignId)).size;

    return {
      activeSubmissions,
      approvedSubmissions,
      revisionRequests,
      campaignsJoined: uniqueCampaigns,
      pendingValidationCount: activeSubmissions,
      actionRequiredCount: revisionRequests,
      myPostsCount: posts.length,
    };
  }

  getLeaderboard(): LeaderboardEntry[] {
    const creatorStats = new Map<string, { approved: number; rejected: number; earnings: number; user: User }>();

    for (const u of this.data.users) {
      if (u.role === 'creator') {
        creatorStats.set(u.id, { approved: 0, rejected: 0, earnings: 0, user: u });
      }
    }

    for (const s of this.data.submissions) {
      const entry = creatorStats.get(s.creatorId);
      if (entry) {
        if (s.status === 'approved') {
          entry.approved++;
          entry.earnings += 450;
        } else if (s.status === 'rejected') {
          entry.rejected++;
        }
      }
    }

    const leaderboard: LeaderboardEntry[] = [];
    let rank = 1;

    for (const [id, stats] of creatorStats.entries()) {
      const reviewedTotal = stats.approved + stats.rejected;
      const approvalRate = reviewedTotal > 0
        ? Math.round((stats.approved / reviewedTotal) * 100)
        : 100;

      const score = stats.approved * 1250 + stats.earnings;

      leaderboard.push({
        rank: 0,
        id,
        name: stats.user.name,
        handle: stats.user.handle,
        avatar: stats.user.avatar,
        tier: stats.user.tier || 'Elite Partner',
        approvedCount: stats.approved,
        totalEarnings: stats.earnings || 2400,
        approvalRate,
        score: score || 9820,
      });
    }

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });

    return leaderboard;
  }
}

export const db = new Database();
