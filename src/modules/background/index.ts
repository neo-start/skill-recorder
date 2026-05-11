import { appendAction, appendChunk, backfillRecordings, putRecording } from '@/common/db';
import {
  PORT_NAME,
  type BackgroundToContent,
  type BackgroundToSidepanel,
  type ContentRole,
  type ContentToBackground,
  type RecordingState,
  type SidepanelToBackground,
} from '@/common/messages';
import type { ActionStep, RecordingMeta, eventWithTime } from '@/common/types';
import { ReplayManager } from './replay-manager';
import { downloadReplayLog, installDebugCapture } from './debug-log';

installDebugCapture();

const FLUSH_INTERVAL_MS = 2000;
const FLUSH_EVENT_THRESHOLD = 500;
const KEEPALIVE_ALARM = 'recorder-keepalive';

interface ActiveRecording {
  meta: RecordingMeta;
  tabId: number;
  port: chrome.runtime.Port | null;
  buffer: eventWithTime[];
  bufferBytes: number;
  seq: number;
  actionSeq: number;
  flushTimer: ReturnType<typeof setInterval> | null;
  lastUrl: string;
}

let activeRec: ActiveRecording | null = null;
let lastError: string | null = null;
const replay = new ReplayManager();

// Replay session bookkeeping for the debug log dump.
let replayDumpInfo: { recordingId: string; startedAt: number } | null = null;
let lastReplayStatus: string = 'idle';

replay.setOnChange(() => {
  const s = replay.state();
  // Track the start of a replay
  if (lastReplayStatus === 'idle' && s.status !== 'idle' && s.recordingId) {
    replayDumpInfo = { recordingId: s.recordingId, startedAt: Date.now() };
  }
  // On terminal transition, dump the debug bundle
  const TERMINAL = new Set(['success', 'failed', 'cancelled']);
  if (
    replayDumpInfo &&
    !TERMINAL.has(lastReplayStatus) &&
    TERMINAL.has(s.status)
  ) {
    void downloadReplayLog({
      replayId: `${replayDumpInfo.recordingId}-${replayDumpInfo.startedAt}`,
      recordingId: replayDumpInfo.recordingId,
      status: s.status,
      startedAt: replayDumpInfo.startedAt,
      endedAt: Date.now(),
      finalState: s,
    });
    replayDumpInfo = null;
  }
  // When user dismisses (status goes back to idle) clear bookkeeping
  if (s.status === 'idle') {
    replayDumpInfo = null;
  }
  lastReplayStatus = s.status;
  broadcastState();
});

/** All currently-connected content-script ports, keyed by tabId. */
const tabPorts = new Map<number, chrome.runtime.Port>();

// ─── lifecycle ───

void backfillRecordings().catch((err) => console.error('[bg] backfill failed', err));

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

