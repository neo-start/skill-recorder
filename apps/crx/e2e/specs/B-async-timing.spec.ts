// Phase 3: Category B — async + timing.
//   - B1: SPA route transition mounts new view after a settle delay; replay
//     must wait via the elementVisible expectation derived from the next step.
//   - B3: lazy modal mounts 700ms after the trigger click; same mechanism.
//
// The Expectation type now also has `networkIdle`, `attributeChange`, and
// `domStable` kinds, exercised indirectly via `domStable` becoming the
// default noop fallback. We don't need a dedicated spec for that — every
// existing replay path now routes through it.

import { test, type BrowserContext, type Page } from '@playwright/test';
import { launchExtension } from '../harness/extension';
import {
  startRecording,
  stopRecording,
  latestRecording,
} from '../harness/recorder-driver';
import { startReplay, waitForReplayTerminal } from '../harness/replay-driver';
import { expect } from '../harness/assertions';

async function findReplayTab(
  context: BrowserContext,
  urlFragment: string,
): Promise<Page> {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    const pages = context.pages();
    const candidates = pages.filter(
      (p) => !p.url().startsWith('chrome-extension://') && p.url().includes(urlFragment),
    );
    if (candidates.length >= 1) {
      const tab = candidates[candidates.length - 1];
      await tab.waitForLoadState('domcontentloaded');
      return tab;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Replay tab matching "${urlFragment}" not found within 8s`);
}

test.describe('@phase-3 Category B — async + timing', () => {
  test('B1: SPA route transition — replay waits for the late-mounted view', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/B1-spa-route.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Navigate to the Orders tab — view mounts ~350ms later.
      await target.locator('[data-testid="nav-orders"]').click();
      await target.locator('[data-testid="confirm-order"]').click();
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();

      await startReplay(sidepanel, meta!.id);
      const replayTab = await findReplayTab(ext.context, 'B1-spa-route.html');
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 25_000 });
      expect(result.status, JSON.stringify(result.failure)).toBe('success');
      await expect(replayTab.locator('#result')).toHaveText(/order confirmed/);
    } finally {
      await ext.close();
    }
  });

  test('B3: lazy modal — replay waits ~700ms for the modal to mount before clicking Confirm', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/B3-lazy-modal.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      await target.locator('[data-testid="open-modal"]').click();
      await target.waitForSelector('[data-testid="confirm-settings"]');
      await target.locator('[data-testid="confirm-settings"]').click();
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();

      await startReplay(sidepanel, meta!.id);
      const replayTab = await findReplayTab(ext.context, 'B3-lazy-modal.html');
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 25_000 });
      expect(result.status, JSON.stringify(result.failure)).toBe('success');
      await expect(replayTab.locator('#result')).toHaveText(/settings confirmed/);
    } finally {
      await ext.close();
    }
  });
});
