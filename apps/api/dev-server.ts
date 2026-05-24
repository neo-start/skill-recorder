// Local Node dev server that speaks the same wire format as the Cloudflare
// Worker in _future/src/index.ts, but distills via the claude-cli backend
// so it uses the developer's Claude Code subscription instead of an
// Anthropic API key.
//
// Use this when you want to exercise the full Video tab → /distill → Skill
// path in the CRX without paying for an API key or deploying the Worker.
//
//   pnpm --filter @skill-recorder/api dev
//
// The CRX's default apiBaseUrl is http://localhost:8787, which is what we
// bind below — no config change needed.

import { createServer } from 'node:http';
import { createClaudeCliBackend } from '@skill-recorder/from-video/backend-claude-cli';
import { createDistillApp } from './distill-app';

const PORT = Number(process.env.PORT ?? 8787);
const VERSION = '0.1.0-dev';

const server = createServer(
  createDistillApp({
    backend: createClaudeCliBackend(),
    version: VERSION,
  }),
);

server.listen(PORT, () => {
  console.log(`[dev-server] listening on http://localhost:${PORT} (backend: claude-cli)`);
  console.log(`[dev-server] POST /distill { videoUrl, model? }   GET /health`);
});
