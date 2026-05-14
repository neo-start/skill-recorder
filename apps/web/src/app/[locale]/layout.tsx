import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { StyledComponentsRegistry } from '@/lib/registry';
import { AnalyticsPageView } from '@/lib/analytics';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { pageMeta } from '@/lib/seo';
import '@/styles/globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return pageMeta({
    title: 'Skill Recorder',
    description:
      'Record a browser flow once. Generate a Claude Code SKILL.md that any AI agent can rerun.',
    path: '/',
    locale,
  });
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  if (!locales.includes(locale)) notFound();
  unstable_setRequestLocale(locale);
  const messages = useMessages();

  return (
    <html lang={locale}>
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <Suspense fallback={null}>
                <AnalyticsPageView />
              </Suspense>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </NextIntlClientProvider>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
