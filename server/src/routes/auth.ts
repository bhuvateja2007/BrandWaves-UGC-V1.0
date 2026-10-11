import { Router } from 'express';
import { db } from '../db/index.js';

export const authRouter = Router();

// GET /api/auth/me - Get currently logged-in user
authRouter.get('/me', (req, res) => {
  const user = db.getCurrentUser();
  const isAdmin = user.role === 'admin' || (user.roles && user.roles.includes('admin'));
  const isBrandOwner = user.role === 'brand_owner' || (user.roles && user.roles.includes('brand_owner'));
  const isBrandAdmin = user.role === 'brand_admin' || isAdmin || isBrandOwner || (user.roles && user.roles.includes('brand_admin'));
  res.json({ 
    success: true, 
    user,
    permissions: {
      isAdmin: Boolean(isAdmin),
      isBrandOwner: Boolean(isBrandOwner),
      isBrandAdmin: Boolean(isBrandAdmin),
      isCreator: user.role === 'creator',
    }
  });
});

// GET /api/auth/users - List users
authRouter.get('/users', (req, res) => {
  const users = db.getUsers();
  res.json({ success: true, users });
});

// POST /api/auth/register - Register a new user account (Default role is always creator/user)
authRouter.post('/register', (req, res) => {
  const { email, name, handle, bio } = req.body;
  if (!email || !name || !handle) {
    return res.status(400).json({ success: false, error: 'Email, name, and handle are required' });
  }

  try {
    const user = db.registerUser({ email, name, handle, bio });
    res.status(201).json({ success: true, user });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/profile - Update user profile
authRouter.put('/profile', (req, res) => {
  const current = db.getCurrentUser();
  try {
    const updated = db.updateUserProfile(current.id, req.body);
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/switch - Switch role/user for demo & dev testing
authRouter.post('/switch', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required' });
  }

  try {
    const user = db.switchUser(userId);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(404).json({ success: false, error: err.message });
  }
});
