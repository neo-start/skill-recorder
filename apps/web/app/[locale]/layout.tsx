import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale,
} from 'next-intl/server';
import { Lexend, Caveat, JetBrains_Mono } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/registry';
import { GlobalStyle } from '@/styles/GlobalStyle';
import { routing } from '@/i18n/routing';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cadeno.ai';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

// This layout owns <html>/<body> so `lang` reflects the active locale. The
// root app/layout.tsx is a pass-through (it has no access to the locale param).
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const [messages, tMeta] = await Promise.all([
    getMessages(),
    getTranslations('main.meta'),
  ]);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cadeno',
    url: BASE_URL,
    description: tMeta('description'),
  };

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Cadeno',
    url: BASE_URL,
    description: tMeta('description'),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <html
      lang={params.locale}
      className={[lexend.variable, caveat.variable, jetbrainsMono.variable].join(
        ' ',
      )}
    >
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          <NextIntlClientProvider messages={messages}>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(softwareJsonLd),
              }}
            />
            {children}
          </NextIntlClientProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
