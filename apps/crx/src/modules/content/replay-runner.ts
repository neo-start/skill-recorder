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
      case 'drag':
        return await runDrag(step, attempt);
      case 'copy':
        return await runCopy(step);
      case 'paste':
        return await runPaste(step, attempt);
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
    // D6: if this click had combobox context, fall back to keyboard-driven select.
    if (step.comboboxContext) {
      const ok = await runComboboxFallback(step.comboboxContext);
      if (ok) return { ok: true };
    }
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

  // D2: file inputs. We can't programmatically synthesize a File without a
  // user gesture-bound picker, so surface a structured failure for the host
  // (sidepanel) to resolve.
  if (step.inputType === 'file') {
    const names = (step.fileMeta ?? []).map((f) => f.name).join(', ');
    return { ok: false, reason: `requiresFileInput: ${names || '<unknown file>'}` };
  }

  // Contenteditable (D4): use execCommand insertText (handles most rich editors).
  if (
    el instanceof HTMLElement &&
    el.isContentEditable &&
    step.inputType === 'contenteditable'
  ) {
    el.focus({ preventScroll: true });
    try {
      // Replace existing content first.
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand('delete', false);
      const ok = document.execCommand('insertText', false, step.value ?? '');
      if (!ok) {
        // Fallback for editors that block execCommand.
        el.innerText = step.value ?? '';
      }
    } catch {
      el.innerText = step.value ?? '';
    }
    el.dispatchEvent(new InputEvent('input', { data: step.value ?? '', bubbles: true }));
    el.blur();
    return { ok: true };
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
  const m = step.modifiers ?? {};
  const ev = new KeyboardEvent(step.type === 'keyDown' ? 'keydown' : 'keyup', {
    key: step.key,
    code: step.code,
    metaKey: !!m.meta,
    ctrlKey: !!m.ctrl,
    shiftKey: !!m.shift,
    altKey: !!m.alt,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(ev);
  return { ok: true };
}

async function runComboboxFallback(
  ctx: NonNullable<ActionStep['comboboxContext']>,
): Promise<boolean> {
  const combobox = await resolveElement(ctx.combobox.selectors, ctx.combobox.fingerprint, {
    timeoutMs: STEP_TIMEOUT_MS,
  });
  if (!(combobox instanceof HTMLElement)) return false;
  combobox.focus({ preventScroll: true });
  await raf();

  // Type the option text into the combobox so it filters.
  if (combobox instanceof HTMLInputElement || combobox instanceof HTMLTextAreaElement) {
    setNativeValue(combobox, ctx.optionText);
    combobox.dispatchEvent(new Event('input', { bubbles: true }));
    combobox.dispatchEvent(new Event('change', { bubbles: true }));
  }
  await raf();

  // Drive the listbox via ArrowDown + Enter. We give up after 20 steps to
  // avoid infinite loops on broken popups.
  for (let i = 0; i < 20; i++) {
    const listboxId = combobox.getAttribute('aria-controls') ?? '';
    const listbox = listboxId ? document.getElementById(listboxId.split(/\s+/)[0]!) : null;
    const activeId = combobox.getAttribute('aria-activedescendant');
    const active = activeId ? document.getElementById(activeId) : null;
    const activeText = ((active as HTMLElement | null)?.innerText ?? active?.textContent ?? '')
      .trim()
      .toLowerCase();
    if (active && activeText === ctx.optionText.trim().toLowerCase()) {
      combobox.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
      );
      return true;
    }
    combobox.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    );
    await raf();
    // If the listbox isn't even present, bail.
    if (!listbox) return false;
  }
  return false;
}

