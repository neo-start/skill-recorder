import { resolveElement } from '@/common/selector';
import type { ActionStep } from '@skill-recorder/types';

const STEP_TIMEOUT_MS = 15000;

/**
 * Execute one step. `attempt` lets us escalate tactics on retries:
 *   - 0: standard synthetic event sequence
 *   - 1: re-resolve via fallback selectors + slightly different event timing
 *   - 2: native el.click() / per-character keystrokes for inputs
 */
export async function executeStep(
  step: ActionStep,
  attempt: number,
): Promise<{ ok: boolean; reason?: string }> {
  try {
    switch (step.type) {
      case 'navigate':
        // Background owns navigation now; if we ever get here treat as ok.
        if (step.navigateUrl) window.location.assign(step.navigateUrl);
        return { ok: true };
      case 'click':
        return await runClick(step, attempt);
      case 'change':
        return await runChange(step, attempt);
      case 'keyDown':
      case 'keyUp':
        return await runKey(step);
      case 'submit':
        return await runSubmit(step);
      case 'scroll':
        window.scrollTo({
          left: step.scrollX ?? 0,
          top: step.scrollY ?? 0,
          behavior: 'instant' as ScrollBehavior,
        });
        return { ok: true };
    }
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

async function runClick(
  step: ActionStep,
  attempt: number,
): Promise<{ ok: boolean; reason?: string }> {
  // Attempt 1: prefer fallback selectors (skip the highest-score one we already tried).
  const selectorPool =
    attempt === 1 && step.selectors && step.selectors.length > 1
      ? step.selectors.slice(1)
      : step.selectors ?? [];

  const el = await resolveElement(selectorPool, step.fingerprint, {
    timeoutMs: STEP_TIMEOUT_MS,
  });

  if (!el) {
    const tried = (step.selectors ?? []).map((s) => `${s.kind}:${s.value}`).join(' | ');
    console.warn('[replay-runner] click target not found', {
      attempt,
      url: location.href,
      tried,
      fingerprint: step.fingerprint,
    });
    return {
      ok: false,
      reason: `element not found (tried ${step.selectors?.length ?? 0} selectors, attempt ${attempt + 1})`,
    };
  }

  console.log('[replay-runner] click resolved', el.tagName, {
    attempt,
    text: (el.textContent || '').slice(0, 60).trim(),
  });

  scrollIntoView(el);
  await raf();

  if (attempt >= 2) {
    // Last-resort: use the browser's native click. Bypasses our synthetic
    // mouse-event chain entirely; some frameworks accept this when the synth chain fails.
    if (el instanceof HTMLElement) el.focus({ preventScroll: true });
    try {
      (el as HTMLElement).click();
    } catch (e) {
      return { ok: false, reason: `native click threw: ${(e as Error).message}` };
    }
    return { ok: true };
  }

  const rect = el.getBoundingClientRect();
  const x = rect.left + (step.offsetX ?? rect.width / 2);
  const y = rect.top + (step.offsetY ?? rect.height / 2);

  if (el instanceof HTMLElement) el.focus({ preventScroll: true });

  fireMouse(el, 'pointerover', x, y);
  fireMouse(el, 'mouseover', x, y);
  fireMouse(el, 'pointerdown', x, y);
  fireMouse(el, 'mousedown', x, y);
  fireMouse(el, 'pointerup', x, y);
  fireMouse(el, 'mouseup', x, y);
  fireMouse(el, 'click', x, y);

  return { ok: true };
}

async function runChange(
  step: ActionStep,
  attempt: number,
): Promise<{ ok: boolean; reason?: string }> {
  const el = await resolveElement(step.selectors ?? [], step.fingerprint, {
    timeoutMs: STEP_TIMEOUT_MS,
  });
  if (!el) return { ok: false, reason: 'element not found' };
  scrollIntoView(el);
  await raf();

  if (step.masked) {
    return { ok: false, reason: 'value is masked; replay would leak placeholder' };
  }

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.focus({ preventScroll: true });

    if (attempt >= 1) {
      // Tier 1+: simulate per-character to wake up controlled components
      // that don't react to programmatic value setters.
      setNativeValue(el, '');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      for (const ch of step.value ?? '') {
        const ev = new KeyboardEvent('keydown', { key: ch, bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
        setNativeValue(el, el.value + ch);
        el.dispatchEvent(new InputEvent('input', { data: ch, bubbles: true }));
        el.dispatchEvent(new KeyboardEvent('keyup', { key: ch, bubbles: true, cancelable: true }));
      }
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.blur();
      return { ok: true };
    }

    // Tier 0: native value setter + input + change
    setNativeValue(el, step.value ?? '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.blur();
    return { ok: true };
  }
  if (el instanceof HTMLSelectElement) {
    el.value = step.value ?? '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true };
  }
  return { ok: false, reason: 'unsupported element for change' };
}

async function runKey(step: ActionStep): Promise<{ ok: boolean; reason?: string }> {
  let el: Element | null = document.activeElement;
  if (step.selectors && step.selectors.length) {
    el =
      (await resolveElement(step.selectors, step.fingerprint, { timeoutMs: STEP_TIMEOUT_MS })) ||
      el;
  }
  const target = el && el !== document.body ? el : document.activeElement || document.body;
  const ev = new KeyboardEvent(step.type === 'keyDown' ? 'keydown' : 'keyup', {
    key: step.key,
    code: step.code,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(ev);
  return { ok: true };
}

async function runSubmit(step: ActionStep): Promise<{ ok: boolean; reason?: string }> {
  const el = await resolveElement(step.selectors ?? [], step.fingerprint, {
    timeoutMs: STEP_TIMEOUT_MS,
  });
  if (!(el instanceof HTMLFormElement)) {
    return { ok: false, reason: 'submit target not a form' };
  }
  if (typeof el.requestSubmit === 'function') el.requestSubmit();
  else el.submit();
  return { ok: true };
}

function fireMouse(el: Element, type: string, x: number, y: number): void {
  const ev = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: window,
    clientX: x,
    clientY: y,
    button: 0,
  });
  el.dispatchEvent(ev);
}

function scrollIntoView(el: Element): void {
  try {
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' as ScrollBehavior });
  } catch {
    /* ignore */
  }
}

function raf(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => r()));
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  const setter = desc?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
}
