/**
 * Captures `[bg]` / `[replay]` / `[replay-runner]` console output in the
 * background service worker into a circular buffer. On replay terminal state,
 * dumps the buffer to ~/Downloads/skill-recorder-logs/replay-<...>.json so an
 * external reader (e.g. an AI assistant) can scan recent replays.
 */

interface LogEntry {
  t: number; // ms epoch
  prefix: string; // e.g. '[replay]', '[bg]'
  msg: string; // joined args
}

const BUFFER_LIMIT = 4000;
const FOLDER = 'skill-recorder-logs';

const buffer: LogEntry[] = [];
let installed = false;
const KNOWN_PREFIXES = ['[bg]', '[replay]', '[replay-runner]', '[content]', '[db]'];

export function installDebugCapture(): void {
  if (installed) return;
  installed = true;

  const originalLog = console.log.bind(console);
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);

  console.log = (...args: unknown[]) => {
    capture(args);
    originalLog(...args);
  };
  console.warn = (...args: unknown[]) => {
    capture(args);
    originalWarn(...args);
  };
  console.error = (...args: unknown[]) => {
    capture(args);
    originalError(...args);
  };
}

function capture(args: unknown[]): void {
  if (!args.length) return;
  const first = args[0];
  if (typeof first !== 'string') return;
  if (!KNOWN_PREFIXES.some((p) => first.startsWith(p))) return;
  const prefix = first.split(' ')[0] ?? '';
  const msg = args.map((a) => stringify(a)).join(' ');
  buffer.push({ t: Date.now(), prefix, msg });
  if (buffer.length > BUFFER_LIMIT) buffer.splice(0, buffer.length - BUFFER_LIMIT);
}

function stringify(v: unknown): string {
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Take a snapshot of the buffer since `sinceMs` (default: full buffer). */
export function snapshotSince(sinceMs?: number): LogEntry[] {
  if (sinceMs === undefined) return [...buffer];
  return buffer.filter((e) => e.t >= sinceMs);
}

/** Download a JSON debug bundle for an entire replay session. */
export async function downloadReplayLog(payload: {
  replayId: string;
  recordingId: string;
  status: string;
  startedAt: number;
  endedAt: number;
  finalState: unknown;
}): Promise<void> {
  const log = snapshotSince(payload.startedAt);
  const bundle = {
    ...payload,
    durationMs: payload.endedAt - payload.startedAt,
    capturedAt: new Date(payload.endedAt).toISOString(),
    eventCount: log.length,
    log,
  };
  const json = JSON.stringify(bundle, null, 2);
  // Use data URL — SW has no DOM for URL.createObjectURL.
  const base64 = btoa(unescape(encodeURIComponent(json)));
  const url = `data:application/json;charset=utf-8;base64,${base64}`;
  const ts = new Date(payload.endedAt)
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace(/Z$/, '');
  const filename = `${FOLDER}/replay-${payload.status}-${ts}.json`;
  try {
    await chrome.downloads.download({ url, filename, conflictAction: 'uniquify', saveAs: false });
    console.log('[bg] wrote replay log', filename, `(${log.length} entries)`);
  } catch (err) {
    console.error('[bg] downloadReplayLog failed', err);
  }
}
