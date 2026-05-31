// Pure, side-effect-free helpers for turning a raw ActionStep[] into a
// reviewable DraftStep[] and finally into a Skill. Extracted from
// SaveAsSkillDialog.tsx so the e2e harness (and any future headless caller)
// can exercise the distillation pipeline without React.
//
// No imports from React, DOM-only globals (window, document, navigator),
// or extension APIs (chrome.*). Only @skill-recorder/types.

import type {
  ActionStep,
  RecordingMeta,
  SelectorEntry,
  Skill,
  SkillActionType,
  SkillAuthHint,
  SkillParameter,
  SkillStep,
} from '@skill-recorder/types';

// ─── Draft type ─────────────────────────────────────────────────────────

export interface DraftStep {
  raw: ActionStep;
  action: SkillActionType;
  intent: string;
  skipped: boolean;
  isParam: boolean;
  paramName: string;
  value: string;
  /**
   * Only meaningful for `action === 'fill'`. true → the change was immediately
   * followed by an Enter on the same target, so the rendered step should
   * preserve submit semantics. false/undefined → mid-form fill; renderer emits
   * `browse fill --no-press-enter ...` so we don't prematurely submit.
   */
  pressEnter?: boolean;
  /**
   * Optional human-authored note. Surfaced into the rendered SKILL.md as a
   * `> **Note from recorder**: …` blockquote. Set by the user via the
   * SaveAsSkillDialog per-step "+ note" affordance — empty / undefined for
   * the default (no extra annotation).
   */
  note?: string;
}

// ─── Draft construction ─────────────────────────────────────────────────

export function buildDrafts(actions: ActionStep[]): DraftStep[] {
  let fillIdx = 0;
  return actions.map((a, idx) => {
    const action = mapAction(a.type);
    let isParam = false;
    let paramName = '';
    // File upload (D2): always parameterize as `file_path`.
    if (action === 'fill' && a.inputType === 'file') {
      isParam = true;
      paramName = 'file_path';
    } else if (action === 'fill' && !a.masked && (a.value ?? '').length > 0) {
      // E2: auto-param only when confidence ≥ 0.7. Hardcoded-looking values
      // (short, matches the field's own aria-label, matches placeholder) stay
      // as literals — user can flip them in the dialog.
      const conf = paramConfidence(a);
      if (conf >= 0.7) {
        isParam = true;
        paramName = suggestParamNameForFill(a, fillIdx++);
      }
    }
    const pressEnter =
      action === 'fill' ? changeWasFollowedByEnter(a, idx, actions) : undefined;
    return {
      raw: a,
      action,
      intent: defaultIntent(a, action),
      skipped: shouldDefaultSkip(a, idx, actions),
      isParam,
      paramName,
      value: a.value ?? '',
      pressEnter,
    };
  });
}

/**
 * For a 'change' action, returns true if it is followed by a keyDown('Enter')
 * on the same target before any other meaningful event. Used to decide whether
 * the resulting fill SkillStep should carry pressEnter: true (preserves submit
 * semantics) or false (default — emits `browse fill --no-press-enter ...` so
 * mid-form fills don't prematurely submit).
 */
export function changeWasFollowedByEnter(
  a: ActionStep,
  idx: number,
  all: ActionStep[],
): boolean {
  if (a.type !== 'change') return false;
  for (let i = idx + 1; i < all.length; i++) {
    const next = all[i];
    if (next.type === 'keyUp') continue; // skip keyUp noise
    if (next.type === 'keyDown' && next.key === 'Enter' && sameTarget(a, next)) {
      return true;
    }
    // Any other event between change and Enter breaks the link.
    if (
      next.type === 'change' ||
      next.type === 'click' ||
      next.type === 'submit' ||
      next.type === 'navigate'
    ) {
      return false;
    }
    if (next.type === 'keyDown' && next.key !== 'Enter') {
      return false;
    }
  }
  return false;
}

/**
 * Score a fill step's likelihood of being a parameter. Returns 0..1. The
 * caller treats ≥0.7 as "auto-param".
 *
 * +0.4 if input type / role is text-like (text/email/tel/search/url/number/textarea/searchbox)
 * +0.3 if value looks variable (UUID, email, long mixed-case, digits ≥4)
 * +0.2 if input has an aria-label or placeholder (gives a good param name)
 * -0.5 if value is short and exactly matches the field's aria-label
 * -0.5 if value matches the field's placeholder verbatim (it's the default
 *      copy the user didn't actually fill in)
 *
 * Clamped to [0, 1].
 */
