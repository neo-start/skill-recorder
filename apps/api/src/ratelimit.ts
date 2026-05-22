// Two-window token bucket implemented on KV. Keyed by client IP
// (`cf-connecting-ip`, set by Cloudflare on the request). Limits per
// docs/video-skills-design.md §限流: 5 requests per 10 minutes + 20 per day.
//
// Two reads + two writes per allowed request. Cheap relative to the LLM call.
// We accept the "TOCTOU window" — two concurrent requests can both pass the
// check; harm bounded to N+1 over the limit. Worth it to keep this simple.

import type { Env } from './env';

interface Bucket {
  windowSec: number;
  max: number;
  prefix: string;
}

const SHORT: Bucket = { windowSec: 600, max: 5, prefix: 'rl:short' };
const LONG: Bucket = { windowSec: 86_400, max: 20, prefix: 'rl:long' };

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec?: number;
}

export async function checkRateLimit(env: Env, ip: string): Promise<RateLimitResult> {
  if (!ip) return { ok: true }; // No IP = local wrangler dev; let through.

  const now = Math.floor(Date.now() / 1000);
  for (const bucket of [SHORT, LONG]) {
    const key = `${bucket.prefix}:${ip}:${Math.floor(now / bucket.windowSec)}`;
    const raw = await env.RATELIMIT.get(key);
    const count = raw ? Number(raw) : 0;
    if (count >= bucket.max) {
      const elapsed = now % bucket.windowSec;
      return { ok: false, retryAfterSec: bucket.windowSec - elapsed };
    }
  }

  // Allowed — bump both counters. Use put with TTL so old buckets self-expire.
  for (const bucket of [SHORT, LONG]) {
    const key = `${bucket.prefix}:${ip}:${Math.floor(now / bucket.windowSec)}`;
    const raw = await env.RATELIMIT.get(key);
    const count = raw ? Number(raw) : 0;
    await env.RATELIMIT.put(key, String(count + 1), {
      expirationTtl: bucket.windowSec + 60,
    });
  }
  return { ok: true };
}
