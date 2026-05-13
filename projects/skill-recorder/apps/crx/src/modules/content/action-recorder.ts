import type { ActionStep } from '@skill-recorder/types';
import { fingerprint, generateSelectors } from '@/common/selector';
import type { ContentToBackground } from '@/common/messages';

type Send = (msg: ContentToBackground) => void;

let attached = false;
let send: Send = () => {};
let scrollTimer: ReturnType<typeof setTimeout> | null = null;

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

  return () => {
    if (!attached) return;
    attached = false;
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('change', onChange, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
  };
}

function onClick(ev: MouseEvent): void {
  const raw = elementAt(ev);
  if (!raw) return;
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
  });
}

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
  if (target instanceof HTMLInputElement) {
    const isPassword = target.type === 'password';
    const value = isPassword ? '***' : target.value;
    emit({
      type: 'change',
      timestamp: Date.now(),
      url: location.href,
      selectors: generateSelectors(target),
      fingerprint: fingerprint(target),
      value,
      inputType: target.type,
      masked: isPassword,
    });
  } else if (target instanceof HTMLTextAreaElement) {
    emit({
      type: 'change',
      timestamp: Date.now(),
      url: location.href,
      selectors: generateSelectors(target),
      fingerprint: fingerprint(target),
      value: target.value,
      inputType: 'textarea',
    });
  } else if (target instanceof HTMLSelectElement) {
    emit({
      type: 'change',
      timestamp: Date.now(),
      url: location.href,
      selectors: generateSelectors(target),
      fingerprint: fingerprint(target),
      value: target.value,
      inputType: 'select',
    });
  }
}

function onKey(ev: KeyboardEvent): void {
  // Only record meaningful keys; skip text input which is captured via 'change'.
  if (!isInterestingKey(ev.key)) return;
  const target = ev.target as Element | null;
  emit({
    type: ev.type === 'keydown' ? 'keyDown' : 'keyUp',
    timestamp: Date.now(),
    url: location.href,
    selectors: target ? generateSelectors(target) : undefined,
    fingerprint: target ? fingerprint(target) : undefined,
    key: ev.key,
    code: ev.code,
  });
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
