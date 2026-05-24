import { describe, expect, it, vi, beforeEach } from 'vitest';
import { distillVideoToSkill, DistillError, type Backend } from './index';

// Stub out the network-bound helpers so we can drive the orchestration end
// to end without hitting YouTube or Anthropic.
vi.mock('./oembed', async () => {
  const actual = await vi.importActual<typeof import('./oembed')>('./oembed');
  return {
    ...actual,
    fetchYoutubeOembed: vi.fn(async () => ({
      title: 'Stubbed Video Title',
      channel: 'Stubbed Channel',
    })),
  };
});
vi.mock('./transcript', () => ({
  fetchYoutubeTranscript: vi.fn(async () => ({
    text: 'fake transcript content',
    charCount: 23,
    durationSec: 600,
  })),
}));

const happyLlmSkill = {
  title: 'Do The Thing',
  description: 'How to do the thing.',
  domain: 'example.com',
  parameters: [],
  steps: [
    { id: 's1', intent: 'open', action: 'navigate', url: 'https://example.com' },
    { id: 's2', intent: 'judge', action: 'guidance', notes: 'careful', criteria: ['a', 'b'] },
  ],
};

const stubBackend = (rawInput: unknown): Backend => ({
  call: vi.fn(async () => ({
    rawInput,
    usage: { inputTokens: 100, outputTokens: 50, cacheHitTokens: 30 },
  })),
});

const fixedNow = new Date('2026-05-24T12:00:00.000Z');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('distillVideoToSkill', () => {
  it('happy path: wraps the LLM output into a Skill with sourceVideo provenance', async () => {
    const result = await distillVideoToSkill({
      videoUrl: 'https://www.youtube.com/watch?v=Bx6BVxP8Uog',
      backend: stubBackend(happyLlmSkill),
      now: () => fixedNow,
    });

    expect(result.skill.title).toBe('Do The Thing');
    expect(result.skill.steps).toHaveLength(2);
    // Provenance is set; id has video id baked in
    expect(result.skill.sourceVideo).toEqual({
      url: 'https://www.youtube.com/watch?v=Bx6BVxP8Uog',
      videoId: 'Bx6BVxP8Uog',
      title: 'Stubbed Video Title',
      channel: 'Stubbed Channel',
      durationSec: 600,
      fetchedAt: '2026-05-24T12:00:00.000Z',
    });
    expect(result.skill.id).toMatch(/^skill_video_Bx6BVxP8Uog_/);
    expect(result.skill.createdAt).toBe(fixedNow.getTime());
    expect(result.skill.updatedAt).toBe(fixedNow.getTime());
    // The recording-only provenance is not set
    expect(result.skill.sourceRecordingId).toBeUndefined();
    // usage passes through
    expect(result.inputTokens).toBe(100);
    expect(result.cacheHitTokens).toBe(30);
  });

  it('omits startUrl when the LLM did not provide one', async () => {
    const result = await distillVideoToSkill({
      videoUrl: 'https://youtu.be/Bx6BVxP8Uog',
      backend: stubBackend(happyLlmSkill),
      now: () => fixedNow,
    });
    expect(result.skill.startUrl).toBeUndefined();
  });

  it('includes startUrl when the LLM provides one', async () => {
    const result = await distillVideoToSkill({
      videoUrl: 'https://youtu.be/Bx6BVxP8Uog',
      backend: stubBackend({ ...happyLlmSkill, startUrl: 'https://example.com/start' }),
      now: () => fixedNow,
    });
    expect(result.skill.startUrl).toBe('https://example.com/start');
  });

  it('omits channel when the oembed channel is empty', async () => {
    const oembed = await import('./oembed');
    (oembed.fetchYoutubeOembed as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      title: 'No Channel Title',
      channel: '',
    });

    const result = await distillVideoToSkill({
      videoUrl: 'https://youtu.be/Bx6BVxP8Uog',
      backend: stubBackend(happyLlmSkill),
      now: () => fixedNow,
    });
    expect(result.skill.sourceVideo?.channel).toBeUndefined();
  });

  it('throws unsupported_source for non-YouTube URLs', async () => {
    await expect(
      distillVideoToSkill({
        videoUrl: 'https://vimeo.com/123',
        backend: stubBackend(happyLlmSkill),
      }),
    ).rejects.toMatchObject({ code: 'unsupported_source' });
  });

  it('throws config when videoUrl is missing', async () => {
    await expect(
      distillVideoToSkill({
        videoUrl: '',
        backend: stubBackend(happyLlmSkill),
      }),
    ).rejects.toMatchObject({ code: 'config' });
  });

  it('throws too_long when transcript exceeds maxTranscriptChars', async () => {
    const transcriptMod = await import('./transcript');
    (transcriptMod.fetchYoutubeTranscript as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      text: 'x'.repeat(70_000),
      charCount: 70_000,
      durationSec: 3000,
    });

    await expect(
      distillVideoToSkill({
        videoUrl: 'https://youtu.be/Bx6BVxP8Uog',
        backend: stubBackend(happyLlmSkill),
        maxTranscriptChars: 60_000,
      }),
    ).rejects.toMatchObject({ code: 'too_long' });
  });

  it('retries on schema-invalid output then throws distill_failed', async () => {
    const badBackend: Backend = {
      call: vi.fn(async () => ({
        rawInput: { totallyWrong: true },
        usage: { inputTokens: 1, outputTokens: 1, cacheHitTokens: 0 },
      })),
    };

    await expect(
      distillVideoToSkill({
        videoUrl: 'https://youtu.be/Bx6BVxP8Uog',
        backend: badBackend,
      }),
    ).rejects.toBeInstanceOf(DistillError);

    // 2 attempts: 1 initial + 1 retry
    expect(badBackend.call).toHaveBeenCalledTimes(2);
  });
});
