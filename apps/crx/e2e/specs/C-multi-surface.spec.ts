// Phase 4: Category C — multi-surface.
//   - C1: same-origin iframe — recorder injects into the iframe, ACTION steps
//     carry a non-zero frameId, replay routes EXECUTE_STEP to the right frame.

import { test, type BrowserContext, type Page } from '@playwright/test';
import { launchExtension } from '../harness/extension';
import {
  startRecording,
  stopRecording,
  latestRecording,
  loadActions,
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

test.describe('@phase-4 Category C — multi-surface', () => {
  test('C2: sensitive fields (password / tel / cc-* / cvc) are masked at record time', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/C2-iframe-cross-origin.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Email is NOT sensitive — should be captured cleartext.
      await target.locator('[data-testid="email"]').fill('alice@example.com');
      // The rest must be redacted.
      await target.locator('[data-testid="pw"]').fill('hunter2');
      await target.locator('[data-testid="phone"]').fill('+1 415 555 0100');
      await target.locator('[data-testid="cc"]').fill('4242424242424242');
      await target.locator('[data-testid="cvc"]').fill('123');
      // Tab away to flush the debounce buffer.
      await target.locator('body').click({ position: { x: 0, y: 0 } });

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);
      const changes = actions.filter((a) => a.type === 'change');

      const byTestid = (id: string) =>
        changes.find((a) =>
          (a.selectors ?? []).some((s) => s.value.includes(`"${id}"`)),
        );

      const emailStep = byTestid('email');
      expect(emailStep, 'email change must be recorded').toBeDefined();
      expect(emailStep!.masked).toBeFalsy();
      expect(emailStep!.value).toBe('alice@example.com');

      for (const id of ['pw', 'phone', 'cc', 'cvc']) {
        const step = byTestid(id);
        expect(step, `expected change step for ${id}`).toBeDefined();
        expect(step!.masked, `step for ${id} must be masked`).toBe(true);
        // CRITICAL invariant — secret bytes never make it to storage.
        expect(step!.value, `value for ${id} must NOT be cleartext`).not.toContain('hunter');
        expect(step!.value, `value for ${id} must NOT contain card digits`).not.toContain('4242');
        expect(step!.value, `value for ${id} must NOT contain phone digits`).not.toContain('0100');
      }
    } finally {
      await ext.close();
    }
  });

  test('C3: shadow-DOM button is captured via a shadow-piercing selector and replays', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/C3-shadow-dom.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // composedPath in the click handler resolves deeper than ev.target — the
      // recorder uses it to reach the shadow element.
      await target.locator('my-card').evaluate((host) => {
        const btn = (host as Element & { shadowRoot: ShadowRoot }).shadowRoot.getElementById(
          'inside-btn',
        ) as HTMLButtonElement;
        btn.click();
      });
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      const click = actions.find((a) => a.type === 'click');
      expect(click, 'expected a click step').toBeDefined();
      const shadowSelector = (click!.selectors ?? []).find((s) => s.kind === 'shadow');
      expect(
        shadowSelector,
        `expected a 'shadow' selector encoding the piercing path; got ${JSON.stringify(click!.selectors)}`,
      ).toBeDefined();
      // Sanity-check the JSON payload is parseable and points at the inner button.
      const parsed = JSON.parse(shadowSelector!.value);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[parsed.length - 1].inner).toContain('inside-btn');

      await startReplay(sidepanel, meta!.id);
      const replayTab = await findReplayTab(ext.context, 'C3-shadow-dom.html');
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 25_000 });
      expect(result.status, JSON.stringify(result.failure)).toBe('success');
      await expect(replayTab.locator('#result')).toHaveText(/shadow button clicked/);
    } finally {
      await ext.close();
    }
  });

  test('C4: target="_blank" link records a switchTab step and replay opens + drives the new tab', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/C4-multi-tab.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Click the target="_blank" link → opens a second tab in this context.
      const [secondTab] = await Promise.all([
        ext.context.waitForEvent('page'),
        target.locator('[data-testid="open-second"]').click(),
      ]);
      await secondTab.waitForLoadState('domcontentloaded');
      await secondTab.bringToFront();
      // Click on the second tab.
      await secondTab.locator('[data-testid="confirm-on-second"]').click();
      await secondTab.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      const switchSteps = actions.filter((a) => a.type === 'switchTab');
      expect(
        switchSteps.length,
        `expected at least one switchTab step, got types: ${actions.map((a) => a.type).join(',')}`,
      ).toBeGreaterThan(0);
      expect(switchSteps[0].targetTabIndex).toBe(1);
      // The recording should contain at least one click that happened on the second tab.
      const allClicks = actions.filter((a) => a.type === 'click');
      const secondClick = allClicks.find(
        (a) => (a.selectors ?? []).some((s) => s.value.includes('confirm-on-second')),
      );
      expect(secondClick, 'expected a click on the second tab').toBeDefined();

      // Replay: should open the new tab and click on it.
      await startReplay(sidepanel, meta!.id);
      const replayTab = await findReplayTab(ext.context, 'C4-multi-tab.html');
      void replayTab;
      // The new tab opens at C4-second.html — wait for its result text.
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 30_000 });
      expect(result.status, JSON.stringify(result.failure)).toBe('success');
      const second = await findReplayTab(ext.context, 'C4-second.html');
      await expect(second.locator('#result')).toHaveText(/second-tab confirm clicked/);
    } finally {
      await ext.close();
    }
  });

  test('C1: iframe click is recorded with a frameId and replays into the iframe', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/C1-iframe-same-origin.html');
      await target.bringToFront();
      // Make sure the iframe has finished loading so its content script connects.
      await target.locator('iframe[data-testid="inner"]').waitFor();
      await target.waitForFunction(() => {
        const f = document.querySelector('iframe');
        return !!(f && f.contentDocument && f.contentDocument.querySelector('[data-testid="inner-btn"]'));
      });

      const before = Date.now();
      await startRecording(sidepanel);

      // Click inside the iframe.
      const innerFrame = target.frameLocator('iframe[data-testid="inner"]');
      await innerFrame.locator('[data-testid="inner-btn"]').click();
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      const iframeClick = actions.find(
        (a) => a.type === 'click' && a.frameId !== undefined && a.frameId !== 0,
      );
      expect(
        iframeClick,
        `expected a click with frameId !== 0, got: ${JSON.stringify(
          actions.map((a) => ({ type: a.type, frameId: a.frameId })),
        )}`,
      ).toBeDefined();
      // Frame-side selectors should still resolve the inner button.
      const innerSels = (iframeClick!.selectors ?? []).map((s) => s.value).join(' | ');
      expect(innerSels).toContain('inner-btn');

      // Replay routes EXECUTE_STEP to the iframe — should succeed.
      await startReplay(sidepanel, meta!.id);
      const replayTab = await findReplayTab(ext.context, 'C1-iframe-same-origin.html');
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 25_000 });
      expect(result.status, JSON.stringify(result.failure)).toBe('success');
      await expect(replayTab.locator('#result')).toHaveText(/inner clicked: inner-btn/);
    } finally {
      await ext.close();
    }
  });
});
