import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'mdx'],
  compiler: {
    styledComponents: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default withNextIntl(withMDX(nextConfig));
