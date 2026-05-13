'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Container, Section } from './Container';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article<{ $featured?: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${(p) => (p.$featured ? p.theme.colors.accent : p.theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;

  h3 {
    margin: 0;
    font-size: 18px;
  }

  ul {
    margin: 12px 0 24px;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 10px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 14px;

    li::before {
      content: '·  ';
      color: ${({ theme }) => theme.colors.accent};
    }
  }

  button {
    margin-top: auto;
    padding: 11px 14px;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: -10px;
  right: 16px;
  background: ${({ theme }) => theme.colors.accent};
  color: #1a1408;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Price = styled.div`
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;

  span {
    font-size: 13px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Heading = styled.h1`
  font-size: 36px;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
`;

const Lede = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 620px;
  margin: 0 auto 48px;
  text-align: center;
  font-size: 16px;
`;

const Center = styled.div`
  text-align: center;
  margin-bottom: 40px;

  ${Heading} {
    margin-left: auto;
    margin-right: auto;
  }
`;

const TIERS = ['free', 'pro', 'team'] as const;

export function PricingTable() {
  const t = useTranslations('pricing');

  return (
    <Section>
      <Container>
        <Center>
          <Heading>{t('heading')}</Heading>
          <Lede>{t('lede')}</Lede>
        </Center>
        <Grid>
          {TIERS.map((tier) => {
            const featured = tier === 'pro';
            const featuresRaw = t.raw(`${tier}.features`) as string[];
            const features = Array.isArray(featuresRaw) ? featuresRaw : [];
            return (
              <Card key={tier} $featured={featured}>
                {featured && <Badge>{t('badge')}</Badge>}
                <h3>{t(`${tier}.name`)}</h3>
                <Price>
                  {t(`${tier}.price`)} <span>{t(`${tier}.priceSuffix`)}</span>
                </Price>
                <ul>
                  {features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button disabled>{t(`${tier}.cta`)}</button>
              </Card>
            );
          })}
        </Grid>
      </Container>
    </Section>
  );
}
