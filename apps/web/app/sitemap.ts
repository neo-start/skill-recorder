import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

// Canonical site origin. Override per-environment with NEXT_PUBLIC_SITE_URL.
const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cadeno.ai'
).replace(/\/$/, '');

// Public, indexable routes. Excludes the private `_blog` segment and the
// internal /styles, /playground and /logo-concepts pages. '' is the homepage.
const ROUTES = [
  { path: '', changeFrequency: 'weekly' as const, priority: 1 },
  { path: '/recorder/chrome', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/policy/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/policy/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
];

// localePrefix is 'as-needed', so the default locale (en) carries no prefix.
function url(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const full = `${prefix}${path}`;
  return `${BASE_URL}${full === '' ? '/' : full}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Plain sitemap (no hreflang <xhtml:link> alternates): the homepage is not
  // localized yet, and the xhtml namespace makes browsers render the file as
  // HTML instead of an XML tree.
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: url(routing.defaultLocale, path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
