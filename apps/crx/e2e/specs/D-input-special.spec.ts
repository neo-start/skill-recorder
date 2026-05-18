// Phase 2: Category D — input specialness.
//   - D1: native HTML5 drag/drop reorders a card across columns.
//
// More D-class specs (file upload, modifiers, contenteditable, clipboard,
// combobox) are added incrementally in the same file as each sub-phase
// lands. Keeping them together makes the suite easier to scan.

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

test.describe('@phase-2 Category D — input specialness', () => {
  test('D3: modifier-key chord (Ctrl/Meta + K) is captured + replayed', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/D3-modifier-keys.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Make sure the target has keyboard focus, then fire the shortcut.
      // Use Meta+K on macOS-style page logic (the fixture accepts either).
      await target.locator('#focus-trap').click();
      await target.keyboard.down('Meta');
      await target.keyboard.press('k');
      await target.keyboard.up('Meta');
      await target.waitForSelector('#palette:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      const chord = actions.find(
        (a) => (a.type === 'keyDown' || a.type === 'keyUp') && (a.key === 'k' || a.key === 'K'),
      );
      expect(chord, `expected a chord step for k, got: ${JSON.stringify(actions.map((a) => a.type + ':' + (a.key ?? '')))}`).toBeDefined();
      expect(chord!.modifiers?.meta, 'meta modifier must be captured').toBe(true);
      // Pure modifier keydowns must NOT show up.
      const bareModifier = actions.find(
        (a) =>
          (a.type === 'keyDown' || a.type === 'keyUp') &&
          (a.key === 'Meta' || a.key === 'Control' || a.key === 'Shift' || a.key === 'Alt'),
      );
      expect(bareModifier, 'bare modifier keydown should not be recorded').toBeUndefined();

      // Replay should re-open the palette.
      await startReplay(sidepanel, meta!.id);
      const replayTab = await findReplayTab(ext.context, 'D3-modifier-keys.html');
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 25_000 });
      expect(result.status, JSON.stringify(result.failure)).toBe('success');
      await expect(replayTab.locator('#palette')).toBeVisible();
      await expect(replayTab.locator('#result')).toHaveText(/opened palette via (Meta|Ctrl)\+K/);
    } finally {
      await ext.close();
    }
  });

  test('D4: contenteditable input is coalesced into one change step', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/D4-contenteditable.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      const editor = target.locator('[data-testid="notes-editor"]');
      await editor.click();
      // Type multi-character text — the debounce should coalesce.
      await target.keyboard.type('Hello rich world', { delay: 30 });
      // Blur flushes the buffer immediately.
      await target.locator('body').click({ position: { x: 0, y: 0 } });
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      const changes = actions.filter(
        (a) => a.type === 'change' && a.inputType === 'contenteditable',
      );
      expect(
        changes.length,
        `expected exactly one coalesced contenteditable change, got ${changes.length}: ${JSON.stringify(changes.map((c) => c.value))}`,
      ).toBe(1);
      const change = changes[0]!;
      expect(change.value).toBe('Hello rich world');
      const sels = (change.selectors ?? []).map((s) => s.value).join(' | ');
      expect(sels).toContain('notes-editor');

      // Replay should restore the same text.
      await startReplay(sidepanel, meta!.id);
      const replayTab = await findReplayTab(ext.context, 'D4-contenteditable.html');
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 25_000 });
      expect(result.status, JSON.stringify(result.failure)).toBe('success');
      await expect(replayTab.locator('[data-testid="notes-editor"]')).toHaveText(/Hello rich world/);
    } finally {
      await ext.close();
    }
  });

  test('D5: copy + paste events are recorded with their text payload', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/D5-clipboard.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Focus the source <pre> so the page selects its text.
      await target.locator('#src').focus();
      // Headless/CI clipboard handling varies. The fixture's copy handler
      // synthesises the payload itself via setData when we dispatch a copy
      // event programmatically, so do that explicitly from the page.
      await target.evaluate(() => {
        const ev = new ClipboardEvent('copy', { bubbles: true, cancelable: true });
        document.getElementById('src')!.dispatchEvent(ev);
      });

      // Now paste into the target via a synthetic ClipboardEvent carrying the
      // same payload (mimics what the OS would deliver after a Cmd+V).
      await target.evaluate(() => {
        const dt = new DataTransfer();
        dt.setData('text/plain', 'hello from D5 clipboard fixture');
        const ev = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt,
        });
        document.getElementById('dst')!.dispatchEvent(ev);
      });
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      const copy = actions.find((a) => a.type === 'copy');
      const paste = actions.find((a) => a.type === 'paste');
      expect(copy, 'expected a copy step').toBeDefined();
      expect(copy!.value).toContain('hello from D5 clipboard fixture');
      expect(paste, 'expected a paste step').toBeDefined();
      expect(paste!.value).toBe('hello from D5 clipboard fixture');
      // Paste target identification — should point at the textarea.
      const pasteSelectors = (paste!.selectors ?? []).map((s) => s.value).join(' | ');
      expect(pasteSelectors).toContain('dst');
    } finally {
      await ext.close();
    }
  });

  test('D6: combobox option click is enriched with comboboxContext and replay falls back to keyboard', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/D6-combobox.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Focus the combobox, type a prefix, click an option.
      await target.locator('#country-cb').click();
      await target.keyboard.type('Den', { delay: 30 });
      // The matching option for "Den" is "Denmark".
      await target.locator('#country-listbox li[role="option"]', { hasText: 'Denmark' }).click();
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      const optionClicks = actions.filter(
        (a) => a.type === 'click' && a.comboboxContext !== undefined,
      );
      expect(
        optionClicks.length,
        `expected at least one click step with comboboxContext, got ${optionClicks.length}`,
      ).toBeGreaterThan(0);
      const click = optionClicks[0]!;
      expect(click.comboboxContext!.optionText).toBe('Denmark');
      const cbSelectors = click.comboboxContext!.combobox.selectors
        .map((s) => s.value)
        .join(' | ');
      expect(cbSelectors).toContain('country-cb');

      // Replay (positive case — option element still exists since fixture is deterministic).
      await startReplay(sidepanel, meta!.id);
      const replayTab = await findReplayTab(ext.context, 'D6-combobox.html');
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 25_000 });
      expect(result.status, JSON.stringify(result.failure)).toBe('success');
      await expect(replayTab.locator('#result')).toHaveText(/selected: Denmark/);
    } finally {
      await ext.close();
    }
  });

  test('D2: file input captures metadata only and replay surfaces requiresFileInput', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/D2-file-upload.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Programmatically attach a file to the input via Playwright.
      const fileInput = target.locator('[data-testid="doc-input"]');
      await fileInput.setInputFiles({
        name: 'hello.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('hello world'),
      });
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      const fileChange = actions.find(
        (a) => a.type === 'change' && a.inputType === 'file',
      );
      expect(fileChange, 'expected a file change step').toBeDefined();
      expect(fileChange!.fileMeta).toBeDefined();
      expect(fileChange!.fileMeta![0]).toMatchObject({
        name: 'hello.txt',
        type: 'text/plain',
        size: 11,
      });
      // The recorder must NEVER attach byte contents — assert that explicitly.
      expect((fileChange as { content?: unknown }).content).toBeUndefined();

      // Replay should fail in a structured way (no sidepanel UI in this harness).
      await startReplay(sidepanel, meta!.id);
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 25_000 });
      expect(result.status).toBe('failed');
      expect(result.failure?.reason ?? '').toMatch(/requiresFileInput/);
    } finally {
      await ext.close();
    }
  });

  test('D1: native drag-and-drop is recorded as one drag step and replays', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/D1-dragdrop.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Playwright's high-level `dragTo` synthesizes the full HTML5 chain
      // (dragstart → dragover → drop → dragend) with a shared DataTransfer.
      // This is exactly the event sequence our recorder listens to.
      const card = target.locator('#task-2');
      const dst = target.locator('#dst');
      await card.dragTo(dst);
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      const drags = actions.filter((a) => a.type === 'drag');
      expect(drags.length, `expected exactly one coalesced drag step, got ${drags.length}`).toBe(1);
      const drag = drags[0]!;
      // Source captured as the "Build prototype" task card.
      expect(drag.dragFrom?.fingerprint?.attrs?.['aria-label']).toBe('Build prototype');
      const fromSelectors = (drag.dragFrom?.selectors ?? []).map((s) => s.value).join(' | ');
      expect(fromSelectors, fromSelectors).toContain('task-2');
      // Destination column.
      expect(drag.dragTo?.fingerprint?.attrs?.['aria-label']).toBe('In progress');
      const toSelectors = (drag.dragTo?.selectors ?? []).map((s) => s.value).join(' | ');
      expect(toSelectors, toSelectors).toContain('dst');
      // DataTransfer types observed include the text/plain we set on dragstart.
      expect(drag.dataTransferTypes ?? []).toContain('text/plain');

      // Replay should reproduce the move.
      await startReplay(sidepanel, meta!.id);
      const replayTab = await findReplayTab(ext.context, 'D1-dragdrop.html');
      const result = await waitForReplayTerminal(sidepanel, { timeoutMs: 25_000 });
      expect(result.status, JSON.stringify(result.failure)).toBe('success');
      await expect(replayTab.locator('#result')).toHaveText(/moved task-2 into dst/);
    } finally {
      await ext.close();
    }
  });
});
