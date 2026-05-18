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

    case 'networkIdle': {
      const idle = exp.networkIdleMs ?? 500;
      const ok = await waitForNetworkIdle(idle, timeoutMs);
      return ok
        ? { ok: true }
        : { ok: false, reason: `network never idle for ${idle}ms within ${timeoutMs}ms` };
    }

    case 'attributeChange': {
      const a = exp.attribute;
      if (!a) return { ok: true };
      const el = await resolveElement(a.selectors, a.fingerprint, { timeoutMs });
      if (!el) return { ok: false, reason: 'attributeChange: target not found' };
      const ok = await waitForAttribute(el, a.attr, a.expectedValue, timeoutMs);
      return ok
        ? { ok: true }
        : {
            ok: false,
            reason: `attribute ${a.attr} never became "${a.expectedValue ?? '<any change>'}" within ${timeoutMs}ms`,
          };
    }

    case 'domStable': {
      const idle = exp.domStableMs ?? 400;
      const ok = await waitForDomStable(idle, timeoutMs);
      return ok ? { ok: true } : { ok: false, reason: `DOM never stable for ${idle}ms` };
    }

    case 'noop':
      // The old behaviour was a fixed 200ms sleep. Now: settle on DOM-stable
      // up to a short budget. Cheaper when the page is already idle, and
      // catches lazy modals / inserted-on-click panels without flakiness.
      await waitForDomStable(300, Math.min(timeoutMs, 2000));
      return { ok: true };
  }
}

function waitForNetworkIdle(idleMs: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let lastResourceAt = Date.now();
    const startedAt = Date.now();
    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver(() => {
        lastResourceAt = Date.now();
      });
      observer.observe({ entryTypes: ['resource'] });
    } catch {
      // PerformanceObserver unavailable — fall back to a flat timeout.
      setTimeout(() => resolve(true), Math.min(idleMs, timeoutMs));
      return;
    }
    const tick = () => {
      const now = Date.now();
      if (now - lastResourceAt >= idleMs) {
        observer?.disconnect();
        resolve(true);
        return;
      }
      if (now - startedAt >= timeoutMs) {
        observer?.disconnect();
        resolve(false);
        return;
      }
      setTimeout(tick, Math.min(idleMs - (now - lastResourceAt), 100));
    };
    setTimeout(tick, Math.min(idleMs, 100));
  });
}

function waitForAttribute(
  el: Element,
  attr: string,
  expectedValue: string | undefined,
  timeoutMs: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    const test = () => {
      const v = el.getAttribute(attr);
      if (expectedValue === undefined) return v !== null;
      return v === expectedValue;
    };
    if (test()) {
      resolve(true);
      return;
    }
    const startedAt = Date.now();
    const mo = new MutationObserver(() => {
      if (test()) {
        mo.disconnect();
        clearTimeout(t);
        resolve(true);
      }
    });
    mo.observe(el, { attributes: true, attributeFilter: [attr] });
    const t = setTimeout(() => {
      mo.disconnect();
      resolve(false);
    }, timeoutMs);
  });
}

function waitForDomStable(idleMs: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let lastMutationAt = Date.now();
    const startedAt = Date.now();
    const mo = new MutationObserver(() => {
      lastMutationAt = Date.now();
    });
    mo.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
    const tick = () => {
      const now = Date.now();
      if (now - lastMutationAt >= idleMs) {
        mo.disconnect();
        resolve(true);
        return;
      }
      if (now - startedAt >= timeoutMs) {
        mo.disconnect();
        resolve(false);
        return;
      }
      setTimeout(tick, Math.min(idleMs - (now - lastMutationAt), 60));
    };
    setTimeout(tick, Math.min(idleMs, 60));
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}
