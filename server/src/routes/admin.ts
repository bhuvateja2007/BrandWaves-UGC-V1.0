import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { supabaseServer, isServerSupabaseConfigured } from '../lib/supabase.js';

export const adminRouter = Router();

// Server-side admin authorization middleware supporting both Bearer token & session
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ') && isServerSupabaseConfigured) {
    const token = authHeader.substring(7);
    try {
      const { data: { user }, error } = await supabaseServer.auth.getUser(token);
      if (user && !error) {
        const { data: profile } = await supabaseServer
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        const role = profile?.role || user.user_metadata?.role;
        if (role === 'admin' || role === 'brand_admin') {
          return next();
        }
      }
    } catch (tokenErr) {
      console.warn('Notice validating admin Bearer token:', tokenErr);
    }
  }

  const current = db.getCurrentUser();
  const isAdmin = current.role === 'admin' || (current.roles && current.roles.includes('admin')) || current.role === 'brand_admin';
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Access restricted to verified platform administrators only.',
    });
  }
  next();
}

adminRouter.use(requireAdmin);

// GET /api/admin/overview - Admin executive overview metrics from live Supabase ledger
adminRouter.get('/overview', async (req, res) => {
  if (isServerSupabaseConfigured) {
    try {
      const [
        { count: profilesCount },
        { count: campaignsCount },
        { count: activeCampaignsCount },
        { count: submissionsCount },
        { count: pendingSubmissionsCount },
        { count: postsCount },
        { count: activitiesCount },
      ] = await Promise.all([
        supabaseServer.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseServer.from('campaigns').select('*', { count: 'exact', head: true }),
        supabaseServer.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabaseServer.from('submissions').select('*', { count: 'exact', head: true }),
        supabaseServer.from('submissions').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
        supabaseServer.from('community_posts').select('*', { count: 'exact', head: true }),
        supabaseServer.from('activity_logs').select('*', { count: 'exact', head: true }),
      ]);

      return res.json({
        success: true,
        stats: {
          totalUsers: profilesCount ?? db.getUsers().length,
          activeUsers: profilesCount ?? db.getUsers().length,
          suspendedUsers: 0,
          totalCampaigns: campaignsCount ?? db.getCampaigns().length,
          activeCampaigns: activeCampaignsCount ?? db.getCampaigns().filter(c => c.status === 'active' || (c.status as string) === 'published').length,
          totalSubmissions: submissionsCount ?? db.getSubmissions().length,
          pendingReviews: pendingSubmissionsCount ?? db.getSubmissions().filter(s => s.status === 'pending').length,
          totalPosts: postsCount ?? db.getPosts({ status: 'all' }).length,
          pendingReports: db.getReports().filter(r => r.status === 'pending').length,
          totalAuditLogs: activitiesCount ?? db.getModerationActions().length,
        },
      });
    } catch (err) {
      console.warn('Notice querying Supabase ledger stats, falling back to local snapshot:', err);
    }
  }

  const users = db.getUsers();
  const campaigns = db.getCampaigns();
  const submissions = db.getSubmissions();
  const posts = db.getPosts({ status: 'all' });
  const reports = db.getReports();
  const actions = db.getModerationActions();

  res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.accountStatus !== 'suspended').length,
      suspendedUsers: users.filter(u => u.accountStatus === 'suspended').length,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalSubmissions: submissions.length,
      pendingReviews: submissions.filter(s => s.status === 'pending').length,
      totalPosts: posts.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      totalAuditLogs: actions.length,
    },
  });
});

// GET /api/admin/users - User management directory
adminRouter.get('/users', async (req, res) => {
  if (isServerSupabaseConfigured) {
    try {
      const { data: profiles, error } = await supabaseServer
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && profiles && profiles.length > 0) {
        const mappedUsers = profiles.map(p => ({
          id: p.id,
          email: p.email || `${p.display_name?.toLowerCase().replace(/\s+/g, '') || 'user'}@brandwaves.io`,
          name: p.display_name || 'BrandWaves Member',
          handle: p.handle || `@${p.display_name?.toLowerCase().replace(/\s+/g, '') || 'member'}`,
          role: p.role === 'brand' ? 'brand_owner' : p.role,
          roles: [p.role === 'brand' ? 'brand_owner' : p.role],
          avatar: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          accountStatus: p.account_status || 'active',
          tier: p.role === 'admin' ? 'Platform Administrator' : 'Verified Member',
          createdAt: p.created_at,
        }));
        return res.json({ success: true, users: mappedUsers });
      }
    } catch (err) {
      console.warn('Notice querying Supabase profiles, using local snapshot:', err);
    }
  }

  const users = db.getUsers();
  res.json({ success: true, users });
});

// PUT /api/admin/users/:id/status - Suspend or reinstate user
adminRouter.put('/users/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status || !['active', 'suspended', 'restricted'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Valid status (active, suspended, restricted) is required' });
  }

  const current = db.getCurrentUser();
  try {
    const updated = db.updateUserStatus(req.params.id, status, current.id);
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/admin/reports - Moderation reports queue
adminRouter.get('/reports', (req, res) => {
  const { status } = req.query;
  const reports = db.getReports(status as string | undefined);
  res.json({ success: true, reports });
});

// PUT /api/admin/reports/:id/resolve - Resolve report
adminRouter.put('/reports/:id/resolve', (req, res) => {
  const { actionTaken } = req.body;
  const current = db.getCurrentUser();
  try {
    const report = db.resolveReport(req.params.id, actionTaken || 'Reviewed and dismissed', current.id);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/admin/moderation/actions - Audit history logs
adminRouter.get('/moderation/actions', async (req, res) => {
  if (isServerSupabaseConfigured) {
    try {
      const { data: logs, error } = await supabaseServer
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && logs && logs.length > 0) {
        const mappedActions = logs.map(l => ({
          id: l.id,
          reportId: l.target_id || l.id,
          adminId: l.user_id,
          action: l.action || 'audit_logged',
          timestamp: l.created_at,
          targetType: l.target_type || 'user',
          targetId: l.target_id || l.id,
          details: typeof l.metadata === 'object' ? JSON.stringify(l.metadata) : (l.metadata || 'System audit ledger event'),
        }));
        return res.json({ success: true, actions: mappedActions });
      }
    } catch (err) {
      console.warn('Notice querying Supabase activity logs:', err);
    }
  }

  const actions = db.getModerationActions();
  res.json({ success: true, actions });
});
