import type { ActionStep } from '@skill-recorder/types';
import { fingerprint, generateSelectors } from '@/common/selector';
import type { ContentToBackground } from '@/common/messages';

type Send = (msg: ContentToBackground) => void;

let attached = false;
let send: Send = () => {};
let scrollTimer: ReturnType<typeof setTimeout> | null = null;

interface CeBuffer {
  el: HTMLElement;
  timer: ReturnType<typeof setTimeout>;
  composing: boolean;
}
// Per-element contenteditable input buffer. We coalesce keystrokes within
// 300ms (or until compositionend) into a single 'change' step.
const ceBuffers = new WeakMap<HTMLElement, CeBuffer>();
// Keep one secondary handle so we can flush all on detach.
const ceTracked = new Set<HTMLElement>();
const CE_DEBOUNCE_MS = 300;

interface DragInProgress {
  fromEl: Element;
  fromX: number;
  fromY: number;
  lastOverEl: Element | null;
  lastOverX: number;
  lastOverY: number;
  types: Set<string>;
}
let dragState: DragInProgress | null = null;
// True from the dragstart -> next click event. Native `drag` HTML5 ends with a
// `mouseup`/`click` we want to suppress (the synthetic click on the drop
// target is a duplicate of the drag's effect).
let suppressNextClickAfterDrop = false;

