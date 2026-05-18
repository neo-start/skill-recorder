'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import Button from '@/components/ui/Button';
import { CTA_URL, withUTM } from '@/lib/utm';

/* ────────────────────────────────────────────────────────────────────
 * Closing CTA — restrained, not a "blue blob with a button in it".
 * Two columns: an editorial closing note on the left, install + playground
 * tease on the right. Background is the deep primary used elsewhere as
 * code-block bg, so it ties the document together.
 * ──────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  position: relative;
  background: var(--color-primary-900);
  color: #d6e0fb;
  padding-block: var(--section-padding-y) var(--space-12);
  overflow: hidden;

  /* faint grid */
  background-image:
    linear-gradient(180deg, var(--color-primary-900) 0%, #050a1c 100%),
    radial-gradient(circle at 1px 1px, rgba(122, 158, 245, 0.07) 1px, transparent 0);
  background-size: auto, 32px 32px;
  background-blend-mode: normal, screen;
`;

const Container = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--space-8);
  position: relative;

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: var(--space-16);
  align-items: end;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: var(--space-10);
  }
`;

const Eyebrow = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary-300);
  margin-bottom: var(--space-3);
`;

const Title = styled.h2`
  font-size: clamp(1.75rem, 3.6vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: #ffffff;
  margin: 0 0 var(--space-5);

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', Georgia, serif;
    font-weight: 500;
    color: var(--color-primary-200);
  }
`;

const Sub = styled.p`
  font-size: var(--text-base);
  line-height: 1.7;
  color: #d6e0fb;
  margin: 0;
  opacity: 0.85;
  max-width: 48ch;
`;

const Ctas = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

const Primary = styled(Button)`
  height: 54px;
  padding: 0 var(--space-8);
  border-radius: 12px;
  font-size: var(--text-base);
  font-weight: 600;
  background: #ffffff;
  color: var(--color-primary-900);
  align-self: start;
  gap: var(--space-2);
  box-shadow: 0 12px 32px rgba(255, 255, 255, 0.18);

  &:hover {
    background: rgba(255, 255, 255, 0.94);
  }
`;

const SecondaryRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px dashed rgba(122, 158, 245, 0.28);
`;

const PlaygroundLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 500;
  color: #ffffff;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  padding-bottom: 4px;
  width: fit-content;

  &:hover {
    border-bottom-color: #ffffff;
  }
`;

const Spec = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: var(--color-primary-300);
  margin-top: var(--space-3);

  & > span:not(:last-child)::after {
    content: '·';
    margin-left: var(--space-3);
    color: rgba(122, 158, 245, 0.4);
  }
`;

const Foot = styled.div`
  margin-top: var(--space-16);
  padding-top: var(--space-6);
  border-top: 1px solid rgba(122, 158, 245, 0.18);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;

  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: rgba(122, 158, 245, 0.7);
`;

function ChromeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2 A10 10 0 0 1 20.66 17 L16.76 14.75 A5.5 5.5 0 0 0 12 6.5 Z" fill="#EA4335" />
      <path d="M20.66 17 A10 10 0 0 1 3.34 17 L7.24 14.75 A5.5 5.5 0 0 0 16.76 14.75 Z" fill="#FBBC04" />
      <path d="M3.34 17 A10 10 0 0 1 12 2 L12 6.5 A5.5 5.5 0 0 0 7.24 14.75 Z" fill="#34A853" />
      <circle cx="12" cy="12" r="5.5" fill="white" />
      <circle cx="12" cy="12" r="4" fill="#4285F4" />
    </svg>
  );
}

export default function CTASection() {
  const t = useTranslations('main.cta');

  return (
    <Section id="cta">
      <Container>
        <Grid>
          <div>
            <Eyebrow>{t('eyebrow')}</Eyebrow>
            <Title>
              {t.rich('title', { em: (chunks) => <em>{chunks}</em> })}
            </Title>
            <Sub>{t('sub')}</Sub>
          </div>

          <Ctas>
            <Primary size="lg" href={withUTM(CTA_URL, 'bottom_cta')}>
              <ChromeIcon /> {t('ctaPrimary')}
            </Primary>
            <SecondaryRow>
              <PlaygroundLink href="/playground">{t('playgroundLink')}</PlaygroundLink>
              <Spec>
                <span>MV3</span>
                <span>Chrome 116+</span>
                <span>Brave / Edge</span>
              </Spec>
            </SecondaryRow>
          </Ctas>
        </Grid>

        <Foot>
          <span>{t('footLeft')}</span>
          <span>v0.4.1 · Updated 2026-02-19</span>
        </Foot>
      </Container>
    </Section>
  );
}
