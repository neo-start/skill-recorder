import { useEffect, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import rrwebPlayer from 'rrweb-player';
import 'rrweb-player/dist/style.css';
import { getRecording, loadActions, loadEvents } from '@/common/db';
import type { ActionStep, RecordingMeta, eventWithTime } from '@skill-recorder/types';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; margin: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #0f172a;
    color: #e5e7eb;
  }
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.header`
  padding: 12px 16px;
  background: #111827;
  border-bottom: 1px solid #1f2937;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
`;

const Sub = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
`;

const Split = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: auto;
  background: #0f172a;
`;

const Right = styled.aside`
  width: 360px;
  border-left: 1px solid #1f2937;
  background: #0b1220;
  overflow: auto;
`;

const RightTitle = styled.div`
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-bottom: 1px solid #1f2937;
  position: sticky;
  top: 0;
  background: #0b1220;
`;

const StepRow = styled.div`
  padding: 10px 14px;
  border-bottom: 1px solid #1f2937;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StepHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
`;

const StepKind = styled.span<{ $kind: ActionStep['type'] }>`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${(p) => kindColor(p.$kind)};
`;

const StepTime = styled.span`
  font-size: 11px;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
`;

const StepBody = styled.div`
  font-size: 12px;
  color: #d1d5db;
  word-break: break-word;
`;

const StepSelector = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
  word-break: break-all;
`;

const Status = styled.div`
  color: #9ca3af;
  font-size: 13px;
`;

function kindColor(k: ActionStep['type']): string {
  switch (k) {
    case 'navigate':
      return '#60a5fa';
    case 'click':
      return '#f472b6';
    case 'change':
      return '#34d399';
    case 'keyDown':
    case 'keyUp':
      return '#facc15';
    case 'submit':
      return '#fb923c';
    case 'scroll':
      return '#a78bfa';
    default:
      return '#9ca3af';
  }
}

function describe(step: ActionStep): string {
  switch (step.type) {
    case 'navigate':
      return step.navigateUrl ?? step.url;
    case 'click':
      return step.fingerprint?.text || step.fingerprint?.tag || 'element';
    case 'change':
      return `"${step.masked ? '***' : step.value ?? ''}"`;
    case 'keyDown':
    case 'keyUp':
      return step.key ?? '';
    case 'submit':
      return step.fingerprint?.tag || 'form';
    case 'scroll':
      return `(${step.scrollX},${step.scrollY})`;
    default:
      return '';
  }
}

function topSelector(step: ActionStep): string {
  return step.selectors?.[0]?.value ?? '';
}

function fmtRelMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function PlayerPage() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [meta, setMeta] = useState<RecordingMeta | null>(null);
  const [actions, setActions] = useState<ActionStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get('id');
    if (!id) {
      setError('Missing recording id.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      const m = await getRecording(id);
      if (!m) {
        if (!cancelled) {
          setError('Recording not found.');
          setLoading(false);
        }
        return;
      }
      const [events, acts] = await Promise.all([
        loadEvents(id) as Promise<eventWithTime[]>,
        loadActions(id),
      ]);
      if (cancelled) return;
      setMeta(m);
      setActions(acts);
      setLoading(false);

      if (events.length < 2) {
        setError(
          `No visual playback available — this recording captured ${events.length} rrweb events. ` +
            `Capture didn't start (likely because the page was open before the extension reloaded). ` +
            `Make a fresh recording.`,
        );
        return;
      }

      requestAnimationFrame(() => {
        if (!hostRef.current) return;
        try {
          new rrwebPlayer({
            target: hostRef.current,
            props: {
              events,
              autoPlay: false,
              showController: true,
              speedOption: [0.5, 1, 2, 4, 8],
              width: Math.min(window.innerWidth - 360 - 64, m.viewport.width || 1280),
              height: Math.min(window.innerHeight - 160, m.viewport.height || 720),
            },
          });
        } catch (e) {
          setError(`Failed to start player: ${(e as Error).message}`);
        }
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const baseTime = actions[0]?.timestamp ?? meta?.startTime ?? 0;

  return (
    <>
      <GlobalStyle />
      <Layout>
        <Header>
          <Title>{meta?.title || (loading ? 'Loading…' : 'Replay')}</Title>
          {meta && (
            <Sub>
              {meta.url} · {meta.eventCount} events · {actions.length} actions
            </Sub>
          )}
        </Header>
        <Split>
          <Left ref={hostRef}>
            {loading && <Status>Loading…</Status>}
            {error && <Status>{error}</Status>}
          </Left>
          <Right>
            <RightTitle>Action log ({actions.length})</RightTitle>
            {actions.length === 0 && !loading && (
              <StepRow>
                <StepBody>No actions captured.</StepBody>
              </StepRow>
            )}
            {actions.map((step) => (
              <StepRow key={`${step.recordingId}-${step.seq}`}>
                <StepHead>
                  <StepKind $kind={step.type}>{step.type}</StepKind>
                  <StepTime>{fmtRelMs(step.timestamp - baseTime)}</StepTime>
                </StepHead>
                <StepBody>{describe(step)}</StepBody>
                {topSelector(step) && <StepSelector>{topSelector(step)}</StepSelector>}
              </StepRow>
            ))}
          </Right>
        </Split>
      </Layout>
    </>
  );
}
