import { getTranslations, getLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://skill-recorder.dev';

function buildLocaleUrl(locale: string, path: string): string {
  const seg = locale === routing.defaultLocale ? '' : `/${locale}`;
  const tail = path === '/' ? '' : path;
  const combined = `${seg}${tail}` || '/';
  return `${BASE_URL}${combined}`;
}

const OG_LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  fr: 'fr_FR',
  pt: 'pt_PT',
  nl: 'nl_NL',
  de: 'de_DE',
  it: 'it_IT',
  ja: 'ja_JP',
  'zh-Hans': 'zh_CN',
  'zh-Hant': 'zh_TW',
  ko: 'ko_KR',
  ru: 'ru_RU',
};

export async function generatePageMetadata(
  page: string,
  path: string
): Promise<Metadata> {
  const [t, locale] = await Promise.all([
    getTranslations(`${page}.meta`),
    getLocale(),
  ]);

  const title = t('title');
  const description = t('description');
  const keywords = t('keywords')
    .split(',')
    .map(k => k.trim());
  const ogLocale = OG_LOCALE_MAP[locale] ?? 'en_US';
  const ogLocaleAlternates = routing.locales
    .filter(l => l !== locale)
    .map(l => OG_LOCALE_MAP[l])
    .filter(Boolean);
  const canonicalUrl = buildLocaleUrl(locale, path);
  const ogImage = `${BASE_URL}/images/og.png`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        routing.locales.map(l => [l, buildLocaleUrl(l, path)])
      ),
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Skill Recorder',
      type: 'website',
      locale: ogLocale,
      alternateLocale: ogLocaleAlternates,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
