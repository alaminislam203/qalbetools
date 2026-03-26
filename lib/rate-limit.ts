import { NextResponse } from 'next/server';

/**
 * ── SIMPLE API RATE LIMITER (MOCK) ──────────────────────────────────────────
 * In a real production environment, you would use Redis (Upstash) or a 
 * Middle-tier database to track usage per IP/API Key.
 * 
 * This mock simulates the behavior for UI/UX demonstration.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

// Map to store mock usage in-memory (Only persists as long as the server instance is alive)
const usageMap = new Map<string, { count: number; lastReset: number }>();

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 Hour window (Daily)
const DEFAULT_LIMIT = 20; // Requests per day for free tier

export async function checkRateLimit(identifier: string, forceTier?: 'free' | 'pro' | 'enterprise'): Promise<RateLimitResult> {
  const now = Date.now();
  const userData = usageMap.get(identifier) || { count: 0, lastReset: now };

  // Reset count if window passed
  if (now - userData.lastReset > WINDOW_MS) {
    userData.count = 0;
    userData.lastReset = now;
  }

  // Determine limit based on tier
  let limit = DEFAULT_LIMIT;
  const tier = forceTier || 'free';
  
  if (tier === 'pro') limit = 100;
  if (tier === 'enterprise') limit = 99999;

  userData.count += 1;
  usageMap.set(identifier, userData);

  const remaining = Math.max(0, limit - userData.count);
  const success = userData.count <= limit;

  return {
    success,
    limit,
    remaining,
    reset: userData.lastReset + WINDOW_MS,
  };
}

/**
 * Utility to generate rate limit headers
 */
export function getRateLimitHeaders(res: RateLimitResult) {
  return {
    'X-RateLimit-Limit': res.limit.toString(),
    'X-RateLimit-Remaining': res.remaining.toString(),
    'X-RateLimit-Reset': res.reset.toString(),
  };
}
