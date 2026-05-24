# `_future/` — Cloudflare Worker (not currently active)

This is the deployable Worker version of the `/distill` endpoint. We're
not running it — the active local path is `../dev-server.ts`. See
[`../README.md`](../README.md) for the reasoning.

## What's in here

| File | Purpose |
|---|---|
| `wrangler.toml` | Worker config; KV bindings; ALLOWED_ORIGINS_EXTRA var |
| `src/index.ts` | `POST /distill`, `GET /health`; CORS, rate limit, cache |
| `src/cors.ts` | Allow-list: `chrome-extension://*` + `*.skill-recorder.dev` |
| `src/ratelimit.ts` | Two-window KV bucket (5/10min + 20/day) on `cf-connecting-ip` |
| `src/env.ts` | Type for the Worker bindings |
| `tsconfig.json` | Workers lib config |

## Activating it (when the time comes)

1. **Create the two KV namespaces** and paste their ids into `wrangler.toml`:

   ```bash
   pnpm --filter @skill-recorder/api exec wrangler kv:namespace create RATELIMIT
   pnpm --filter @skill-recorder/api exec wrangler kv:namespace create CACHE
   ```

2. **Set the Anthropic secret**:

   ```bash
   pnpm --filter @skill-recorder/api exec wrangler secret put ANTHROPIC_API_KEY
   ```

3. **Deploy**:

   ```bash
   pnpm --filter @skill-recorder/api deploy:worker
   ```

4. **Point the CRX at it** — in the Video tab, click *Change* and paste
   the production URL (e.g. `https://api.skill-recorder.dev`).

## Local Worker testing (Miniflare)

If you want to exercise the Worker code path locally without deploying:

```bash
pnpm --filter @skill-recorder/api dev:worker
```

This starts `wrangler dev` against `_future/wrangler.toml`, with KV
simulated locally. You'll still need `apps/api/.dev.vars` containing
`ANTHROPIC_API_KEY=sk-…` for `/distill` to actually call the model.
