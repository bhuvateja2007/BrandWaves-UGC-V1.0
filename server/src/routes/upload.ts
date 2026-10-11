import { Router, Request, Response } from 'express';
import { supabaseServer, isServerSupabaseConfigured } from '../lib/supabase.js';
import crypto from 'crypto';

export const uploadRouter = Router();

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * POST /api/upload
 * Handles persistent media file uploads directly to Supabase Storage ('brandwaves-media').
 * Accepts base64 encoded fileData or binary buffer.
 */
uploadRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { fileData, fileName, mimeType, userId, isPrivate } = req.body;

    if (!fileData || !fileName || !mimeType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required upload parameters: fileData (base64), fileName, and mimeType are required.'
      });
    }

    // 1. Enforce allowed MIME types
    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return res.status(415).json({
        success: false,
        error: `Unsupported media type: '${mimeType}'. Allowed formats: ${ALLOWED_MIME_TYPES.join(', ')}.`
      });
    }

    // 2. Decode file bytes from Base64
    const base64Data = fileData.includes('base64,') 
      ? fileData.split('base64,')[1] 
      : fileData;
    
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // 3. Enforce maximum file size limit
    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(413).json({
        success: false,
        error: `File size exceeds the 25MB limit. Received: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB.`
      });
    }

    if (!isServerSupabaseConfigured) {
      return res.status(503).json({
        success: false,
        error: 'Remote storage is not configured. Supabase credentials missing in server environment.'
      });
    }

    // 4. Construct safe normalized storage path
    const sanitizedExt = (fileName.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const userFolder = userId ? `user-${userId.replace(/[^a-zA-Z0-9_-]/g, '')}` : 'community';
    const uniqueId = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const storagePath = `${userFolder}/${uniqueId}.${sanitizedExt}`;

    // 5. Upload actual file bytes to Supabase Storage bucket 'brandwaves-media'
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('brandwaves-media')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[UploadRouter] Supabase Storage upload failed:', uploadError);
      return res.status(500).json({
        success: false,
        error: `Supabase Storage upload failed: ${uploadError.message}`
      });
    }

    // 6. Obtain persistent URL
    let publicUrl = '';
    if (isPrivate) {
      // For private campaign deliverables, generate a 24-hour signed URL
      const { data: signedData, error: signedErr } = await supabaseServer.storage
        .from('brandwaves-media')
        .createSignedUrl(storagePath, 86400); // 24 hours
      
      if (!signedErr && signedData?.signedUrl) {
        publicUrl = signedData.signedUrl;
      }
    }

    if (!publicUrl) {
      const { data: publicData } = supabaseServer.storage
        .from('brandwaves-media')
        .getPublicUrl(storagePath);
      
      publicUrl = publicData.publicUrl;
    }

    return res.status(201).json({
      success: true,
      storagePath,
      publicUrl,
      fileName,
      mimeType,
      size: fileBuffer.length,
      bucket: 'brandwaves-media',
      isPrivate: Boolean(isPrivate)
    });

  } catch (err: any) {
    console.error('[UploadRouter] Unhandled exception:', err);
    return res.status(500).json({
      success: false,
      error: `Server upload exception: ${err.message || 'Unknown error'}`
    });
  }
});

/**
 * GET /api/upload/signed-url
 * Generates an authorized signed URL for private campaign deliverables.
 */
uploadRouter.get('/signed-url', async (req: Request, res: Response) => {
  try {
    const { path: storagePath, expiresIn = '3600' } = req.query;

    if (!storagePath || typeof storagePath !== 'string') {
      return res.status(400).json({ success: false, error: 'Query parameter "path" is required.' });
    }

    const { data, error } = await supabaseServer.storage
      .from('brandwaves-media')
      .createSignedUrl(storagePath, Number(expiresIn) || 3600);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, signedUrl: data.signedUrl });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
