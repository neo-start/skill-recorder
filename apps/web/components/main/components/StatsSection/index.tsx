'use client';

import { useTranslations } from 'next-intl';
import styled from 'styled-components';

const Section = styled.section`
  width: 100%;
  background: none;
  padding-block: 0 var(--section-padding-y);
`;

const Inner = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-around;

  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: var(--space-8);
    justify-content: center;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);

  @media (max-width: 600px) {
    flex: 0 0 40%;
  }
`;

const StatValue = styled.span`
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--color-primary-500);
  line-height: 1;
  letter-spacing: -0.03em;
`;

const StatLabel = styled.span`
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  font-weight: 500;
`;

export default function StatsSection() {
  const t = useTranslations('main');
  const stats = t.raw('stats') as { value: string; label: string }[];

  return (
    <Section>
      <Inner>
        {stats.map((stat, i) => (
          <StatItem key={i}>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatItem>
        ))}
      </Inner>
    </Section>
  );
}
