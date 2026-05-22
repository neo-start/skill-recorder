import type { Skill, SkillStep } from '@skill-recorder/types';
import { fetchYoutubeOembed, parseYoutubeId } from './oembed';
import { fetchYoutubeTranscript } from './transcript';
import { callDistill } from './distill';
import { DistillError } from './errors';
import type { Backend } from './backend';
import type { LlmSkill } from './schema';

export { DistillError } from './errors';
export type { DistillErrorCode } from './errors';
export type { Backend, RawBackendOptions, RawBackendResult, RawBackendUsage } from './backend';
// Backends live on subpath exports (`./backend-anthropic`, `./backend-claude-cli`)
// so callers like the Cloudflare Worker don't drag `node:child_process` into
// their bundle.

export interface DistillOptions {
  videoUrl: string;
  /** Constructed backend — callers wire up either createAnthropicBackend()
   *  (works in Workers) or createClaudeCliBackend() (local Node only). */
  backend: Backend;
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
  if (!opts.backend) throw new DistillError('config', 'backend is required');

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
    backend: opts.backend,
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
