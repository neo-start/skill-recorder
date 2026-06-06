/**
 * POST /api/waitlist
 *
 * Cloudflare Pages Function. Validates an email, then logs it to the
 * CF dashboard's function logs. There is intentionally no durable storage
 * yet — wire one of these in when the beta opens for sign-ups:
 *
 *   - env.WAITLIST_KV.put(email, …)          // simple KV
 *   - env.DB.prepare(…).bind(email).run()    // D1
 *   - Resend / Loops / ConvertKit API call   // email service
 *
 * Until then, logs are visible in: Cloudflare Pages → Functions → Logs.
 */

interface Body {
  email?: unknown;
  source?: unknown;
}

// Minimal stand-in for the Pages Functions handler signature. Avoids
// pulling in @cloudflare/workers-types just to name the type; Cloudflare
// still discovers and executes these exports at runtime.
type Handler = (ctx: { request: Request }) => Promise<Response>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const onRequestPost: Handler = async ({ request }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const source = typeof body.source === 'string' ? body.source.slice(0, 64) : 'unknown';

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  // eslint-disable-next-line no-console
  console.log('[waitlist]', JSON.stringify({ email, source, ts: new Date().toISOString() }));

  return json({ ok: true });
};

// Reject everything that isn't POST so the endpoint doesn't accidentally
// look like a fetchable resource.
export const onRequest: Handler = async () =>
  json({ ok: false, error: 'method_not_allowed' }, 405);

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
