import { Router } from 'express';
import { db } from '../db/index.js';

export const leaderboardRouter = Router();

// GET /api/leaderboard - Get ranked creator leaderboard
leaderboardRouter.get('/', (req, res) => {
  const leaderboard = db.getLeaderboard();
  res.json({ success: true, count: leaderboard.length, leaderboard });
});
