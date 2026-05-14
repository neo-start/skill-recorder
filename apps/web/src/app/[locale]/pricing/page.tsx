import type { Metadata } from 'next';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { PricingTable } from '@/components/PricingTable';
import { pageMeta } from '@/lib/seo';
import type { Locale } from '@/i18n';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'pricing' });
  return pageMeta({
    title: t('heading'),
    description: t('lede'),
    path: '/pricing',
    locale,
  });
}

export default function PricingPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  return <PricingTable />;
}
