// Phase-0 smoke test. Validates the entire harness end-to-end:
//   1. Extension boots, sidepanel loads.
//   2. Recording start → drive A1 → stop captures the expected ActionStep[].
//   3. Distillation produces a Skill with the matching shape.
//
// If this passes, the rest of the e2e specs in later phases can rely on
// the harness without re-validating its plumbing.

import { test } from '@playwright/test';
import { launchExtension } from '../harness/extension';
import {
  startRecording,
  stopRecording,
  latestRecording,
  loadActions,
} from '../harness/recorder-driver';
import { distill } from '../harness/skill-driver';
import { expectSteps, expect } from '../harness/assertions';

test.describe('@phase-0 A1 smoke', () => {
  test('records form fill + submit, distills to a Skill', async () => {
    const ext = await launchExtension();
    try {
      const sidepanel = await ext.openSidepanel();
      // Open + focus the target page BEFORE starting recording. The SW's
      // startRecording() reads chrome.tabs.query({active:true, lastFocusedWindow:true})
      // and refuses chrome-extension:// URLs, so the target must be the
      // active tab at the moment we send START_RECORDING.
      const target = await ext.context.newPage();
      await target.goto('/A1-static-form.html');
      await target.bringToFront();

      const before = Date.now();
      await startRecording(sidepanel);

      await target.locator('[data-testid="field-name"]').fill('Ada');
      await target.locator('[data-testid="field-email"]').fill('ada@example.com');
      await target.locator('[data-testid="field-message"]').fill('Hi there');
      await target.locator('[data-testid="btn-submit"]').click();
      await target.waitForSelector('#result:not([hidden])');

      await stopRecording(sidepanel);

      const meta = await latestRecording(sidepanel, before);
      expect(meta, 'a recording should exist after stop').not.toBeNull();
      const actions = await loadActions(sidepanel, meta!.id);

      // Expect: navigate to A1, fill name/email/message, click submit.
      // Allow extra incidental steps (recorder may emit clicks-into-focus etc).
      expectSteps(actions, [
        { type: 'navigate', urlContains: 'A1-static-form.html' },
        { type: 'change', value: 'Ada' },
        { type: 'change', value: 'ada@example.com' },
        { type: 'change', value: 'Hi there' },
        { type: 'click', label: 'Send' },
      ]);

      const result = distill(meta!, actions, { title: 'A1 Smoke' });
      // The submit click is intentionally filtered by shouldDefaultSkip
      // (`type="submit"` button after a fill within 3s — assumed to be
      // a redundant click since fill+Enter would auto-submit). So the
      // distilled skill has navigate + 3 fills = 4 steps.
      expect(result.skill.steps.length, 'kept at least navigate + 3 fills').toBeGreaterThanOrEqual(4);
      expect(result.skill.title).toBe('A1 Smoke');
      expect(result.skill.startUrl).toContain('A1-static-form.html');

      // Every change step should round-trip a non-empty value or template.
      const fills = result.skill.steps.filter((s) => s.action === 'fill');
      expect(fills.length).toBeGreaterThanOrEqual(3);
      for (const f of fills) {
        expect(f.valueTemplate, `fill step "${f.intent}" must have a value or template`).toBeTruthy();
      }
    } finally {
      await ext.close();
    }
  });
});
