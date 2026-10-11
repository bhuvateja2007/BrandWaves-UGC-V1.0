import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { authRouter } from './routes/auth.js';
import { campaignsRouter } from './routes/campaigns.js';
import { submissionsRouter } from './routes/submissions.js';
import { postsRouter } from './routes/posts.js';
import { adminRouter } from './routes/admin.js';
import { notificationsRouter } from './routes/notifications.js';
import { analyticsRouter } from './routes/analytics.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import { aiRouter } from './routes/ai.js';
import { uploadRouter } from './routes/upload.js';

import { 
  securityHeaders, 
  secureCors, 
  inputSanitizer, 
  rateLimiter 
} from './middleware/security.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Global Security Middleware
app.use(securityHeaders);
app.use(secureCors);
app.use(express.json({ limit: '30mb' }));
app.use(inputSanitizer);

// Rate Limiting (Defense against DoS and credential stuffing)
const globalLimiter = rateLimiter({ maxRequests: 300, windowMs: 60 * 1000 });
const authLimiter = rateLimiter({ maxRequests: 60, windowMs: 60 * 1000 });

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/ai', aiRouter);

// Health check & Service status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BrandWaves Node.js Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Production SPA static file serving
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 BrandWaves Backend Server running on http://localhost:${PORT}`);
});
