import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { loadActions } from '@/common/db';
import { renderSkillAsMarkdown } from '@skill-recorder/render';
import { autoSaveSkillMarkdown } from '@/common/skill-export';
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
import { skillsStore } from '@/stores/skills';
import { colors } from '../styles';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
`;

const Panel = styled.div`
  background: ${colors.surface};
  border-radius: 10px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
`;

const Hdr = styled.header`
  padding: 14px 16px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HTitle = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
`;

const Close = styled.button`
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: ${colors.textMuted};
  padding: 0 6px;
`;

const Body = styled.div`
  padding: 14px 16px;
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FieldGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${colors.textMuted};
`;

const Input = styled.input`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 7px 10px;
  font: inherit;
  font-size: 13px;
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Textarea = styled.textarea`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 7px 10px;
  font: inherit;
  font-size: 13px;
  min-height: 56px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${colors.textMuted};
  margin-top: 4px;
`;

const StepRow = styled.div<{ $skipped?: boolean }>`
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  opacity: ${(p) => (p.$skipped ? 0.45 : 1)};
`;

const StepTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const StepKind = styled.span<{ $kind: SkillActionType }>`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${(p) => kindColor(p.$kind)};
  color: white;
`;

const SmallBtn = styled.button<{ $danger?: boolean; $active?: boolean }>`
  border: 1px solid ${(p) => (p.$active ? '#3b82f6' : colors.border)};
  background: ${(p) => (p.$active ? '#3b82f6' : colors.surface)};
  color: ${(p) =>
    p.$active ? 'white' : p.$danger ? colors.accent : colors.text};
  border-radius: 4px;
  font-size: 11px;
  padding: 3px 7px;
  cursor: pointer;
`;

const ValueRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const ValueInput = styled.input`
  flex: 1;
  border: 1px solid ${colors.border};
  border-radius: 5px;
  padding: 4px 8px;
  font: inherit;
  font-size: 12px;
`;

const ParamInput = styled.input`
  flex: 1;
  border: 1px solid #3b82f6;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 5px;
  padding: 4px 8px;
  font: inherit;
  font-size: 12px;
  font-family: ui-monospace, monospace;
`;

const Footer = styled.footer`
  padding: 12px 16px;
  border-top: 1px solid ${colors.border};
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FeedbackText = styled.div`
  font-size: 12px;
  color: ${colors.textMuted};
  flex: 1;
  text-align: left;
  min-width: 0;
`;

const Btn = styled.button<{ $primary?: boolean }>`
  border: 1px solid ${(p) => (p.$primary ? '#3b82f6' : colors.border)};
  background: ${(p) => (p.$primary ? '#3b82f6' : colors.surface)};
  color: ${(p) => (p.$primary ? 'white' : colors.text)};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 14px;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Hint = styled.div`
  font-size: 11px;
  color: ${colors.textMuted};
  word-break: break-word;
`;

const AuthRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px 10px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: rgba(250, 204, 21, 0.06);
`;

const AuthCheckbox = styled.input`
  margin-top: 3px;
  cursor: pointer;
`;

const AuthLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
`;

function kindColor(k: SkillActionType): string {
  switch (k) {
    case 'navigate':
      return '#60a5fa';
    case 'click':
      return '#f472b6';
    case 'fill':
      return '#34d399';
    case 'press_key':
      return '#facc15';
    case 'submit':
      return '#fb923c';
    case 'scroll':
      return '#a78bfa';
    default:
      return '#9ca3af';
  }
}

interface Props {
  recording: RecordingMeta;
  onClose: () => void;
}

interface DraftStep {
  raw: ActionStep;
  action: SkillActionType;
  intent: string;
  skipped: boolean;
  isParam: boolean;
  paramName: string;
  value: string;
}

