// Talks to apps/api's POST /distill on behalf of the side panel. Reads the
// API base URL from chrome.storage.local so a developer can point at a local
// wrangler dev (http://localhost:8787) without rebuilding the extension.

import type { Skill } from '@skill-recorder/types';

const STORAGE_KEY = 'apiBaseUrl';
// We don't ship a hosted Worker yet; defaulting to localhost makes the dev
// loop just-work after `pnpm --filter @skill-recorder/api dev`. Override with:
//   chrome.storage.local.set({ apiBaseUrl: 'https://api.skill-recorder.dev' })
export const DEFAULT_API_BASE_URL = 'http://localhost:8787';

export interface DistillResponse {
  skill: Skill;
  videoMeta: { videoId: string; title: string; channel: string; durationSec: number };
  usage: { inputTokens: number; outputTokens: number; cacheHitTokens: number };
  transcriptCharCount: number;
  cached?: boolean;
}

export class DistillRequestError extends Error {
  code: string;
  status: number;
  retryAfterSec?: number;
  constructor(code: string, status: number, message: string, retryAfterSec?: number) {
    super(message);
    this.name = 'DistillRequestError';
    this.code = code;
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

export async function getApiBaseUrl(): Promise<string> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const v = stored[STORAGE_KEY];
  return typeof v === 'string' && v ? v : DEFAULT_API_BASE_URL;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: url });
}

export async function distillVideoUrl(videoUrl: string, model?: string): Promise<DistillResponse> {
  const baseUrl = await getApiBaseUrl();
  const endpoint = `${baseUrl.replace(/\/$/, '')}/distill`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(model ? { videoUrl, model } : { videoUrl }),
    });
  } catch (e) {
    throw new DistillRequestError(
      'network',
      0,
      `Could not reach ${endpoint}. Is the API running? (${(e as Error).message})`,
    );
  }

  if (!res.ok) {
    const body = await safeJson(res);
    const code = typeof body?.error === 'string' ? body.error : `http_${res.status}`;
    const msg = typeof body?.message === 'string' ? body.message : describeStatus(code, res.status);
    const retryAfter = typeof body?.retryAfterSec === 'number' ? body.retryAfterSec : undefined;
    throw new DistillRequestError(code, res.status, msg, retryAfter);
  }

  return (await res.json()) as DistillResponse;
}

async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function describeStatus(code: string, status: number): string {
  switch (code) {
    case 'no_transcript':
      return 'This video has no transcript / captions enabled. Distill needs captions.';
    case 'inaccessible':
      return "Couldn't open this video (private, age-restricted, or removed).";
    case 'too_long':
      return 'Transcript is too long for v1 (>~45 min). Try a shorter video.';
    case 'insufficient_content':
      return 'The transcript was too thin to build a useful skill from.';
    case 'unsupported_source':
      return 'Only YouTube URLs are supported.';
    case 'rate_limited':
      return 'Rate limit hit — try again in a moment.';
    case 'forbidden_origin':
      return "This extension's origin isn't allowed by the API.";
    case 'distill_failed':
      return 'The model output failed validation. Try again or change the model.';
    default:
      return `Distill failed (HTTP ${status}).`;
  }
}
