// Drive the recorder via the sidepanel page (which is a real extension page
// with chrome.runtime access). Reads action results out of IndexedDB.
//
// We do NOT poll mobx stores directly — the public surface for "start
// recording" is `chrome.runtime.sendMessage({type: 'START_RECORDING'})`,
// same call path the sidepanel button uses, so tests stay close to the
// real user flow.

import type { Page } from '@playwright/test';
import type { ActionStep, RecordingMeta } from '@skill-recorder/types';

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

/**
 * Start a recording. Returns once the background has accepted the request.
 * Subsequent navigations on `targetPage` will be captured.
 */
export async function startRecording(sidepanel: Page): Promise<void> {
  await send(sidepanel, { type: 'START_RECORDING' });
}

/** Stop the active recording. Returns once flushed. */
export async function stopRecording(sidepanel: Page): Promise<void> {
  await send(sidepanel, { type: 'STOP_RECORDING' });
  // Give the background a beat to flush buffered chunks + persist the meta.
  await new Promise((r) => setTimeout(r, 150));
}

/**
 * Return the most recent completed recording. Pass an `after` timestamp
 * to ignore stale recordings from prior tests.
 *
 * Talks to IndexedDB directly via raw `indexedDB.open(...)` — avoids
 * depending on the extension's bundled `db.ts` module which isn't
 * importable from the sidepanel page context post-build.
 */
export async function latestRecording(sidepanel: Page, after = 0): Promise<RecordingMeta | null> {
  return sidepanel.evaluate(async (afterTs) => {
    const db = await openDB();
    return new Promise<RecordingMeta | null>((resolve, reject) => {
      const tx = db.transaction('recordings', 'readonly');
      const req = tx.objectStore('recordings').index('by-startTime').openCursor(null, 'prev');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const cur = req.result;
        if (!cur) return resolve(null);
        const meta = cur.value as RecordingMeta;
        if (meta.startTime < afterTs) return resolve(null);
        resolve(meta);
      };
    });

    function openDB(): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open('recorder', 3);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result);
      });
    }
  }, after);
}

/** Load all ActionSteps for a recording, in record order. */
export async function loadActions(sidepanel: Page, recordingId: string): Promise<ActionStep[]> {
  return sidepanel.evaluate(async (id) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('recorder', 3);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
    return new Promise<ActionStep[]>((resolve, reject) => {
      const tx = db.transaction('actions', 'readonly');
      const idx = tx.objectStore('actions').index('by-recording');
      const range = IDBKeyRange.bound([id, -Infinity], [id, Infinity]);
      const out: ActionStep[] = [];
      const req = idx.openCursor(range);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const cur = req.result;
        if (!cur) return resolve(out);
        out.push(cur.value as ActionStep);
        cur.continue();
      };
    });
  }, recordingId);
}
