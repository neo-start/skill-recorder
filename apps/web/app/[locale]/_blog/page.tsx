import { unstable_setRequestLocale } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogListApp from '@/components/blog/BlogListApp';
import { fetchBlogList } from '@/lib/blog';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata() {
  return generatePageMetadata('blog', '/blog');
}

export default async function BlogPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);

  const content = (await fetchBlogList(params.locale)) ?? {
    title: '',
    description: '',
    blogs: [],
  };

  return (
    <>
      <Navbar />
      <BlogListApp content={content} />
      <Footer />
    </>
  );
}
