import type { MetadataRoute } from 'next';

// Canonical site origin. Override per-environment with NEXT_PUBLIC_SITE_URL.
const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cadeno.ai'
).replace(/\/$/, '');

// Generates /robots.txt at build time (works with `output: 'export'`).
// Internal design-exploration and demo routes are kept out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/styles/', '/playground/', '/logo-concepts'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
