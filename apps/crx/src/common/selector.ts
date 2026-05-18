import type { ElementFingerprint, SelectorEntry, SelectorKind } from '@skill-recorder/types';

const TESTID_ATTRS = ['data-testid', 'data-test-id', 'data-test', 'data-cy', 'data-qa'];
const STABLE_ATTRS_FOR_FINGERPRINT = [
  'name',
  'type',
  'role',
  'placeholder',
  'href',
  'aria-label',
  // i18n-stable identifiers (preferred over visible text on multilingual sites)
  'data-i18n-key',
  'aria-label-key',
];
const I18N_KEY_ATTRS = ['data-i18n-key', 'aria-label-key'];
const MAX_TEXT_LEN = 80;

const SCORE: Record<SelectorKind, number> = {
  testid: 95,
  id: 80,
  aria: 70,
  text: 60,
  css: 45,
  xpath: 25,
  // Highest score — when present we ALWAYS want to use it because the light-DOM
  // resolvers above can't reach inside a shadow root at all.
  shadow: 99,
};

// ─── Generation ───

export function generateSelectors(el: Element): SelectorEntry[] {
  const out: SelectorEntry[] = [];

  // C3: if the element is inside one or more shadow roots, emit a piercing
  // path as the highest-priority selector — light-DOM selectors can't reach
  // through a shadow boundary.
  const shadowPath = buildShadowPath(el);
  if (shadowPath) {
    out.push({ kind: 'shadow', value: JSON.stringify(shadowPath), score: SCORE.shadow });
  }

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
  const fp: ElementFingerprint = {
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role') || implicitRole(el),
    text: fingerprintText(el),
    attrs,
  };
  const i18nKey = readI18nKey(el);
  if (i18nKey) fp.i18nKey = i18nKey;
  const idx = indexAmongFingerprintSiblings(el, fp);
  if (idx !== undefined) fp.fingerprintIndex = idx;
  return fp;
}

/**
 * Walk self + ancestors (up to 4 levels) looking for a stable i18n key
 * attribute. Returns the closest match — element-level wins over ancestor.
 */
function readI18nKey(el: Element): string | undefined {
  let cur: Element | null = el;
  for (let i = 0; cur && i < 4; i++) {
    for (const attr of I18N_KEY_ATTRS) {
      const v = cur.getAttribute(attr);
      if (v) return v;
    }
    cur = cur.parentElement;
  }
  return undefined;
}

/**
 * If the element shares its (tag, role, text) with siblings on the page,
 * record which one we hit. At replay time we tiebreak via the same key.
 * Returns undefined when the element is already unique (no tiebreak needed).
 */
function indexAmongFingerprintSiblings(
  el: Element,
  fp: ElementFingerprint,
): number | undefined {
  const sameTag = Array.from(document.getElementsByTagName(fp.tag));
  const matches: Element[] = [];
  for (const cand of sameTag) {
    if (sameFingerprint(cand, fp)) matches.push(cand);
  }
  if (matches.length <= 1) return undefined;
  const idx = matches.indexOf(el);
  return idx >= 0 ? idx : undefined;
}

function sameFingerprint(el: Element, fp: ElementFingerprint): boolean {
  if (el.tagName.toLowerCase() !== fp.tag) return false;
  const role = el.getAttribute('role') || implicitRole(el);
  if ((role || null) !== fp.role) return false;
  // Text equality with the same fallback-aware extraction the recorder uses.
  if (fingerprintText(el) !== fp.text) return false;
  return true;
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

  // When the fingerprint has a sibling-index tiebreak OR a locale-stable
  // i18nKey, the generic selectors (text, aria) would happily resolve to
  // the WRONG identical-looking element. Run fingerprintScan first so
  // those signals win.
  const fingerprintFirst = !!fp && (fp.fingerprintIndex !== undefined || !!fp.i18nKey);

  while (Date.now() < deadline) {
    if (fingerprintFirst) {
      const el = fingerprintScan(fp);
      if (el) return el;
    }
    for (const sel of sorted) {
      const el = tryFind(sel);
      if (el) return el;
    }
    if (!fingerprintFirst && fp) {
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
      case 'shadow':
        return resolveShadowPath(sel.value);
    }
  } catch {
    return null;
  }
}

// ─── Shadow-DOM piercing (C3) ───
//
// Encoded path: `[{ host: cssSelector, inner: cssSelector }, …, { host: cssSelector | null, inner: cssSelector }]`
// The first segment's host is a selector in the light DOM; each subsequent
// segment's host is a selector within the previous segment's shadowRoot.
// The final segment's `inner` is the selector within the deepest shadow root
// that resolves to our target element.
interface ShadowSegment {
  host: string;
  inner: string;
}

