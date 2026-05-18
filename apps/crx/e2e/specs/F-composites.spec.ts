// Phase 6: Category F — real-world composites.
//
// These fixtures (F1 Notion, F2 Linear, F3 Jira, F4 Salesforce) chain 12-15
// difficulty points each into a single product-shaped flow. The specs below
// don't try to replay each composite end-to-end; instead they pick the
// *most distinctive* interaction from each fixture and verify the recorder
// caught it with the right semantics (correct selector, correct mask flag,
// correct comboboxContext, correct chord modifiers, etc.).
//
// If these recording assertions pass, the composite pitch on the playground
// page ("12-15 difficulty points, all caught") is honest.

import { test } from '@playwright/test';
import { launchExtension } from '../harness/extension';
import {
  startRecording,
  stopRecording,
  latestRecording,
  loadActions,
} from '../harness/recorder-driver';
import { expect } from '../harness/assertions';

const selectorsOf = (a: { selectors?: { value: string }[] }) =>
  (a.selectors ?? []).map((s) => s.value).join(' | ');

test.describe('@phase-6 Category F — real-world composites', () => {
  test('F1 (Notion-style): contenteditable page-title rename + @-mention click captured', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/F1-notion.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Rename the page title — it's a contenteditable div (D4).
      const title = target.locator('[data-testid="page-title"]');
      await title.click();
      // Wipe existing content (the fixture pre-fills it) and type fresh text.
      await target.keyboard.press('ControlOrMeta+a');
      await target.keyboard.type('My new page', { delay: 25 });
      // Blur to flush the debounced contenteditable buffer.
      await target.locator('body').click({ position: { x: 4, y: 4 } });

      // Click the @-mention chip — it has a stable data-i18n-key (A4) and a testid.
      await target.locator('[data-testid="mention-alex"]').click();

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta, 'a recording should exist').not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      // The title rename produces a coalesced contenteditable change.
      const ce = actions.find(
        (a) => a.type === 'change' && a.inputType === 'contenteditable',
      );
      expect(ce, 'expected a contenteditable change step for the page title').toBeDefined();
      expect(ce!.value).toContain('My new page');
      expect(selectorsOf(ce!)).toContain('page-title');

      // The @-mention click is captured against a stable selector.
      const mention = actions.find(
        (a) =>
          a.type === 'click' &&
          (a.selectors ?? []).some((s) => s.value.includes('mention-alex')),
      );
      expect(mention, 'expected a click on @-mention chip').toBeDefined();

      // The recording should NOT be drowning in mouse-move / scroll noise.
      const noise = actions.filter(
        (a) => a.type === 'mouseMove' || a.type === 'scroll',
      );
      expect(noise.length, `unexpected noise events: ${noise.length}`).toBeLessThanOrEqual(2);
    } finally {
      await ext.close();
    }
  });

  test('F2 (Linear-style): Cmd+K chord → palette filter → Enter selects highlighted command', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/F2-linear.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Make sure the page has focus, then fire Cmd+K.
      await target.locator('body').click({ position: { x: 2, y: 2 } });
      await target.keyboard.down('Meta');
      await target.keyboard.press('k');
      await target.keyboard.up('Meta');
      await target.waitForSelector('#paletteBack.open');

      // Type into the palette filter. The fixture filters items as we type;
      // "board" leaves "Switch to Board view" as the first match.
      await target.locator('[data-testid="palette-input"]').fill('board');
      // Press Enter to select the highlighted item. The fixture's palette
      // items use `mousedown` handlers that close the popover before the
      // click event fires, so clicking would race with the close — keyboard
      // selection is the more realistic interaction here.
      await target.keyboard.press('Enter');
      // Wait for the view to switch.
      await target.waitForSelector('#boardView, .board, [data-view="board"]', { timeout: 3000 }).catch(() => null);

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      // Chord with metaKey:true captured (D3).
      const chord = actions.find(
        (a) =>
          (a.type === 'keyDown' || a.type === 'keyUp') &&
          (a.key === 'k' || a.key === 'K'),
      );
      expect(
        chord,
        `expected Cmd+K chord; key events: ${JSON.stringify(actions.filter((a) => a.type === 'keyDown' || a.type === 'keyUp').map((a) => ({ k: a.key, mods: a.modifiers })))}`,
      ).toBeDefined();
      expect(chord!.modifiers?.meta, 'meta modifier on chord').toBe(true);

      // Bare Meta key should NOT be recorded on its own.
      const bareMeta = actions.find(
        (a) =>
          (a.type === 'keyDown' || a.type === 'keyUp') && a.key === 'Meta',
      );
      expect(bareMeta, 'bare Meta key should not be a step').toBeUndefined();

      // Filter typed value coalesced.
      const filter = actions.find(
        (a) =>
          a.type === 'change' &&
          (a.selectors ?? []).some((s) => s.value.includes('palette-input')),
      );
      expect(filter, 'expected change step on palette-input').toBeDefined();
      expect(filter!.value).toBe('board');

      // Enter chord captured against the palette input.
      const enterKey = actions.findLast(
        (a) =>
          (a.type === 'keyDown' || a.type === 'keyUp') && a.key === 'Enter',
      );
      expect(
        enterKey,
        `expected Enter keypress to be captured; key events: ${JSON.stringify(actions.filter((a) => a.type === 'keyDown' || a.type === 'keyUp').map((a) => ({ k: a.key, target: selectorsOf(a) })))}`,
      ).toBeDefined();
    } finally {
      await ext.close();
    }
  });

  test('F3 (Jira-style): login password redacted, 2FA lazy modal sequence captured', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/F3-jira.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Email — should round-trip in cleartext.
      await target.locator('[data-testid="login-email"]').fill('user@example.com');
      // Password — must be masked (C2).
      await target.locator('[data-testid="login-password"]').fill('hunter2-secret');
      await target.locator('[data-testid="login-submit"]').click();

      // 2FA modal mounts after a 200ms timeout; wait for it to be active.
      await target.waitForSelector('#stage-2fa.active');
      // Then wait the extra 50ms for the autofocus to settle.
      await target.waitForTimeout(80);
      // Drive each digit. Use pressSequentially so a keystroke + input event
      // pair fires for each slot (closer to a human than .fill which sets
      // value in one shot).
      for (let i = 1; i <= 6; i++) {
        const inp = target.locator(`[data-testid="2fa-${i}"]`);
        await inp.click();
        await inp.pressSequentially(String(i), { delay: 30 });
      }
      // Blur the last input so its change buffer flushes before stop.
      await target.locator('body').click({ position: { x: 4, y: 4 } });
      await target.locator('[data-testid="2fa-verify"]').click();

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      // Email cleartext.
      const email = actions.find(
        (a) =>
          a.type === 'change' &&
          (a.selectors ?? []).some((s) => s.value.includes('login-email')),
      );
      expect(email, 'expected change on login-email').toBeDefined();
      expect(email!.value).toBe('user@example.com');
      expect((email as { masked?: boolean }).masked ?? false).toBe(false);

      // Password masked.
      const pw = actions.find(
        (a) =>
          a.type === 'change' &&
          (a.selectors ?? []).some((s) => s.value.includes('login-password')),
      );
      expect(pw, 'expected change on login-password').toBeDefined();
      expect(
        (pw as { masked?: boolean }).masked,
        `password change must be masked; got: ${JSON.stringify(pw)}`,
      ).toBe(true);
      expect(pw!.value ?? '').not.toContain('hunter2-secret');

      // All six 2FA inputs got recorded — proves the lazy-mounted modal
      // events were captured after the trigger click.
      //
      // The CSS selector serializer escapes leading digits, so a data-testid
      // of "2fa-1" comes out as `[data-testid="\32 fa-1"]`. We match either
      // the raw or escaped form.
      const allChanges = actions.filter((a) => a.type === 'change');
      const twofa = allChanges.filter((a) =>
        (a.selectors ?? []).some((s) => /(2|\\32 )fa-[1-6]/.test(s.value)),
      );
      expect(
        twofa.length,
        `expected 6 2FA fills; got ${twofa.length}. All change selectors: ${JSON.stringify(allChanges.map((c) => ({ sel: selectorsOf(c), val: c.value })))}`,
      ).toBe(6);
      // The captured values round-trip the digits we typed.
      expect(twofa.map((c) => c.value).join('')).toBe('123456');

      // Verify button click captured. The CSS-escaped form is `\32 fa-verify`
      // because data-testid="2fa-verify" starts with a digit.
      const verify = actions.find(
        (a) =>
          a.type === 'click' &&
          (a.selectors ?? []).some((s) => /(2|\\32 )fa-verify/.test(s.value)),
      );
      expect(
        verify,
        `expected click on 2fa-verify; clicks: ${JSON.stringify(actions.filter((a) => a.type === 'click').map((a) => selectorsOf(a)))}`,
      ).toBeDefined();
    } finally {
      await ext.close();
    }
  });

  test('F4 (Salesforce-style): login password redacted, sensitive phone field redacted on inline edit', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      const target = await ext.context.newPage();
      await target.goto('/F4-salesforce.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      // Log in.
      await target.locator('[data-testid="login-username"]').fill('demo@example.com');
      await target.locator('[data-testid="login-password"]').fill('secret-pw-123');
      await target.locator('[data-testid="login-submit"]').click();

      // After login the app stage mounts and renderAccounts() fills the
      // <tbody>. Each row is a <tr data-testid="account-${id}">. Wait for
      // any row and click the first one.
      await target.waitForSelector('[data-testid^="account-"]');
      await target.locator('[data-testid^="account-"]').first().click();

      // Inline-edit the phone — click the pencil, wait for the lazy-mounted
      // input (150ms), fill it with a fresh number, press Enter.
      await target.waitForSelector('.pencil[data-edit="phone"]');
      await target.locator('.pencil[data-edit="phone"]').click();
      await target.waitForSelector('[data-testid="edit-phone"]');
      const phone = target.locator('[data-testid="edit-phone"]');
      await phone.fill('+1 415 555 9999');
      await phone.press('Enter');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta).not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      // Password masked.
      const pw = actions.find(
        (a) =>
          a.type === 'change' &&
          (a.selectors ?? []).some((s) => s.value.includes('login-password')),
      );
      expect(pw).toBeDefined();
      expect(
        (pw as { masked?: boolean }).masked,
        'login-password must be masked',
      ).toBe(true);
      expect(pw!.value ?? '').not.toContain('secret-pw-123');

      // Phone — type="tel" must be masked too.
      const phoneChange = actions.find(
        (a) =>
          a.type === 'change' &&
          (a.selectors ?? []).some((s) => s.value.includes('edit-phone')),
      );
      expect(
        phoneChange,
        `expected a change on edit-phone; all changes: ${JSON.stringify(actions.filter((a) => a.type === 'change').map((a) => ({ sel: selectorsOf(a), masked: (a as { masked?: boolean }).masked })))}`,
      ).toBeDefined();
      expect(
        (phoneChange as { masked?: boolean }).masked,
        'phone field (type=tel) must be masked',
      ).toBe(true);
      expect(phoneChange!.value ?? '').not.toContain('9999');

      // Drilling into an account: Playwright's .click() on a <tr> lands at
      // its centre, which falls inside one of the <td>s. The recorder
      // records the click on the cell — that's the actual event target.
      // We just verify *some* click happened inside #accountsBody.
      const rowClick = actions.find(
        (a) =>
          a.type === 'click' &&
          (a.selectors ?? []).some((s) => s.value.includes('accountsBody')),
      );
      expect(
        rowClick,
        `expected click inside #accountsBody; clicks: ${JSON.stringify(actions.filter((a) => a.type === 'click').map((a) => selectorsOf(a)))}`,
      ).toBeDefined();
    } finally {
      await ext.close();
    }
  });
});