export function attachActionRecorder(sendFn: Send): () => void {
  if (attached) return () => {};
  attached = true;
  send = sendFn;

  document.addEventListener('click', onClick, true);
  document.addEventListener('change', onChange, true);
  // Only capture keydown — keyup is a duplicate signal for replay purposes.
  document.addEventListener('keydown', onKey, true);
  // Intentionally NOT listening to 'submit' — every real submit is preceded by a click
  // or Enter keydown that we already captured; the submit event creates a duplicate
  // step that causes replay loops on sites like Amazon.
  window.addEventListener('scroll', onScroll, { capture: true, passive: true });
  // Native HTML5 drag/drop.
  document.addEventListener('dragstart', onDragStart, true);
  document.addEventListener('dragover', onDragOver, true);
  document.addEventListener('drop', onDrop, true);
  document.addEventListener('dragend', onDragEnd, true);
  // Clipboard (D5). Listen at capture phase so we still see events even when
  // the page hijacks them.
  document.addEventListener('copy', onCopy, true);
  document.addEventListener('cut', onCopy, true);
  document.addEventListener('paste', onPaste, true);
  // Contenteditable (D4). `change` doesn't fire on contenteditable, so we
  // hook `input` + `compositionend` and debounce into a single change step.
  document.addEventListener('input', onInput, true);
  document.addEventListener('compositionstart', onCompositionStart, true);
  document.addEventListener('compositionend', onCompositionEnd, true);
  document.addEventListener('blur', onBlurFlushCe, true);

  return () => {
    if (!attached) return;
    attached = false;
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('change', onChange, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
    document.removeEventListener('dragstart', onDragStart, true);
    document.removeEventListener('dragover', onDragOver, true);
    document.removeEventListener('drop', onDrop, true);
    document.removeEventListener('dragend', onDragEnd, true);
    document.removeEventListener('copy', onCopy, true);
    document.removeEventListener('cut', onCopy, true);
    document.removeEventListener('paste', onPaste, true);
    document.removeEventListener('input', onInput, true);
    document.removeEventListener('compositionstart', onCompositionStart, true);
    document.removeEventListener('compositionend', onCompositionEnd, true);
    document.removeEventListener('blur', onBlurFlushCe, true);
    // Flush any pending ce buffers.
    for (const el of ceTracked) flushCe(el);
    ceTracked.clear();
  };
}

function onClick(ev: MouseEvent): void {
  // After a drop the browser may synthesize a trailing click on the drop target.
  // Don't double-record it.
  if (suppressNextClickAfterDrop) {
    suppressNextClickAfterDrop = false;
    return;
  }
  const raw = elementAt(ev);
  if (!raw) return;
  // Any click is a commit point — flush pending input buffers (text inputs,
  // textareas, contenteditable) so the change step is emitted BEFORE the
  // click step. Otherwise comboboxes that swallow focus produce ordering bugs.
  for (const el of [...ceTracked]) {
    if (!el.contains(raw)) flushCe(el);
  }
  // Walk up to the nearest actionable ancestor (link/button/role=button etc).
  // Without this, clicks on inner <svg>/<span> generate useless selectors that
  // won't resolve at replay time.
  const target = nearestActionable(raw) ?? raw;
  const rect = target.getBoundingClientRect();
  emit({
    type: 'click',
    timestamp: Date.now(),
    url: location.href,
    selectors: generateSelectors(target),
    fingerprint: fingerprint(target),
    offsetX: Math.round(ev.clientX - rect.left),
    offsetY: Math.round(ev.clientY - rect.top),
    comboboxContext: detectComboboxContext(raw) ?? undefined,
    rowContext: detectRowContext(target) ?? undefined,
  });
}

/**
 * If the click/change landed inside a <tr> or [role="row"], return the row's
 * identity (selectors + fingerprint + visible text) plus a relative locator
 * for the clicked cell. Lets the renderer emit `xpath://tr[contains(., "…")]`
 * commands that survive per-render id churn (Magento/Knockout regenerate
 * `#id_…` on every page load — recorded ids don't resolve at replay).
 */
function detectRowContext(target: Element): ActionStep['rowContext'] | null {
  let cur: Element | null = target.parentElement;
  let row: Element | null = null;
  for (let i = 0; i < 8 && cur; i++) {
    if (cur.tagName === 'TR' || cur.getAttribute('role') === 'row') {
      row = cur;
      break;
    }
    cur = cur.parentElement;
  }
  if (!row) return null;
  if (target === row) return null;
  return {
    rowSelectors: generateSelectors(row),
    rowFingerprint: fingerprint(row),
    rowText: (row.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120),
    cellLocator: minimalCellLocator(target),
  };
}

/**
 * Build the smallest selector that distinguishes `target` within its row.
 * Strategy: checkbox/radio inputs → input[type="…"]; button/anchor with text
 * or action-keyword href → text/href-attribute matcher; otherwise just the
 * tag name (rows usually contain one of each actionable element type).
 */
function minimalCellLocator(target: Element): string {
  const tag = target.tagName.toLowerCase();
  if (tag === 'input') {
    const t = (target as HTMLInputElement).type;
    if (t === 'checkbox' || t === 'radio') return `input[type="${t}"]`;
  }
  if (tag === 'button') {
    const text = (target.textContent ?? '').trim();
    if (text && text.length <= 40) {
      const escaped = text.replace(/"/g, '\\"');
      return `button:has-text("${escaped}")`;
    }
  }
  if (tag === 'a') {
    const href = (target as HTMLAnchorElement).getAttribute('href') ?? '';
    const keyword = ['edit', 'delete', 'view', 'remove', 'duplicate'].find((k) => href.includes(k));
    if (keyword) return `a[href*="${keyword}"]`;
  }
  return tag;
}

/**
 * If the click landed on a role=option inside an aria-combobox-controlled
 * listbox, return enough info for replay to fall back to a keyboard-driven
 * selection. Returns null otherwise.
 */
function detectComboboxContext(
  el: Element,
): ActionStepComboboxContext | null {
  const option = el.closest('[role="option"]');
  if (!option) return null;
  const listbox = option.closest('[role="listbox"]');
  if (!listbox) return null;
  // Find the combobox that controls this listbox: prefer aria-controls on a
  // role=combobox somewhere; otherwise use document.activeElement if it has
  // aria-controls / aria-activedescendant.
  const id = listbox.id;
  let combobox: Element | null = null;
  if (id) {
    combobox = document.querySelector(`[role="combobox"][aria-controls~="${id}"]`);
  }
  if (!combobox) {
    const active = document.activeElement;
    if (active && (active.getAttribute('aria-controls') || active.getAttribute('aria-activedescendant'))) {
      combobox = active;
    }
  }
  if (!combobox) return null;
  const optionText = ((option as HTMLElement).innerText || option.textContent || '').trim();
  const optionValue = option.getAttribute('data-value') || option.getAttribute('value') || undefined;
  return {
    combobox: {
      selectors: generateSelectors(combobox),
      fingerprint: fingerprint(combobox),
    },
    optionText,
    optionValue,
  };
}

// Local alias for the type encoded on ActionStep['comboboxContext'].
type ActionStepComboboxContext = NonNullable<
  import('@skill-recorder/types').ActionStep['comboboxContext']
>;

/**
 * Walk up to 8 levels looking for the most semantic actionable ancestor.
 * Prefer <a>/<button>/role=link/role=button (have built-in accessible names)
 * over generic [jsaction] / [onclick] / [tabindex] wrappers.
 */
function nearestActionable(start: Element): Element | null {
  let cur: Element | null = start;
  let semantic: Element | null = null;
  let generic: Element | null = null;
  for (let i = 0; i < 8 && cur; i++) {
    if (isSemanticActionable(cur)) {
      if (!semantic) semantic = cur;
    } else if (isGenericActionable(cur)) {
      if (!generic) generic = cur;
    }
    cur = cur.parentElement;
  }
  return semantic ?? generic;
}

const ACTIONABLE_ROLES = new Set([
  'button',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'tab',
  'option',
  'checkbox',
  'radio',
  'switch',
  'treeitem',
]);

function isSemanticActionable(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === 'a' && (el as HTMLAnchorElement).hasAttribute('href')) return true;
  if (['button', 'input', 'select', 'textarea', 'summary', 'label'].includes(tag)) return true;
  const role = el.getAttribute('role');
  if (role && ACTIONABLE_ROLES.has(role)) return true;
  // div/span with aria-label is "semantic" for our purposes — name is captured.
  if (el.hasAttribute('aria-label')) return true;
  return false;
}

function isGenericActionable(el: Element): boolean {
  if (el.getAttribute('onclick') !== null) return true;
  if (el instanceof HTMLElement && el.tabIndex >= 0 && el.hasAttribute('tabindex')) return true;
  // jsaction is Google's click-handler attribute (Gmail, Search, etc.)
  if (el.hasAttribute('jsaction')) return true;
  return false;
}

function onChange(ev: Event): void {
  const target = ev.target as Element | null;
  if (!target) return;
  // D2: file inputs. Capture metadata only — never bytes.
  if (target instanceof HTMLInputElement && target.type === 'file') {
    const files = target.files ? Array.from(target.files) : [];
    emit({
      type: 'change',
      timestamp: Date.now(),
      url: location.href,
      selectors: generateSelectors(target),
      fingerprint: fingerprint(target),
      inputType: 'file',
      fileMeta: files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified,
      })),
      value: files.map((f) => f.name).join(', '),
      rowContext: detectRowContext(target) ?? undefined,
    });
    return;
  }
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    // Text inputs are now handled via the debounced 'input' pipeline; the
    // blur-triggered 'change' would otherwise produce a duplicate step. Just
    // flush whatever's pending and return.
    if (target instanceof HTMLElement && ceBuffers.has(target)) flushCe(target);
    // Non-text inputs (checkbox/radio/file) still need a snapshot via 'change'.
    if (target instanceof HTMLInputElement && (target.type === 'checkbox' || target.type === 'radio')) {
      emit({
        type: 'change',
        timestamp: Date.now(),
        url: location.href,
        selectors: generateSelectors(target),
        fingerprint: fingerprint(target),
        value: target.checked ? 'on' : 'off',
        inputType: target.type,
        rowContext: detectRowContext(target) ?? undefined,
      });
    }
    return;
  }
  if (target instanceof HTMLSelectElement) {
    emit({
      type: 'change',
      timestamp: Date.now(),
      url: location.href,
      selectors: generateSelectors(target),
      fingerprint: fingerprint(target),
      value: target.value,
      inputType: 'select',
      rowContext: detectRowContext(target) ?? undefined,
    });
  }
}

