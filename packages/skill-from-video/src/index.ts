import type { Skill, SkillStep } from '@skill-recorder/types';
import { fetchYoutubeOembed, parseYoutubeId } from './oembed';
import { fetchYoutubeTranscript } from './transcript';
import { callDistill } from './distill';
import { DistillError } from './errors';
import { createAnthropicBackend } from './backend-anthropic';
import { createClaudeCliBackend, type ClaudeCliBackendOptions } from './backend-claude-cli';
import type { Backend } from './backend';
import type { LlmSkill } from './schema';

export { DistillError } from './errors';
export type { DistillErrorCode } from './errors';
export type { Backend } from './backend';
export { createAnthropicBackend } from './backend-anthropic';
export { createClaudeCliBackend } from './backend-claude-cli';

export type BackendName = 'anthropic-sdk' | 'claude-cli';

export interface DistillOptions {
  videoUrl: string;
  /** Which backend to use. Default: claude-cli (subscription, free for the user). */
  backend?: BackendName | Backend;
  /** Required when backend === 'anthropic-sdk'. Ignored otherwise. */
  apiKey?: string;
  /** Options forwarded to the Claude CLI backend (e.g. bin path). */
  claudeCli?: ClaudeCliBackendOptions;
  /** Default: claude-sonnet-4-6. Model id passed through to the backend. */
  model?: string;
  /** Hard cap on transcript size; default 60_000. */
  maxTranscriptChars?: number;
  signal?: AbortSignal;
  /** Override wall clock for `sourceVideo.fetchedAt` (testing). */
  now?: () => Date;
}

export interface DistillResult {
  skill: Skill;
  videoMeta: { videoId: string; title: string; channel: string; durationSec: number };
  transcriptCharCount: number;
  inputTokens: number;
  outputTokens: number;
  cacheHitTokens: number;
}

const DEFAULT_MAX = 60_000;

export async function distillVideoToSkill(opts: DistillOptions): Promise<DistillResult> {
  if (!opts.videoUrl) throw new DistillError('config', 'videoUrl is required');

  const backend = resolveBackend(opts);

  const videoId = parseYoutubeId(opts.videoUrl);
  if (!videoId) {
    throw new DistillError('unsupported_source', `Not a recognised YouTube URL: ${opts.videoUrl}`);
  }

  const [oembed, transcript] = await Promise.all([
    fetchYoutubeOembed(opts.videoUrl, opts.signal),
    fetchYoutubeTranscript(opts.videoUrl),
  ]);

  const maxChars = opts.maxTranscriptChars ?? DEFAULT_MAX;
  if (transcript.charCount > maxChars) {
    throw new DistillError(
      'too_long',
      `Transcript is ${transcript.charCount} chars (limit ${maxChars}). v1 only supports videos ≤ ~45 minutes.`,
    );
  }

  const { parsed, usage } = await callDistill({
    backend,
    model: opts.model,
    signal: opts.signal,
    videoTitle: oembed.title,
    videoChannel: oembed.channel,
    videoUrl: opts.videoUrl,
    videoId,
    durationSec: transcript.durationSec,
    transcript: transcript.text,
  });

  const now = (opts.now ?? (() => new Date()))();
  const skill = wrapSkill({
    parsed,
    videoId,
    videoUrl: opts.videoUrl,
    videoTitle: oembed.title,
    videoChannel: oembed.channel,
    durationSec: transcript.durationSec,
    now,
  });

  return {
    skill,
    videoMeta: {
      videoId,
      title: oembed.title,
      channel: oembed.channel,
      durationSec: transcript.durationSec,
    },
    transcriptCharCount: transcript.charCount,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    cacheHitTokens: usage.cacheHitTokens,
  };
}

function resolveBackend(opts: DistillOptions): Backend {
  if (typeof opts.backend === 'object' && opts.backend !== null) return opts.backend;
  const name: BackendName = (opts.backend as BackendName) ?? 'claude-cli';
  if (name === 'anthropic-sdk') {
    if (!opts.apiKey) throw new DistillError('config', 'apiKey is required for anthropic-sdk backend');
    return createAnthropicBackend(opts.apiKey);
  }
  if (name === 'claude-cli') {
    return createClaudeCliBackend(opts.claudeCli ?? {});
  }
  throw new DistillError('config', `unknown backend: ${String(name)}`);
}

interface WrapArgs {
  parsed: LlmSkill;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  videoChannel: string;
  durationSec: number;
  now: Date;
}

function wrapSkill(a: WrapArgs): Skill {
  const ms = a.now.getTime();
  const steps: SkillStep[] = a.parsed.steps.map((s) => ({ ...s }) as SkillStep);
  return {
    id: `skill_video_${a.videoId}_${slug6(a.parsed.title)}`,
    title: a.parsed.title,
    description: a.parsed.description,
    domain: a.parsed.domain,
    ...(a.parsed.startUrl ? { startUrl: a.parsed.startUrl } : {}),
    parameters: a.parsed.parameters,
    steps,
    sourceVideo: {
      url: a.videoUrl,
      videoId: a.videoId,
      title: a.videoTitle,
      ...(a.videoChannel ? { channel: a.videoChannel } : {}),
      durationSec: a.durationSec,
      fetchedAt: a.now.toISOString(),
    },
    createdAt: ms,
    updatedAt: ms,
  };
}

function slug6(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}
