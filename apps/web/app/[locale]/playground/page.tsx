import { unstable_setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import PlaygroundClient from '@/components/playground/PlaygroundClient';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const metadata = {
  title: 'Playground — Test Skill Recorder Flows',
  description:
    'Pick a sample flow, install the extension, and hit Record to capture it into a SKILL.md.',
  robots: { index: false },
};

export default function PlaygroundPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  return <PlaygroundClient />;
}
