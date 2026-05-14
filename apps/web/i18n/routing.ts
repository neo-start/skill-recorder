import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: [
    'en',
    'es',
    'fr',
    'pt',
    'nl',
    'de',
    'it',
    'ja',
    'zh-Hans',
    'zh-Hant',
    'ko',
    'ru',
  ],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
