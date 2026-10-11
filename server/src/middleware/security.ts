import { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// 1. HTTP SECURITY HEADERS (OWASP ASVS / CIS Compliant)
// ---------------------------------------------------------------------------
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent Clickjacking (disallow framing)
  res.setHeader('X-Frame-Options', 'DENY');

  // Disable legacy buggy XSS auditor
  res.setHeader('X-XSS-Protection', '0');

  // Control referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict powerful browser APIs
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Content Security Policy for API surface
  if (req.path.startsWith('/api')) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    );
  }

  // Prevent caching of sensitive API state
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}

// ---------------------------------------------------------------------------
// 2. STRICT CORS ORIGIN VALIDATION
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
]);

// Dynamically include production URLs from environment
const customOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  process.env.CORS_ALLOWED_ORIGINS,
].filter(Boolean);

for (const origStr of customOrigins) {
  if (origStr) {
    origStr.split(',').forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) ALLOWED_ORIGINS.add(trimmed);
    });
  }
}

export function secureCors(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  if (origin) {
    if (ALLOWED_ORIGINS.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
      );
    } else {
      // Reject cross-origin requests from unauthorized origins
      if (req.method !== 'GET') {
        return res.status(403).json({
          success: false,
          error: 'CORS policy violation: Origin not allowed',
        });
      }
    }
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
}

// ---------------------------------------------------------------------------
// 3. IN-MEMORY RATE LIMITING (Sliding Window per IP)
// ---------------------------------------------------------------------------
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitMap.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimiter(options: { maxRequests: number; windowMs: number }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    const bucket = rateLimitMap.get(key);

    if (!bucket || bucket.resetAt <= now) {
      rateLimitMap.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', options.maxRequests - 1);
      return next();
    }

    if (bucket.count >= options.maxRequests) {
      res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down and try again later.',
      });
    }

    bucket.count += 1;
    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', options.maxRequests - bucket.count);
    next();
  };
}

// ---------------------------------------------------------------------------
// 4. PROTOTYPE POLLUTION & DANGEROUS INPUT SANITIZER
// ---------------------------------------------------------------------------
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizeObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (DANGEROUS_KEYS.has(key)) {
      continue; // Strip prototype pollution vector
    }
    clean[key] = sanitizeObject(value);
  }
  return clean;
}

export function inputSanitizer(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
}
