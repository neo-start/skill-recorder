'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant D: Brutalist Mono — pure white canvas, mono everywhere,
 * heavy black rules, single red accent. No rounded corners. Visible
 * grid. References: Vercel OSS, Linear docs, Hacker News archive,
 * Y Combinator startup-school pages. Raw over polished. */

const MONO = 'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace';
const INK = '#000000';
const PAPER = '#ffffff';
const RED = '#ff2400';
const FAINT = 'rgba(0,0,0,0.55)';

const Wrap = styled.div`
  min-height: 100vh;
  background: ${PAPER};
  color: ${INK};
  font-family: ${MONO};
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-inline: var(--space-8);
  border-left: 1px solid ${INK};
  border-right: 1px solid ${INK};

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Masthead = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: var(--space-5);
  border-bottom: 1px solid ${INK};
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;

  & > .name {
    font-weight: 700;
  }

  & > .meta {
    color: ${FAINT};
  }
`;

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding-block: var(--space-16) var(--space-12);
  border-bottom: 1px solid ${INK};
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
`;

const IndexRow = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr 96px;
  gap: var(--space-6);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${FAINT};
  padding-bottom: var(--space-3);
  border-bottom: 1px dashed ${INK};

  & > span:nth-child(2) {
    color: ${INK};
    font-weight: 700;
  }
  & > span:last-child {
    text-align: right;
  }
`;

const Headline = styled.h1`
  font-family: ${MONO};
  font-size: clamp(2.5rem, 7.5vw, 6rem);
  font-weight: 700;
  line-height: 0.92;
  letter-spacing: -0.04em;
  margin: 0;
  color: ${INK};
  text-transform: uppercase;

  em {
    font-style: normal;
    color: ${RED};
    background: ${INK};
    padding: 0 12px 4px;
    margin: 0 4px;
    display: inline-block;
  }
`;

const Lead = styled.p`
  font-family: ${MONO};
  font-size: clamp(15px, 1.4vw, 18px);
  line-height: 1.6;
  margin: 0;
  max-width: 720px;
  color: ${INK};

  strong {
    background: ${RED};
    color: ${PAPER};
    padding: 0 6px;
    font-weight: 700;
  }
`;

const Ctas = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-top: var(--space-4);
  border-top: 1px solid ${INK};
  border-bottom: 1px solid ${INK};

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const Primary = styled.a`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-8);
  background: ${INK};
  color: ${PAPER};
  font-family: ${MONO};
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border-right: 1px solid ${INK};
  transition: background var(--transition-fast);

  &:hover {
    background: ${RED};
  }

  @media (max-width: 560px) {
    border-right: none;
    border-bottom: 1px solid ${INK};
  }
`;

const Secondary = styled.a`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-8);
  background: ${PAPER};
  color: ${INK};
  font-family: ${MONO};
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);

  &::after {
    content: '↗';
  }

  &:hover {
    background: ${INK};
    color: ${PAPER};
  }
`;

const TrustLine = styled.p`
  font-family: ${MONO};
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${FAINT};
  margin: 0;
  padding-top: var(--space-4);

  strong {
    color: ${INK};
    font-weight: 700;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-12) 0;
`;

const SectionMast = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr 96px;
  gap: var(--space-6);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid ${INK};

  & > span:nth-child(2) {
    font-weight: 700;
  }
  & > span:last-child {
    text-align: right;
    color: ${FAINT};
  }
`;

const WhyTitle = styled.h2`
  font-family: ${MONO};
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: var(--space-8) 0 var(--space-3);
  color: ${INK};
  text-transform: uppercase;

  em {
    font-style: normal;
    color: ${RED};
  }
`;

const WhyLead = styled.p`
  font-family: ${MONO};
  font-size: 15px;
  line-height: 1.55;
  margin: 0 0 var(--space-10);
  max-width: 640px;
  color: ${FAINT};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  border-top: 1px solid ${INK};
  border-bottom: 1px solid ${INK};

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  padding: var(--space-8);
  border-right: 1px solid ${INK};
  border-bottom: 1px solid ${INK};

  &:nth-child(2n) {
    border-right: none;
  }
  &:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  @media (max-width: 560px) {
    border-right: none;
    &:nth-last-child(-n + 2) {
      border-bottom: 1px solid ${INK};
    }
    &:last-child {
      border-bottom: none;
    }
  }
`;

const CardIndex = styled.div`
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${RED};
  margin-bottom: var(--space-3);
  display: flex;
  justify-content: space-between;

  & > span:last-child {
    color: ${FAINT};
  }
`;

const CardTitle = styled.h3`
  font-family: ${MONO};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  margin: 0 0 var(--space-3);
  color: ${INK};
  text-transform: uppercase;
`;

const CardBody = styled.p`
  font-family: ${MONO};
  font-size: 14px;
  line-height: 1.55;
  margin: 0;
  color: ${INK};
`;

const Foot = styled.footer`
  padding-block: var(--space-5);
  border-top: 0;
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${FAINT};
  display: flex;
  justify-content: space-between;
`;

const items = [
  {
    title: 'Never repeat yourself.',
    body: 'Show your agent how to do it once — the next thousand times are on autopilot.',
  },
  {
    title: 'Capture tribal knowledge.',
    body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.',
  },
  {
    title: 'Be in a hundred places.',
    body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.',
  },
  {
    title: 'Build leverage.',
    body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.',
  },
];

export default function BrutalistVariantPage() {
  return (
    <Wrap>
      <StyleSwitcher active="brutalist" tone="mono" />

      <Container>
        <Masthead>
          <span className="name">Cadeno / Your Personal FDE</span>
          <span className="meta">Build 2026.06</span>
        </Masthead>

        <Hero>
          <IndexRow>
            <span>§ 01</span>
            <span>Forward Deployed Engineer — For You</span>
            <span>v0.1</span>
          </IndexRow>

          <Headline>
            Your Personal <em>FDE</em>.
          </Headline>

          <Lead>
            Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person ships like a team</strong>.
          </Lead>

          <Ctas>
            <Primary href="#install">▸ Create your first skill</Primary>
            <Secondary href="#use-cases">See skills in action</Secondary>
          </Ctas>

          <TrustLine>
            Built for <strong>creators</strong> · <strong>operators</strong> · <strong>freelancers</strong> · <strong>solopreneurs</strong>
          </TrustLine>
        </Hero>

        <Why>
          <SectionMast>
            <span>§ 02</span>
            <span>Why a personal FDE</span>
            <span>4 items</span>
          </SectionMast>

          <WhyTitle>
            One pair of hands. <em>A hundred places.</em>
          </WhyTitle>
          <WhyLead>
            Big companies hire Forward Deployed Engineers to ship custom automation for them. Now you have one too.
          </WhyLead>

          <Grid>
            {items.map((it, i) => (
              <Card key={it.title}>
                <CardIndex>
                  <span>§ 02.{(i + 1).toString().padStart(2, '0')}</span>
                  <span>Item {i + 1} of {items.length}</span>
                </CardIndex>
                <CardTitle>{it.title}</CardTitle>
                <CardBody>{it.body}</CardBody>
              </Card>
            ))}
          </Grid>
        </Why>

        <Foot>
          <span>End of document</span>
          <span>Cadeno · 2026</span>
        </Foot>
      </Container>
    </Wrap>
  );
}