export function paramConfidence(a: ActionStep): number {
  const fp = a.fingerprint;
  const value = a.value ?? '';
  if (!value) return 0;
  let score = 0;
  const tag = fp?.tag?.toLowerCase();
  const inputType = (a.inputType || fp?.attrs?.type || '').toLowerCase();
  const role = fp?.role?.toLowerCase();
  const textLike =
    tag === 'textarea' ||
    role === 'textbox' ||
    role === 'searchbox' ||
    ['text', 'email', 'tel', 'search', 'url', 'number', ''].includes(inputType);
  if (textLike) score += 0.4;
  if (looksVariable(value)) score += 0.3;
  const aria = fp?.attrs?.['aria-label'] ?? '';
  const placeholder = fp?.attrs?.placeholder ?? '';
  if (aria || placeholder) score += 0.2;
  if (aria && value.length < 24 && value.toLowerCase() === aria.toLowerCase()) score -= 0.5;
  if (placeholder && value === placeholder) score -= 0.5;
  return Math.max(0, Math.min(1, score));
}

function looksVariable(value: string): boolean {
  // Long-enough UUIDs, emails, urls, mixed-case strings, and digit runs all
  // smell like "the user filled this in with their own data."
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-/.test(value)) return true; // UUID prefix
  if (/^\S+@\S+\.\S+$/.test(value)) return true; // email
  if (/^https?:\/\//.test(value)) return true; // url
  if (/\d{4,}/.test(value)) return true; // 4+ consecutive digits
  if (value.length > 12 && /[A-Z]/.test(value) && /[a-z]/.test(value)) return true; // mixed case long
  return false;
}

// ─── URL path-segment parameter detection (E2) ─────────────────────────
//
// Detect "variable-looking" segments in a navigate step's URL — UUIDs,
// numeric IDs — and surface them as `{{name}}` templates so the rendered
// SKILL.md can be re-used across runs.

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const NUMERIC_ID_RE = /^\d{3,}$/;

export interface UrlParam {
  /** logical param name e.g. "order_id" */
  name: string;
  /** original segment value, kept as example */
  example: string;
}

/**
 * Parameterize variable-looking segments of a URL. Returns the templated URL
 * (`https://x.com/orders/{{order_id}}`) plus the params it detected.
 */
export function parameterizeUrl(url: string, existingNames: Set<string>): {
  templateUrl: string;
  params: UrlParam[];
} {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { templateUrl: url, params: [] };
  }
  const segments = parsed.pathname.split('/');
  const params: UrlParam[] = [];
  let prevSegment = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg) {
      prevSegment = seg;
      continue;
    }
    if (UUID_RE.test(seg) || NUMERIC_ID_RE.test(seg)) {
      // Use the preceding segment as the basis of the param name when it's a
      // plausible noun: /orders/123 → order_id.
      const base = prevSegment.replace(/[^a-z0-9]+/gi, '_').replace(/_+$/, '').toLowerCase();
      let name = base ? `${base.replace(/s$/, '')}_id` : `id_${params.length + 1}`;
      while (existingNames.has(name)) name = `${name}_${params.length + 1}`;
      existingNames.add(name);
      params.push({ name, example: seg });
      segments[i] = `{{${name}}}`;
    }
    prevSegment = seg;
  }
  const templateUrl = `${parsed.origin}${segments.join('/')}${parsed.search}${parsed.hash}`;
  return { templateUrl, params };
}

// ─── Skill construction ─────────────────────────────────────────────────

export interface BuildSkillInput {
  title: string;
  description: string;
  drafts: DraftStep[];
  recording: RecordingMeta;
  authHint: SkillAuthHint;
}

