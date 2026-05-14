import { observer } from 'mobx-react';
import styled from 'styled-components';
import type { RecordingsStore } from '@/stores/recordings';
import type { ActionStep, ReplayStatus } from '@skill-recorder/types';
import { colors } from '../styles';

type Tone = 'info' | 'success' | 'warn' | 'retry';

function toneBg(t: Tone): string {
  if (t === 'success') return 'rgba(16, 185, 129, 0.08)';
  if (t === 'warn') return 'rgba(220, 38, 38, 0.06)';
  if (t === 'retry') return 'rgba(245, 158, 11, 0.08)';
  return '#eff6ff';
}

function toneBorder(t: Tone): string {
  if (t === 'success') return 'rgba(16, 185, 129, 0.4)';
  if (t === 'warn') return colors.accent;
  if (t === 'retry') return 'rgba(245, 158, 11, 0.6)';
  return '#bfdbfe';
}

function toneBar(t: Tone): string {
  if (t === 'success') return '#10b981';
  if (t === 'warn') return colors.accent;
  if (t === 'retry') return '#f59e0b';
  return '#3b82f6';
}

const Wrap = styled.div<{ $tone: Tone }>`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${(p) => toneBg(p.$tone)};
  border: 1px solid ${(p) => toneBorder(p.$tone)};
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  align-items: center;
  gap: 8px;
`;

const RightCluster = styled.span`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Badge = styled.span<{ $tone: Tone }>`
  display: inline-flex;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 999px;
  text-transform: uppercase;
  background: ${(p) => toneBar(p.$tone)};
  color: white;
`;

const StepLine = styled.div`
  font-size: 12px;
  color: ${colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SubLine = styled.div`
  font-size: 11px;
  color: ${colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BarOuter = styled.div`
  height: 4px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 2px;
  overflow: hidden;
`;

const BarInner = styled.div<{ $pct: number; $tone: Tone }>`
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: ${(p) => toneBar(p.$tone)};
  transition: width 0.2s;
`;

const Buttons = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

const Btn = styled.button<{ $variant?: 'primary' | 'danger' }>`
  flex: 1;
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 8px;
  ${(p) =>
    p.$variant === 'primary' &&
    `
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  `}
  ${(p) =>
    p.$variant === 'danger' &&
    `
    color: ${colors.accent};
    &:hover { background: rgba(220, 38, 38, 0.06); border-color: ${colors.accent}; }
  `}
`;

const Reason = styled.div`
  font-size: 12px;
  color: ${colors.accent};
  margin-top: 2px;
  word-break: break-word;
`;

function statusLabel(status: ReplayStatus): string {
  switch (status) {
    case 'starting':
      return 'Starting';
    case 'navigating':
      return 'Navigating';
    case 'waitingForContent':
      return 'Waiting for page';
    case 'executing':
      return 'Replaying';
    case 'verifying':
      return 'Verifying';
    case 'retrying':
      return 'Retrying';
    case 'success':
      return 'Finished';
    case 'failed':
      return 'Paused';
    case 'cancelled':
      return 'Cancelled';
    default:
      return '';
  }
}

function toneFor(status: ReplayStatus): Tone {
  if (status === 'success') return 'success';
  if (status === 'failed') return 'warn';
  if (status === 'retrying') return 'retry';
  return 'info';
}

function describeStep(step: ActionStep | null): string {
  if (!step) return '';
  switch (step.type) {
    case 'navigate':
      return `→ ${step.navigateUrl ?? ''}`;
    case 'click':
      return `Click ${step.fingerprint?.text || step.selectors?.[0]?.value || 'element'}`;
    case 'change': {
      const v = step.masked ? '***' : step.value ?? '';
      return `Type "${v}" into ${step.fingerprint?.text || step.fingerprint?.tag || 'field'}`;
    }
    case 'keyDown':
      return `Key down: ${step.key}`;
    case 'keyUp':
      return `Key up: ${step.key}`;
    case 'submit':
      return 'Submit form';
    case 'scroll':
      return `Scroll to (${step.scrollX},${step.scrollY})`;
    default:
      return step.type;
  }
}

function shortUrl(u: string): string {
  try {
    const url = new URL(u);
    const tail = `${url.pathname}${url.hash}`;
    return `${url.host}${tail.length > 40 ? tail.slice(0, 40) + '…' : tail}`;
  } catch {
    return u.length > 50 ? u.slice(0, 50) + '…' : u;
  }
}

export const ReplayProgress = observer(({ store }: { store: RecordingsStore }) => {
  const r = store.replay;
  if (r.status === 'idle' || !r.recordingId) return null;

  const tone = toneFor(r.status);
  const pct = r.totalSteps ? Math.min(100, Math.round((r.stepIndex / r.totalSteps) * 100)) : 0;
  const showRetryBadge = r.status === 'retrying' || r.currentAttempt > 0;

  let expectationText = '';
  if (r.expectation) {
    if (r.expectation.kind === 'urlChange' && r.expectation.targetUrl) {
      expectationText = `→ URL: ${shortUrl(r.expectation.targetUrl)}`;
    } else if (r.expectation.description) {
      expectationText = `→ ${r.expectation.description}`;
    }
  }

  return (
    <Wrap $tone={tone}>
      <Top>
        <span>{statusLabel(r.status)}</span>
        <RightCluster>
          {showRetryBadge && (
            <Badge $tone="retry">
              Try {r.currentAttempt + 1}/{r.maxAttempts}
            </Badge>
          )}
          <span>
            {r.stepIndex} / {r.totalSteps}
          </span>
        </RightCluster>
      </Top>
      <BarOuter>
        <BarInner $pct={pct} $tone={tone} />
      </BarOuter>
      {r.currentStep && <StepLine>{describeStep(r.currentStep)}</StepLine>}
      {expectationText &&
        (r.status === 'verifying' || r.status === 'executing' || r.status === 'retrying') && (
          <SubLine>{expectationText}</SubLine>
        )}
      {r.failure && <Reason>{r.failure.reason}</Reason>}
      {r.status === 'failed' && (
        <Buttons>
          <Btn $variant="primary" onClick={() => void store.decideReplay('retry')}>
            Retry
          </Btn>
          <Btn onClick={() => void store.decideReplay('skip')}>Skip</Btn>
          <Btn $variant="danger" onClick={() => void store.decideReplay('stop')}>
            Stop
          </Btn>
        </Buttons>
      )}
      {(r.status === 'executing' ||
        r.status === 'navigating' ||
        r.status === 'waitingForContent' ||
        r.status === 'verifying' ||
        r.status === 'retrying' ||
        r.status === 'starting') && (
        <Buttons>
          <Btn $variant="danger" onClick={() => void store.stopReplay()}>
            Stop
          </Btn>
        </Buttons>
      )}
      {(r.status === 'success' || r.status === 'cancelled') && (
        <Buttons>
          <Btn onClick={() => void store.stopReplay()}>Dismiss</Btn>
        </Buttons>
      )}
    </Wrap>
  );
});
