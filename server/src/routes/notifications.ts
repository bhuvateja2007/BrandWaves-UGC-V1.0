import { Router } from 'express';
import { db } from '../db/index.js';

export const notificationsRouter = Router();

// GET /api/notifications - List current user notifications
notificationsRouter.get('/', (req, res) => {
  const current = db.getCurrentUser();
  const notifications = db.getNotifications(current.id);
  res.json({ success: true, notifications });
});

// PUT /api/notifications/:id/read - Mark notification as read
notificationsRouter.put('/:id/read', (req, res) => {
  const current = db.getCurrentUser();
  const result = db.markNotificationRead(req.params.id, current.id);
  res.json({ ...result });
});
