// Boot Chromium with the unpacked extension and return useful handles.
//
// Usage:
//   const ext = await launchExtension();
//   // ...drive recording, replay, skill-build via the drivers in this dir
//   await ext.close();

import { chromium, type BrowserContext, type Page, type Worker } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXT_DIST = path.resolve(__dirname, '../../dist');

export interface LaunchedExtension {
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
  /** Open the sidepanel as a regular page (used by drivers to fire chrome.runtime.sendMessage). */
  openSidepanel(): Promise<Page>;
  close(): Promise<void>;
}

export async function launchExtension(): Promise<LaunchedExtension> {
  if (!fs.existsSync(EXT_DIST)) {
    throw new Error(
      `Extension dist not found at ${EXT_DIST}. Run \`pnpm -F crx build\` first.`,
    );
  }

  // MV3 extensions require persistent context (Chromium will not load extensions
  // in incognito/ephemeral mode). Empty userDataDir = fresh profile per run.
  const context = await chromium.launchPersistentContext('', {
    headless: false, // MV3 service workers don't run in pure headless yet
    args: [
      `--disable-extensions-except=${EXT_DIST}`,
      `--load-extension=${EXT_DIST}`,
      // Suppress first-run noise that can race with test setup
      '--no-first-run',
      '--no-default-browser-check',
    ],
  });

  // Service worker may already be alive, or starting up. Wait either way.
  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker', { timeout: 15_000 });
  }

  // chrome-extension://<id>/path/to/sw → split out the id
  const swUrl = new URL(serviceWorker.url());
  const extensionId = swUrl.hostname;

  const openSidepanel = async (): Promise<Page> => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/src/modules/sidepanel/index.html`);
    // Give the React tree + mobx stores a beat to hydrate.
    await page.waitForLoadState('domcontentloaded');
    return page;
  };

  return {
    context,
    extensionId,
    serviceWorker,
    openSidepanel,
    close: () => context.close(),
  };
}
