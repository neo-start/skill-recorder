// Allow-list approach: we ship the API key in env, so we don't want random
// origins making us proxy LLM calls on their behalf. Allowed origins:
//   - chrome-extension://<anything>  (our CRX, any installation id)
//   - https://skill-recorder.dev and any preview subdomain
//   - whatever the operator extends via ALLOWED_ORIGINS_EXTRA in wrangler.toml

import type { Env } from './env';

const ALWAYS_ALLOWED_HOST_RE = /^([a-z0-9-]+\.)?skill-recorder\.dev$/i;

export function isAllowedOrigin(origin: string | null, env: Env): boolean {
  if (!origin) return false;

  if (origin.startsWith('chrome-extension://')) return true;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
  if (ALWAYS_ALLOWED_HOST_RE.test(url.host)) return true;

  const extra = (env.ALLOWED_ORIGINS_EXTRA ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return extra.includes(origin);
}

export function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  if (!origin || !isAllowedOrigin(origin, env)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-max-age': '600',
    'vary': 'origin',
  };
}
