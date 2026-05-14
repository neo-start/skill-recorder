'use client';

import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import CtaButton from '@/components/ui/CtaButton';
import { CTA_URL, withUTM } from '@/lib/utm';

const Section = styled.section`
  position: relative;
  overflow: hidden;
  background-color: var(--color-primary-500);
  padding-block: var(--section-padding-y);
`;

const BgLayer = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.18) 0, transparent 40%),
    radial-gradient(circle at 80% 60%, rgba(255, 255, 255, 0.12) 0, transparent 45%);
  opacity: 0.9;
  pointer-events: none;
`;

const Inner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-5);
  max-width: 560px;
  margin-inline: auto;
`;

const Title = styled.h2`
  font-size: clamp(var(--text-3xl), 4vw, var(--text-4xl));
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1.15;
`;

const Actions = styled.div`
  margin-top: var(--space-10);
`;

const Note = styled.p`
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
`;

const WhiteCta = styled(CtaButton)`
  background-color: #ffffff !important;
  border-color: transparent !important;
  color: var(--color-primary-500) !important;
  &:hover { background-color: rgba(255, 255, 255, 0.9) !important; }
  &:active { background-color: rgba(255, 255, 255, 0.8) !important; }
`;

export default function CTASection() {
  const t = useTranslations('main.cta');

  return (
    <Section id="cta">
      <BgLayer aria-hidden="true" />
      <div className="container">
        <Inner>
          <Title>{t('title')}</Title>
          <Actions>
            <WhiteCta label={t('button')} href={withUTM(CTA_URL, 'bottom_cta')} />
          </Actions>
          <Note>{t('note')}</Note>
        </Inner>
      </div>
    </Section>
  );
}
