import { DistillError } from './errors';

export interface VideoOembed {
  title: string;
  channel: string;
}

const OEMBED_ENDPOINT = 'https://www.youtube.com/oembed';

export async function fetchYoutubeOembed(videoUrl: string, signal?: AbortSignal): Promise<VideoOembed> {
  const u = new URL(OEMBED_ENDPOINT);
  u.searchParams.set('url', videoUrl);
  u.searchParams.set('format', 'json');

  const res = await fetch(u, { signal });
  if (res.status === 401 || res.status === 403) {
    throw new DistillError('inaccessible', 'Video is private or age-restricted', { status: res.status });
  }
  if (res.status === 404) {
    throw new DistillError('inaccessible', 'Video not found', { status: 404 });
  }
  if (!res.ok) {
    throw new DistillError('inaccessible', `oEmbed failed with HTTP ${res.status}`);
  }

  const body = (await res.json()) as { title?: string; author_name?: string };
  return {
    title: body.title ?? '',
    channel: body.author_name ?? '',
  };
}

const YOUTUBE_ID = /[A-Za-z0-9_-]{11}/;

export function parseYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return YOUTUBE_ID.test(id) ? id : null;
    }
    if (u.hostname.endsWith('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v && YOUTUBE_ID.test(v)) return v;
      // /shorts/<id>, /embed/<id>, /live/<id>
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[2]!;
    }
    return null;
  } catch {
    return null;
  }
}
