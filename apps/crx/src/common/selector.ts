import type { ElementFingerprint, SelectorEntry, SelectorKind } from '@skill-recorder/types';

const TESTID_ATTRS = ['data-testid', 'data-test-id', 'data-test', 'data-cy', 'data-qa'];
const STABLE_ATTRS_FOR_FINGERPRINT = ['name', 'type', 'role', 'placeholder', 'href', 'aria-label'];
const MAX_TEXT_LEN = 80;

const SCORE: Record<SelectorKind, number> = {
  testid: 95,
  id: 80,
  aria: 70,
  text: 60,
  css: 45,
  xpath: 25,
};

// ─── Generation ───

export function generateSelectors(el: Element): SelectorEntry[] {
  const out: SelectorEntry[] = [];

  for (const attr of TESTID_ATTRS) {
    const v = el.getAttribute(attr);
    if (v) out.push({ kind: 'testid', value: `[${attr}="${cssEscape(v)}"]`, score: SCORE.testid });
  }

  const id = el.getAttribute('id');
  if (id && isStableId(id)) {
    out.push({ kind: 'id', value: `#${cssEscape(id)}`, score: SCORE.id });
  }

  const role = el.getAttribute('role') || implicitRole(el);
  const accessibleName = getAccessibleName(el);
  if (accessibleName && role) {
    out.push({ kind: 'aria', value: `${role}:${accessibleName}`, score: SCORE.aria });
  } else if (accessibleName) {
    // empty role; resolver will scan interactive elements
    out.push({ kind: 'aria', value: `:${accessibleName}`, score: SCORE.aria - 10 });
  }

  if (isClickableText(el)) {
    const text = normalizeText(el.textContent || '');
    if (text) out.push({ kind: 'text', value: text, score: SCORE.text });
  }

  const css = cssPath(el);
  if (css) out.push({ kind: 'css', value: css, score: SCORE.css });

  const xp = xpathFor(el);
  if (xp) out.push({ kind: 'xpath', value: xp, score: SCORE.xpath });

  // de-dup by value, keep highest score
  const map = new Map<string, SelectorEntry>();
  for (const s of out) {
    const key = `${s.kind}:${s.value}`;
    const cur = map.get(key);
    if (!cur || cur.score < s.score) map.set(key, s);
  }
  return [...map.values()].sort((a, b) => b.score - a.score);
}

export function fingerprint(el: Element): ElementFingerprint {
  const attrs: Record<string, string> = {};
  for (const attr of STABLE_ATTRS_FOR_FINGERPRINT) {
    const v = el.getAttribute(attr);
    if (v) attrs[attr] = v;
  }
  return {
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role') || implicitRole(el),
    text: fingerprintText(el),
    attrs,
  };
}

/**
 * Extract a "fingerprint text" for an element. Prefers visible text,
 * falls back to <img alt> or descendant aria-label for content-less wrappers
 * (e.g., `<a><img alt="Product name"></a>` on Amazon search results).
 */
function fingerprintText(el: Element): string {
  const direct = dedupeRepeatedText(normalizeText(el.textContent || ''));
  if (direct) return direct.slice(0, MAX_TEXT_LEN);
  const img = el.querySelector('img');
  if (img) {
    const alt = img.getAttribute('alt');
    if (alt) return normalizeText(alt).slice(0, MAX_TEXT_LEN);
    const ariaLabel = img.getAttribute('aria-label');
    if (ariaLabel) return normalizeText(ariaLabel).slice(0, MAX_TEXT_LEN);
  }
  const labeled = el.querySelector('[aria-label]');
  if (labeled) {
    const lab = labeled.getAttribute('aria-label');
    if (lab) return normalizeText(lab).slice(0, MAX_TEXT_LEN);
  }
  return '';
}

/**
 * Collapse "FooFoo" → "Foo" when textContent concatenates a visually-hidden
 * sr-only sibling with the visible label (very common in icon-buttons). Only
 * collapses exact duplicate halves with no whitespace at the seam, which is
 * the smoking gun for DOM concat artifacts vs legitimate repetition.
 */
function dedupeRepeatedText(s: string): string {
  if (s.length < 8 || s.length % 2 !== 0) return s;
  const half = s.length / 2;
  const left = s.slice(0, half);
  const right = s.slice(half);
  if (left !== right) return s;
  if (s[half - 1] === ' ' || s[half] === ' ') return s;
  return left;
}

// ─── Resolution ───

export interface ResolveOptions {
  timeoutMs?: number;
  pollMs?: number;
}

