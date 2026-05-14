#!/usr/bin/env node
// Flatten the default-locale (en) export into the site root so the canonical
// English URL is `/` instead of `/en`. Other locales remain prefixed.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'out');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function moveIfExists(src, dst) {
  if (!(await exists(src))) return false;
  await fs.rename(src, dst);
  return true;
}

async function main() {
  if (!(await exists(OUT))) {
    console.error(`[postbuild] ${OUT} does not exist — was next build run with output: 'export'?`);
    process.exit(1);
  }

  for (const ext of ['html', 'txt']) {
    const src = path.join(OUT, `en.${ext}`);
    const dst = path.join(OUT, `index.${ext}`);
    if (await moveIfExists(src, dst)) {
      console.log(`[postbuild] en.${ext} -> index.${ext}`);
    }
  }

  const enDir = path.join(OUT, 'en');
  if (await exists(enDir)) {
    await fs.cp(enDir, OUT, { recursive: true, force: true });
    await fs.rm(enDir, { recursive: true, force: true });
    console.log('[postbuild] en/* merged into root, en/ removed');
  }

  console.log('[postbuild] done — canonical EN is now at /');
}

main().catch(err => {
  console.error('[postbuild] failed:', err);
  process.exit(1);
});
