#!/usr/bin/env node
// Mirror the e2e fixtures used by Phase 0–5 specs into the marketing site's
// public/ folder so they double as interactive playground pages. The /e2e/
// fixtures remain the single source of truth; this script keeps the copies
// fresh at dev start and before each production build.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..', '..', 'crx', 'e2e', 'fixtures');
const DST = path.resolve(__dirname, '..', 'public', 'playground');

async function main() {
  const entries = await fs.readdir(SRC);
  await fs.mkdir(DST, { recursive: true });
  let copied = 0;
  for (const name of entries) {
    if (!name.endsWith('.html')) continue;
    const src = path.join(SRC, name);
    const dst = path.join(DST, name);
    await fs.copyFile(src, dst);
    copied += 1;
  }
  console.log(`[sync-playground] copied ${copied} fixture(s) into ${path.relative(process.cwd(), DST)}`);
}

main().catch((err) => {
  console.error('[sync-playground] failed', err);
  process.exit(1);
});
