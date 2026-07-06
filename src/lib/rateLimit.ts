import { NextRequest } from 'next/server';

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitTracker>();

/**
 * Checks if a request key has exceeded rate limits.
 * @param key Unique client identifier (e.g. IP address + route)
 * @param limit Maximum allowed requests within the window
 * @param windowMs Window duration in milliseconds (e.g. 60000 for 1 minute)
 * @returns boolean true if rate limited, false otherwise
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = tracker.get(key);

  if (!record || now > record.resetTime) {
    tracker.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return false;
  }

  record.count += 1;
  if (record.count > limit) {
    return true;
  }

  return false;
}

/**
 * Extracts client IP from request headers or fallback.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
