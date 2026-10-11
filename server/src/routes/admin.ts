import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';

export const adminRouter = Router();

// Server-side admin authorization middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
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

// GET /api/admin/overview - Admin executive overview metrics
adminRouter.get('/overview', (req, res) => {
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
adminRouter.get('/users', (req, res) => {
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
adminRouter.get('/moderation/actions', (req, res) => {
  const actions = db.getModerationActions();
  res.json({ success: true, actions });
});
