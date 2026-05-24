import { describe, expect, it } from 'vitest';
import { parseYoutubeId } from './oembed';

describe('parseYoutubeId', () => {
  it('extracts id from a standard watch URL', () => {
    expect(parseYoutubeId('https://www.youtube.com/watch?v=Bx6BVxP8Uog')).toBe('Bx6BVxP8Uog');
  });

  it('extracts id from a youtu.be short URL', () => {
    expect(parseYoutubeId('https://youtu.be/Bx6BVxP8Uog')).toBe('Bx6BVxP8Uog');
  });

  it('extracts id from a /shorts/ URL', () => {
    expect(parseYoutubeId('https://www.youtube.com/shorts/Bx6BVxP8Uog')).toBe('Bx6BVxP8Uog');
  });

  it('extracts id from a /embed/ URL', () => {
    expect(parseYoutubeId('https://www.youtube.com/embed/Bx6BVxP8Uog')).toBe('Bx6BVxP8Uog');
  });

  it('extracts id from a /live/ URL', () => {
    expect(parseYoutubeId('https://www.youtube.com/live/Bx6BVxP8Uog')).toBe('Bx6BVxP8Uog');
  });

  it('keeps extra query params on watch URL', () => {
    expect(parseYoutubeId('https://www.youtube.com/watch?v=Bx6BVxP8Uog&t=42s&feature=share')).toBe(
      'Bx6BVxP8Uog',
    );
  });

  it('strips a trailing path from youtu.be', () => {
    // `youtu.be/<id>?si=...` — common share-URL shape.
    expect(parseYoutubeId('https://youtu.be/Bx6BVxP8Uog?si=abcdef')).toBe('Bx6BVxP8Uog');
  });

  it('rejects non-YouTube domains', () => {
    expect(parseYoutubeId('https://vimeo.com/123456789')).toBeNull();
    expect(parseYoutubeId('https://example.com/watch?v=Bx6BVxP8Uog')).toBeNull();
  });

  it('rejects a watch URL with no v param', () => {
    expect(parseYoutubeId('https://www.youtube.com/watch?foo=bar')).toBeNull();
  });

  it('rejects ids of the wrong length', () => {
    expect(parseYoutubeId('https://www.youtube.com/watch?v=tooShort')).toBeNull();
    expect(parseYoutubeId('https://youtu.be/tooShort')).toBeNull();
  });

  it('returns null for non-URL strings', () => {
    expect(parseYoutubeId('not a url')).toBeNull();
    expect(parseYoutubeId('')).toBeNull();
  });
});