function onKey(ev: KeyboardEvent): void {
  const hasModifier = ev.metaKey || ev.ctrlKey || ev.altKey;
  // Drop ordinary text-input keys (captured via 'change'). Single chars with a
  // non-shift modifier (e.g. Cmd+K, Ctrl+Enter) are shortcuts and worth keeping.
  if (!isInterestingKey(ev.key) && !hasModifier) return;
  // Ignore pure modifier keydowns (Shift/Ctrl/Meta/Alt alone) — replaying them
  // is meaningless without the chord they precede.
  if (isModifierKey(ev.key)) return;
  const target = ev.target as Element | null;
  emit({
    type: ev.type === 'keydown' ? 'keyDown' : 'keyUp',
    timestamp: Date.now(),
    url: location.href,
    selectors: target ? generateSelectors(target) : undefined,
    fingerprint: target ? fingerprint(target) : undefined,
    key: ev.key,
    code: ev.code,
    modifiers: hasModifier || ev.shiftKey
      ? {
          meta: ev.metaKey || undefined,
          ctrl: ev.ctrlKey || undefined,
          shift: ev.shiftKey || undefined,
          alt: ev.altKey || undefined,
        }
      : undefined,
  });
}

function isModifierKey(k: string): boolean {
  return k === 'Meta' || k === 'Control' || k === 'Shift' || k === 'Alt';
}

/**
 * Treat an input as sensitive (mask its value during recording) when its
 * type / autocomplete / name hints at password, phone number, or credit-card
 * data. Used by the recorder so cross-origin/embedded payment flows don't
 * leak card numbers into recordings.
 */
