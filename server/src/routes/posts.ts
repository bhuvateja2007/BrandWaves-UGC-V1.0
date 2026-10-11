import { Router } from 'express';
import { db } from '../db/index.js';

export const postsRouter = Router();

// GET /api/posts - Get community posts
postsRouter.get('/', (req, res) => {
  const { authorId, category, status } = req.query;
  const posts = db.getPosts({
    authorId: authorId as string | undefined,
    category: category as string | undefined,
    status: status as string | undefined,
  });
  res.json({ success: true, posts });
});

// GET /api/posts/:id - Get single post
postsRouter.get('/:id', (req, res) => {
  const post = db.getPost(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, error: 'Post not found' });
  }
  res.json({ success: true, post });
});

// POST /api/posts - Create and immediately publish community content (Workflow A)
postsRouter.post('/', (req, res) => {
  const { title, caption, category, mediaUrl, mediaType, mediaStoragePath, campaignId } = req.body;
  
  if (!title || !mediaUrl) {
    return res.status(400).json({ success: false, error: 'Title and mediaUrl are required' });
  }

  try {
    const post = db.createPost({
      title,
      caption,
      category,
      mediaUrl,
      mediaType,
      mediaStoragePath,
      campaignId,
    });
    res.status(201).json({ success: true, post });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/posts/:id - Update own post
postsRouter.put('/:id', (req, res) => {
  try {
    const post = db.updatePost(req.params.id, req.body);
    res.json({ success: true, post });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/posts/:id - Delete own post
postsRouter.delete('/:id', (req, res) => {
  try {
    const result = db.deletePost(req.params.id);
    res.json({ ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/posts/:id/unpublish - Admin moderation unpublish
postsRouter.post('/:id/unpublish', (req, res) => {
  const { reason } = req.body;
  const current = db.getCurrentUser();
  try {
    const post = db.unpublishPost(req.params.id, reason || 'Content violated guidelines', current.id);
    res.json({ success: true, post });
  } catch (err: any) {
    res.status(403).json({ success: false, error: err.message });
  }
});

// POST /api/posts/:id/report - User reporting inappropriate content
postsRouter.post('/:id/report', (req, res) => {
  const { reason } = req.body;
  if (!reason) {
    return res.status(400).json({ success: false, error: 'Reason for report is required' });
  }

  try {
    const report = db.createReport({
      targetType: 'post',
      targetId: req.params.id,
      reason,
    });
    res.status(201).json({ success: true, report });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
