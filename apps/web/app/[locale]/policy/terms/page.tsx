import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { generatePageMetadata } from '@/lib/metadata';
import { PolicyMain, PolicyContent, PolicyMeta } from '../PolicyContent';

type PolicyBullet = { label: string; text: string };
type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: PolicyBullet[];
  trailing?: string;
  contactEmail?: string;
};

export async function generateMetadata() {
  return generatePageMetadata('policy.terms', '/policy/terms');
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function TermsPage({
  params,
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations('policy.terms');
  const sections = t.raw('sections') as PolicySection[];

  return (
    <>
      <Navbar />
      <PolicyMain>
        <PolicyContent>
          <h1>{t('title')}</h1>
          <PolicyMeta>{t('effectiveDate')}</PolicyMeta>
          <p>{t('intro')}</p>

          {sections.map((section, i) => (
            <section key={i}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((p, j) =>
                section.contactEmail && j === section.paragraphs!.length - 1 ? (
                  <p key={j}>
                    {p}{' '}
                    <a href={`mailto:${section.contactEmail}`}>{section.contactEmail}</a>
                  </p>
                ) : (
                  <p key={j}>{p}</p>
                )
              )}
              {section.bullets && section.bullets.length > 0 && (
                <ul>
                  {section.bullets.map((b, k) => (
                    <li key={k}>
                      {b.label ? <strong>{b.label}</strong> : null}
                      {b.label ? ' ' : ''}
                      {b.text}
                    </li>
                  ))}
                </ul>
              )}
              {section.trailing && <p>{section.trailing}</p>}
            </section>
          ))}
        </PolicyContent>
      </PolicyMain>
      <Footer />
    </>
  );
}
