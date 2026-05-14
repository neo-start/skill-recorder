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

const Card = styled.article`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  transition: border-color 200ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    letter-spacing: -0.01em;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 14px;
    line-height: 1.55;
  }
`;

const Step = styled.div`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Heading = styled.h2`
  font-size: 32px;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
  max-width: 620px;
`;

const Lede = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 580px;
  font-size: 15px;
  margin: 0 0 36px;
`;

const KEYS = ['record', 'distill', 'export'] as const;

export function FeatureGrid() {
  const t = useTranslations('features');
  return (
    <Section>
      <Container>
        <Heading>{t('heading')}</Heading>
        <Lede>{t('lede')}</Lede>
        <Grid>
          {KEYS.map((key, i) => (
            <Card key={key}>
              <Step>{`Step ${i + 1}`}</Step>
              <h3>{t(`${key}.title`)}</h3>
              <p>{t(`${key}.body`)}</p>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
