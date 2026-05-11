import { record } from 'rrweb';
import {
  PORT_NAME,
  type BackgroundToContent,
  type ContentRole,
  type ContentToBackground,
} from '@/common/messages';
import type { eventWithTime } from '@/common/types';
import { attachActionRecorder } from './action-recorder';
import { executeStep } from './replay-runner';
import { verifyExpectation } from './verifier';
import type { ActionStep, Expectation } from '@/common/types';

let stopRrweb: (() => void) | null = null;
let detachActions: (() => void) | null = null;

let port: chrome.runtime.Port | null = null;
let attempts = 0;

bootstrap();

function bootstrap(): void {
  if (port) return;
  try {
    port = chrome.runtime.connect({ name: PORT_NAME });
  } catch {
    scheduleReconnect();
    return;
  }
  attempts = 0;

  port.onMessage.addListener((msg: BackgroundToContent) => {
    if (msg.type === 'ROLE') {
      handleRole(msg.role);
    } else if (msg.type === 'START_CAPTURE') {
      startCapture();
    } else if (msg.type === 'STOP_CAPTURE') {
      teardown();
      try {
        port?.disconnect();
      } catch {
        /* ignore */
      }
      port = null;
    } else if (msg.type === 'EXECUTE_STEP') {
      void executeAndReport(msg.step, msg.stepIndex, msg.attempt, msg.expectation, msg.verifyTimeoutMs);
    }
  });

  port.onDisconnect.addListener(() => {
    port = null;
    teardown();
    scheduleReconnect();
  });

  send({
    type: 'HELLO',
    url: location.href,
    title: document.title,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  });
}

function scheduleReconnect(): void {
  attempts += 1;
  const delay = Math.min(1000 * 2 ** attempts, 10000);
  setTimeout(bootstrap, delay);
}

function handleRole(role: ContentRole): void {
  if (role === 'recording') {
    startCapture();
  } else if (role === 'replaying') {
    // background will dispatch EXECUTE_STEP messages; nothing to attach.
  } else {
    teardown();
  }
}

function startCapture(): void {
  if (!stopRrweb) {
    stopRrweb =
      record({
        emit(event: eventWithTime) {
          send({ type: 'RRWEB_EVENT', event });
        },
        // PostHog-style defaults — see posthog/frontend/src/toolbar/toolbarPosthogJS.ts:29-36
        blockClass: 'rec-block',
        blockSelector: '[data-rec-block]',
        maskAllInputs: true,
        maskInputOptions: { password: true },
        slimDOMOptions: {
          script: true,
          comment: true,
          headFavicon: true,
          headMetaSocial: true,
          headMetaRobots: true,
        },
        sampling: {
          mousemove: 50,
          scroll: 150,
          media: 800,
          input: 'last',
        },
        checkoutEveryNms: 60_000,
        recordCanvas: false,
      }) ?? null;
  }
  if (!detachActions) {
    detachActions = attachActionRecorder(send);
  }
}

function teardown(): void {
  if (stopRrweb) {
    try {
      stopRrweb();
    } catch {
      /* ignore */
    }
    stopRrweb = null;
  }
  if (detachActions) {
    try {
      detachActions();
    } catch {
      /* ignore */
    }
    detachActions = null;
  }
}

async function executeAndReport(
  step: ActionStep,
  stepIndex: number,
  attempt: number,
  expectation: Expectation,
  verifyTimeoutMs: number,
): Promise<void> {
  const exec = await executeStep(step, attempt);
  if (!exec.ok) {
    send({
      type: 'STEP_RESULT',
      stepIndex,
      attempt,
      ok: false,
      phase: 'execute',
      reason: exec.reason,
    });
    return;
  }

  const verify = await verifyExpectation(expectation, step, verifyTimeoutMs);
  send({
    type: 'STEP_RESULT',
    stepIndex,
    attempt,
    ok: verify.ok,
    phase: 'verify',
    reason: verify.reason,
  });
}

function send(msg: ContentToBackground): void {
  if (!port) return;
  try {
    port.postMessage(msg);
  } catch {
    port = null;
  }
}

window.addEventListener('beforeunload', () => teardown());
