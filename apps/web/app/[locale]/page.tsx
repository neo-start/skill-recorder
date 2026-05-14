import { unstable_setRequestLocale } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import { routing } from '@/i18n/routing';
import Main from '@/components/main';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata() {
  return generatePageMetadata('main', '/');
}

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <Main />;
}