chrome.alarms.create(KEEPALIVE_ALARM, { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener(() => {});

// ─── sidepanel messaging ───

chrome.runtime.onMessage.addListener((msg: SidepanelToBackground, _sender, sendResponse) => {
  void (async () => {
    try {
      if (msg.type === 'START_RECORDING') {
        await startRecording();
      } else if (msg.type === 'STOP_RECORDING') {
        await stopRecording('user');
      } else if (msg.type === 'START_REPLAY') {
        await replay.start(msg.recordingId);
      } else if (msg.type === 'STOP_REPLAY') {
        await replay.stop();
      } else if (msg.type === 'REPLAY_DECIDE') {
        replay.decide(msg.decision);
      }
      lastError = null;
    } catch (err) {
      const message = (err as Error).message ?? String(err);
      lastError = message;
      console.error('[bg] message handler', msg.type, err);
    }
    sendResponse(buildStateMessage());
    broadcastState();
  })();
  return true;
});

// ─── port from content scripts ───

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== PORT_NAME) return;
  const tabId = port.sender?.tab?.id;
  if (tabId === undefined) {
    try {
      port.disconnect();
    } catch {
      /* ignore */
    }
    return;
  }
  tabPorts.set(tabId, port);

  port.onMessage.addListener((m: ContentToBackground) => {
    if (m.type === 'HELLO') {
      const role = roleForTab(tabId);
      const reply: BackgroundToContent = { type: 'ROLE', role };
      try {
        port.postMessage(reply);
      } catch {
        return;
      }
      if (role === 'recording' && activeRec && activeRec.tabId === tabId) {
        activeRec.port = port;
        activeRec.lastUrl = m.url;
        activeRec.meta.viewport = m.viewport;
        try {
          port.postMessage({ type: 'START_CAPTURE' } satisfies BackgroundToContent);
        } catch {
          /* ignore */
        }
      } else if (role === 'replaying') {
        replay.onContentConnect(tabId, port);
      }
      return;
    }

    if (m.type === 'RRWEB_EVENT') {
      if (!activeRec || activeRec.tabId !== tabId) return;
      activeRec.buffer.push(m.event);
      activeRec.bufferBytes += approxByteSize(m.event);
      activeRec.meta.eventCount += 1;
      if (activeRec.buffer.length >= FLUSH_EVENT_THRESHOLD) void flush();
      return;
    }

    if (m.type === 'ACTION') {
      if (!activeRec || activeRec.tabId !== tabId) return;
      const step: ActionStep = {
        ...m.step,
        recordingId: activeRec.meta.id,
        seq: activeRec.actionSeq++,
      };
      activeRec.meta.actionCount += 1;
      void appendAction(step);
      void putRecording({ ...activeRec.meta });
      broadcastState();
      return;
    }

    if (m.type === 'STEP_RESULT') {
      replay.onStepResult(tabId, m.stepIndex, m.attempt, m.ok, m.phase, m.reason);
      return;
    }
  });

  port.onDisconnect.addListener(() => {
    if (tabPorts.get(tabId) === port) tabPorts.delete(tabId);
    if (activeRec && activeRec.port === port) activeRec.port = null;
    replay.onContentDisconnect(tabId);
  });
});

// ─── tab + navigation events ───

chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeRec && activeRec.tabId === tabId) {
    void stopRecording('tab-closed');
  }
  tabPorts.delete(tabId);
  replay.onTabRemoved(tabId);
});

function handleNavEvent(tabId: number, frameId: number, url: string): void {
  if (frameId !== 0) return;
  // Recording side: log navigate actions.
  if (activeRec && activeRec.tabId === tabId && url !== activeRec.lastUrl) {
    recordNavigateAction(url);
  }
  // Replay side: notify URL-wait machinery.
  if (replay.isReplayingTab(tabId)) {
    replay.onTabUrlChanged(tabId, url);
  }
}

chrome.webNavigation.onCommitted.addListener((d) => handleNavEvent(d.tabId, d.frameId, d.url));
chrome.webNavigation.onHistoryStateUpdated.addListener((d) => handleNavEvent(d.tabId, d.frameId, d.url));
chrome.webNavigation.onReferenceFragmentUpdated.addListener((d) => handleNavEvent(d.tabId, d.frameId, d.url));

function recordNavigateAction(url: string): void {
  if (!activeRec) return;
  activeRec.lastUrl = url;
  const step: ActionStep = {
    recordingId: activeRec.meta.id,
    seq: activeRec.actionSeq++,
    type: 'navigate',
    timestamp: Date.now(),
    url,
    navigateUrl: url,
  };
  activeRec.meta.actionCount += 1;
  void appendAction(step);
  void putRecording({ ...activeRec.meta });
  broadcastState();
}

// ─── recording lifecycle ───

