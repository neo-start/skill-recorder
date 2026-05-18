// Phase 5: Category E — parameterization & reuse.
//
// The dialog UI is hard to drive in this harness (it imports react/styled —
// the build doesn't expose them outside the bundle). Instead we test the
// pure helpers extracted into `apps/crx/src/common/skill-build.ts`, which is
// the same code the UI calls. That gives confidence the param scoring +
// URL-segment templating round-trips through buildSkill correctly without
// having to script the dialog.

import { test } from '@playwright/test';
import { expect } from '../harness/assertions';
import {
  buildDrafts,
  buildSkill,
  paramConfidence,
  parameterizeUrl,
  extractTemplateTokens,
} from '../../src/common/skill-build';
import type { ActionStep, RecordingMeta } from '@skill-recorder/types';

function fillStep(over: Partial<ActionStep>): ActionStep {
  return {
    recordingId: 'r1',
    seq: 0,
    type: 'change',
    timestamp: 0,
    url: 'https://example.com/',
    value: '',
    inputType: 'text',
    fingerprint: { tag: 'input', role: null, text: '', attrs: { type: 'text' } },
    selectors: [{ kind: 'css', value: 'input', score: 45 }],
    ...over,
  };
}

function navStep(url: string): ActionStep {
  return {
    recordingId: 'r1',
    seq: 0,
    type: 'navigate',
    timestamp: 0,
    url,
    navigateUrl: url,
  };
}

function fakeRecording(): RecordingMeta {
  return {
    id: 'r1',
    title: 't',
    url: 'https://example.com/',
    startTime: 0,
    endTime: null,
    eventCount: 0,
    actionCount: 0,
    byteSize: 0,
    status: 'completed',
    viewport: { width: 1280, height: 800 },
  };
}

test.describe('@phase-5 Category E — parameterization', () => {
  test('E2: confidence scoring picks variable values, leaves hardcoded ones alone', async () => {
    // High-confidence fills (auto-param).
    const email = fillStep({
      value: 'alice@example.com',
      inputType: 'email',
      fingerprint: {
        tag: 'input',
        role: null,
        text: '',
        attrs: { type: 'email', 'aria-label': 'Email' },
      },
    });
    expect(paramConfidence(email)).toBeGreaterThanOrEqual(0.7);

    const uuid = fillStep({
      value: '550e8400-e29b-41d4-a716-446655440000',
      inputType: 'text',
      fingerprint: {
        tag: 'input',
        role: null,
        text: '',
        attrs: { type: 'text', 'aria-label': 'Order ID' },
      },
    });
    expect(paramConfidence(uuid)).toBeGreaterThanOrEqual(0.7);

    // Low-confidence: short value that just echoes the field label.
    const hardcoded = fillStep({
      value: 'Submit',
      inputType: 'text',
      fingerprint: {
        tag: 'input',
        role: null,
        text: '',
        attrs: { type: 'text', 'aria-label': 'Submit' },
      },
    });
    expect(paramConfidence(hardcoded)).toBeLessThan(0.7);

    // Drafts: auto-param should match the confidence threshold.
    const drafts = buildDrafts([email, uuid, hardcoded]);
    expect(drafts[0].isParam).toBe(true);
    expect(drafts[1].isParam).toBe(true);
    expect(drafts[2].isParam).toBe(false);
  });

  test('E2: URL-segment params lift UUIDs / numeric IDs into navigate-step templates', async () => {
    // UUIDs become `{{*_id}}` segments; numeric IDs do too.
    const r = parameterizeUrl(
      'https://x.com/orders/550e8400-e29b-41d4-a716-446655440000/items/4729',
      new Set(),
    );
    expect(r.templateUrl).toMatch(/orders\/\{\{order_id\}\}\/items\/\{\{item_id\}\}/);
    expect(r.params.map((p) => p.name)).toEqual(['order_id', 'item_id']);

    // End-to-end: buildSkill rewrites navigate URLs and exposes URL params.
    const nav = navStep('https://x.com/orders/12345');
    const drafts = buildDrafts([nav]);
    const skill = buildSkill({
      title: 'Open order',
      description: '',
      drafts,
      recording: fakeRecording(),
      authHint: { required: false },
    });
    expect(skill.steps[0].url).toMatch(/orders\/\{\{order_id\}\}/);
    const orderParam = skill.parameters.find((p) => p.name === 'order_id');
    expect(orderParam, JSON.stringify(skill.parameters)).toBeDefined();
    expect(orderParam!.example).toBe('12345');
  });

  test('E1: literal values containing {{name}} or ${name} tokens become template params too', async () => {
    expect(extractTemplateTokens('Hello {{name}}, code ${code}')).toEqual(['name', 'code']);

    const fill = fillStep({
      value: 'Hello {{greeting}}, code ${order_id}',
      inputType: 'text',
      fingerprint: {
        tag: 'input',
        role: null,
        text: '',
        attrs: { type: 'text', 'aria-label': 'Note' },
      },
    });
    const drafts = buildDrafts([fill]);
    // The auto-param confidence will likely tag this as a param (long mixed
    // case). We force-disable that so we can check the embedded tokens path.
    drafts[0].isParam = false;
    const skill = buildSkill({
      title: 'Send greeting',
      description: '',
      drafts,
      recording: fakeRecording(),
      authHint: { required: false },
    });
    const names = skill.parameters.map((p) => p.name).sort();
    expect(names).toEqual(['greeting', 'order_id']);
    // The template surfaces verbatim in valueTemplate; renderer normalises to {{}}.
    expect(skill.steps[0].valueTemplate).toBe('Hello {{greeting}}, code ${order_id}');
  });
});
