# `@skill-recorder/api`

Local HTTP shim for the CRX's **Video** tab. Currently active path: **dev-server**, not the Worker.

## TL;DR

```bash
pnpm --filter @skill-recorder/api dev   # starts http://localhost:8787
```

Then open the CRX side panel → Video tab → paste a YouTube URL. The CRX
defaults to `http://localhost:8787` and matches the dev-server's bind, so
no configuration is needed.

## What `dev-server.ts` is

A 100-line Node HTTP server that speaks the exact `POST /distill` /
`GET /health` wire format the CRX expects. Internally it calls
`distillVideoToSkill()` with the **claude-cli backend** — so it uses your
local Claude Code subscription (`claude -p`) instead of an Anthropic API key.

This is sufficient for a single-developer workflow:
- No API key needed; pays out of your Claude subscription
- No Cloudflare account, no DNS, no KV namespaces
- Works offline-ish (you still need network for Anthropic + YouTube transcript)

What it doesn't have, that the Worker has:
- Result cache (re-distilling the same video re-spends a Claude call)
- IP-based rate limit (irrelevant for personal use)
- Remote accessibility (you have to be on the laptop running it)

## `_future/` — the Cloudflare Worker

Lives in [`_future/`](./_future). It's a full Cloudflare Worker
implementation of the same `/distill` endpoint, with CORS allow-list,
KV-backed rate limiting, and KV-backed 30-day result cache. It uses the
**anthropic-sdk backend** instead of claude-cli (since Workers can't spawn
processes).

We're not running it. It's there for the day "ship this to other people"
becomes a goal — at which point local Node + a Claude subscription stops
being enough.

To deploy it later:

```bash
pnpm --filter @skill-recorder/api deploy:worker
```

See [`_future/README.md`](./_future/README.md) for the operator setup
(KV namespaces, secret).
