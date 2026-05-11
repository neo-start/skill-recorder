import { useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import type { RecordingsStore } from '@/stores/recordings';
import type { RecordingMeta } from '@/common/types';
import { colors } from '../styles';
import { SaveAsSkillDialog } from './SaveAsSkillDialog';

const Wrap = styled.div`
  padding: 12px 16px 24px;
`;

const Empty = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: ${colors.textMuted};
  font-size: 13px;
`;

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
`;

const Title = styled.span`
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const Duration = styled.span`
  font-size: 12px;
  color: ${colors.textMuted};
  font-variant-numeric: tabular-nums;
`;

const Sub = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${colors.textMuted};
`;

const Url = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

const ActionBtn = styled.button<{ $variant?: 'primary' | 'subtle' | 'danger' }>`
  flex: 1;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background-color 0.15s, border-color 0.15s;

  ${(p) =>
    p.$variant === 'primary' &&
    `
    background: ${colors.accent};
    color: white;
    border-color: ${colors.accent};
    &:hover { background: ${colors.accentHover}; border-color: ${colors.accentHover}; }
  `}

  ${(p) =>
    p.$variant === 'danger' &&
    `
    color: ${colors.accent};
    &:hover { background: rgba(220, 38, 38, 0.06); border-color: ${colors.accent}; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function fmtDuration(start: number, end: number | null): string {
  if (!end) return '—';
  const s = Math.floor((end - start) / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function fmtAgo(t: number): string {
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(t).toLocaleDateString();
}

export const RecordingList = observer(({ store }: { store: RecordingsStore }) => {
  if (!store.recordings.length) {
    return (
      <Empty>
        No recordings yet.
        <br />
        Press Record to capture the current page.
      </Empty>
    );
  }
  return (
    <Wrap>
      {store.recordings.map((r) => (
        <Row key={r.id} rec={r} store={store} />
      ))}
    </Wrap>
  );
});

const Row = observer(({ rec, store }: { rec: RecordingMeta; store: RecordingsStore }) => {
  const [saveDialog, setSaveDialog] = useState(false);

  const onReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    void store.startReplay(rec.id);
  };
  const onView = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.openPlayer(rec.id);
  };
  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    void store.remove(rec.id);
  };
  const onSaveSkill = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaveDialog(true);
  };

  const replayDisabled =
    store.isRecording || store.isReplaying || rec.status !== 'completed' || rec.actionCount === 0;
  // Allow opening the dialog even with 0 actions (lets the user see why the recording is empty).
  const skillDisabled = rec.status !== 'completed';

  return (
    <Card>
      <Top>
        <Title>{rec.title || 'Untitled'}</Title>
        <Duration>{fmtDuration(rec.startTime, rec.endTime)}</Duration>
      </Top>
      <Sub>
        <Url>{rec.url.replace(/^https?:\/\//, '')}</Url>
        <span>{fmtAgo(rec.startTime)}</span>
      </Sub>
      <Sub>
        <span>
          {rec.eventCount} events · {rec.actionCount} actions
        </span>
      </Sub>
      <Actions>
        <ActionBtn
          $variant="primary"
          onClick={onSaveSkill}
          disabled={skillDisabled}
          title="Distill this recording into a reusable skill"
        >
          ✨ Save as Skill
        </ActionBtn>
        <ActionBtn onClick={onReplay} disabled={replayDisabled} title="Auto-replay">
          ▶ Replay
        </ActionBtn>
      </Actions>
      <Actions>
        <ActionBtn onClick={onView}>View</ActionBtn>
        <ActionBtn $variant="danger" onClick={onDelete}>
          Delete
        </ActionBtn>
      </Actions>
      {saveDialog && (
        <SaveAsSkillDialog recording={rec} onClose={() => setSaveDialog(false)} />
      )}
    </Card>
  );
});
