// Structural assertions over ActionStep[]. Ignores volatile fields
// (selectors values, timestamps, frame ids) and focuses on what a
// test author intended ("a click on Submit, then a fill with 'foo'").

import { expect } from '@playwright/test';
import type { ActionStep, ActionStepType } from '@skill-recorder/types';

export interface ExpectedStep {
  type: ActionStepType;
  /** Substring match on fingerprint.text or fingerprint.attrs['aria-label']. */
  label?: string;
  /** Exact match on the value (for change steps). */
  value?: string;
  /** Exact match on the key (for keyDown/keyUp). */
  key?: string;
  /** For navigate steps. */
  urlContains?: string;
  /** For change steps with masked=true. */
  masked?: boolean;
}

/**
 * Assert that `actual` contains each `expected` step in order. Extra steps
 * in `actual` are allowed (recorder may emit incidental scrolls/keyDowns).
 */
export function expectSteps(actual: ActionStep[], expected: ExpectedStep[]): void {
  let cursor = 0;
  const trace: string[] = [];
  for (const want of expected) {
    let found = -1;
    for (let i = cursor; i < actual.length; i++) {
      if (matches(actual[i], want)) {
        found = i;
        break;
      }
    }
    if (found < 0) {
      const dump = actual
        .map((a, i) => `  [${i}] ${describe(a)}`)
        .join('\n');
      throw new Error(
        `Step not found from index ${cursor}: ${formatWant(want)}\n` +
          `Trace so far:\n${trace.join('\n') || '(none)'}\n` +
          `All recorded steps:\n${dump}`,
      );
    }
    trace.push(`  matched [${found}] ${describe(actual[found])} → ${formatWant(want)}`);
    cursor = found + 1;
  }
}

function matches(a: ActionStep, w: ExpectedStep): boolean {
  if (a.type !== w.type) return false;
  if (w.value !== undefined && a.value !== w.value) return false;
  if (w.key !== undefined && a.key !== w.key) return false;
  if (w.masked !== undefined && !!a.masked !== w.masked) return false;
  if (w.urlContains !== undefined) {
    const url = a.navigateUrl ?? a.url ?? '';
    if (!url.includes(w.urlContains)) return false;
  }
  if (w.label !== undefined) {
    const text = a.fingerprint?.text ?? '';
    const aria = a.fingerprint?.attrs?.['aria-label'] ?? '';
    if (!text.includes(w.label) && !aria.includes(w.label)) return false;
  }
  return true;
}

function describe(a: ActionStep): string {
  const text = a.fingerprint?.text ? `"${a.fingerprint.text}"` : '';
  const meta: string[] = [];
  if (a.value !== undefined) meta.push(`value=${JSON.stringify(a.value)}`);
  if (a.key) meta.push(`key=${a.key}`);
  if (a.navigateUrl) meta.push(`url=${a.navigateUrl}`);
  return `${a.type} ${text} ${meta.join(' ')}`.trim();
}

function formatWant(w: ExpectedStep): string {
  const parts: string[] = [w.type];
  if (w.label) parts.push(`label~="${w.label}"`);
  if (w.value !== undefined) parts.push(`value=${JSON.stringify(w.value)}`);
  if (w.key) parts.push(`key=${w.key}`);
  if (w.urlContains) parts.push(`url~="${w.urlContains}"`);
  if (w.masked !== undefined) parts.push(`masked=${w.masked}`);
  return parts.join(' ');
}

/** Re-export Playwright expect for spec authors. */
export { expect };
