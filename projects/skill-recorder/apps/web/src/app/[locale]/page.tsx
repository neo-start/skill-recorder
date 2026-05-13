import { unstable_setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { FeatureGrid } from '@/components/FeatureGrid';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';
import { SkillMarkdownPreview } from '@/components/SkillMarkdownPreview';
import { InstallCta } from '@/components/InstallCta';
import type { Locale } from '@/i18n';

export default function HomePage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  return (
    <>
      <Hero />
      <FeatureGrid />
      <SkillMarkdownPreview />
      <ArchitectureDiagram />
      <InstallCta />
    </>
  );
}
