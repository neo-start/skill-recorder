import type { MetadataRoute } from 'next';
import { listDocs } from '@/lib/docs';
import { locales } from '@/i18n';
import { siteUrl } from '@/lib/seo';

const STATIC_PATHS = ['', '/pricing', '/changelog', '/privacy', '/terms'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    for (const p of STATIC_PATHS) {
      out.push({
        url: `${siteUrl}${prefix}${p || '/'}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: p === '' ? 1 : 0.7,
      });
    }
    const docs = await listDocs(locale);
    for (const d of docs) {
      out.push({
        url: `${siteUrl}${prefix}/docs/${d.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }
  return out;
}
