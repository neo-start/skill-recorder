import { observer } from 'mobx-react';
import styled, { css, keyframes } from 'styled-components';
import type { RecordingsStore } from '@/stores/recordings';
import { colors } from '../styles';
import { useNow } from '../hooks/useNow';

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const Button = styled.button<{ $recording: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  transition: background-color 0.15s;
  background: ${(p) => (p.$recording ? colors.stop : colors.accent)};

  &:hover {
    background: ${(p) => (p.$recording ? colors.stopHover : colors.accentHover)};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Dot = styled.span<{ $recording: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  ${(p) =>
    p.$recording &&
    css`
      animation: ${pulse} 1.2s infinite;
    `}
`;

const Meta = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${colors.textMuted};
`;

function fmtDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export const RecordButton = observer(({ store }: { store: RecordingsStore }) => {
  const recording = store.isRecording;
  useNow(1000, recording);

  const onClick = () => {
    if (recording) void store.stopRecording();
    else void store.startRecording();
  };

  const elapsed =
    recording && store.recording.startTime ? Date.now() - store.recording.startTime : 0;

  return (
    <>
      <Button $recording={recording} onClick={onClick} disabled={store.isReplaying}>
        <Dot $recording={recording} />
        {recording ? 'STOP' : 'Record'}
      </Button>
      {recording && (
        <Meta>
          <span>{fmtDuration(elapsed)}</span>
          <span>
            {store.recording.eventCount} events · {store.recording.actionCount} actions
          </span>
        </Meta>
      )}
    </>
  );
});
