export const toYouTubeNoCookieEmbedSrc = (src?: string): string | undefined => {
  if (!src) return src;
  const normalizedSrc = src.startsWith('//') ? `https:${src}` : src;
  const buildEmbedUrl = (videoId: string, searchParams?: URLSearchParams) => {
    const url = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
    if (searchParams) {
      searchParams.forEach((value, key) => {
        if (key !== 'v') url.searchParams.set(key, value);
      });
    }
    return url.toString();
  };

  try {
    const url = new URL(normalizedSrc);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;

    if (hostname === 'youtu.be') {
      const videoId = pathname.split('/').filter(Boolean)[0];
      if (!videoId) return src;
      return buildEmbedUrl(videoId, url.searchParams);
    }
    if (hostname.endsWith('youtube.com') || hostname.endsWith('youtube-nocookie.com')) {
      if (pathname.startsWith('/embed/')) {
        url.hostname = 'www.youtube-nocookie.com';
        url.protocol = 'https:';
        return url.toString();
      }
      if (pathname === '/watch') {
        const videoId = url.searchParams.get('v');
        if (!videoId) return src;
        return buildEmbedUrl(videoId, url.searchParams);
      }
    }
  } catch {
    return src.includes('youtube.com/embed/') && !src.includes('youtube-nocookie.com')
      ? src.replace('youtube.com/embed/', 'youtube-nocookie.com/embed/')
      : src;
  }
  return src.includes('youtube.com/embed/') && !src.includes('youtube-nocookie.com')
    ? src.replace('youtube.com/embed/', 'youtube-nocookie.com/embed/')
    : src;
};

export const toYouTubeVideoId = (src?: string): string | undefined => {
  if (!src) return src;
  const normalizedSrc = src.startsWith('//') ? `https:${src}` : src;
  try {
    const url = new URL(normalizedSrc);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;
    if (hostname === 'youtu.be') return pathname.split('/').filter(Boolean)[0];
    if (hostname.endsWith('youtube.com') || hostname.endsWith('youtube-nocookie.com')) {
      if (pathname.startsWith('/embed/')) return pathname.replace('/embed/', '').split('/').filter(Boolean)[0];
      if (pathname === '/watch') return url.searchParams.get('v') || undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

export const toYouTubeSrcDoc = (videoId: string, title: string, embedUrl: string): string => {
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}a{position:relative;display:block;width:100%;height:100%;background:#000}img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;filter:brightness(.9)}.play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:999px;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;color:#fff}.play svg{width:28px;height:28px;display:block}</style></head><body><a href="${embedUrl}" aria-label="${safeTitle}"><img src="${thumbnail}" alt=""/><span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7L8 5z" fill="currentColor"/></svg></span></a></body></html>`;
};
