#!/usr/bin/env node
// Toggle middleware.ts between active and disabled state.
//
//   enabled  → rename middleware.ts.disabled → middleware.ts (needed for `next dev`
//              so the next-intl middleware handles locale routing at `/` and `/en`)
//   disabled → rename middleware.ts → middleware.ts.disabled (needed before
//              `next build` because middleware is incompatible with `output: 'export'`)
//
// Idempotent: if the file is already in the requested state, exits cleanly.
//
// Safety: `disabled` mode refuses to run if a dev server is detected on
// port 3300, because removing middleware while `next dev` is running silently
// breaks /en → / redirects in the live server. Pass --force to override.
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(__dirname, '..');
const ACTIVE = path.join(WEB, 'middleware.ts');
const DISABLED = path.join(WEB, 'middleware.ts.disabled');
const DEV_PORT = 3300;

const args = process.argv.slice(2);
const mode = args[0];
const force = args.includes('--force');

function fail(msg) {
  console.error(`[middleware-toggle] ${msg}`);
  process.exit(1);
}

function isDevServerRunning() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port: DEV_PORT, host: '127.0.0.1' });
    socket.setTimeout(300);
    const done = (result) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.once('timeout', () => done(false));
  });
}

async function main() {
  if (!['enabled', 'disabled'].includes(mode)) {
    fail('usage: node scripts/middleware-toggle.mjs <enabled|disabled> [--force]');
  }

  const hasActive = fs.existsSync(ACTIVE);
  const hasDisabled = fs.existsSync(DISABLED);

  if (hasActive && hasDisabled) {
    fail('both middleware.ts and middleware.ts.disabled exist — resolve manually before toggling');
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
    return;
  }

  // mode === 'disabled'
  if (!force && (await isDevServerRunning())) {
    fail(
      `dev server appears to be running on port ${DEV_PORT}.\n` +
        `  disabling middleware now would silently break /en → / redirects in the live dev server.\n` +
        `  stop the dev server first, or pass --force to override.`
    );
  }

  if (hasDisabled) {
    console.log('[middleware-toggle] already disabled');
  } else {
    fs.renameSync(ACTIVE, DISABLED);
    console.log('[middleware-toggle] disabled (.ts → .disabled)');
  }
}

main().catch((err) => fail(err.stack || String(err)));
