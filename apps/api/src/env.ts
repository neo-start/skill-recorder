/**
 * Bindings declared in `wrangler.toml`. The Cloudflare Workers runtime hands
 * us a fresh `Env` per request via the second argument to `fetch`.
 */
export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS_EXTRA?: string;
  RATELIMIT: KVNamespace;
  CACHE: KVNamespace;
}
