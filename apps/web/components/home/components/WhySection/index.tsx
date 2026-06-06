'use client';

import styled from 'styled-components';

/* ────────────────────────────────────────────────────────────────────
 * Why — five callouts on what a personal FDE unlocks. Format mirrors
 * Delphi's "You're in demand. Be present for every opportunity." section:
 * one strong heading, a short prose lead, then a 2-3-2 grid of callout
 * cards, each titled with a verb-led promise.
 * ──────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  padding-block: var(--space-24);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 768px) {
    padding-block: var(--space-16);
  }
`;

const Inner = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Header = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-16);
  text-align: center;
`;

const Label = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-primary-600);
  margin-bottom: var(--space-4);
`;

const Title = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0;

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    color: var(--color-primary-600);
  }
`;

const Lead = styled.p`
  font-size: var(--text-lg);
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: var(--space-6) auto 0;
  max-width: 580px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg);
  transition: border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    border-color: var(--color-border-hover);
    transform: translateY(-2px);
    box-shadow: 0 12px 28px -16px rgba(7, 14, 36, 0.18);
  }

  @media (max-width: 560px) {
    padding: var(--space-6);
  }
`;

const Icon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
  margin-bottom: var(--space-3);
`;

const CardTitle = styled.h3`
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-gray-900);
  line-height: 1.25;
  letter-spacing: -0.015em;
  margin: 0;
`;

const CardBody = styled.p`
  font-size: 0.9375rem;
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: 0;
`;

type Item = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

const items: Item[] = [
  {
    title: 'Never repeat yourself.',
    body: 'Show your agent how to do it once — the next thousand times are on autopilot.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
  },
  {
    title: 'Capture tribal knowledge.',
    body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    title: 'Be in a hundred places.',
    body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: 'Build leverage.',
    body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function WhySection() {
  return (
    <Section id="why">
      <Inner>
        <Header>
          <Label>Why a personal FDE</Label>
          <Title>
            You have one pair of hands. <em>Be in a hundred places.</em>
          </Title>
          <Lead>
            Big companies hire Forward Deployed Engineers to ship custom automation for them. Now you have one too — and it works only for you.
          </Lead>
        </Header>

        <Grid>
          {items.map(it => (
            <Card key={it.title}>
              <Icon>{it.icon}</Icon>
              <CardTitle>{it.title}</CardTitle>
              <CardBody>{it.body}</CardBody>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}