export function buildSkill(input: BuildSkillInput): Skill {
  const kept = input.drafts.filter((d) => !d.skipped);
  // Pre-scan: detect URL-segment params on navigate steps and rewrite their
  // url field to use {{name}} placeholders. We collect those params alongside
  // the fill-derived params so they all surface in the rendered SKILL.md.
  const fillParams = collectParams(input.drafts);
  const existingNames = new Set(fillParams.map((p) => p.name));
  const urlParams: SkillParameter[] = [];
  const urlTemplates = new Map<DraftStep, string>();
  for (const d of kept) {
    if (d.action !== 'navigate') continue;
    const u = d.raw.navigateUrl ?? d.raw.url;
    if (!u) continue;
    const { templateUrl, params } = parameterizeUrl(u, existingNames);
    if (params.length) {
      urlTemplates.set(d, templateUrl);
      for (const p of params) {
        urlParams.push({
          name: p.name,
          type: 'string',
          description: `URL parameter for ${p.name}`,
          example: p.example,
        });
      }
    }
  }
  const steps: SkillStep[] = kept.map((d, idx) => toSkillStep(d, idx, kept, urlTemplates));
  return {
    id: cryptoRandomId(),
    title: input.title.trim(),
    description: input.description.trim() || input.title.trim(),
    domain: hostnameOf(input.recording.url),
    startUrl: urlTemplates.get(kept[0]!) ?? input.recording.url,
    parameters: [...fillParams, ...urlParams],
    steps,
    auth: input.authHint.required ? input.authHint : undefined,
    sourceRecordingId: input.recording.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function collectParams(drafts: DraftStep[]): SkillParameter[] {
  const seen = new Map<string, SkillParameter>();
  for (const d of drafts) {
    if (d.skipped) continue;
    // Primary param tag.
    if (d.isParam) {
      const name = sanitizeParamName(d.paramName);
      if (name && !seen.has(name)) {
        seen.set(name, {
          name,
          type: 'string',
          description: `Value for ${name}`,
          example: d.value,
        });
      }
    }
    // Additional tokens embedded in a literal template (E1).
    if (d.value) {
      for (const tok of extractTemplateTokens(d.value)) {
        const name = sanitizeParamName(tok);
        if (name && !seen.has(name)) {
          seen.set(name, {
            name,
            type: 'string',
            description: `Value for ${name}`,
          });
        }
      }
    }
  }
  return [...seen.values()];
}

/** Pick `{{name}}` and `${name}` tokens out of a string. */
export function extractTemplateTokens(s: string): string[] {
  const out: string[] = [];
  const re = /\{\{(\w+)\}\}|\$\{(\w+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    out.push(m[1] ?? m[2]!);
  }
  return out;
}

function toSkillStep(
  d: DraftStep,
  _idx: number,
  kept: DraftStep[],
  urlTemplates: Map<DraftStep, string> = new Map(),
): SkillStep {
  const next = kept[kept.indexOf(d) + 1];
  return {
    id: cryptoRandomId(),
    intent: d.intent.trim() || defaultIntent(d.raw, d.action),
    action: d.action,
    selectors: d.raw.selectors,
    fingerprint: d.raw.fingerprint,
    url: urlTemplates.get(d) ?? (d.raw.navigateUrl ?? d.raw.url),
    valueTemplate:
      d.action === 'fill' || d.action === 'copy' || d.action === 'paste'
        ? d.isParam
          ? `{{${sanitizeParamName(d.paramName)}}}`
          : // Literal values may themselves contain template tokens — preserve.
            d.value
        : undefined,
    key: d.raw.key,
    modifiers: d.raw.modifiers,
    scrollX: d.raw.scrollX,
    scrollY: d.raw.scrollY,
    dragFrom: d.raw.dragFrom
      ? { selectors: d.raw.dragFrom.selectors, fingerprint: d.raw.dragFrom.fingerprint }
      : undefined,
    dragTo: d.raw.dragTo
      ? { selectors: d.raw.dragTo.selectors, fingerprint: d.raw.dragTo.fingerprint }
      : undefined,
    rowContext: d.raw.rowContext,
    pressEnter: d.action === 'fill' ? d.pressEnter ?? false : undefined,
    note: d.note?.trim() || undefined,
    expectation: deriveExpectation(d, next),
  };
}

function deriveExpectation(cur: DraftStep, next: DraftStep | undefined) {
  if (!next) return undefined;
  if (cur.raw.url && next.raw.url && next.raw.url !== cur.raw.url) {
    return { description: `URL becomes ${shortUrl(next.raw.url)}`, urlMatch: next.raw.url };
  }
  const sel = next.raw.selectors?.[0];
  if (!sel) return undefined;
  const targetName =
    next.raw.fingerprint?.attrs?.['aria-label'] ||
    (next.raw.fingerprint?.text && next.raw.fingerprint.text !== next.raw.fingerprint?.tag
      ? next.raw.fingerprint.text
      : '') ||
    sel.value.slice(0, 50);
  if (!targetName) return undefined;
  return {
    description: `"${targetName}" becomes interactable`,
    elementVisible: [sel] as SelectorEntry[],
  };
}

// ─── Action mapping + skip heuristics ───────────────────────────────────

export function mapAction(t: ActionStep['type']): SkillActionType {
  switch (t) {
    case 'navigate':
      return 'navigate';
    case 'click':
      return 'click';
    case 'change':
      return 'fill';
    case 'keyDown':
      return 'press_key';
    case 'keyUp':
      return 'press_key';
    case 'scroll':
      return 'scroll';
    case 'submit':
      return 'submit';
    case 'drag':
      return 'drag';
    case 'copy':
      return 'copy';
    case 'paste':
      return 'paste';
    case 'switchTab':
      return 'switchTab';
  }
}

export function defaultIntent(a: ActionStep, action: SkillActionType): string {
  const aria = a.fingerprint?.attrs?.['aria-label'];
  const text = a.fingerprint?.text;
  switch (action) {
    case 'navigate':
      return `Navigate to ${a.navigateUrl ?? a.url}`;
    case 'click': {
      const label = aria || (text && text !== a.fingerprint?.tag ? text : '');
      const role = a.fingerprint?.role || a.fingerprint?.tag || 'element';
      if (a.rowContext) {
        const target = label || role;
        const rowSnippet = a.rowContext.rowText.slice(0, 60);
        return `Click ${target} in the row containing "${rowSnippet}"`;
      }
      return label ? `Click "${label}"` : `Click ${role}`;
    }
    case 'fill': {
      const label = aria || (text && text !== a.fingerprint?.tag ? text : '');
      const fieldLabel = label || a.fingerprint?.tag || 'field';
      if (a.rowContext) {
        const rowSnippet = a.rowContext.rowText.slice(0, 60);
        return `Fill "${fieldLabel}" in the row containing "${rowSnippet}"`;
      }
      return label ? `Fill "${label}"` : `Fill ${a.fingerprint?.tag ?? 'field'}`;
    }
    case 'press_key':
      return `Press ${formatChord(a.key ?? '', a.modifiers)}`;
    case 'scroll':
      return `Scroll`;
    case 'submit':
      return aria || text ? `Submit "${aria || text}"` : 'Submit form';
    case 'drag': {
      const fromLabel = a.dragFrom?.fingerprint?.attrs?.['aria-label'] || a.dragFrom?.fingerprint?.text || a.dragFrom?.fingerprint?.tag || 'source';
      const toLabel = a.dragTo?.fingerprint?.attrs?.['aria-label'] || a.dragTo?.fingerprint?.text || a.dragTo?.fingerprint?.tag || 'target';
      return `Drag "${fromLabel}" onto "${toLabel}"`;
    }
    case 'copy':
      return `Copy "${(a.value ?? '').slice(0, 32)}" to clipboard`;
    case 'paste': {
      const label = aria || (text && text !== a.fingerprint?.tag ? text : '') || a.fingerprint?.tag || 'target';
      return `Paste into "${label}"`;
    }
    case 'switchTab':
      return `Switch to tab #${(a.targetTabIndex ?? 0) + 1}`;
    case 'select': {
      const label = aria || (text && text !== a.fingerprint?.tag ? text : '');
      const fieldLabel = label || a.fingerprint?.tag || 'dropdown';
      if (a.rowContext) {
        const rowSnippet = a.rowContext.rowText.slice(0, 60);
        return `Select option in "${fieldLabel}" in the row containing "${rowSnippet}"`;
      }
      return `Select option in "${fieldLabel}"`;
    }
    case 'guidance':
      // Recording path never produces guidance steps — they only come from
      // video-distilled skills, which never flow through this function.
      return 'Apply checklist';
  }
}

export function describeRaw(a: ActionStep): string {
  const selPreview = a.selectors?.[0]?.value ?? '';
  switch (a.type) {
    case 'navigate':
      return a.navigateUrl ?? '';
    case 'click':
      return `${a.fingerprint?.text ? `"${a.fingerprint.text}" ` : ''}${selPreview}`;
    case 'change':
      return `${a.masked ? '***' : a.value ?? ''} — ${selPreview}`;
    case 'keyDown':
    case 'keyUp':
      return `${a.key}`;
    case 'scroll':
      return `(${a.scrollX},${a.scrollY})`;
    case 'submit':
      return selPreview;
    case 'drag': {
      const fromText = a.dragFrom?.fingerprint?.text || a.dragFrom?.selectors?.[0]?.value || '';
      const toText = a.dragTo?.fingerprint?.text || a.dragTo?.selectors?.[0]?.value || '';
      return `${fromText} → ${toText}`;
    }
    case 'copy':
      return `"${(a.value ?? '').slice(0, 48)}"`;
    case 'paste':
      return `"${(a.value ?? '').slice(0, 48)}" → ${selPreview}`;
    default:
      return '';
  }
}

export function shouldDefaultSkip(a: ActionStep, idx: number, all: ActionStep[]): boolean {
  // Always skip scroll — rarely intentional
  if (a.type === 'scroll') return true;
  // switchTab is a replay-routing concept; render a hint at most.
  if (a.type === 'switchTab') return false;

  // Skip clearing keys (Backspace/Delete) — fill will overwrite anyway
  const isKey = a.type === 'keyDown' || a.type === 'keyUp';
  if (isKey && (a.key === 'Backspace' || a.key === 'Delete')) return true;

  // Skip duplicate consecutive presses of same key
  if (isKey && idx > 0) {
    const prev = all[idx - 1];
    if ((prev.type === 'keyDown' || prev.type === 'keyUp') && prev.key === a.key) return true;
  }

  // Skip keyUp entirely (we only need keyDown for replay)
  if (a.type === 'keyUp') return true;

  // Skip Enter pressed right after focusing an input but before any typing.
  if (a.type === 'keyDown' && a.key === 'Enter' && idx > 0) {
    let sawChangeOnTarget = false;
    for (let i = idx - 1; i >= 0; i--) {
      const prev = all[i];
      if (prev.type === 'change' && sameTarget(prev, a)) {
        sawChangeOnTarget = true;
        break;
      }
      if (prev.type === 'click' && isTextLikeInput(prev.fingerprint)) {
        if (!sawChangeOnTarget) return true;
        break;
      }
      if (prev.type === 'click' || prev.type === 'submit' || prev.type === 'navigate') break;
    }
  }

  // Skip a click that immediately follows a `change` on a text input when the
  // click target is a submit-like button — the change's Enter already submitted.
  if (a.type === 'click' && idx > 0 && isSubmitLikeButton(a.fingerprint, a.selectors)) {
    for (let i = idx - 1; i >= 0; i--) {
      const prev = all[i];
      if (prev.type === 'navigate' || prev.type === 'keyUp') continue;
      if (
        prev.type === 'change' &&
        isTextLikeInput(prev.fingerprint) &&
        a.timestamp - prev.timestamp < 3000
      ) {
        return true;
      }
      break;
    }
  }

  // Skip navigate that's part of a navigation chain caused by a click/submit/Enter.
  if (a.type === 'navigate' && idx > 0) {
    for (let i = idx - 1; i >= 0; i--) {
      const prev = all[i];
      if (prev.type === 'navigate') continue;
      const dt = a.timestamp - prev.timestamp;
      const isTrigger =
        prev.type === 'click' ||
        prev.type === 'submit' ||
        prev.type === 'change' ||
        (prev.type === 'keyDown' && prev.key === 'Enter');
      if (isTrigger && dt > 0 && dt < 5000) return true;
      break;
    }
  }

  return false;
}

export function isTextLikeInput(fp: ActionStep['fingerprint']): boolean {
  if (!fp) return false;
  const tag = fp.tag?.toLowerCase();
  if (tag === 'textarea') return true;
  if (tag !== 'input') {
    const role = fp.role?.toLowerCase();
    return role === 'searchbox' || role === 'textbox' || role === 'combobox';
  }
  const type = (fp.attrs?.type || 'text').toLowerCase();
  return ['text', 'search', 'email', 'url', 'tel', 'password', 'number', ''].includes(type);
}

export function isSubmitLikeButton(
  fp: ActionStep['fingerprint'],
  selectors: ActionStep['selectors']
): boolean {
  const submitVerbs = /\b(search|submit|go|find|search amazon|search button)\b/i;
  if (fp) {
    const type = (fp.attrs?.type || '').toLowerCase();
    if (type === 'submit') return true;
    const label = `${fp.attrs?.['aria-label'] || ''} ${fp.text || ''}`.trim();
    const role = fp.role?.toLowerCase();
    if ((role === 'button' || fp.tag?.toLowerCase() === 'button') && submitVerbs.test(label)) {
      return true;
    }
  }
  if (selectors) {
    for (const s of selectors) {
      if (/submit-button|searchsubmit|search-submit|btnsearch|btn-search/i.test(s.value)) {
        return true;
      }
    }
  }
  return false;
}

export function sameTarget(a: ActionStep, b: ActionStep): boolean {
  const sa = a.selectors?.[0]?.value;
  const sb = b.selectors?.[0]?.value;
  if (sa && sb && sa === sb) return true;
  const fa = a.fingerprint;
  const fb = b.fingerprint;
  if (!fa || !fb) return false;
  if (fa.tag === fb.tag && (fa.attrs?.id || '') === (fb.attrs?.id || '') && fa.tag) {
    return true;
  }
  return false;
}

// ─── Param naming ───────────────────────────────────────────────────────

export function suggestParamName(intent: string, raw: ActionStep): string {
  const text = (
    raw.fingerprint?.text ||
    raw.fingerprint?.attrs?.['aria-label'] ||
    intent ||
    'value'
  ).toLowerCase();
  const ascii = text.replace(/[^a-z0-9 ]/g, '').trim();
  const words = ascii.split(/\s+/).filter(Boolean).slice(0, 2);
  if (!words.length) return 'value';
  return words.join('_');
}

export function suggestParamNameForFill(a: ActionStep, fillIdx: number): string {
  const label = a.fingerprint?.attrs?.['aria-label'] || a.fingerprint?.text || '';
  const ascii = label
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(the|a|an|to|for|of|in|on)\b/g, '')
    .trim();
  const words = ascii.split(/\s+/).filter(Boolean).slice(0, 2);
  if (words.length) return words.join('_').slice(0, 32);
  return `value_${fillIdx + 1}`;
}

export function sanitizeParamName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}

// ─── Auth detection ─────────────────────────────────────────────────────

const AUTH_HOST_PATTERNS = [
  /(^|\.)logto\.app$/i,
  /(^|\.)auth0\.com$/i,
  /(^|\.)okta\.com$/i,
  /(^|\.)clerk\.(dev|com|accounts|services)$/i,
  /(^|\.)stytch\.com$/i,
  /(^|\.)workos\.com$/i,
  /(^|\.)firebaseapp\.com$/i,
  /(^|\.)identityserver\.io$/i,
  /(^|\.)accounts\.google\.com$/i,
  /(^|\.)appleid\.apple\.com$/i,
  /(^|\.)login\.microsoftonline\.com$/i,
  /(^|\.)github\.com$/i,
  /(^|\.)gitlab\.com$/i,
  /(^|\.)supabase\.co$/i,
];

const AUTH_PATH_PATTERN =
  /\/(login|signin|sign-in|sso|oauth|oauth2|authorize|register|signup|sign-up)(\/|$|\?)/i;

/**
 * Distill-time heuristic: did the recording cross any auth-provider signal?
 * If yes, the skill probably needs a pre-authenticated session at replay time.
 */
export function detectAuthSignals(actions: ActionStep[], startUrl: string): SkillAuthHint {
  const reasons: string[] = [];
  const domains = new Set<string>();
  const startHost = hostnameOf(startUrl);

  for (const a of actions) {
    if (a.type === 'change' && a.masked) {
      reasons.push('a password input was filled during recording');
    }
    const target = a.type === 'navigate' ? a.navigateUrl : a.url;
    if (!target) continue;
    let host = '';
    let path = '';
    try {
      const u = new URL(target);
      host = u.host;
      path = u.pathname;
    } catch {
      continue;
    }
    if (host && host !== startHost) {
      for (const re of AUTH_HOST_PATTERNS) {
        if (re.test(host)) {
          domains.add(host);
          reasons.push(`redirect to auth provider ${host}`);
          break;
        }
      }
    }
    if (path && AUTH_PATH_PATTERN.test(path)) {
      reasons.push(`navigated to ${path}`);
    }
  }

  if (!reasons.length) return { required: false };

  const uniqueReasons = [...new Set(reasons)].slice(0, 3);
  return {
    required: true,
    reason: uniqueReasons.join('; '),
    authDomains: domains.size ? [...domains] : undefined,
  };
}

// ─── Misc helpers ───────────────────────────────────────────────────────

export function formatChord(key: string, modifiers?: ActionStep['modifiers']): string {
  if (!modifiers) return key;
  const parts: string[] = [];
  if (modifiers.meta) parts.push('Meta');
  if (modifiers.ctrl) parts.push('Control');
  if (modifiers.alt) parts.push('Alt');
  if (modifiers.shift) parts.push('Shift');
  parts.push(key);
  return parts.join('+');
}

export function shortUrl(u: string): string {
  try {
    const url = new URL(u);
    const tail = `${url.pathname}${url.hash}`;
    return `${url.host}${tail.length > 60 ? tail.slice(0, 60) + '…' : tail}`;
  } catch {
    return u.length > 80 ? u.slice(0, 80) + '…' : u;
  }
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'skill'
  );
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

export function cryptoRandomId(): string {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}
