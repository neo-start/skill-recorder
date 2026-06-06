'use client';

import styled, { keyframes } from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant H: Vapourwave — pink→purple→teal gradient sky, gradient sun
 * behind the hero, perspective grid floor, Times Roman display, full-
 * width katakana caption. References: 80s/90s mall ads, A E S T H E T I C
 * communities, Macintosh System 1 nostalgia. */

const SERIF = "'Times New Roman', 'Iowan Old Style', Georgia, serif";
const INK = '#ffffff';
const PINK = '#ff6ad5';
const PURPLE = '#c774e8';
const LAVENDER = '#ad8cff';
const TEAL = '#8795e8';
const SUN_TOP = '#ffd6ff';
const SUN_BOT = '#ff6ad5';

const Wrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, ${PINK} 0%, ${PURPLE} 35%, ${LAVENDER} 65%, ${TEAL} 100%);
  color: ${INK};
  font-family: var(--font-sans);
  overflow-x: hidden;
  position: relative;
`;

const SunWrap = styled.div`
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  width: 520px;
  height: 320px;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;

  @media (max-width: 768px) {
    width: 360px;
    height: 220px;
    top: 100px;
  }
`;

const Sun = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(180deg, ${SUN_TOP} 0%, ${SUN_BOT} 100%);
  box-shadow: 0 0 80px rgba(255, 106, 213, 0.55);

  &::before,
  &::after,
  & {
    --b: 12px;
  }
`;

const SunBands = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60%;
  background:
    repeating-linear-gradient(0deg, transparent 0 22px, ${TEAL} 22px 30px);
  mix-blend-mode: multiply;
  opacity: 0.85;
`;

const GridFloor = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 280px;
  background-image:
    linear-gradient(${INK} 1px, transparent 1px),
    linear-gradient(90deg, ${INK} 1px, transparent 1px);
  background-size: 60px 60px;
  transform: perspective(380px) rotateX(58deg);
  transform-origin: bottom;
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
`;

const Container = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding-block: var(--space-24) var(--space-20);
  text-align: center;
`;

const Katakana = styled.div`
  font-family: ${SERIF};
  font-size: clamp(13px, 1.6vw, 17px);
  font-weight: 400;
  letter-spacing: 0.5em;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  margin-bottom: var(--space-12);
`;

const Headline = styled.h1`
  font-family: ${SERIF};
  font-size: clamp(3rem, 9vw, 7.5rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: 0.02em;
  margin: 0;
  color: ${INK};
  text-shadow:
    0 0 20px rgba(255, 255, 255, 0.4),
    3px 3px 0 rgba(255, 106, 213, 0.45),
    6px 6px 0 rgba(135, 149, 232, 0.35);

  em {
    font-style: italic;
    background: linear-gradient(180deg, ${SUN_TOP} 0%, ${SUN_BOT} 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
  }
`;

const Lead = styled.p`
  font-family: ${SERIF};
  font-style: italic;
  font-size: clamp(1.0625rem, 1.6vw, 1.3125rem);
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.55;
  margin: var(--space-10) auto 0;
  max-width: 620px;

  strong {
    font-style: normal;
    background: rgba(255, 255, 255, 0.18);
    padding: 0 8px;
    color: #ffffff;
    font-weight: 600;
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

const Primary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 54px;
  padding: 0 var(--space-10);
  background: linear-gradient(180deg, ${SUN_TOP} 0%, ${SUN_BOT} 100%);
  color: #4a0a3a;
  font-family: ${SERIF};
  font-style: italic;
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  border-radius: 100px;
  box-shadow: 0 8px 24px rgba(255, 106, 213, 0.4);
  transition: transform var(--transition-fast);

  &:hover {
    transform: translateY(-2px);
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 54px;
  padding: 0 var(--space-8);
  background: transparent;
  color: ${INK};
  font-family: ${SERIF};
  font-style: italic;
  font-size: 18px;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 100px;
  transition: background var(--transition-fast);

  &::after {
    content: '↗';
  }

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
`;

const TrustLine = styled.p`
  font-family: ${SERIF};
  font-size: 14px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin-top: var(--space-12);
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-20) var(--space-24);
`;

const WhyHead = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-14);
  text-align: center;
`;

const WhyLabel = styled.div`
  font-family: ${SERIF};
  font-size: 14px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: ${SUN_TOP};
  margin-bottom: var(--space-4);
`;

const WhyTitle = styled.h2`
  font-family: ${SERIF};
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.01em;
  margin: 0;
  color: ${INK};

  em {
    font-style: italic;
    color: ${SUN_TOP};
  }
`;

const WhyLead = styled.p`
  font-family: ${SERIF};
  font-style: italic;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.55;
  margin: var(--space-6) auto 0;
  max-width: 560px;
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
  padding: var(--space-8);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const CardTitle = styled.h3`
  font-family: ${SERIF};
  font-size: 24px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.02em;
  margin: 0;
  color: ${INK};
`;

const CardBody = styled.p`
  font-family: ${SERIF};
  font-style: italic;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.55;
  margin: 0;
`;

const items = [
  { title: 'Never repeat yourself.', body: 'Show your agent how to do it once — the next thousand times are on autopilot.' },
  { title: 'Capture tribal knowledge.', body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.' },
  { title: 'Be in a hundred places.', body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.' },
  { title: 'Build leverage.', body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.' },
];

export default function VapourwaveVariantPage() {
  return (
    <Wrap>
      <SunWrap>
        <Sun />
        <SunBands />
      </SunWrap>
      <GridFloor />
      <StyleSwitcher active="vapourwave" tone="dark" />

      <Container>
        <Hero>
          <Katakana>カデノ — Your Personal FDE</Katakana>

          <Headline>
            Your Personal <em>FDE</em>.
          </Headline>

          <Lead>
            Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person can ship like a team</strong>.
          </Lead>

          <Ctas>
            <Primary href="#install">Create your first skill</Primary>
            <Secondary href="#use-cases">See skills in action</Secondary>
          </Ctas>

          <TrustLine>creators · operators · freelancers · solopreneurs</TrustLine>
        </Hero>

        <Why>
          <WhyHead>
            <WhyLabel>· why a personal FDE ·</WhyLabel>
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
