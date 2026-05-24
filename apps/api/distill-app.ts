// HTTP handler factored out of dev-server.ts so it's testable with a stub
// Backend. The binary glues this to createClaudeCliBackend(); tests glue
// it to whatever fake Backend they need.

import { createServer, type IncomingMessage, type RequestListener, type Server, type ServerResponse } from 'node:http';
import { distillVideoToSkill, DistillError, type Backend } from '@skill-recorder/from-video';

export interface DistillAppOptions {
  backend: Backend;
  version?: string;
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

export function createDistillApp(opts: DistillAppOptions): RequestListener {
  const version = opts.version ?? 'dev';
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const baseHeaders = devCorsHeaders(req.headers.origin ?? null);

    if (req.method === 'OPTIONS') {
      sendJson(res, 204, baseHeaders, null);
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      sendJson(res, 200, baseHeaders, { ok: true, version, backend: 'injected' });
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
        backend: opts.backend,
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
  };
}

/**
 * Convenience for tests: start the app on a random port and return the
 * server + base URL. Caller is responsible for `server.close()`.
 */
export async function startDistillApp(opts: DistillAppOptions): Promise<{ server: Server; baseUrl: string }> {
  const server = createServer(createDistillApp(opts));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  if (typeof addr === 'string' || !addr) throw new Error('server did not bind a port');
  return { server, baseUrl: `http://127.0.0.1:${addr.port}` };
}

function devCorsHeaders(origin: string | null): Record<string, string> {
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
