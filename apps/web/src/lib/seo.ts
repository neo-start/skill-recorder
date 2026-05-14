import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://skill-recorder.dev';
const SITE_NAME = 'Skill Recorder';
const TWITTER_HANDLE = '@skillrecorder';

interface PageMetaArgs {
  title: string;
  description: string;
  path: string;
  locale?: 'en' | 'zh';
  image?: string;
}

export function pageMeta({
  title,
  description,
  path,
  locale = 'en',
  image = '/og-image.png',
}: PageMetaArgs): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${path === '/' ? '' : path}`,
        zh: `${SITE_URL}/zh${path === '/' ? '' : path}`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const siteUrl = SITE_URL;
export const siteName = SITE_NAME;
