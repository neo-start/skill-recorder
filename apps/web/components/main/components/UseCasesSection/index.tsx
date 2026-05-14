'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import { CTA_URL, withUTM } from '@/lib/utm';

const CASES = ['ecommerce', 'reviews', 'seo', 'leads', 'jobs', 'realestate', 'hotels'] as const;
type CaseKey = (typeof CASES)[number];

const Section = styled.section`
  background: var(--color-bg);
  padding-block: var(--section-padding-y);
`;

const Head = styled.div`
  margin-bottom: var(--space-10);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(21, 1fr);
  gap: var(--space-4);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const spanByIdx = (idx: number): number => {
  if (idx === 0) return 12;
  if (idx === 1) return 9;
  if (idx === 2) return 9;
  if (idx === 3) return 12;
  return 7;
};

const Card = styled.div<{ $idx: number }>`
  position: relative;
  grid-column: span ${({ $idx }) => spanByIdx($idx)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  background: ${({ $idx }) =>
    $idx === 0 || $idx === 3 ? 'var(--color-primary-200)' : 'var(--color-primary-50)'};
  min-height: 200px;
  overflow: hidden;
  border: 1.5px solid transparent;
  transition: border-color var(--transition-fast);

  &:hover {
    border-color: var(--color-primary-500);
  }

  @media (max-width: 768px) {
    grid-column: span 1;
  }
  @media (max-width: 600px) {
    grid-column: span 1;
  }
`;

const CardText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const CardTitle = styled.h3`
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.3;
  margin: 0;
`;

const CardDesc = styled.p`
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  line-height: 1.6;
  margin: 0;
`;

const CardBottom = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const CardCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary-500);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: gap var(--transition-fast);

  &:hover { gap: var(--space-2); }
`;

const IconWrap = styled.div`
  flex-shrink: 0;
  width: clamp(64px, 22%, 120px);
  aspect-ratio: 1;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  color: var(--color-primary-600);
  opacity: 0.85;
`;

const CASE_ICONS: Record<CaseKey, () => JSX.Element> = {
  ecommerce: () => (
    <svg viewBox="0 0 64 64" fill="none">
      <rect x="10" y="14" width="44" height="40" rx="6" stroke="currentColor" strokeWidth="3" />
      <path d="M20 24h24M20 32h24M20 40h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  reviews: () => (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M16 50V18a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H28l-12 6z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="26" cy="28" r="2" fill="currentColor" />
      <circle cx="34" cy="28" r="2" fill="currentColor" />
      <circle cx="42" cy="28" r="2" fill="currentColor" />
    </svg>
  ),
  seo: () => (
    <svg viewBox="0 0 64 64" fill="none">
      <circle cx="28" cy="28" r="14" stroke="currentColor" strokeWidth="3" />
      <path d="M40 40l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  leads: () => (
    <svg viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="22" r="8" stroke="currentColor" strokeWidth="3" />
      <path d="M14 54c0-10 8-16 18-16s18 6 18 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  jobs: () => (
    <svg viewBox="0 0 64 64" fill="none">
      <rect x="10" y="20" width="44" height="32" rx="4" stroke="currentColor" strokeWidth="3" />
      <path d="M24 20v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4" stroke="currentColor" strokeWidth="3" />
      <path d="M10 32h44" stroke="currentColor" strokeWidth="3" />
    </svg>
  ),
  realestate: () => (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M8 30L32 10l24 20v22a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V30z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M24 56V40h16v16" stroke="currentColor" strokeWidth="3" />
    </svg>
  ),
  hotels: () => (
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M10 50V18a4 4 0 0 1 4-4h36a4 4 0 0 1 4 4v32" stroke="currentColor" strokeWidth="3" />
      <rect x="20" y="26" width="10" height="8" stroke="currentColor" strokeWidth="3" />
      <rect x="34" y="26" width="10" height="8" stroke="currentColor" strokeWidth="3" />
      <path d="M14 50h36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
};

export default function UseCasesSection() {
  const t = useTranslations('main.useCases');

  return (
    <Section id="use-cases">
      <div className="container">
        <Head>
          <h2 className="section-title">{t('title')}</h2>
        </Head>

        <Grid>
          {CASES.map((key, idx) => {
            const Icon = CASE_ICONS[key];
            return (
              <Card key={key} $idx={idx}>
                <CardText>
                  <CardTitle>{t(`cases.${key}.title`)}</CardTitle>
                  <CardDesc>{t(`cases.${key}.desc`)}</CardDesc>
                </CardText>

                <CardBottom>
                  <CardCta href={withUTM(CTA_URL, `uc_${key}`)}>
                    {t(`cases.${key}.cta`)}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path
                        d="M2.917 7h8.166M7.583 4.083L10.5 7l-2.917 2.917"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </CardCta>

                  <IconWrap aria-hidden="true">
                    <Icon />
                  </IconWrap>
                </CardBottom>
              </Card>
            );
          })}
        </Grid>
      </div>
    </Section>
  );
}
