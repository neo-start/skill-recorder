import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SCENARIOS, scenarioBySlug } from '../../scenarios';
import ScenarioView from './ScenarioView';

export function generateStaticParams() {
  const out: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const s of SCENARIOS) out.push({ locale, slug: s.slug });
  }
  return out;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const s = scenarioBySlug(params.slug);
  if (!s) return {};
  return {
    title: `${s.title} · Playground · Skill Recorder`,
    description: s.tagline,
  };
}

export default function ScenarioPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  unstable_setRequestLocale(params.locale);
  const scenario = scenarioBySlug(params.slug);
  if (!scenario) notFound();
  return (
    <>
      <Navbar />
      <main>
        <ScenarioView scenario={scenario} />
      </main>
      <Footer />
    </>
  );
}