function isSensitiveInput(el: HTMLInputElement): boolean {
  if (el.type === 'password' || el.type === 'tel') return true;
  const ac = (el.getAttribute('autocomplete') || '').toLowerCase();
  if (
    ac.includes('cc-') ||
    ac.includes('cvc') ||
    ac.includes('csc') ||
    ac.includes('security-code')
  ) {
    return true;
  }
  const name = (el.getAttribute('name') || '').toLowerCase();
  const id = (el.getAttribute('id') || '').toLowerCase();
  if (/(card|cvc|cvv|csc|securitycode)/.test(name + ' ' + id)) return true;
  return false;
}

function onDragStart(ev: DragEvent): void {
  const target = (ev.target instanceof Element ? ev.target : null) || elementFromDragEvent(ev);
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const types = new Set<string>();
  try {
    for (const t of ev.dataTransfer?.types ?? []) types.add(t);
  } catch {
    /* DataTransfer locked on some platforms */
  }
  dragState = {
    fromEl: target,
    fromX: Math.round(ev.clientX - rect.left),
    fromY: Math.round(ev.clientY - rect.top),
    lastOverEl: null,
    lastOverX: 0,
    lastOverY: 0,
    types,
  };
}

function onDragOver(ev: DragEvent): void {
  if (!dragState) return;
  const el = ev.target instanceof Element ? ev.target : null;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  dragState.lastOverEl = el;
  dragState.lastOverX = Math.round(ev.clientX - rect.left);
  dragState.lastOverY = Math.round(ev.clientY - rect.top);
}

function onDrop(ev: DragEvent): void {
  if (!dragState) return;
  const target = (ev.target instanceof Element ? ev.target : null) || dragState.lastOverEl;
  if (!target) {
    dragState = null;
    return;
  }
  const rect = target.getBoundingClientRect();
  // Capture additional dataTransfer types at drop time (some browsers reveal
  // them only here).
  try {
    for (const t of ev.dataTransfer?.types ?? []) dragState.types.add(t);
  } catch {
    /* ignore */
  }
  emit({
    type: 'drag',
    timestamp: Date.now(),
    url: location.href,
    selectors: generateSelectors(dragState.fromEl),
    fingerprint: fingerprint(dragState.fromEl),
    dragFrom: {
      selectors: generateSelectors(dragState.fromEl),
      fingerprint: fingerprint(dragState.fromEl),
      offsetX: dragState.fromX,
      offsetY: dragState.fromY,
    },
    dragTo: {
      selectors: generateSelectors(target),
      fingerprint: fingerprint(target),
      offsetX: Math.round(ev.clientX - rect.left),
      offsetY: Math.round(ev.clientY - rect.top),
    },
    dataTransferTypes: [...dragState.types],
  });
  suppressNextClickAfterDrop = true;
  dragState = null;
}

function onInput(ev: Event): void {
  const target = ev.target;
  if (!(target instanceof HTMLElement)) return;
  // Text inputs / textareas: coalesce typing into one change step. Text inputs
  // natively fire `change` only on blur, which misses cases like comboboxes
  // (option click steals focus without blurring) and any submit-on-Enter flow
  // where the page navigates before the change event lands.
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    if (target.type === 'checkbox' || target.type === 'radio' || target.type === 'file') return;
    scheduleCeFlush(target);
    return;
  }
  if (target.isContentEditable) {
    scheduleCeFlush(target);
  }
}

function onCompositionStart(ev: Event): void {
  const target = ev.target;
  if (!(target instanceof HTMLElement) || !target.isContentEditable) return;
  let buf = ceBuffers.get(target);
  if (!buf) {
    buf = { el: target, timer: setTimeout(() => flushCe(target), CE_DEBOUNCE_MS), composing: true };
    ceBuffers.set(target, buf);
    ceTracked.add(target);
  }
  buf.composing = true;
  clearTimeout(buf.timer);
}

function onCompositionEnd(ev: Event): void {
  const target = ev.target;
  if (!(target instanceof HTMLElement) || !target.isContentEditable) return;
  const buf = ceBuffers.get(target);
  if (buf) buf.composing = false;
  scheduleCeFlush(target);
}

function onBlurFlushCe(ev: Event): void {
  const target = ev.target;
  if (target instanceof HTMLElement && target.isContentEditable && ceBuffers.has(target)) {
    flushCe(target);
  }
}

