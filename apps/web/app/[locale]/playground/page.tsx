import { unstable_setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PlaygroundIndex from './PlaygroundIndex';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'Playground · Skill Recorder',
  description:
    'Hands-on demo pages that stress-test the recorder against drag-and-drop, iframes, shadow DOM, multi-tab flows, modifier-key chords, contenteditable, and more.',
};

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
