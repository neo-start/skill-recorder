import { IBlogList, IBlogPageConfig } from '@/types/blog';

// When NEXT_PUBLIC_BLOG_HOST is unset (e.g. local dev) we fall back to the
// site's own /seo/blog/contents/<locale>/... paths bundled under public/.
const BLOG_HOST = process.env.NEXT_PUBLIC_BLOG_HOST ?? '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

function blogBase() {
  if (BLOG_HOST) return BLOG_HOST;
  if (SITE_URL) return SITE_URL;
  return '';
}

export async function fetchBlogList(locale: string): Promise<IBlogList | null> {
  const base = blogBase();
  try {
    const url = base
      ? `${base}/seo/blog/contents/${locale}/blogs.json`
      : `/seo/blog/contents/${locale}/blogs.json`;

    // During SSG with no SITE_URL configured, dynamic-import the bundled JSON
    // directly so the page can still render at build time.
    if (!base) {
      try {
        const mod = await import(`@/public/seo/blog/contents/${locale}/blogs.json`);
        return (mod.default ?? mod) as IBlogList;
      } catch {
        const fallback = await import(`@/public/seo/blog/contents/en/blogs.json`).catch(() => null);
        return fallback ? ((fallback as any).default ?? fallback) as IBlogList : null;
      }
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.data ?? data) as IBlogList;
  } catch {
    return null;
  }
}

export async function fetchBlogById(
  id: string,
  locale: string
): Promise<IBlogPageConfig | null> {
  if (!id) return null;
  const base = blogBase();
  try {
    if (!base) {
      try {
        const mod = await import(
          `@/public/seo/blog/contents/${locale}/${id}/content.json`
        );
        return (mod.default ?? mod) as IBlogPageConfig;
      } catch {
        const fallback = await import(
          `@/public/seo/blog/contents/en/${id}/content.json`
        ).catch(() => null);
        return fallback
          ? (((fallback as any).default ?? fallback) as IBlogPageConfig)
          : null;
      }
    }
    const url = `${base}/seo/blog/contents/${locale}/${id}/content.json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.data ?? data) as IBlogPageConfig;
  } catch {
    return null;
  }
}
