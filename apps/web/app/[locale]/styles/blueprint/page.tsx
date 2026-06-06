'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant J: Industrial Blueprint — deep blue paper, cyan grid, mono
 * font for all labels, schematic-style corner brackets and measurement
 * lines. References: NASA technical drawings, architectural plans,
 * engineering manuals, IBM technical pubs. */

const MONO = 'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace';
const PAPER = '#0e2a47';
const CYAN = '#00d4ff';
const CYAN_SOFT = 'rgba(0, 212, 255, 0.55)';
const CYAN_FAINT = 'rgba(0, 212, 255, 0.18)';
const TXT = '#a8e8ff';

const Wrap = styled.div`
  min-height: 100vh;
  background:
    linear-gradient(${CYAN_FAINT} 1px, transparent 1px) 0 0 / 24px 24px,
    linear-gradient(90deg, ${CYAN_FAINT} 1px, transparent 1px) 0 0 / 24px 24px,
    ${PAPER};
  color: ${TXT};
  font-family: var(--font-sans);
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Stamp = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: var(--space-5);
  border-bottom: 1px solid ${CYAN_SOFT};
  font-family: ${MONO};
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${CYAN};

  & > span:last-child {
    color: ${CYAN_SOFT};
  }
`;

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  position: relative;
  padding-block: var(--space-16) var(--space-12);
  border-bottom: 1px solid ${CYAN_SOFT};
`;

const Schematic = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-12);
  align-items: end;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 1px solid ${CYAN};
  }
  &::before {
    top: -8px;
    left: -8px;
    border-right: none;
    border-bottom: none;
  }
  &::after {
    bottom: -8px;
    right: -8px;
    border-left: none;
    border-top: none;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
`;

const HeroBody = styled.div``;

const Spec = styled.div`
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  font-family: ${MONO};
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${CYAN};
  border-left: 2px solid ${CYAN};
  padding-left: var(--space-4);
  margin-bottom: var(--space-6);

  & > span:last-child {
    color: ${TXT};
    font-weight: 700;
  }
`;

const Headline = styled.h1`
  font-family: var(--font-sans);
  font-size: clamp(2.75rem, 7.5vw, 6rem);
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: -0.04em;
  margin: 0;
  color: ${TXT};

  em {
    font-style: normal;
    color: ${CYAN};
    border: 2px solid ${CYAN};
    padding: 0 12px;
    margin-left: 6px;
    display: inline-block;
    line-height: 1.05;
  }
`;

const Lead = styled.p`
  font-family: var(--font-sans);
  font-size: clamp(15px, 1.4vw, 17px);
  color: ${TXT};
  line-height: 1.6;
  margin: var(--space-6) 0 0;
  max-width: 640px;

  strong {
    color: ${CYAN};
    font-weight: 600;
    text-shadow: 0 0 8px ${CYAN_SOFT};
  }
`;

const Ctas = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
  flex-wrap: wrap;
`;

const Primary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  height: 48px;
  padding: 0 var(--space-8);
  background: ${CYAN};
  color: ${PAPER};
  font-family: ${MONO};
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background var(--transition-fast);

  &::before {
    content: '◢';
  }

  &:hover {
    background: ${TXT};
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  height: 48px;
  padding: 0 var(--space-6);
  background: transparent;
  color: ${CYAN};
  font-family: ${MONO};
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid ${CYAN_SOFT};
  transition: border-color var(--transition-fast);

  &::after {
    content: '↗';
  }

  &:hover {
    border-color: ${CYAN};
  }
`;

const Sidebar = styled.aside`
  border: 1px solid ${CYAN_SOFT};
  padding: var(--space-5);
  background: rgba(0, 212, 255, 0.04);
  min-width: 220px;

  & > .label {
    font-family: ${MONO};
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${CYAN};
    margin-bottom: var(--space-3);
  }

  & > .rows {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 6px 14px;
    font-family: ${MONO};
    font-size: 11.5px;
  }

  & > .rows dt {
    color: ${CYAN_SOFT};
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  & > .rows dd {
    color: ${TXT};
    margin: 0;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-16) var(--space-20);
`;

