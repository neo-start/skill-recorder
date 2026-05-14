#!/usr/bin/env node
// Toggle middleware.ts between active and disabled state.
//
//   enabled  → rename middleware.ts.disabled → middleware.ts (needed for `next dev`
//              so the next-intl middleware handles locale routing at `/` and `/en`)
//   disabled → rename middleware.ts → middleware.ts.disabled (needed before
//              `next build` because middleware is incompatible with `output: 'export'`)
//
// Idempotent: if the file is already in the requested state, exits cleanly.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(__dirname, '..');
const ACTIVE = path.join(WEB, 'middleware.ts');
const DISABLED = path.join(WEB, 'middleware.ts.disabled');

const mode = process.argv[2];

function fail(msg) {
  console.error(`[middleware-toggle] ${msg}`);
  process.exit(1);
}

if (!['enabled', 'disabled'].includes(mode)) {
  fail('usage: node scripts/middleware-toggle.mjs <enabled|disabled>');
}

const hasActive = fs.existsSync(ACTIVE);
const hasDisabled = fs.existsSync(DISABLED);

if (hasActive && hasDisabled) {
  fail(
    'both middleware.ts and middleware.ts.disabled exist — resolve manually before toggling'
  );
}
if (!hasActive && !hasDisabled) {
  fail('neither middleware.ts nor middleware.ts.disabled exists');
}

if (mode === 'enabled') {
  if (hasActive) {
    console.log('[middleware-toggle] already enabled');
  } else {
    fs.renameSync(DISABLED, ACTIVE);
    console.log('[middleware-toggle] enabled (.disabled → .ts)');
  }
} else {
  if (hasDisabled) {
    console.log('[middleware-toggle] already disabled');
  } else {
    fs.renameSync(ACTIVE, DISABLED);
    console.log('[middleware-toggle] disabled (.ts → .disabled)');
  }
}