async function runDrag(
  step: ActionStep,
  attempt: number,
): Promise<{ ok: boolean; reason?: string }> {
  const fromSpec = step.dragFrom;
  const toSpec = step.dragTo;
  if (!fromSpec || !toSpec) return { ok: false, reason: 'drag step missing dragFrom/dragTo' };

  const fromEl = await resolveElement(fromSpec.selectors, fromSpec.fingerprint, {
    timeoutMs: STEP_TIMEOUT_MS,
  });
  if (!fromEl) return { ok: false, reason: 'drag source not found' };
  const toEl = await resolveElement(toSpec.selectors, toSpec.fingerprint, {
    timeoutMs: STEP_TIMEOUT_MS,
  });
  if (!toEl) return { ok: false, reason: 'drop target not found' };

  scrollIntoView(fromEl);
  await raf();

  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();
  const fromX = fromRect.left + (fromSpec.offsetX ?? fromRect.width / 2);
  const fromY = fromRect.top + (fromSpec.offsetY ?? fromRect.height / 2);
  const toX = toRect.left + (toSpec.offsetX ?? toRect.width / 2);
  const toY = toRect.top + (toSpec.offsetY ?? toRect.height / 2);

  if (attempt === 0) {
    // Tier 0: HTML5 native drag-and-drop event chain with a shared DataTransfer.
    const dt = new DataTransfer();
    fireDrag(fromEl, 'dragstart', fromX, fromY, dt);
    fireDrag(toEl, 'dragenter', toX, toY, dt);
    fireDrag(toEl, 'dragover', toX, toY, dt);
    fireDrag(toEl, 'drop', toX, toY, dt);
    fireDrag(fromEl, 'dragend', toX, toY, dt);
    return { ok: true };
  }

  // Tier 1+: pointer event fallback for sites driven by mousedown/mousemove/mouseup
  // (e.g. Sortable.js, react-dnd in HTML5 mode often respond to either).
  fireMouse(fromEl, 'pointerdown', fromX, fromY);
  fireMouse(fromEl, 'mousedown', fromX, fromY);
  // Move through midpoint to wake up onmousemove-driven libraries.
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  fireMouse(document.body, 'pointermove', midX, midY);
  fireMouse(document.body, 'mousemove', midX, midY);
  await raf();
  fireMouse(toEl, 'pointermove', toX, toY);
  fireMouse(toEl, 'mousemove', toX, toY);
  fireMouse(toEl, 'pointerup', toX, toY);
  fireMouse(toEl, 'mouseup', toX, toY);
  return { ok: true };
}

function fireDrag(
  el: Element,
  type: string,
  x: number,
  y: number,
  dataTransfer: DataTransfer,
): void {
  // DragEvent has no `dataTransfer` in its initializer (read-only). Construct
  // the event and patch it on. This is the standard testing-library trick.
  const ev = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: x,
    clientY: y,
  });
  try {
    Object.defineProperty(ev, 'dataTransfer', { value: dataTransfer });
  } catch {
    /* some browsers freeze the event; carry on */
  }
  el.dispatchEvent(ev);
}

async function runCopy(step: ActionStep): Promise<{ ok: boolean; reason?: string }> {
  const value = step.value ?? '';
  // Best-effort: write to the system clipboard. Some browsers block this
  // without a user gesture; the replay tab generally has one, so this works
  // in practice. If it fails, just dispatch a synthetic copy event so any
  // page-level handler sees it.
  let okClipboard = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      okClipboard = true;
    }
  } catch {
    /* fall through */
  }
  const target = step.selectors
    ? await resolveElement(step.selectors, step.fingerprint, { timeoutMs: STEP_TIMEOUT_MS })
    : document.activeElement;
  if (target instanceof Element) {
    const dt = new DataTransfer();
    try {
      dt.setData('text/plain', value);
    } catch {
      /* ignore */
    }
    const ev = new ClipboardEvent('copy', { bubbles: true, cancelable: true, clipboardData: dt });
    try {
      Object.defineProperty(ev, 'clipboardData', { value: dt });
    } catch {
      /* ignore */
    }
    target.dispatchEvent(ev);
  }
  return { ok: true, reason: okClipboard ? undefined : 'clipboard write blocked (event dispatched)' };
}

async function runPaste(
  step: ActionStep,
  attempt: number,
): Promise<{ ok: boolean; reason?: string }> {
  const value = step.value ?? '';
  const target = step.selectors
    ? await resolveElement(step.selectors, step.fingerprint, { timeoutMs: STEP_TIMEOUT_MS })
    : (document.activeElement as Element | null);
  if (!target) return { ok: false, reason: 'paste target not found' };
  if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  scrollIntoView(target);
  await raf();

  // Tier 0: dispatch a real ClipboardEvent('paste') with a populated DataTransfer.
  if (attempt === 0) {
    const dt = new DataTransfer();
    try {
      dt.setData('text/plain', value);
    } catch {
      /* ignore */
    }
    const ev = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt });
    try {
      Object.defineProperty(ev, 'clipboardData', { value: dt });
    } catch {
      /* ignore */
    }
    const accepted = target.dispatchEvent(ev);
    if (!ev.defaultPrevented) {
      // Page didn't consume the event — insert text ourselves into form inputs / contenteditable.
      insertTextInto(target, value);
    }
    return { ok: accepted };
  }

  // Tier 1+: skip the synthetic ClipboardEvent and write directly.
  insertTextInto(target, value);
  return { ok: true };
}

function insertTextInto(target: Element, value: string): void {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    const cur = target.value;
    const start = target.selectionStart ?? cur.length;
    const end = target.selectionEnd ?? cur.length;
    const next = cur.slice(0, start) + value + cur.slice(end);
    setNativeValue(target, next);
    target.dispatchEvent(new InputEvent('input', { data: value, bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (target instanceof HTMLElement && target.isContentEditable) {
    try {
      document.execCommand('insertText', false, value);
    } catch {
      target.textContent = (target.textContent || '') + value;
    }
    target.dispatchEvent(new InputEvent('input', { data: value, bubbles: true }));
    return;
  }
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
