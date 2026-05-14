import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  ActionStep,
  RecordingChunk,
  RecordingMeta,
  Skill,
  eventWithTime,
} from '@skill-recorder/types';

interface RecorderDB extends DBSchema {
  recordings: {
    key: string;
    value: RecordingMeta;
    indexes: { 'by-startTime': number };
  };
  chunks: {
    key: number;
    value: RecordingChunk;
    indexes: { 'by-recording': [string, number] };
  };
  actions: {
    key: number;
    value: ActionStep;
    indexes: { 'by-recording': [string, number] };
  };
  skills: {
    key: string;
    value: Skill;
    indexes: { 'by-createdAt': number };
  };
}

const DB_NAME = 'recorder';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<RecorderDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<RecorderDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RecorderDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const recordings = db.createObjectStore('recordings', { keyPath: 'id' });
          recordings.createIndex('by-startTime', 'startTime');

          const chunks = db.createObjectStore('chunks', { keyPath: 'id', autoIncrement: true });
          chunks.createIndex('by-recording', ['recordingId', 'seq']);
        }
        if (oldVersion < 2) {
          const actions = db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
          actions.createIndex('by-recording', ['recordingId', 'seq']);
        }
        if (oldVersion < 3) {
          const skills = db.createObjectStore('skills', { keyPath: 'id' });
          skills.createIndex('by-createdAt', 'createdAt');
        }
      },
      blocked() {
        console.warn('[db] upgrade blocked by another connection');
      },
      terminated() {
        console.warn('[db] connection terminated');
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

/** Backfill actionCount=0 on legacy v0.1 records. Idempotent. */
export async function backfillRecordings(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('recordings', 'readwrite');
  let cursor = await tx.store.openCursor();
  while (cursor) {
    const r = cursor.value;
    if (r.actionCount === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r as any).actionCount = 0;
      await cursor.update(r);
    }
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function putRecording(meta: RecordingMeta): Promise<void> {
  const db = await getDB();
  await db.put('recordings', meta);
}

export async function getRecording(id: string): Promise<RecordingMeta | undefined> {
  const db = await getDB();
  return db.get('recordings', id);
}

export async function listRecordings(): Promise<RecordingMeta[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('recordings', 'by-startTime');
  return all.reverse();
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['recordings', 'chunks', 'actions'], 'readwrite');
  await tx.objectStore('recordings').delete(id);
  for (const storeName of ['chunks', 'actions'] as const) {
    const idx = tx.objectStore(storeName).index('by-recording');
    let cursor = await idx.openCursor(IDBKeyRange.bound([id, -Infinity], [id, Infinity]));
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
  }
  await tx.done;
}

export async function appendChunk(
  recordingId: string,
  seq: number,
  events: eventWithTime[],
): Promise<void> {
  if (!events.length) return;
  const db = await getDB();
  await db.add('chunks', { recordingId, seq, events });
}

export async function loadEvents(recordingId: string): Promise<eventWithTime[]> {
  const db = await getDB();
  const idx = db.transaction('chunks').store.index('by-recording');
  const out: eventWithTime[] = [];
  let cursor = await idx.openCursor(
    IDBKeyRange.bound([recordingId, -Infinity], [recordingId, Infinity]),
  );
  while (cursor) {
    out.push(...cursor.value.events);
    cursor = await cursor.continue();
  }
  return out;
}

export async function appendAction(step: ActionStep): Promise<void> {
  const db = await getDB();
  await db.add('actions', step);
}

export async function loadActions(recordingId: string): Promise<ActionStep[]> {
  const db = await getDB();
  const idx = db.transaction('actions').store.index('by-recording');
  const out: ActionStep[] = [];
  let cursor = await idx.openCursor(
    IDBKeyRange.bound([recordingId, -Infinity], [recordingId, Infinity]),
  );
  while (cursor) {
    out.push(cursor.value);
    cursor = await cursor.continue();
  }
  return out;
}

// ─── Skills ───

export async function putSkill(skill: Skill): Promise<void> {
  const db = await getDB();
  await db.put('skills', skill);
}

export async function getSkill(id: string): Promise<Skill | undefined> {
  const db = await getDB();
  return db.get('skills', id);
}

export async function listSkills(): Promise<Skill[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('skills', 'by-createdAt');
  return all.reverse();
}

export async function deleteSkill(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('skills', id);
}