export function SaveAsSkillDialog({ recording, onClose }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState(recording.title || 'Untitled Skill');
  const [description, setDescription] = useState('');
  const [drafts, setDrafts] = useState<DraftStep[]>([]);
  const [authHint, setAuthHint] = useState<SkillAuthHint>({ required: false });
  const [busy, setBusy] = useState<'idle' | 'copying' | 'downloading'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const actions = await loadActions(recording.id);
      setDrafts(buildDrafts(actions));
      setAuthHint(detectAuthSignals(actions, recording.url));
      setLoaded(true);
    })();
  }, [recording.id, recording.url]);

  const params = useMemo<SkillParameter[]>(() => {
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
  }, [drafts]);

  const canSave =
    loaded &&
    title.trim().length > 0 &&
    drafts.some((d) => !d.skipped) &&
    drafts.every((d) => !d.isParam || sanitizeParamName(d.paramName).length > 0);

  const updateDraft = (i: number, patch: Partial<DraftStep>) => {
    setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };

  const buildSkill = (): Skill => {
    const kept = drafts.filter((d) => !d.skipped);
    const steps: SkillStep[] = kept.map((d, idx) => toSkillStep(d, idx, kept));
    return {
      id: cryptoRandomId(),
      title: title.trim(),
      description: description.trim() || title.trim(),
      domain: hostnameOf(recording.url),
      startUrl: recording.url,
      parameters: params,
      steps,
      auth: authHint.required ? authHint : undefined,
      sourceRecordingId: recording.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  };

  const onCopy = async () => {
    if (!canSave) return;
    setBusy('copying');
    setFeedback(null);
    try {
      const skill = buildSkill();
      await skillsStore.save(skill);
      const md = renderSkillAsMarkdown(skill);
      await navigator.clipboard.writeText(md);
      const filePath = await autoSaveSkillMarkdown(skill);
      setFeedback(`✓ Copied to clipboard · also saved → ${filePath}`);
      setTimeout(onClose, 1500);
    } catch (err) {
      setFeedback(`Copy failed: ${(err as Error).message}`);
    } finally {
      setBusy('idle');
    }
  };

  const onDownload = async () => {
    if (!canSave) return;
    setBusy('downloading');
    setFeedback(null);
    try {
      const skill = buildSkill();
      await skillsStore.save(skill);
      const filePath = await autoSaveSkillMarkdown(skill);
      setFeedback(`✓ Downloaded → ${filePath}`);
      setTimeout(onClose, 1500);
    } catch (err) {
      setFeedback(`Download failed: ${(err as Error).message}`);
    } finally {
      setBusy('idle');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Hdr>
          <HTitle>Save as Skill</HTitle>
          <Close onClick={onClose}>×</Close>
        </Hdr>
        <Body>
          <FieldGroup>
            <FieldLabel>Title</FieldLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <FieldLabel>Description (optional)</FieldLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this skill accomplish? Used as the AI-facing description."
            />
          </FieldGroup>

          <AuthRow>
            <AuthCheckbox
              type="checkbox"
              checked={authHint.required}
              onChange={(e) =>
                setAuthHint((cur) => ({ ...cur, required: e.target.checked }))
              }
            />
            <AuthLabel>
              <b>Requires authenticated session</b>
              <Hint>
                {authHint.required
                  ? authHint.reason ||
                    'A `## Precondition` block will be emitted telling the agent to load a Browserbase context before running steps.'
                  : 'Skill assumes a public, unauthenticated page. Toggle on if the target site needs login.'}
              </Hint>
            </AuthLabel>
          </AuthRow>

          <SectionLabel>
            Steps ({drafts.filter((d) => !d.skipped).length}/{drafts.length})
          </SectionLabel>
          {!loaded && <Hint>Loading steps…</Hint>}
          {loaded && drafts.length === 0 && <Hint>This recording has no actions.</Hint>}
          {loaded && drafts.some((d) => d.isParam) && (
            <Hint>
              💡 Every typed value is auto-marked as a parameter. Click <b>✓ param</b> to make it
              a literal value instead.
            </Hint>
          )}
          {drafts.map((d, i) => (
            <StepRow key={i} $skipped={d.skipped}>
              <StepTop>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <StepKind $kind={d.action}>{d.action}</StepKind>
                  <Hint>#{i + 1}</Hint>
                </span>
                <SmallBtn
                  $danger
                  onClick={() => updateDraft(i, { skipped: !d.skipped })}
                >
                  {d.skipped ? 'Include' : 'Skip'}
                </SmallBtn>
              </StepTop>
              <Input
                value={d.intent}
                onChange={(e) => updateDraft(i, { intent: e.target.value })}
                placeholder="Intent — what does this step do?"
              />
              {d.action === 'fill' && (
                <ValueRow>
                  <SmallBtn
                    $active={d.isParam}
                    onClick={() =>
                      updateDraft(i, {
                        isParam: !d.isParam,
                        paramName: !d.isParam ? suggestParamName(d.intent, d.raw) : d.paramName,
                      })
                    }
                  >
                    {d.isParam ? '✓ param' : '$ make param'}
                  </SmallBtn>
                  {d.isParam ? (
                    <ParamInput
                      value={d.paramName}
                      placeholder="param name"
                      onChange={(e) => updateDraft(i, { paramName: e.target.value })}
                    />
                  ) : (
                    <ValueInput
                      value={d.value}
                      onChange={(e) => updateDraft(i, { value: e.target.value })}
                      placeholder="literal value"
                    />
                  )}
                </ValueRow>
              )}
              <Hint>{describeRaw(d.raw)}</Hint>
            </StepRow>
          ))}
        </Body>
        <Footer>
          {feedback && <FeedbackText>{feedback}</FeedbackText>}
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn disabled={!canSave || busy !== 'idle'} onClick={onDownload}>
            {busy === 'downloading' ? '…' : '⬇ Download SKILL.md'}
          </Btn>
          <Btn $primary disabled={!canSave || busy !== 'idle'} onClick={onCopy}>
            {busy === 'copying' ? '…' : '📋 Copy SKILL.md'}
          </Btn>
        </Footer>
      </Panel>
    </Overlay>
  );
}

// ─── helpers ───

function buildDrafts(actions: ActionStep[]): DraftStep[] {
  let fillIdx = 0;
  return actions.map((a, idx) => {
    const action = mapAction(a.type);
    let isParam = false;
    let paramName = '';
    if (action === 'fill' && !a.masked && (a.value ?? '').length > 0) {
      // Default-mark every non-masked fill as a parameter. Most RPA flows
      // want every typed value to be variable. User can untoggle to keep literal.
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

function suggestParamNameForFill(a: ActionStep, fillIdx: number): string {
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

function shouldDefaultSkip(a: ActionStep, idx: number, all: ActionStep[]): boolean {
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
  // Pattern: click on a text input → keyDown Enter, with no `change` between.
  // Common artifact when the user clicks then accidentally taps Enter before typing.
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
      // walk past other irrelevant events (keyUp filtered, scrolls etc.)
      if (prev.type === 'click' || prev.type === 'submit' || prev.type === 'navigate') break;
    }
  }

  // Skip a click that immediately follows a `change` on a text input when the
  // click target is a submit-like button — the change's Enter already submitted.
  // Pattern: fill search box → (Enter auto-submit) → click "Go" button (redundant).
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
  // Walk back over previous navigates to find the originating action — if it's a
  // trigger within ~5s, the whole chain is a side effect and should be skipped.
  if (a.type === 'navigate' && idx > 0) {
    for (let i = idx - 1; i >= 0; i--) {
      const prev = all[i];
      if (prev.type === 'navigate') continue; // walk through redirect chain
      const dt = a.timestamp - prev.timestamp;
      const isTrigger =
        prev.type === 'click' ||
        prev.type === 'submit' ||
        prev.type === 'change' || // fill auto-submits via Enter
        (prev.type === 'keyDown' && prev.key === 'Enter');
      if (isTrigger && dt > 0 && dt < 5000) return true;
      break;
    }
  }

  return false;
}

function isTextLikeInput(fp: ActionStep['fingerprint']): boolean {
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

function isSubmitLikeButton(
  fp: ActionStep['fingerprint'],
  selectors: ActionStep['selectors'],
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

function sameTarget(a: ActionStep, b: ActionStep): boolean {
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

function mapAction(t: ActionStep['type']): SkillActionType {
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
  }
}

function defaultIntent(a: ActionStep, action: SkillActionType): string {
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
      return `Press ${a.key}`;
    case 'scroll':
      return `Scroll`;
    case 'submit':
      return aria || text ? `Submit "${aria || text}"` : 'Submit form';
  }
}

function describeRaw(a: ActionStep): string {
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
    default:
      return '';
  }
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
    valueTemplate: d.action === 'fill' ? (d.isParam ? `\${${sanitizeParamName(d.paramName)}}` : d.value) : undefined,
    key: d.raw.key,
    scrollX: d.raw.scrollX,
    scrollY: d.raw.scrollY,
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

function shortUrl(u: string): string {
  try {
    const url = new URL(u);
    const tail = `${url.pathname}${url.hash}`;
    return `${url.host}${tail.length > 60 ? tail.slice(0, 60) + '…' : tail}`;
  } catch {
    return u.length > 80 ? u.slice(0, 80) + '…' : u;
  }
}

function suggestParamName(intent: string, raw: ActionStep): string {
  const text = (raw.fingerprint?.text || raw.fingerprint?.attrs?.['aria-label'] || intent || 'value').toLowerCase();
  const ascii = text.replace(/[^a-z0-9 ]/g, '').trim();
  const words = ascii.split(/\s+/).filter(Boolean).slice(0, 2);
  if (!words.length) return 'value';
  return words.join('_');
}

function sanitizeParamName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'skill'
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

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
  /(^|\.)github\.com$/i, // /login or /oauth paths — caught by path check too
  /(^|\.)gitlab\.com$/i,
  /(^|\.)supabase\.co$/i,
];

const AUTH_PATH_PATTERN = /\/(login|signin|sign-in|sso|oauth|oauth2|authorize|register|signup|sign-up)(\/|$|\?)/i;

/**
 * Distill-time heuristic: did the recording cross any auth-provider signal?
 * If yes, the skill probably needs a pre-authenticated session at replay time.
 *
 * Strong signals (auto-flag as required):
 *   - A `change` step on a password input (masked).
 *   - A `navigate` to a known auth-provider host.
 *   - A `navigate` whose path matches /login|/signin|/oauth|... .
 *
 * Soft signal (suggest, but leave for the user to confirm):
 *   - The starting URL is on a host whose root path is *not* what we're navigating
 *     to (e.g., recording starts at /workspace, /dashboard, /app — common
 *     post-login routes). We don't auto-flag here; the user is the better judge.
 */
function detectAuthSignals(actions: ActionStep[], startUrl: string): SkillAuthHint {
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

  // Deduplicate, cap at 3 distinct reasons for the UI hint.
  const uniqueReasons = [...new Set(reasons)].slice(0, 3);
  return {
    required: true,
    reason: uniqueReasons.join('; '),
    authDomains: domains.size ? [...domains] : undefined,
  };
}

function cryptoRandomId(): string {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}
