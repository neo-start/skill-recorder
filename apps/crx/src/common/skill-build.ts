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
}

// ─── Draft construction ─────────────────────────────────────────────────

export function buildDrafts(actions: ActionStep[]): DraftStep[] {
  let fillIdx = 0;
  return actions.map((a, idx) => {
    const action = mapAction(a.type);
    let isParam = false;
    let paramName = '';
    // File upload (D2): always parameterize as `file_path` since the recorded
    // filename is rarely the one the agent will want at replay time.
    if (action === 'fill' && a.inputType === 'file') {
      isParam = true;
      paramName = 'file_path';
    } else if (action === 'fill' && !a.masked && (a.value ?? '').length > 0) {
      // Default-mark every non-masked fill as a parameter.
      isParam = true;
      paramName = suggestParamNameForFill(a, fillIdx++);
    }
    return {
      raw: a,
      action,
      intent: defaultIntent(a, action),
      skipped: shouldDefaultSkip(a, idx, actions),
      isParam,
      paramName,
      value: a.value ?? '',
    };
  });
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
  const steps: SkillStep[] = kept.map((d, idx) => toSkillStep(d, idx, kept));
  return {
    id: cryptoRandomId(),
    title: input.title.trim(),
    description: input.description.trim() || input.title.trim(),
    domain: hostnameOf(input.recording.url),
    startUrl: input.recording.url,
    parameters: collectParams(input.drafts),
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
    if (d.skipped || !d.isParam) continue;
    const name = sanitizeParamName(d.paramName);
    if (!name) continue;
    if (!seen.has(name)) {
      seen.set(name, {
        name,
        type: 'string',
        description: `Value for ${name}`,
        example: d.value,
      });
    }
  }
  return [...seen.values()];
}

function toSkillStep(d: DraftStep, _idx: number, kept: DraftStep[]): SkillStep {
  const next = kept[kept.indexOf(d) + 1];
  return {
    id: cryptoRandomId(),
    intent: d.intent.trim() || defaultIntent(d.raw, d.action),
    action: d.action,
    selectors: d.raw.selectors,
    fingerprint: d.raw.fingerprint,
    url: d.raw.navigateUrl ?? d.raw.url,
    valueTemplate:
      d.action === 'fill'
        ? d.isParam
          ? `\${${sanitizeParamName(d.paramName)}}`
          : d.value
        : d.action === 'copy' || d.action === 'paste'
          ? d.isParam
            ? `\${${sanitizeParamName(d.paramName)}}`
            : d.value
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
      return label ? `Click "${label}"` : `Click ${role}`;
    }
    case 'fill': {
      const label = aria || (text && text !== a.fingerprint?.tag ? text : '');
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
