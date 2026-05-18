import { unstable_setRequestLocale } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PlaygroundIndex from './PlaygroundIndex';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata() {
  return generatePageMetadata('playground', '/playground');
}

export default function PlaygroundPage({ params }: { params: { locale: string } }) {
  unstable_setRequestLocale(params.locale);
  return (
    <>
      <Navbar />
      <main>
        <PlaygroundIndex />
      </main>
      <Footer />
    </>
  );
}
