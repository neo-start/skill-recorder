import { unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogDetailApp from '@/components/blog/BlogDetailApp';
import { fetchBlogById, fetchBlogList } from '@/lib/blog';
import blogsIndex from '@/public/seo/blog/contents/en/blogs.json';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://skill-recorder.dev';

export function generateStaticParams() {
  const ids = (blogsIndex as any).blogs.map((b: any) => b.id as string);
  return routing.locales.flatMap(locale =>
    ids.map((id: string) => ({ locale, id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const content = await fetchBlogById(params.id, params.locale);
  if (!content) return { title: 'Blog | Skill Recorder' };

  const { meta, title, description } = content;
  const ogImage = `${BASE_URL}/images/og.png`;
  const canonicalUrl = `${BASE_URL}/blog/${params.id}`;

  return {
    title: meta?.title || title,
    description: meta?.description || description,
    keywords: meta?.keywords?.split(',').map(k => k.trim()),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: meta?.title || title,
      description: meta?.description || description,
      url: canonicalUrl,
      siteName: 'Skill Recorder',
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta?.title || title,
      description: meta?.description || description,
      images: [ogImage],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  unstable_setRequestLocale(params.locale);

  const [content, blogList] = await Promise.all([
    fetchBlogById(params.id, params.locale),
    fetchBlogList(params.locale),
  ]);

  if (!content) notFound();

  const relatedPosts = (blogList?.blogs ?? [])
    .filter(b => b.id !== params.id)
    .slice(0, 2);

  return (
    <>
      <Navbar />
      <BlogDetailApp content={content} locale={params.locale} relatedPosts={relatedPosts} />
      <Footer />
    </>
  );
}
