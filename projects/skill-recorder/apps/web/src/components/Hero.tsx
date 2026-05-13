'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { useLocale, useTranslations } from 'next-intl';
import { Container } from './Container';

const Wrap = styled.section`
  position: relative;
  padding: 96px 0 56px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: -20% -10% auto -10%;
    height: 60%;
    background: radial-gradient(60% 60% at 50% 0%, rgba(251, 191, 36, 0.18), transparent 70%);
    pointer-events: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 56px 0 32px;
  }
`;

const Eyebrow = styled.div`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.accentSoft};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Title = styled.h1`
  font-size: clamp(36px, 5.5vw, 64px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 18px 0 18px;
  max-width: 800px;

  em {
    font-style: normal;
    background: linear-gradient(120deg, #fbbf24 0%, #f97316 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

const Sub = styled.p`
  font-size: 18px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 620px;
  margin: 0 0 32px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Primary = styled(Link)`
  background: ${({ theme }) => theme.colors.accent};
  color: #1a1408;
  font-weight: 600;
  padding: 12px 18px;
  border-radius: ${({ theme }) => theme.radii.md};
  &:hover {
    filter: brightness(1.08);
  }
`;

const Secondary = styled(Link)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 12px 18px;
  border-radius: ${({ theme }) => theme.radii.md};
  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

const Tag = styled.span`
  display: inline-flex;
  margin-top: 10px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textFaint};
  font-family: ${({ theme }) => theme.font.mono};
`;

export function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const installUrl =
    process.env.NEXT_PUBLIC_CHROME_WEBSTORE_URL ||
    'https://chrome.google.com/webstore/detail/skill-recorder';

  return (
    <Wrap>
      <Container>
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <Title>{t.rich('title', { em: (chunks) => <em>{chunks}</em> })}</Title>
        <Sub>{t('subtitle')}</Sub>
        <Row>
          <Primary href={installUrl} target="_blank" rel="noopener">
            {t('cta')}
          </Primary>
          <Secondary href={`${prefix}/docs/getting-started`}>{t('docsCta')}</Secondary>
        </Row>
        <div>
          <Tag>{t('runtime')}</Tag>
        </div>
      </Container>
    </Wrap>
  );
}
