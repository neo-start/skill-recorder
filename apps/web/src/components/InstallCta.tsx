'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Container, Section } from './Container';

const Card = styled.div`
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.08), transparent),
    ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 18px;
  padding: 48px 40px;
  text-align: center;

  h2 {
    font-size: 32px;
    letter-spacing: -0.02em;
    margin: 0 0 12px;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    max-width: 520px;
    margin: 0 auto 24px;
  }
`;

const Btn = styled(Link)`
  display: inline-block;
  background: ${({ theme }) => theme.colors.accent};
  color: #1a1408;
  padding: 14px 22px;
  font-weight: 600;
  font-size: 14px;
  border-radius: ${({ theme }) => theme.radii.md};

  &:hover {
    filter: brightness(1.1);
  }
`;

export function InstallCta() {
  const t = useTranslations('installCta');
  const url =
    process.env.NEXT_PUBLIC_CHROME_WEBSTORE_URL ||
    'https://chrome.google.com/webstore/detail/skill-recorder';

  return (
    <Section>
      <Container>
        <Card>
          <h2>{t('heading')}</h2>
          <p>{t('lede')}</p>
          <Btn href={url} target="_blank" rel="noopener">
            {t('cta')}
          </Btn>
        </Card>
      </Container>
    </Section>
  );
}