const WhyHead = styled.div`
  margin-bottom: var(--space-12);
  max-width: 720px;
`;

const WhyLabel = styled.div`
  font-family: ${MONO};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${CYAN};
  margin-bottom: var(--space-4);

  &::before {
    content: 'sect. ';
    color: ${CYAN_SOFT};
  }
`;

const WhyTitle = styled.h2`
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: 0;
  color: ${TXT};

  em {
    font-style: normal;
    color: ${CYAN};
  }
`;

const WhyLead = styled.p`
  font-size: 15px;
  color: ${TXT};
  line-height: 1.6;
  margin: var(--space-4) 0 0;
  max-width: 560px;
  opacity: 0.85;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  border: 1px solid ${CYAN_SOFT};

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  padding: var(--space-8);
  border-right: 1px solid ${CYAN_SOFT};
  border-bottom: 1px solid ${CYAN_SOFT};
  position: relative;

  &:nth-child(2n) {
    border-right: none;
  }
  &:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  @media (max-width: 560px) {
    border-right: none;
    &:nth-last-child(-n + 2) {
      border-bottom: 1px solid ${CYAN_SOFT};
    }
    &:last-child {
      border-bottom: none;
    }
  }
`;

const CardKey = styled.div`
  font-family: ${MONO};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${CYAN};
  margin-bottom: var(--space-3);
  display: flex;
  justify-content: space-between;

  & > span:last-child {
    color: ${CYAN_SOFT};
    font-weight: 500;
  }
`;

const CardTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  margin: 0 0 var(--space-3);
  color: ${TXT};
`;

const CardBody = styled.p`
  font-family: var(--font-sans);
  font-size: 14.5px;
  line-height: 1.6;
  margin: 0;
  color: ${TXT};
  opacity: 0.78;
`;

const items = [
  { title: 'Never repeat yourself.', body: 'Show your agent how to do it once — the next thousand times are on autopilot.' },
  { title: 'Capture tribal knowledge.', body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.' },
  { title: 'Be in a hundred places.', body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.' },
  { title: 'Build leverage.', body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.' },
];

export default function BlueprintVariantPage() {
  return (
    <Wrap>
      <StyleSwitcher active="blueprint" tone="dark" />

      <Container>
        <Stamp>
          <span>Cadeno / Drawing 01 — Hero</span>
          <span>Sheet 1 of 2 · Rev 0.1</span>
        </Stamp>

        <Hero>
          <Schematic>
            <HeroBody>
              <Spec>
                <span>spec / classification</span>
                <span>Forward Deployed Engineer · Personal</span>
              </Spec>

              <Headline>
                Your Personal <em>FDE</em>.
              </Headline>

              <Lead>
                Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person ships like a team</strong>.
              </Lead>

              <Ctas>
                <Primary href="#install">init skill</Primary>
                <Secondary href="#use-cases">view cases</Secondary>
              </Ctas>
            </HeroBody>

            <Sidebar>
              <div className="label">parameters</div>
              <dl className="rows">
                <dt>Input</dt>
                <dd>recording / doc / video</dd>
                <dt>Output</dt>
                <dd>runnable skill</dd>
                <dt>Run on</dt>
                <dd>your accounts</dd>
                <dt>Cadence</dt>
                <dd>on demand · scheduled</dd>
                <dt>Audience</dt>
                <dd>creators · ops · OPC</dd>
              </dl>
            </Sidebar>
          </Schematic>
        </Hero>

        <Why>
          <WhyHead>
            <WhyLabel>02 — Why a personal FDE</WhyLabel>
            <WhyTitle>
              One pair of hands. <em>A hundred places.</em>
            </WhyTitle>
            <WhyLead>
              Big companies hire Forward Deployed Engineers to ship custom automation for them. Now you have one too.
            </WhyLead>
          </WhyHead>

          <Grid>
            {items.map((it, i) => (
              <Card key={it.title}>
                <CardKey>
                  <span>02.{(i + 1).toString().padStart(2, '0')}</span>
                  <span>{i + 1} / {items.length}</span>
                </CardKey>
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
