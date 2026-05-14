'use client';

import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import Button from '@/components/ui/Button';
import { CTA_URL, withUTM } from '@/lib/utm';

function ChromeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 2 A10 10 0 0 1 20.66 17 L16.76 14.75 A5.5 5.5 0 0 0 12 6.5 Z" fill="#EA4335" />
      <path d="M20.66 17 A10 10 0 0 1 3.34 17 L7.24 14.75 A5.5 5.5 0 0 0 16.76 14.75 Z" fill="#FBBC04" />
      <path d="M3.34 17 A10 10 0 0 1 12 2 L12 6.5 A5.5 5.5 0 0 0 7.24 14.75 Z" fill="#34A853" />
      <circle cx="12" cy="12" r="5.5" fill="white" />
      <circle cx="12" cy="12" r="4" fill="#4285F4" />
    </svg>
  );
}

const Section = styled.section`
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-top: calc(-1 * var(--navbar-height));
  --circle-clearance: 350px;
`;

const BgLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 12% 6%, rgba(122, 158, 245, 0.45) 0, transparent 38%),
    radial-gradient(circle at 90% 18%, rgba(173, 193, 247, 0.35) 0, transparent 42%),
    linear-gradient(180deg, #eef2fd 0%, #ffffff 70%);
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-5);
  padding: calc(var(--navbar-height) + clamp(64px, 5vh, 128px)) var(--space-6)
    calc(var(--circle-clearance) + var(--space-6));
  max-width: 960px;
  width: 100%;
`;

const Headline = styled.h1`
  font-size: clamp(2rem, 7vw, var(--text-5xl));
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0;

  @media (max-width: 768px) {
    font-size: clamp(1.75rem, 7vw, 2.5rem);
  }
`;

const Subheadline = styled.p`
  font-size: var(--text-base);
  color: var(--color-gray-700);
  line-height: 1.6;
  margin: 0;
  max-width: 480px;

  @media (min-width: 769px) {
    max-width: none;
  }
`;

const Note = styled.p`
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
`;

const HeroCta = styled(Button)`
  margin-top: auto;
  height: 52px;
  padding: 0 var(--space-8);
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(48, 92, 222, 0.35);

  @media (max-width: 768px) {
    margin-top: var(--space-10);
  }
`;

const Circle = styled.div`
  position: absolute;
  z-index: 1;
  width: 1400px;
  height: 1600px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  left: 50%;
  bottom: -1250px;
  transform: translateX(-50%);
  pointer-events: none;
`;

const MockWrap = styled.div`
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: clamp(280px, 38%, 580px);
  line-height: 0;
`;

const MockSvg = styled.svg`
  width: 100%;
  height: auto;
  display: block;
`;

export default function HeroSection() {
  const t = useTranslations('main.hero');

  return (
    <Section id="hero">
      <BgLayer aria-hidden="true" />
      <Content>
        <Headline>{t('title')}</Headline>
        <Subheadline>{t('subtitle')}</Subheadline>
        <HeroCta size="lg" href={withUTM(CTA_URL, 'hero_cta')}>
          <ChromeIcon />
          {t('ctaPrimary')}
        </HeroCta>
        <Note>{t('note')}</Note>
      </Content>

      <Circle aria-hidden="true" />

      <MockWrap aria-hidden="true">
        <MockSvg viewBox="0 0 480 270" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="hero-gradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#1a2f6e" />
              <stop offset="100%" stopColor="#305cde" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="480" height="270" rx="14" fill="url(#hero-gradient)" />
          <circle cx="22" cy="20" r="5" fill="#ff5f57" />
          <circle cx="40" cy="20" r="5" fill="#febc2e" />
          <circle cx="58" cy="20" r="5" fill="#28c840" />
          <rect x="22" y="40" width="436" height="42" rx="6" fill="rgba(255,255,255,0.06)" />
          <rect x="34" y="54" width="270" height="6" rx="3" fill="rgba(255,255,255,0.45)" />
          <rect x="34" y="66" width="180" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x="22" y="92" width="436" height="156" rx="6" fill="rgba(255,255,255,0.04)" />
          <text x="36" y="116" fill="#eaeeff" fontFamily="monospace" fontSize="13" fontWeight="600">
            ## record-purchase-order.SKILL.md
          </text>
          <text x="36" y="142" fill="#7a9ef5" fontFamily="monospace" fontSize="12">
            1. open supplier portal
          </text>
          <text x="36" y="162" fill="#7a9ef5" fontFamily="monospace" fontSize="12">
            2. click "new purchase order"
          </text>
          <text x="36" y="182" fill="#7a9ef5" fontFamily="monospace" fontSize="12">
            3. fill {`{sku}`} and {`{quantity}`}
          </text>
          <text x="36" y="202" fill="#7a9ef5" fontFamily="monospace" fontSize="12">
            4. submit
          </text>
          <rect x="36" y="218" width="92" height="22" rx="6" fill="#305cde" />
          <text x="56" y="234" fill="#ffffff" fontFamily="monospace" fontSize="11" fontWeight="600">
            Download
          </text>
        </MockSvg>
      </MockWrap>
    </Section>
  );
}
