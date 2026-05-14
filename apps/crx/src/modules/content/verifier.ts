import { resolveElement } from '@/common/selector';
import type { ActionStep, Expectation } from '@skill-recorder/types';

/**
 * Verify the side-effect that the step was expected to produce.
 *
 * urlChange is verified by background (via webNavigation events) — content
 * treats it as immediately OK and just settles briefly.
 */
export async function verifyExpectation(
  exp: Expectation,
  step: ActionStep,
  timeoutMs: number,
): Promise<{ ok: boolean; reason?: string }> {
  switch (exp.kind) {
    case 'urlChange':
      // Background's responsibility. We just give the page a moment to start unloading.
      await sleep(120);
      return { ok: true };

    case 'elementVisible': {
      if (!exp.selectors?.length) return { ok: true };
      const el = await resolveElement(exp.selectors, exp.fingerprint, { timeoutMs });
      return el
        ? { ok: true }
        : { ok: false, reason: `next-step element didn't appear: ${exp.description ?? exp.selectors[0]?.value ?? ''}` };
    }

    case 'valueMatch': {
      if (step.type !== 'change') return { ok: true };
      const el = await resolveElement(step.selectors ?? [], step.fingerprint, { timeoutMs: 1500 });
      if (!el) return { ok: false, reason: 'change target not found' };
      const got = (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
      const expected = step.masked ? '***' : step.value ?? '';
      if (step.masked) return { ok: true }; // we never replay masked values; trust execute phase
      if (got === expected) return { ok: true };
      return { ok: false, reason: `value mismatch: got "${trunc(got, 40)}" vs "${trunc(expected, 40)}"` };
    }

    case 'scrollMatch': {
      const tolPx = 50;
      const ty = step.scrollY ?? 0;
      const tx = step.scrollX ?? 0;
      const ay = window.scrollY;
      const ax = window.scrollX;
      if (Math.abs(ay - ty) <= tolPx && Math.abs(ax - tx) <= tolPx) return { ok: true };
      return { ok: false, reason: `scroll mismatch: got (${ax},${ay}) vs (${tx},${ty})` };
    }

    case 'noop':
      await sleep(200);
      return { ok: true };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}
