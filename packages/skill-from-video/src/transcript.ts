import { YoutubeTranscript } from 'youtube-transcript';
import { DistillError } from './errors';

export interface FetchedTranscript {
  text: string;
  charCount: number;
  durationSec: number;
}

/**
 * Fetch a YouTube transcript and return a flat, timestamp-stripped string
 * suitable for feeding to an LLM. We deliberately ignore per-segment timing
 * — the prompt operates on the narrative flow, not on cue timings.
 *
 * `youtube-transcript` returns `{ text, duration, offset, lang }[]` where
 * `offset` + `duration` are in milliseconds.
 */
export async function fetchYoutubeTranscript(videoIdOrUrl: string): Promise<FetchedTranscript> {
  let segments;
  try {
    segments = await YoutubeTranscript.fetchTranscript(videoIdOrUrl);
  } catch (e) {
    const msg = (e as Error).message || 'transcript fetch failed';
    if (/disabled|not.*available|no.*caption/i.test(msg)) {
      throw new DistillError('no_transcript', msg);
    }
    throw new DistillError('no_transcript', msg);
  }

  if (!segments || segments.length === 0) {
    throw new DistillError('no_transcript', 'Transcript is empty');
  }

  const last = segments[segments.length - 1]!;
  const durationSec = Math.round(((last.offset ?? 0) + (last.duration ?? 0)) / 1000);

  // Decode HTML entities the transcript API leaves in (e.g. &amp;#39;).
  const text = segments
    .map((s) => decodeHtmlEntities(s.text).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');

  return { text, charCount: text.length, durationSec };
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}
