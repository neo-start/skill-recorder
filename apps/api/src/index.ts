// POST /distill { videoUrl, model? } → { skill, videoMeta, usage }
// GET  /health                       → { ok: true, version }
//
// Thin transport layer over @skill-recorder/from-video. Adds CORS, KV-based
// rate limiting, KV-based result caching keyed by (model, videoId), and
// translates DistillError into HTTP status codes per the table in
// docs/video-skills-design.md §错误与边缘情况.

import { z } from 'zod';
import { distillVideoToSkill, DistillError } from '@skill-recorder/from-video';
import { createAnthropicBackend } from '@skill-recorder/from-video/backend-anthropic';
import type { Env } from './env';
import { corsHeaders, isAllowedOrigin } from './cors';
import { checkRateLimit } from './ratelimit';

const VERSION = '0.1.0';
const CACHE_TTL_SEC = 30 * 24 * 60 * 60; // 30 days

const RequestBody = z.object({
  videoUrl: z.string().url(),
  model: z.string().optional(),
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('origin');
    const baseHeaders = corsHeaders(origin, env);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: baseHeaders });
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, version: VERSION }, 200, baseHeaders);
    }

    if (request.method !== 'POST' || url.pathname !== '/distill') {
      return json({ error: 'not_found' }, 404, baseHeaders);
    }

    // Auth-by-origin: we ship the API key, so we won't proxy LLM calls for
    // arbitrary websites. Local wrangler dev requests usually have no origin.
    if (origin && !isAllowedOrigin(origin, env)) {
      return json({ error: 'forbidden_origin', origin }, 403, baseHeaders);
    }

    // Rate limit
    const ip = request.headers.get('cf-connecting-ip') ?? '';
    const rl = await checkRateLimit(env, ip);
    if (!rl.ok) {
      return json(
        { error: 'rate_limited', retryAfterSec: rl.retryAfterSec },
        429,
        { ...baseHeaders, 'retry-after': String(rl.retryAfterSec ?? 60) },
      );
    }

    // Parse body
    let body: z.infer<typeof RequestBody>;
    try {
      const raw = await request.json();
      body = RequestBody.parse(raw);
    } catch (e) {
      return json({ error: 'bad_request', message: (e as Error).message }, 400, baseHeaders);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'config', message: 'ANTHROPIC_API_KEY not bound' }, 500, baseHeaders);
    }

    // Cache lookup
    const model = body.model ?? 'claude-sonnet-4-6';
    const videoIdGuess = guessVideoId(body.videoUrl);
    const refresh = url.searchParams.get('refresh') === '1';
    const cacheKey = videoIdGuess ? `distill:v1:${model}:${videoIdGuess}` : null;
    if (cacheKey && !refresh) {
      const cached = await env.CACHE.get(cacheKey, 'json');
      if (cached) {
        return json({ ...cached, cached: true }, 200, baseHeaders);
      }
    }

    // Distill
    const backend = createAnthropicBackend(env.ANTHROPIC_API_KEY);
    try {
      const result = await distillVideoToSkill({
        videoUrl: body.videoUrl,
        backend,
        model,
      });
      const payload = {
        skill: result.skill,
        videoMeta: result.videoMeta,
        usage: {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          cacheHitTokens: result.cacheHitTokens,
        },
        transcriptCharCount: result.transcriptCharCount,
      };
      if (cacheKey) {
        // Best-effort write; don't block on it.
        await env.CACHE.put(cacheKey, JSON.stringify(payload), { expirationTtl: CACHE_TTL_SEC });
      }
      return json(payload, 200, baseHeaders);
    } catch (e) {
      return errorResponse(e, baseHeaders);
    }
  },
};

function json(body: unknown, status: number, extraHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

function errorResponse(e: unknown, baseHeaders: Record<string, string>): Response {
  if (e instanceof DistillError) {
    const status = HTTP_STATUS_BY_CODE[e.code] ?? 500;
    return json({ error: e.code, message: e.message }, status, baseHeaders);
  }
  console.error('[distill] unhandled', e);
  return json({ error: 'internal', message: (e as Error).message ?? 'unknown' }, 500, baseHeaders);
}

const HTTP_STATUS_BY_CODE: Record<string, number> = {
  unsupported_source: 400,
  no_transcript: 422,
  inaccessible: 422,
  too_long: 422,
  insufficient_content: 422,
  distill_failed: 502,
  config: 500,
};

// Cheap pre-validation videoId guess. The package does the authoritative
// parse, but we need an id _before_ paying for the LLM call so we can
// consult the cache. Mirrors logic in src/oembed.ts intentionally; if they
// drift the cache just misses, no correctness impact.
function guessVideoId(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl);
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (u.hostname.endsWith('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[2]!;
    }
    return null;
  } catch {
    return null;
  }
}
