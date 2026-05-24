import type { Server } from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DistillError, type Backend } from '@skill-recorder/from-video';
import { startDistillApp } from './distill-app';

// Stub distillVideoToSkill entirely — the HTTP layer is what we're testing,
// and the orchestration unit (network → backend → wrap) is covered by
// packages/skill-from-video/src/index.test.ts.
vi.mock('@skill-recorder/from-video', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@skill-recorder/from-video')>();
  return {
    ...actual,
    distillVideoToSkill: vi.fn(),
  };
});

import { distillVideoToSkill } from '@skill-recorder/from-video';

const okSkill = {
  id: 'skill_video_Bx6BVxP8Uog_x',
  title: 'X',
  description: 'A test skill.',
  domain: 'example.com',
  parameters: [],
  steps: [{ id: 's1', intent: 'go', action: 'navigate', url: 'https://example.com' }],
  sourceVideo: {
    url: 'https://www.youtube.com/watch?v=Bx6BVxP8Uog',
    videoId: 'Bx6BVxP8Uog',
    title: 'X',
    durationSec: 60,
    fetchedAt: '2026-05-24T00:00:00.000Z',
  },
  createdAt: 1716000000000,
  updatedAt: 1716000000000,
};

const stubBackend = (): Backend => ({
  call: vi.fn(async () => ({
    rawInput: {},
    usage: { inputTokens: 0, outputTokens: 0, cacheHitTokens: 0 },
  })),
});

let server: Server | null = null;
let baseUrl: string;

beforeEach(async () => {
  vi.clearAllMocks();
  const started = await startDistillApp({ backend: stubBackend(), version: 'test' });
  server = started.server;
  baseUrl = started.baseUrl;
});

afterEach(async () => {
  await new Promise<void>((resolve) => server?.close(() => resolve()));
  server = null;
});

describe('GET /health', () => {
  it('returns 200 with version + backend marker', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, version: 'test', backend: 'injected' });
  });
});

describe('POST /distill — happy path', () => {
  it('returns the wire-format response', async () => {
    (distillVideoToSkill as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      skill: okSkill,
      videoMeta: { videoId: 'Bx6BVxP8Uog', title: 'X', channel: '', durationSec: 60 },
      inputTokens: 100,
      outputTokens: 50,
      cacheHitTokens: 30,
      transcriptCharCount: 1234,
    });

    const res = await fetch(`${baseUrl}/distill`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ videoUrl: 'https://youtu.be/Bx6BVxP8Uog' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skill.id).toBe(okSkill.id);
    expect(body.usage).toEqual({ inputTokens: 100, outputTokens: 50, cacheHitTokens: 30 });
    expect(body.transcriptCharCount).toBe(1234);
  });

  it('passes the model through to distillVideoToSkill', async () => {
    (distillVideoToSkill as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      skill: okSkill,
      videoMeta: { videoId: 'Bx6BVxP8Uog', title: 'X', channel: '', durationSec: 60 },
      inputTokens: 0,
      outputTokens: 0,
      cacheHitTokens: 0,
      transcriptCharCount: 0,
    });

    await fetch(`${baseUrl}/distill`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ videoUrl: 'https://youtu.be/Bx6BVxP8Uog', model: 'claude-haiku-4-5' }),
    });
    expect(distillVideoToSkill).toHaveBeenCalledWith(
      expect.objectContaining({
        videoUrl: 'https://youtu.be/Bx6BVxP8Uog',
        model: 'claude-haiku-4-5',
      }),
    );
  });
});

describe('POST /distill — DistillError → HTTP status mapping', () => {
  it.each([
    ['no_transcript', 422],
    ['inaccessible', 422],
    ['too_long', 422],
    ['insufficient_content', 422],
    ['unsupported_source', 400],
    ['distill_failed', 502],
    ['config', 500],
  ] as const)('maps %s → HTTP %d', async (code, expectedStatus) => {
    (distillVideoToSkill as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new DistillError(code, `mock ${code} message`),
    );

    const res = await fetch(`${baseUrl}/distill`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ videoUrl: 'https://youtu.be/Bx6BVxP8Uog' }),
    });
    expect(res.status).toBe(expectedStatus);
    const body = await res.json();
    expect(body).toMatchObject({ error: code, message: expect.stringContaining(code) });
  });

  it('returns 500 on unrecognized errors', async () => {
    (distillVideoToSkill as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom — totally unexpected'),
    );

    const res = await fetch(`${baseUrl}/distill`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ videoUrl: 'https://youtu.be/Bx6BVxP8Uog' }),
    });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('internal');
  });
});

describe('POST /distill — request validation', () => {
  it('returns 400 on missing videoUrl', async () => {
    const res = await fetch(`${baseUrl}/distill`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('bad_request');
  });

  it('returns 400 on malformed JSON body', async () => {
    const res = await fetch(`${baseUrl}/distill`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('bad_request');
  });
});

describe('routing', () => {
  it('returns 404 on unknown paths', async () => {
    const res = await fetch(`${baseUrl}/nope`);
    expect(res.status).toBe(404);
  });

  it('returns 404 on POST to wrong path', async () => {
    const res = await fetch(`${baseUrl}/wrong`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    expect(res.status).toBe(404);
  });
});

describe('CORS', () => {
  it('responds to OPTIONS preflight with permissive dev headers', async () => {
    const res = await fetch(`${baseUrl}/distill`, {
      method: 'OPTIONS',
      headers: { origin: 'chrome-extension://abc' },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('chrome-extension://abc');
    expect(res.headers.get('access-control-allow-methods')).toContain('POST');
  });
});
