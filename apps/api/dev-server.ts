// Local Node dev server that speaks the same wire format as the Cloudflare
// Worker in src/index.ts, but distills via the claude-cli backend so it uses
// the developer's Claude Code subscription instead of an Anthropic API key.
//
// Use this when you want to exercise the full Video tab → /distill → Skill
// path in the CRX without paying for an API key or deploying the Worker.
//
//   pnpm --filter @skill-recorder/api dev:cli
//
// The CRX's default apiBaseUrl is http://localhost:8787, which is what we
// bind below — no config change needed.

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { distillVideoToSkill, DistillError } from '@skill-recorder/from-video';
import { createClaudeCliBackend } from '@skill-recorder/from-video/backend-claude-cli';

const PORT = Number(process.env.PORT ?? 8787);
const VERSION = '0.1.0-dev';

const HTTP_STATUS_BY_CODE: Record<string, number> = {
  unsupported_source: 400,
  no_transcript: 422,
  inaccessible: 422,
  too_long: 422,
  insufficient_content: 422,
  distill_failed: 502,
  config: 500,
};

const server = createServer(async (req, res) => {
  const origin = req.headers.origin ?? null;
  const baseHeaders = devCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, baseHeaders, null);
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, baseHeaders, { ok: true, version: VERSION, backend: 'claude-cli' });
    return;
  }

  const url = new URL(req.url ?? '/', 'http://localhost');
  if (req.method !== 'POST' || url.pathname !== '/distill') {
    sendJson(res, 404, baseHeaders, { error: 'not_found' });
    return;
  }

  let body: unknown;
  try {
    body = await readJson(req);
  } catch (e) {
    sendJson(res, 400, baseHeaders, { error: 'bad_request', message: (e as Error).message });
    return;
  }

  const { videoUrl, model } = (body ?? {}) as { videoUrl?: string; model?: string };
  if (typeof videoUrl !== 'string' || !videoUrl) {
    sendJson(res, 400, baseHeaders, { error: 'bad_request', message: 'videoUrl is required' });
    return;
  }

  try {
    const result = await distillVideoToSkill({
      videoUrl,
      backend: createClaudeCliBackend(),
      model,
    });
    sendJson(res, 200, baseHeaders, {
      skill: result.skill,
      videoMeta: result.videoMeta,
      usage: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        cacheHitTokens: result.cacheHitTokens,
      },
      transcriptCharCount: result.transcriptCharCount,
    });
  } catch (e) {
    if (e instanceof DistillError) {
      const status = HTTP_STATUS_BY_CODE[e.code] ?? 500;
      sendJson(res, status, baseHeaders, { error: e.code, message: e.message });
      return;
    }
    console.error('[dev-server] unhandled', e);
    sendJson(res, 500, baseHeaders, { error: 'internal', message: (e as Error).message ?? 'unknown' });
  }
});

server.listen(PORT, () => {
  console.log(`[dev-server] listening on http://localhost:${PORT} (backend: claude-cli)`);
  console.log(`[dev-server] POST /distill { videoUrl, model? }   GET /health`);
});

function devCorsHeaders(origin: string | null): Record<string, string> {
  // Local dev: trust whatever Chrome sends. The shipped Worker (src/index.ts)
  // has the real allow-list.
  return {
    'access-control-allow-origin': origin ?? '*',
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-max-age': '600',
    vary: 'origin',
  };
}

function sendJson(
  res: ServerResponse,
  status: number,
  headers: Record<string, string>,
  body: unknown,
): void {
  const payload = body === null ? '' : JSON.stringify(body);
  res.writeHead(status, {
    ...headers,
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(Buffer.byteLength(payload)),
  });
  res.end(payload);
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}
