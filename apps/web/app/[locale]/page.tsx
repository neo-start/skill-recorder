import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Home from '@/components/home';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cadeno.ai';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Your Personal FDE',
  description:
    'Distill the work you do once into skills your agent runs forever. The personal Forward Deployed Engineer for creators, operators, freelancers, and solopreneurs.',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'Cadeno — Your Personal FDE',
    description:
      'Distill the work you do once into skills your agent runs forever.',
    images: [{ url: `${BASE_URL}/images/og.png` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cadeno — Your Personal FDE',
    description:
      'Distill the work you do once into skills your agent runs forever.',
    images: [`${BASE_URL}/images/og.png`],
  },
};

export default function Page({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return <Home />;
}