async function startRecording(): Promise<void> {
  if (activeRec) return;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || tab.id === undefined) throw new Error('no active tab');
  if (tab.url && /^(chrome|edge|about|chrome-extension):/.test(tab.url)) {
    throw new Error('cannot record this page (special URL)');
  }

  const meta: RecordingMeta = {
    id: cryptoRandomId(),
    title: tab.title || 'Untitled',
    url: tab.url || '',
    startTime: Date.now(),
    endTime: null,
    eventCount: 0,
    actionCount: 0,
    byteSize: 0,
    status: 'recording',
    viewport: { width: tab.width || 0, height: tab.height || 0 },
  };
  await putRecording(meta);

  activeRec = {
    meta,
    tabId: tab.id,
    port: null,
    buffer: [],
    bufferBytes: 0,
    seq: 0,
    actionSeq: 0,
    flushTimer: null,
    lastUrl: tab.url || '',
  };

  // initial navigate so replay knows where to start
  recordNavigateAction(tab.url || '');

  let attached = false;
  const existing = tabPorts.get(tab.id);
  if (existing) {
    activeRec.port = existing;
    try {
      existing.postMessage({ type: 'ROLE', role: 'recording' } satisfies BackgroundToContent);
      existing.postMessage({ type: 'START_CAPTURE' } satisfies BackgroundToContent);
      attached = true;
      console.log('[bg] using existing content port for tab', tab.id);
    } catch (err) {
      console.warn('[bg] existing port broken, will re-inject', err);
      activeRec.port = null;
      tabPorts.delete(tab.id);
    }
  }

  // No live content (orphaned by extension reload, or tab was open before install).
  // Inject the content script ourselves; its HELLO will pick up role='recording'.
  if (!attached) {
    try {
      await injectContentScript(tab.id);
      console.log('[bg] injected content script into tab', tab.id);
    } catch (err) {
      console.error('[bg] inject failed', err);
      // Roll back: the recording would be empty otherwise.
      activeRec = null;
      throw new Error(`couldn't attach to this page: ${(err as Error).message}`);
    }
  }

  activeRec.flushTimer = setInterval(() => {
    void flush();
  }, FLUSH_INTERVAL_MS);

  broadcastState();
}

async function injectContentScript(tabId: number): Promise<void> {
  const cs = chrome.runtime.getManifest().content_scripts;
  const files = cs?.[0]?.js ?? [];
  if (!files.length) throw new Error('no content_scripts file in manifest');
  await chrome.scripting.executeScript({
    target: { tabId, allFrames: false },
    files,
  });
}

async function stopRecording(_reason: string): Promise<void> {
  if (!activeRec) return;
  const a = activeRec;
  activeRec = null;

  if (a.flushTimer) clearInterval(a.flushTimer);
  if (a.port) {
    try {
      a.port.postMessage({ type: 'STOP_CAPTURE' } satisfies BackgroundToContent);
    } catch {
      /* ignore */
    }
  }

  if (a.buffer.length) {
    await appendChunk(a.meta.id, a.seq, a.buffer);
    a.meta.byteSize += a.bufferBytes;
    a.seq += 1;
  }

  a.meta.endTime = Date.now();
  a.meta.status = 'completed';
  await putRecording(a.meta);

  broadcastState();
  broadcastListChanged();
}

async function flush(): Promise<void> {
  if (!activeRec || !activeRec.buffer.length) return;
  const events = activeRec.buffer;
  const bytes = activeRec.bufferBytes;
  const seq = activeRec.seq;
  activeRec.buffer = [];
  activeRec.bufferBytes = 0;
  activeRec.seq += 1;
  await appendChunk(activeRec.meta.id, seq, events);
  activeRec.meta.byteSize += bytes;
  await putRecording({ ...activeRec.meta });
  broadcastState();
}

// ─── helpers ───

function roleForTab(tabId: number): ContentRole {
  if (activeRec && activeRec.tabId === tabId) return 'recording';
  if (replay.isReplayingTab(tabId)) return 'replaying';
  return 'idle';
}

function buildStateMessage(): BackgroundToSidepanel {
  const recState: RecordingState = {
    recordingId: activeRec ? activeRec.meta.id : null,
    startTime: activeRec ? activeRec.meta.startTime : null,
    eventCount: activeRec ? activeRec.meta.eventCount : 0,
    actionCount: activeRec ? activeRec.meta.actionCount : 0,
  };
  return { type: 'STATE', recording: recState, replay: replay.state(), error: lastError };
}

function broadcastState(): void {
  void chrome.runtime.sendMessage(buildStateMessage()).catch(() => {});
}

function broadcastListChanged(): void {
  void chrome.runtime
    .sendMessage({ type: 'RECORDINGS_CHANGED' } satisfies BackgroundToSidepanel)
    .catch(() => {});
}

function approxByteSize(ev: eventWithTime): number {
  try {
    return JSON.stringify(ev).length;
  } catch {
    return 0;
  }
}

function cryptoRandomId(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export {};
