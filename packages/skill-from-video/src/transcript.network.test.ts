// Contract test for the `youtube-transcript` package. Hits youtube.com
// for real, so it's gated behind RUN_NETWORK_TESTS=1 and not part of the
// default `pnpm test` run:
//
//   pnpm --filter @skill-recorder/from-video test:network
//
// Why this exists: `youtube-transcript` scrapes an undocumented YouTube
// endpoint. The day YouTube changes the response shape, every distill in
// production silently starts failing with `no_transcript`. This test is
// the canary — when it fails, the package needs a patch (or we cut over
// to Whisper STT, which is the M4 fallback in the design doc).
//
// We deliberately pick two anchor videos that are structurally
// indestructible:
//   - dQw4w9WgXcQ — Rick Astley "Never Gonna Give You Up". Sony Music
//     property, the most-watched music video that doubles as the internet's
//     rickroll meme. Will not be removed in our lifetime. Has stable English
//     captions (the lyrics).
//   - Bx6BVxP8Uog — the Fiverr tutorial that our M1 distill fixture
//     (packages/skill-from-video/__fixtures__/fiverr-Bx6BVxP8Uog.*) is
//     built on. If this stops fetching, regenerating the fixture breaks too.

import { describe, expect, it } from 'vitest';
import { fetchYoutubeTranscript } from './transcript';

const NETWORK_ENABLED = process.env.RUN_NETWORK_TESTS === '1';

describe.skipIf(!NETWORK_ENABLED)('youtube-transcript live fetch', () => {
  it(
    'fetches the Rick Astley anchor video',
    { timeout: 30_000 },
    async () => {
      const result = await fetchYoutubeTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      // Structural invariants — not exact text, which drifts with caption edits.
      expect(result.text.length).toBeGreaterThan(500);
      expect(result.charCount).toBe(result.text.length);

      // The song is 3:33. Allow a wide ±30s margin for caption-padding drift.
      expect(result.durationSec).toBeGreaterThan(180);
      expect(result.durationSec).toBeLessThan(240);

      // Signature words from the chorus. If `youtube-transcript` returns
      // junk (HTML, captions for the wrong video, etc), this catches it.
      const text = result.text.toLowerCase();
      expect(text).toContain('never gonna');
    },
  );

  it(
    'fetches the Fiverr fixture anchor video',
    { timeout: 30_000 },
    async () => {
      const result = await fetchYoutubeTranscript('https://www.youtube.com/watch?v=Bx6BVxP8Uog');

      expect(result.text.length).toBeGreaterThan(1000);
      // The video is ~7 min; assert >2 min and <15 min as sanity bounds.
      expect(result.durationSec).toBeGreaterThan(120);
      expect(result.durationSec).toBeLessThan(900);

      // The Fiverr tutorial mentions the platform many times — if it
      // doesn't, we've got the wrong transcript.
      const text = result.text.toLowerCase();
      expect(text).toMatch(/fiverr|freelancer/);
    },
  );

  it(
    'handles very short videos (YouTube first-upload "Me at the zoo")',
    { timeout: 30_000 },
    async () => {
      // jNQXAC9IVRw — the literal first video uploaded to YouTube in 2005
      // by co-founder Jawed Karim. 19 seconds, has the famous "really
      // really long trunks" captions, structurally indestructible. We use
      // it to confirm tiny transcripts come through without the lib
      // crashing on edge cases (single segment, sub-minute duration).
      const result = await fetchYoutubeTranscript(
        'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      );
      expect(result.text.length).toBeGreaterThan(50);
      expect(result.text.toLowerCase()).toContain('trunks');
      expect(result.durationSec).toBeGreaterThan(10);
      expect(result.durationSec).toBeLessThan(30);
    },
  );
});
