import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIXTURE_PORT = 4318;

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: false, // extension state isn't safely parallelisable yet
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    viewport: { width: 1280, height: 800 },
    baseURL: `http://127.0.0.1:${FIXTURE_PORT}`,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    // Serves apps/crx/e2e/fixtures/ as static HTML so specs can `goto('/A1-static-form.html')`.
    command: `node ${path.join(__dirname, 'e2e/server.mjs')}`,
    port: FIXTURE_PORT,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
