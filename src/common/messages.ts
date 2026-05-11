import type { ActionStep, Expectation, ReplayState, eventWithTime } from './types';

export const PORT_NAME = 'recorder';

export type ContentRole = 'idle' | 'recording' | 'replaying';

// ─── Sidepanel ⇄ Background ───

export type SidepanelToBackground =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'GET_STATE' }
  | { type: 'START_REPLAY'; recordingId: string }
  | { type: 'STOP_REPLAY' }
  | { type: 'REPLAY_DECIDE'; decision: 'retry' | 'skip' | 'stop' };

export interface RecordingState {
  recordingId: string | null;
  startTime: number | null;
  eventCount: number;
  actionCount: number;
}

export type BackgroundToSidepanel =
  | { type: 'STATE'; recording: RecordingState; replay: ReplayState; error: string | null }
  | { type: 'RECORDINGS_CHANGED' };

// ─── Content ⇄ Background (via long-lived port) ───

export type StepResultPhase = 'execute' | 'verify';

export type ContentToBackground =
  | { type: 'HELLO'; url: string; title: string; viewport: { width: number; height: number } }
  | { type: 'RRWEB_EVENT'; event: eventWithTime }
  | { type: 'ACTION'; step: Omit<ActionStep, 'id' | 'recordingId' | 'seq'> }
  | {
      type: 'STEP_RESULT';
      stepIndex: number;
      attempt: number;
      ok: boolean;
      phase: StepResultPhase;
      reason?: string;
    };

export type BackgroundToContent =
  | { type: 'ROLE'; role: ContentRole }
  | { type: 'START_CAPTURE' }
  | { type: 'STOP_CAPTURE' }
  | {
      type: 'EXECUTE_STEP';
      step: ActionStep;
      stepIndex: number;
      attempt: number;
      expectation: Expectation;
      verifyTimeoutMs: number;
    };
