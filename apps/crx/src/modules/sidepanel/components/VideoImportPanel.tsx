import { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { Skill } from '@skill-recorder/types';
import { autoSaveSkillMarkdown } from '@/common/skill-export';
import { skillsStore } from '@/stores/skills';
import {
  DEFAULT_API_BASE_URL,
  DistillRequestError,
  distillVideoUrl,
  getApiBaseUrl,
  setApiBaseUrl,
  type DistillResponse,
} from '@/common/distill-client';
import { colors } from '../styles';

type Phase = 'idle' | 'loading' | 'preview' | 'saved';

const Panel = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Input = styled.input`
  width: 100%;
  padding: 9px 10px;
  font-size: 13px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: ${colors.surface};
  color: ${colors.text};
  &:focus {
    outline: none;
    border-color: ${colors.accent};
  }
`;

const PrimaryButton = styled.button`
  background: ${colors.accent};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  &:disabled {
    background: ${colors.textMuted};
    cursor: default;
  }
  &:hover:not(:disabled) {
    background: ${colors.accentHover};
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  border: 1px solid ${colors.border};
  color: ${colors.text};
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  &:hover {
    background: ${colors.bg};
  }
`;

const StatusBlock = styled.div<{ $tone: 'info' | 'error' | 'success' }>`
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.5;
  background: ${(p) =>
    p.$tone === 'error'
      ? 'rgba(220, 38, 38, 0.08)'
      : p.$tone === 'success'
        ? 'rgba(22, 163, 74, 0.08)'
        : 'rgba(59, 130, 246, 0.08)'};
  border: 1px solid
    ${(p) =>
      p.$tone === 'error'
        ? colors.accent
        : p.$tone === 'success'
          ? '#16a34a'
          : '#3b82f6'};
  color: ${(p) =>
    p.$tone === 'error' ? colors.accent : p.$tone === 'success' ? '#15803d' : '#1d4ed8'};
`;

const PreviewCard = styled.div`
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PreviewTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
`;

const PreviewMeta = styled.div`
  font-size: 11px;
  color: ${colors.textMuted};
`;

const PreviewDesc = styled.div`
  font-size: 12px;
  color: ${colors.text};
`;

const StepBadges = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $kind: 'guidance' | 'action' }>`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${(p) => (p.$kind === 'guidance' ? '#fef3c7' : '#dbeafe')};
  color: ${(p) => (p.$kind === 'guidance' ? '#92400e' : '#1e40af')};
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ApiBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: ${colors.textMuted};
`;

const ApiInput = styled(Input)`
  font-size: 11px;
  padding: 5px 8px;
`;

export const VideoImportPanel = () => {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DistillResponse | null>(null);
  const [savedFilename, setSavedFilename] = useState<string | null>(null);

  const [apiBaseUrl, setApiBaseUrlLocal] = useState<string>(DEFAULT_API_BASE_URL);
  const [editingApi, setEditingApi] = useState(false);

  useEffect(() => {
    void getApiBaseUrl().then(setApiBaseUrlLocal);
  }, []);

  const onDistill = async (): Promise<void> => {
    setError(null);
    setResult(null);
    setSavedFilename(null);
    setPhase('loading');
    try {
      const res = await distillVideoUrl(url.trim());
      setResult(res);
      setPhase('preview');
    } catch (e) {
      const msg =
        e instanceof DistillRequestError
          ? `${e.message}${e.retryAfterSec ? ` (retry in ${e.retryAfterSec}s)` : ''}`
          : (e as Error).message;
      setError(msg);
      setPhase('idle');
    }
  };

  const onSave = async (): Promise<void> => {
    if (!result) return;
    try {
      const skill: Skill = result.skill;
      await skillsStore.save(skill);
      const filename = await autoSaveSkillMarkdown(skill);
      setSavedFilename(filename);
      setPhase('saved');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onCommitApi = async (next: string): Promise<void> => {
    const trimmed = next.trim() || DEFAULT_API_BASE_URL;
    await setApiBaseUrl(trimmed);
    setApiBaseUrlLocal(trimmed);
    setEditingApi(false);
  };

  return (
    <Panel>
      <Label htmlFor="video-url">YouTube URL</Label>
      <Input
        id="video-url"
        type="url"
        placeholder="https://www.youtube.com/watch?v=…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={phase === 'loading'}
      />
      <ActionRow>
        <PrimaryButton onClick={onDistill} disabled={!url.trim() || phase === 'loading'}>
          {phase === 'loading' ? 'Distilling…' : 'Distill skill'}
        </PrimaryButton>
      </ActionRow>

      {phase === 'loading' && (
        <StatusBlock $tone="info">
          Fetching transcript and asking the model to distill — typically 10–30 seconds.
        </StatusBlock>
      )}

      {error && <StatusBlock $tone="error">{error}</StatusBlock>}

      {result && phase === 'preview' && <SkillPreview result={result} onSave={onSave} />}

      {result && phase === 'saved' && savedFilename && (
        <StatusBlock $tone="success">
          Saved <strong>{result.skill.title}</strong>. SKILL.md downloaded to{' '}
          <code>{savedFilename}</code>.
        </StatusBlock>
      )}

      <ApiBar>
        {editingApi ? (
          <ApiBarEditor initial={apiBaseUrl} onCommit={onCommitApi} onCancel={() => setEditingApi(false)} />
        ) : (
          <>
            <span>
              API: <code>{apiBaseUrl}</code>
            </span>
            <SecondaryButton onClick={() => setEditingApi(true)}>Change</SecondaryButton>
          </>
        )}
      </ApiBar>
    </Panel>
  );
};

interface SkillPreviewProps {
  result: DistillResponse;
  onSave: () => void;
}

const SkillPreview = ({ result, onSave }: SkillPreviewProps) => {
  const { skill, videoMeta } = result;
  const counts = skill.steps.reduce(
    (acc, s) => {
      if (s.action === 'guidance') acc.guidance += 1;
      else acc.action += 1;
      return acc;
    },
    { guidance: 0, action: 0 },
  );
  return (
    <PreviewCard>
      <PreviewTitle>{skill.title}</PreviewTitle>
      <PreviewMeta>
        From “{videoMeta.title}” · {videoMeta.channel} · {Math.round(videoMeta.durationSec / 60)} min
      </PreviewMeta>
      <PreviewDesc>{skill.description}</PreviewDesc>
      <StepBadges>
        {counts.action > 0 && <Badge $kind="action">{counts.action} action</Badge>}
        {counts.guidance > 0 && <Badge $kind="guidance">{counts.guidance} guidance</Badge>}
        {skill.parameters.length > 0 && (
          <Badge $kind="action">{skill.parameters.length} parameter</Badge>
        )}
      </StepBadges>
      {result.cached && <PreviewMeta>Served from cache.</PreviewMeta>}
      <ActionRow>
        <PrimaryButton onClick={onSave}>Save &amp; download SKILL.md</PrimaryButton>
      </ActionRow>
    </PreviewCard>
  );
};

interface ApiBarEditorProps {
  initial: string;
  onCommit: (next: string) => void | Promise<void>;
  onCancel: () => void;
}

const ApiBarEditor = ({ initial, onCommit, onCancel }: ApiBarEditorProps) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <ApiInput
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void onCommit(value);
          if (e.key === 'Escape') onCancel();
        }}
        placeholder={DEFAULT_API_BASE_URL}
      />
      <SecondaryButton onClick={() => void onCommit(value)}>Save</SecondaryButton>
      <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
    </>
  );
};