export async function resolveElement(
  selectors: SelectorEntry[],
  fp: ElementFingerprint | undefined,
  opts: ResolveOptions = {},
): Promise<Element | null> {
  const timeout = opts.timeoutMs ?? 5000;
  const poll = opts.pollMs ?? 100;
  const deadline = Date.now() + timeout;

  const sorted = [...selectors].sort((a, b) => b.score - a.score);

  while (Date.now() < deadline) {
    for (const sel of sorted) {
      const el = tryFind(sel);
      if (el) return el;
    }
    if (fp) {
      const el = fingerprintScan(fp);
      if (el) return el;
    }
    await sleep(poll);
  }
  return null;
}

function tryFind(sel: SelectorEntry): Element | null {
  try {
    switch (sel.kind) {
      case 'testid':
      case 'id':
      case 'css':
        return document.querySelector(sel.value);
      case 'xpath': {
        const r = document.evaluate(sel.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return (r.singleNodeValue as Element) || null;
      }
      case 'aria':
        return findByAria(sel.value);
      case 'text':
        return findByText(sel.value);
    }
  } catch {
    return null;
  }
}

function findByAria(value: string): Element | null {
  const colonIdx = value.indexOf(':');
  if (colonIdx < 0) return null;
  const role = value.slice(0, colonIdx);
  const name = value.slice(colonIdx + 1);
  if (!name) return null;

  let candidates: NodeListOf<Element> | Element[];
  if (role) {
    candidates = document.querySelectorAll(`[role="${cssEscape(role)}"], ${roleToTags(role)}`);
  } else {
    // Empty role: scan common interactive containers (incl. jsaction-bearing divs).
    candidates = document.querySelectorAll(
      'a, button, input, select, textarea, label, summary, [role], [aria-label], [jsaction], [onclick]',
    );
  }
  for (const el of Array.from(candidates)) {
    const n = getAccessibleName(el as Element);
    if (n && eqLoose(n, name)) return el as Element;
  }
  return null;
}

function findByText(text: string): Element | null {
  const wanted = normalizeText(text);
  if (!wanted) return null;
  const tags = ['a', 'button', 'span', 'p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'label'];
  const seen = new Set<Element>();
  for (const tag of tags) {
    for (const el of Array.from(document.getElementsByTagName(tag))) {
      if (seen.has(el)) continue;
      seen.add(el);
      const t = normalizeText(el.textContent || '');
      if (t && eqLoose(t, wanted)) return el;
    }
  }
  return null;
}

function fingerprintScan(fp: ElementFingerprint): Element | null {
  // Same tag first; then widen to common interactive containers if text+role didn't land.
  let best = scanFingerprint(Array.from(document.getElementsByTagName(fp.tag)), fp, 50);
  if (best) return best;
  if (fp.text) {
    const widerTags = ['a', 'button', 'div', 'span', 'li', 'label'];
    const all: Element[] = [];
    for (const t of widerTags) all.push(...Array.from(document.getElementsByTagName(t)));
    best = scanFingerprint(all, fp, 70); // higher bar when crossing tags
  }
  return best;
}

function scanFingerprint(
  candidates: Element[],
  fp: ElementFingerprint,
  threshold: number,
): Element | null {
  let best: { el: Element; score: number } | null = null;
  for (const el of candidates) {
    let score = 0;
    if (fp.role && (el.getAttribute('role') === fp.role || implicitRole(el) === fp.role)) score += 30;
    for (const [k, v] of Object.entries(fp.attrs)) {
      if (el.getAttribute(k) === v) score += 15;
    }
    if (fp.text) {
      // Use the same fallback-aware text extraction the recorder used, so
      // <a><img alt="X"></a> matches when fp.text was captured from img.alt.
      const t = fingerprintText(el);
      if (t === fp.text) score += 60;
      else if (t && (t.includes(fp.text) || fp.text.includes(t))) score += 25;
    }
    if (score >= threshold && (!best || best.score < score)) best = { el, score };
  }
  return best?.el ?? null;
}

// ─── Helpers ───

function cssPath(el: Element): string | null {
  if (!el.parentElement) return null;
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur.nodeType === 1 && parts.length < 8) {
    let part = cur.tagName.toLowerCase();
    const id = cur.getAttribute('id');
    if (id && isStableId(id)) {
      parts.unshift(`#${cssEscape(id)}`);
      break;
    }
    const cls = stableClasses(cur);
    if (cls.length) part += `.${cls.map(cssEscape).join('.')}`;
    const parent: Element | null = cur.parentElement;
    if (parent) {
      const tag = cur.tagName;
      const sameTag = Array.from(parent.children).filter((c: Element) => c.tagName === tag);
      if (sameTag.length > 1) {
        part += `:nth-of-type(${sameTag.indexOf(cur) + 1})`;
      }
    }
    parts.unshift(part);
    cur = parent;
  }
  const path = parts.join(' > ');
  try {
    if (document.querySelectorAll(path).length === 1) return path;
  } catch {
    return null;
  }
  return path; // not unique but better than nothing; resolver will rank lower
}

function xpathFor(el: Element): string | null {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur.nodeType === 1 && cur.tagName.toLowerCase() !== 'html') {
    const parent: Element | null = cur.parentElement;
    if (!parent) break;
    const sameTag = Array.from(parent.children).filter((c) => c.tagName === cur!.tagName);
    const idx = sameTag.indexOf(cur) + 1;
    parts.unshift(`${cur.tagName.toLowerCase()}[${idx}]`);
    cur = parent;
  }
  if (!parts.length) return null;
  return `/html/body/${parts.join('/')}`;
}