function buildShadowPath(el: Element): ShadowSegment[] | null {
  const segments: ShadowSegment[] = [];
  let cur: Element | null = el;
  // Walk up; whenever we cross a shadow root via `host`, push a segment whose
  // inner is the path from the shadowRoot to the previous element, and whose
  // host is the path to the host (built on the next loop iteration).
  let leg: Element = el;
  while (cur) {
    const root = cur.getRootNode();
    if (root instanceof ShadowRoot) {
      const innerPath = cssPathWithin(leg, root);
      // For the host portion we now restart leg = root.host and continue.
      leg = root.host;
      segments.unshift({ host: '', inner: innerPath });
      cur = root.host;
      continue;
    }
    cur = cur.parentElement;
  }
  if (segments.length === 0) return null;
  // For each segment, fill in the host path. The first segment's host lives in
  // light DOM; subsequent segment hosts live in their parent segment's shadow.
  let currentLeg: Element = leg;
  for (let i = 0; i < segments.length; i++) {
    if (i === 0) {
      segments[i].host = cssPathWithin(currentLeg, document);
    } else {
      // Host of segment i is whatever shadow-host element we recorded; for the
      // simple single-level shadow case there's no nested-shadow host name to
      // compute here. We left segments[i].host empty and treat empty host as
      // "use the deepest light-DOM host" — the resolver handles that.
    }
  }
  return segments;
}

/**
 * cssPath built relative to `root` (which is either Document or ShadowRoot).
 * Mirrors the production cssPath() but stops at the root rather than the html
 * element.
 */
function cssPathWithin(el: Element, root: Document | ShadowRoot): string {
  if ('getElementById' in root && el.id && (root as Document | ShadowRoot).getElementById(el.id) === el) {
    return `#${cssEscape(el.id)}`;
  }
  // Walk up to root building a chain like `host > div > button:nth-of-type(2)`.
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== (root as unknown as Element)) {
    let segment = cur.tagName.toLowerCase();
    const parentEl: Element | null = cur.parentElement;
    if (parentEl) {
      const tag = cur.tagName;
      const siblings = (Array.from(parentEl.children) as Element[]).filter((s) => s.tagName === tag);
      if (siblings.length > 1) {
        const idx = siblings.indexOf(cur);
        segment += `:nth-of-type(${idx + 1})`;
      }
    }
    parts.unshift(segment);
    cur = parentEl;
  }
  return parts.join(' > ');
}

function resolveShadowPath(value: string): Element | null {
  let segments: ShadowSegment[];
  try {
    segments = JSON.parse(value) as ShadowSegment[];
  } catch {
    return null;
  }
  if (!segments.length) return null;
  // First segment: find host in light DOM.
  const firstHost = document.querySelector(segments[0].host);
  if (!firstHost) return null;
  let shadow: ShadowRoot | null = firstHost.shadowRoot;
  if (!shadow) return null;
  // For each segment, find `inner` in the current shadow root. If there are
  // more segments after, the resolved inner element is the next host whose
  // shadowRoot we walk into.
  for (let i = 0; i < segments.length; i++) {
    if (!shadow) return null;
    const inner: Element | null = shadow.querySelector(segments[i].inner);
    if (!inner) return null;
    if (i === segments.length - 1) return inner;
    // The inner is the next-segment host. Descend into its shadow.
    shadow = inner.shadowRoot;
  }
  return null;
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
  // 1. i18nKey hit takes priority — locale-independent and rare enough to be unique
  if (fp.i18nKey) {
    const byKey = findByI18nKey(fp.i18nKey);
    if (byKey) return byKey;
  }
  // 2. Same tag first
  const sameTag = Array.from(document.getElementsByTagName(fp.tag));
  // 2a. If we recorded a tiebreaker, collect ALL strong matches and pick the
  //     correct one by index. Strong = exact text + role + attrs equality
  //     under the same threshold scanFingerprint would have considered.
  if (fp.fingerprintIndex !== undefined) {
    const exact = sameTag.filter((el) => sameFingerprint(el, fp));
    if (exact.length > fp.fingerprintIndex) return exact[fp.fingerprintIndex];
    // Fall through if the page has fewer matches than expected (DOM churn).
  }
  let best = scanFingerprint(sameTag, fp, 50);
  if (best) return best;
  // 3. Widen to common interactive containers if text+role didn't land
  if (fp.text) {
    const widerTags = ['a', 'button', 'div', 'span', 'li', 'label'];
    const all: Element[] = [];
    for (const t of widerTags) all.push(...Array.from(document.getElementsByTagName(t)));
    best = scanFingerprint(all, fp, 70); // higher bar when crossing tags
  }
  return best;
}

function findByI18nKey(key: string): Element | null {
  const escaped = key.replace(/"/g, '\\"');
  for (const attr of I18N_KEY_ATTRS) {
    const hit = document.querySelector(`[${attr}="${escaped}"]`);
    if (hit) return hit;
  }
  return null;
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
    // i18nKey match outranks text — locale-independent, intent-stable
    if (fp.i18nKey) {
      const key = readI18nKey(el);
      if (key === fp.i18nKey) score += 80;
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
  // CSS Modules — `Component_styles__abc123` or `_styles__abc123`
  if (/^_?[A-Za-z]+_[A-Za-z]+__[A-Za-z0-9]{4,}$/.test(c)) return false;
  // Vue scoped-style internal — `v-` or unmangled component class with hash
  if (/^v-[a-f0-9]{6,}$/i.test(c)) return false;
  // Angular emulated encapsulation host classes
  if (/^_nghost-|^_ngcontent-/.test(c)) return false;
  // Trailing hash (e.g. `button__primary--a3f9c2`)
  if (/[-_][A-Fa-f0-9]{6,}$/.test(c)) return false;
  // Generic short alpha-hash suffix
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
