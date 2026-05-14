import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { listDocs, getDoc } from '@/lib/docs';
import { renderMarkdown } from '@/lib/markdown';
import { DocLayout } from '@/components/DocLayout';
import { pageMeta } from '@/lib/seo';
import type { Locale } from '@/i18n';

interface Params {
  locale: Locale;
  slug?: string[];
}

export async function generateStaticParams() {
  const params: { locale: Locale; slug?: string[] }[] = [];
  for (const locale of ['en', 'zh'] as Locale[]) {
    const docs = await listDocs(locale);
    for (const d of docs) {
      params.push({ locale, slug: [d.slug] });
    }
    // Index page: redirect to first doc — emit no extra param.
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const slug = (params.slug && params.slug[0]) || 'getting-started';
  const doc = await getDoc(slug, params.locale);
  if (!doc) return pageMeta({ title: 'Docs', description: '', path: '/docs', locale: params.locale });
  return pageMeta({
    title: doc.title,
    description: doc.description || doc.title,
    path: `/docs/${doc.slug}`,
    locale: params.locale,
  });
}

export default async function DocPage({ params }: { params: Params }) {
  unstable_setRequestLocale(params.locale);
  const slug = (params.slug && params.slug[0]) || 'getting-started';
  const docs = await listDocs(params.locale);
  const doc = docs.find((d) => d.slug === slug);
  if (!doc) notFound();

  const html = await renderMarkdown(doc.body);
  const items = docs.map((d) => ({ slug: d.slug, title: d.title }));

  return <DocLayout items={items} currentSlug={slug} description={doc.description} html={html} />;
}
