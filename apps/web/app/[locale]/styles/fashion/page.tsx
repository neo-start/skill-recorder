'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant K: Fashion Magazine — pure white canvas, tall thin display
 * serif, single Vogue-red accent, "No. 01" callouts, dramatic
 * horizontal rules. References: Vogue, Harper's Bazaar, AnOther
 * Magazine, T: The New York Times Style Magazine. */

const SERIF = "'Iowan Old Style', 'Georgia', 'Times New Roman', serif";
const INK = '#0a0a0a';
const PAPER = '#ffffff';
const RED = '#dd0000';
const FAINT = 'rgba(10, 10, 10, 0.55)';

const Wrap = styled.div`
  min-height: 100vh;
  background: ${PAPER};
  color: ${INK};
  font-family: ${SERIF};
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Masthead = styled.header`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-6);
  padding-block: var(--space-8) var(--space-4);
  border-bottom: 4px solid ${INK};

  & > .name {
    font-family: ${SERIF};
    font-weight: 500;
    font-size: clamp(36px, 5vw, 64px);
    letter-spacing: -0.02em;
    line-height: 1;
  }

  & > .meta {
    font-family: var(--font-sans);
    font-size: 11px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: ${FAINT};
    text-align: right;
  }
`;

const SubRule = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: var(--space-3);
  border-bottom: 1px solid ${INK};
  font-family: var(--font-sans);
  font-size: 10.5px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: ${FAINT};

  & > .right {
    color: ${RED};
  }
`;

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding-block: var(--space-20) var(--space-16);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: end;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: var(--space-10);
  }
`;

const HeroLeft = styled.div``;

const Number = styled.div`
  font-family: ${SERIF};
  font-style: italic;
  font-weight: 500;
  font-size: 120px;
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: ${RED};
  margin-bottom: var(--space-6);

  & > sup {
    font-size: 0.35em;
    vertical-align: super;
    color: ${INK};
    margin-right: 8px;
    letter-spacing: 0.04em;
  }
`;

const Story = styled.p`
  font-family: var(--font-sans);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: ${INK};
  margin-bottom: var(--space-3);
`;

const Headline = styled.h1`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: clamp(3.5rem, 9vw, 7rem);
  line-height: 0.92;
  letter-spacing: -0.035em;
  margin: 0;
  color: ${INK};

  em {
    font-style: italic;
    color: ${RED};
  }
`;

const HeroRight = styled.div`
  border-left: 1px solid ${INK};
  padding-left: var(--space-10);

  @media (max-width: 880px) {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid ${INK};
    padding-top: var(--space-8);
  }
`;

const Lead = styled.p`
  font-family: ${SERIF};
  font-size: 19px;
  line-height: 1.55;
  margin: 0;
  color: ${INK};

  &::first-letter {
    font-size: 4em;
    line-height: 0.85;
    float: left;
    color: ${RED};
    padding-right: 12px;
    padding-top: 6px;
    font-weight: 500;
  }

  strong {
    font-weight: 500;
    font-style: italic;
    color: ${RED};
  }
`;

const Ctas = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-6);
  margin-top: var(--space-8);
  flex-wrap: wrap;
`;

const Primary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  height: 48px;
  padding: 0 var(--space-8);
  background: ${INK};
  color: ${PAPER};
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background var(--transition-fast);

  &:hover {
    background: ${RED};
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${SERIF};
  font-style: italic;
  font-size: 18px;
  color: ${INK};
  text-decoration: underline;
  text-underline-offset: 5px;
  text-decoration-thickness: 1px;

  &:hover {
    color: ${RED};
  }
`;

const Byline = styled.p`
  font-family: var(--font-sans);
  font-size: 10.5px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: ${FAINT};
  margin-top: var(--space-10);
  padding-top: var(--space-5);
  border-top: 1px solid ${INK};

  & > strong {
    color: ${INK};
    font-weight: 600;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-12) var(--space-20);
  border-top: 4px solid ${INK};
`;

const WhyMast = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-block: var(--space-4) var(--space-3);
  border-bottom: 1px solid ${INK};
  margin-bottom: var(--space-12);

  & > .left {
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: ${RED};
  }

  & > .right {
    font-family: ${SERIF};
    font-style: italic;
    font-size: 17px;
    color: ${FAINT};
  }
`;

const WhyTitle = styled.h2`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
  margin: 0 0 var(--space-6);
  max-width: 720px;
  color: ${INK};

  em {
    font-style: italic;
    color: ${RED};
  }
`;

const WhyLead = styled.p`
  font-family: ${SERIF};
  font-size: 18px;
  line-height: 1.55;
  margin: 0 0 var(--space-14);
  max-width: 580px;
  color: ${FAINT};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);

  @media (max-width: 880px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  border-top: 4px solid ${INK};
  padding-top: var(--space-4);
`;

const CardNo = styled.div`
  font-family: ${SERIF};
  font-style: italic;
  font-size: 13px;
  letter-spacing: 0.06em;
  color: ${RED};
  margin-bottom: var(--space-2);

  & > sup {
    font-size: 0.8em;
    vertical-align: super;
  }
`;

const CardTitle = styled.h3`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.015em;
  margin: 0 0 var(--space-3);
  color: ${INK};
`;

const CardBody = styled.p`
  font-family: ${SERIF};
  font-size: 15px;
  line-height: 1.55;
  margin: 0;
  color: ${FAINT};
`;

const items = [
  { title: 'Never repeat yourself.', body: 'Show your agent how to do it once — the next thousand times are on autopilot.' },
  { title: 'Capture tribal knowledge.', body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.' },
  { title: 'Be in a hundred places.', body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.' },
  { title: 'Build leverage.', body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.' },
];

export default function FashionVariantPage() {
  return (
    <Wrap>
      <StyleSwitcher active="fashion" tone="light" />

      <Container>
        <Masthead>
          <span className="name">CADENO</span>
          <span className="meta">
            Vol. I · No. 01<br />
            The Forward-Deployed Issue
          </span>
        </Masthead>

        <SubRule>
          <span>Featuring · Your Personal FDE · The art of distillation</span>
          <span className="right">2026</span>
        </SubRule>

        <Hero>
          <HeroLeft>
            <Number>
              <sup>No.</sup>01
            </Number>
            <Story>The Cover Story</Story>
            <Headline>
              Your Personal <em>FDE</em>.
            </Headline>
          </HeroLeft>

          <HeroRight>
            <Lead>
              Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person can ship like a team</strong>.
            </Lead>

            <Ctas>
              <Primary href="#install">Create your first skill</Primary>
              <Secondary href="#use-cases">See skills in action ↗</Secondary>
            </Ctas>

            <Byline>
              <strong>For</strong> · Creators · Operators · Freelancers · Solopreneurs
            </Byline>
          </HeroRight>
        </Hero>

        <Why>
          <WhyMast>
            <span className="left">Section II · The Case</span>
            <span className="right">Four arguments for hiring yourself one.</span>
          </WhyMast>

          <WhyTitle>
            You have one pair of hands. <em>Be in a hundred places.</em>
          </WhyTitle>
          <WhyLead>
            Big companies hire Forward Deployed Engineers to ship custom automation for them. Now you have one too.
          </WhyLead>

          <Grid>
            {items.map((it, i) => (
              <Card key={it.title}>
                <CardNo>
                  <sup>No.</sup> {(i + 1).toString().padStart(2, '0')}
                </CardNo>
                <CardTitle>{it.title}</CardTitle>
                <CardBody>{it.body}</CardBody>
              </Card>
            ))}
          </Grid>
        </Why>
      </Container>
    </Wrap>
  );
}
