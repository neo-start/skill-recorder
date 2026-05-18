// Drive replay end-to-end. Polls the background SW's state until terminal.

import type { Page } from '@playwright/test';
import type { ReplayStatus } from '@skill-recorder/types';

const TERMINAL: ReplayStatus[] = ['success', 'failed', 'cancelled'];

async function send(sidepanel: Page, msg: { type: string; [k: string]: unknown }): Promise<unknown> {
  return sidepanel.evaluate(
    (m) =>
      new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(m, (resp: unknown) => {
            const err = chrome.runtime.lastError;
            if (err) reject(new Error(err.message));
            else resolve(resp);
          });
        } catch (e) {
          reject(e as Error);
        }
      }),
    msg,
  );
}

/** Start replay of an existing recording; returns once accepted. */
export async function startReplay(sidepanel: Page, recordingId: string): Promise<void> {
  await send(sidepanel, { type: 'START_REPLAY', recordingId });
}

export interface ReplayResult {
  status: ReplayStatus;
  totalSteps: number;
  stepIndex: number;
  failure: { stepIndex: number; reason: string } | null;
}

/**
 * Poll replay state until terminal. The background broadcasts state changes
 * via chrome.runtime.sendMessage(buildStateMessage()) but the simplest poll
 * is to ping it for the current state every interval.
 *
 * The background's onMessage handler always responds with buildStateMessage()
 * regardless of input — so any sendMessage call returns the current state.
 */
export async function waitForReplayTerminal(
  sidepanel: Page,
  opts: { pollMs?: number; timeoutMs?: number } = {},
): Promise<ReplayResult> {
  const pollMs = opts.pollMs ?? 250;
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const state = (await send(sidepanel, { type: 'NO_OP' })) as
      | { replay?: ReplayResult & { recordingId: string | null } }
      | undefined;
    const replay = state?.replay;
    if (replay && TERMINAL.includes(replay.status)) {
      return {
        status: replay.status,
        totalSteps: replay.totalSteps,
        stepIndex: replay.stepIndex,
        failure: replay.failure,
      };
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error(`Replay did not reach terminal state within ${timeoutMs}ms`);
}

export async function stopReplay(sidepanel: Page): Promise<void> {
  await send(sidepanel, { type: 'STOP_REPLAY' });
}
