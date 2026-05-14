import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'zh'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && locales.includes(requested as Locale)
      ? (requested as Locale)
      : defaultLocale;
  if (!locales.includes(locale as Locale)) notFound();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