function scheduleCeFlush(el: HTMLElement): void {
  const existing = ceBuffers.get(el);
  if (existing) {
    clearTimeout(existing.timer);
    existing.timer = setTimeout(() => {
      if (!existing.composing) flushCe(el);
    }, CE_DEBOUNCE_MS);
    return;
  }
  const buf: CeBuffer = {
    el,
    timer: setTimeout(() => {
      if (!buf.composing) flushCe(el);
    }, CE_DEBOUNCE_MS),
    composing: false,
  };
  ceBuffers.set(el, buf);
  ceTracked.add(el);
}

function flushCe(el: HTMLElement): void {
  const buf = ceBuffers.get(el);
  if (!buf) return;
  clearTimeout(buf.timer);
  ceBuffers.delete(el);
  ceTracked.delete(el);
  if (el instanceof HTMLInputElement) {
    const sensitive = isSensitiveInput(el);
    emit({
      type: 'change',
      timestamp: Date.now(),
      url: location.href,
      selectors: generateSelectors(el),
      fingerprint: fingerprint(el),
      value: sensitive ? '***' : el.value,
      inputType: el.type,
      masked: sensitive || undefined,
      rowContext: detectRowContext(el) ?? undefined,
    });
    return;
  }
  if (el instanceof HTMLTextAreaElement) {
    emit({
      type: 'change',
      timestamp: Date.now(),
      url: location.href,
      selectors: generateSelectors(el),
      fingerprint: fingerprint(el),
      value: el.value,
      inputType: 'textarea',
      rowContext: detectRowContext(el) ?? undefined,
    });
    return;
  }
  emit({
    type: 'change',
    timestamp: Date.now(),
    url: location.href,
    selectors: generateSelectors(el),
    fingerprint: fingerprint(el),
    value: el.innerText ?? '',
    inputType: 'contenteditable',
    rowContext: detectRowContext(el) ?? undefined,
  });
}

function onCopy(ev: ClipboardEvent): void {
  let value = '';
  try {
    value = ev.clipboardData?.getData('text/plain') || '';
  } catch {
    /* ignore */
  }
  if (!value) {
    value = window.getSelection()?.toString() || '';
  }
  if (!value) return;
  const target = ev.target instanceof Element ? ev.target : null;
  emit({
    type: 'copy',
    timestamp: Date.now(),
    url: location.href,
    selectors: target ? generateSelectors(target) : undefined,
    fingerprint: target ? fingerprint(target) : undefined,
    value,
  });
}

function onPaste(ev: ClipboardEvent): void {
  let value = '';
  try {
    value = ev.clipboardData?.getData('text/plain') || '';
  } catch {
    /* ignore */
  }
  if (!value) return;
  const target = ev.target instanceof Element ? ev.target : null;
  emit({
    type: 'paste',
    timestamp: Date.now(),
    url: location.href,
    selectors: target ? generateSelectors(target) : undefined,
    fingerprint: target ? fingerprint(target) : undefined,
    value,
  });
}

function onDragEnd(): void {
  // dragend fires regardless of drop success; clear state in case onDrop
  // didn't get called (e.g. drop outside viewport).
  dragState = null;
}

function elementFromDragEvent(ev: DragEvent): Element | null {
  if (ev.target instanceof Element) return ev.target;
  return document.elementFromPoint(ev.clientX, ev.clientY);
}

function onScroll(): void {
  if (scrollTimer) return;
  scrollTimer = setTimeout(() => {
    scrollTimer = null;
    emit({
      type: 'scroll',
      timestamp: Date.now(),
      url: location.href,
      scrollX: Math.round(window.scrollX),
      scrollY: Math.round(window.scrollY),
    });
  }, 200);
}

function emit(step: Omit<ActionStep, 'id' | 'recordingId' | 'seq'>): void {
  try {
    send({ type: 'ACTION', step });
  } catch {
    // port closed
  }
}

function elementAt(ev: MouseEvent): Element | null {
  // composedPath()[0] gives the deepest element even when the event crosses a shadow boundary
  // where ev.target would be the shadow host.
  const path = typeof ev.composedPath === 'function' ? ev.composedPath() : [];
  for (const node of path) {
    if (node instanceof Element) return node;
  }
  if (ev.target instanceof Element) return ev.target;
  return document.elementFromPoint(ev.clientX, ev.clientY);
}

function isInterestingKey(k: string): boolean {
  if (k.length === 1) return false; // single char belongs to input
  return [
    'Enter',
    'Escape',
    'Tab',
    'Backspace',
    'Delete',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'PageUp',
    'PageDown',
    'Home',
    'End',
  ].includes(k);
}
