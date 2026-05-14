import type { Metadata } from 'next';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { renderMarkdown } from '@/lib/markdown';
import { pageMeta } from '@/lib/seo';
import { Container } from '@/components/Container';
import type { Locale } from '@/i18n';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });
  return pageMeta({
    title: t('heading'),
    description: t('lede'),
    path: '/privacy',
    locale,
  });
}

export default async function PrivacyPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });
  const html = await renderMarkdown(t('body'));
  return (
    <Container>
      <div style={{ padding: '56px 0', maxWidth: 760 }}>
        <h1 style={{ fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{t('heading')}</h1>
        <p style={{ color: '#5a6273', fontSize: 13, marginBottom: 32 }}>{t('lastUpdated')}</p>
        <div style={{ lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </Container>
  );
}