function stableClasses(el: Element): string[] {
  const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
  return cls.filter((c) => isStableClass(c)).slice(0, 2);
}

function isStableClass(c: string): boolean {
  if (!c) return false;
  if (/^[A-Za-z_][\w-]*$/.test(c) === false) return false;
  // Filter common css-in-js / hashed classes
  if (/^(css-|jss|sc-|emotion-|tw-|chakra-|MuiBox-)/i.test(c)) return false;
  if (/^[a-z]+-[A-Za-z0-9]{6,}$/i.test(c)) return false;
  return c.length <= 30;
}

function isStableId(id: string): boolean {
  if (!id) return false;
  // React/Radix/etc generated patterns
  if (/^(:r[0-9a-f]+:?|__|radix-|headlessui-|mui-|react-)/.test(id)) return false;
  if (/^[a-z]+-[A-Za-z0-9]{6,}$/i.test(id)) return false;
  return true;
}

function cssEscape(s: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(s);
  return s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}

function implicitRole(el: Element): string | null {
  const tag = el.tagName.toLowerCase();
  switch (tag) {
    case 'a':
      return (el as HTMLAnchorElement).hasAttribute('href') ? 'link' : null;
    case 'button':
      return 'button';
    case 'input': {
      const t = (el as HTMLInputElement).type;
      if (['button', 'submit', 'reset'].includes(t)) return 'button';
      if (t === 'checkbox') return 'checkbox';
      if (t === 'radio') return 'radio';
      return 'textbox';
    }
    case 'textarea':
      return 'textbox';
    case 'select':
      return 'combobox';
    default:
      return null;
  }
}

function roleToTags(role: string): string {
  switch (role) {
    case 'button':
      return 'button, input[type="button"], input[type="submit"], input[type="reset"]';
    case 'link':
      return 'a[href]';
    case 'textbox':
      return 'input, textarea';
    case 'combobox':
      return 'select';
    case 'checkbox':
      return 'input[type="checkbox"]';
    case 'radio':
      return 'input[type="radio"]';
    default:
      return '*';
  }
}

function getAccessibleName(el: Element): string {
  const aria = el.getAttribute('aria-label');
  if (aria) return normalizeText(aria);
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const refs = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || '')
      .filter(Boolean);
    if (refs.length) return normalizeText(refs.join(' '));
  }
  const title = el.getAttribute('title');
  if (title) return normalizeText(title);
  const placeholder = el.getAttribute('placeholder');
  if (placeholder) return normalizeText(placeholder);
  // For form fields, look up <label for=id>
  const id = el.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${cssEscape(id)}"]`);
    if (label) return normalizeText(label.textContent || '');
  }
  // Clickable elements: try a descendant aria-label first (handles Gmail's
  // <div jsaction><a aria-label="Snoozed">...</a></div> pattern), then text.
  if (isClickableText(el)) {
    const inner = el.querySelector('[aria-label]');
    if (inner) {
      const innerLabel = inner.getAttribute('aria-label');
      if (innerLabel) return normalizeText(innerLabel);
    }
    return dedupeRepeatedText(normalizeText(el.textContent || '')).slice(0, MAX_TEXT_LEN);
  }
  return '';
}

const CLICKABLE_ROLES = new Set([
  'button',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'tab',
  'option',
  'switch',
  'treeitem',
  'checkbox',
  'radio',
]);

function isClickableText(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if (['a', 'button', 'summary', 'label'].includes(tag)) return true;
  const role = el.getAttribute('role');
  if (role && CLICKABLE_ROLES.has(role)) return true;
  if (el.hasAttribute('jsaction')) return true;
  return false;
}

function normalizeText(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function eqLoose(a: string, b: string): boolean {
  return normalizeText(a).toLowerCase() === normalizeText(b).toLowerCase();
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
