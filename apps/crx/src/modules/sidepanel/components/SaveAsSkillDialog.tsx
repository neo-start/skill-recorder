import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { loadActions } from '@/common/db';
import { renderSkillAsMarkdown } from '@skill-recorder/render';
import { autoSaveSkillMarkdown } from '@/common/skill-export';
import type { RecordingMeta, Skill, SkillActionType, SkillAuthHint } from '@skill-recorder/types';
import {
  buildDrafts,
  buildSkill as buildSkillPure,
  describeRaw,
  detectAuthSignals,
  sanitizeParamName,
  suggestParamName,
  type DraftStep,
} from '@/common/skill-build';
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
    case 'drag':
      return '#ef4444';
    case 'copy':
      return '#0ea5e9';
    case 'paste':
      return '#22d3ee';
    case 'switchTab':
      return '#fbbf24';
    default:
      return '#9ca3af';
  }
}

interface Props {
  recording: RecordingMeta;
  onClose: () => void;
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

  const canSave =
    loaded &&
    title.trim().length > 0 &&
    drafts.some((d) => !d.skipped) &&
    drafts.every((d) => !d.isParam || sanitizeParamName(d.paramName).length > 0);

  const updateDraft = (i: number, patch: Partial<DraftStep>) => {
    setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };

  const buildSkill = (): Skill =>
    buildSkillPure({ title, description, drafts, recording, authHint });

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

