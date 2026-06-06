'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant L: Y2K Chrome — silver-blue chrome canvas, chrome text
 * gradients, Aqua-style bubble buttons with bevel highlights, pink
 * and baby-blue accents. References: Mac OS X Aqua (2002), Windows
 * XP Luna, early iTunes, MSN Messenger, AIM. */

const SKY = '#cbe3f0';
const SKY_DEEP = '#9fbfd8';
const INK = '#0a2540';
const PINK = '#ff80a8';
const BLUE = '#5ea6ff';
const CHROME_TOP = '#ffffff';
const CHROME_MID = '#dee7f0';
const CHROME_BOT = '#8fa3b8';

const Wrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, ${SKY} 0%, ${SKY_DEEP} 100%);
  color: ${INK};
  font-family: var(--font-sans);
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding-block: var(--space-20) var(--space-16);
  text-align: center;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 18px;
  border-radius: 100px;
  background: linear-gradient(180deg, #ffffff 0%, ${PINK} 50%, #e25a82 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(226, 90, 130, 0.4);
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
  margin-bottom: var(--space-8);

  &::before {
    content: '✿';
  }
`;

const Headline = styled.h1`
  font-family: var(--font-sans);
  font-size: clamp(3rem, 8.5vw, 6.75rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.04em;
  margin: 0;
  background: linear-gradient(180deg, ${CHROME_TOP} 0%, ${CHROME_MID} 48%, ${CHROME_BOT} 52%, ${CHROME_MID} 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 0 rgba(10, 37, 64, 0.18)) drop-shadow(0 6px 20px rgba(10, 37, 64, 0.22));

  em {
    font-style: italic;
    background: linear-gradient(180deg, #ffe1ee 0%, ${PINK} 50%, #d04877 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Lead = styled.p`
  font-size: clamp(1.0625rem, 1.5vw, 1.25rem);
  color: ${INK};
  line-height: 1.55;
  margin: var(--space-10) auto 0;
  max-width: 620px;
  font-weight: 500;

  strong {
    background: linear-gradient(180deg, #fff8dd 0%, #ffd966 100%);
    padding: 0 8px;
    border-radius: 6px;
    color: ${INK};
    font-weight: 700;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 0 rgba(0, 0, 0, 0.08);
  }
`;

const Ctas = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-5);
  margin-top: var(--space-10);
  flex-wrap: wrap;
  justify-content: center;
`;

const aquaButton = `
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 52px;
  padding: 0 28px;
  border-radius: 26px;
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 15px;
  text-decoration: none;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.25);
  transition: transform 120ms ease;

  &::before {
    content: '';
    position: absolute;
    inset: 1px 1px 50% 1px;
    border-radius: 25px 25px 0 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.05) 100%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(1px);
  }
`;

const Primary = styled.a`
  ${aquaButton}
  background: linear-gradient(180deg, #79b8ff 0%, ${BLUE} 50%, #2c79e0 100%);
  color: #ffffff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2),
    0 6px 14px rgba(44, 121, 224, 0.45);
`;

const Secondary = styled.a`
  ${aquaButton}
  background: linear-gradient(180deg, #ffffff 0%, #e8eef5 50%, #b8c6d4 100%);
  color: ${INK};
  text-shadow: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(0, 0, 0, 0.12),
    0 6px 14px rgba(10, 37, 64, 0.22);
`;

const TrustLine = styled.p`
  font-size: 13px;
  color: ${INK};
  margin-top: var(--space-12);
  font-weight: 600;
  opacity: 0.7;

  strong {
    color: ${INK};
    background: rgba(255, 255, 255, 0.55);
    padding: 0 6px;
    border-radius: 4px;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-16) var(--space-24);
`;

const WhyHead = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-12);
  text-align: center;
`;

const WhyTitle = styled.h2`
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0;
  background: linear-gradient(180deg, ${CHROME_TOP} 0%, ${CHROME_MID} 48%, ${CHROME_BOT} 52%, ${CHROME_MID} 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 0 rgba(10, 37, 64, 0.18));

  em {
    font-style: italic;
    background: linear-gradient(180deg, #ffe1ee 0%, ${PINK} 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const WhyLead = styled.p`
  font-size: var(--text-lg);
  color: ${INK};
  line-height: 1.55;
  margin: var(--space-5) auto 0;
  max-width: 560px;
  font-weight: 500;
  opacity: 0.85;
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
  position: relative;
  padding: var(--space-8);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.6) 100%);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 8px 22px rgba(10, 37, 64, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const Pill = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 100px;
  background: linear-gradient(180deg, #ffffff 0%, ${({ $color }) => $color} 60%, ${({ $color }) => $color} 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 1px 0 rgba(0, 0, 0, 0.08);
  margin-bottom: var(--space-2);
`;

const CardTitle = styled.h3`
  font-size: var(--text-xl);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.015em;
  margin: 0;
  color: ${INK};
`;

const CardBody = styled.p`
  font-size: 15px;
  color: ${INK};
  line-height: 1.55;
  margin: 0;
  opacity: 0.78;
`;

const items = [
  { pill: '★ 01', color: PINK, title: 'Never repeat yourself.', body: 'Show your agent how to do it once — the next thousand times are on autopilot.' },
  { pill: '★ 02', color: BLUE, title: 'Capture tribal knowledge.', body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.' },
  { pill: '★ 03', color: '#ffb05e', title: 'Be in a hundred places.', body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.' },
  { pill: '★ 04', color: '#7adfa8', title: 'Build leverage.', body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.' },
];

export default function Y2KVariantPage() {
  return (
    <Wrap>
      <StyleSwitcher active="y2k" tone="light" />

      <Container>
        <Hero>
          <Badge>Cadeno — your personal FDE</Badge>

          <Headline>
            Your Personal <em>FDE</em>.
          </Headline>

          <Lead>
            Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person can ship like a team</strong>.
          </Lead>

          <Ctas>
            <Primary href="#install">✨ Create your first skill</Primary>
            <Secondary href="#use-cases">See skills in action →</Secondary>
          </Ctas>

          <TrustLine>
            built for <strong>creators</strong> · <strong>operators</strong> · <strong>freelancers</strong> · <strong>solopreneurs</strong>
          </TrustLine>
        </Hero>

        <Why>
          <WhyHead>
            <WhyTitle>
              One pair of hands. <em>A hundred places.</em>
            </WhyTitle>
            <WhyLead>
              Big companies hire Forward Deployed Engineers to ship custom automation for them. Now you have one too.
            </WhyLead>
          </WhyHead>

          <Grid>
            {items.map(it => (
              <Card key={it.title}>
                <Pill $color={it.color}>{it.pill}</Pill>
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
