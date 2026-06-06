'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant C: Friendly Pastel — warm cream canvas, rotating pastel
 * accents per card, rounded everything, soft shadows. References:
 * Notion, Granola, Cron, Loom, Linear's consumer edges. Approachable
 * over imposing. */

const PAPER = '#fff5ec';
const INK = '#2d2748';
const INK_SOFT = 'rgba(45, 39, 72, 0.66)';
const PEACH = '#ff7a59';
const SKY = '#5ec8ff';
const MINT = '#5edcaa';
const SUN = '#ffc857';

const Wrap = styled.div`
  min-height: 100vh;
  background: ${PAPER};
  color: ${INK};
  font-family: var(--font-sans);
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

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding-block: var(--space-24) var(--space-16);
  text-align: center;
  position: relative;
`;

const FloatingShape = styled.span<{ $top: string; $left: string; $color: string; $rotate: string }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: ${({ $color }) => $color};
  transform: rotate(${({ $rotate }) => $rotate});
  opacity: 0.85;
  z-index: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
`;

const Sticker = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #ffffff;
  border: 1.5px solid ${INK};
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  margin-bottom: var(--space-8);
  box-shadow: 4px 4px 0 ${INK};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${MINT};
  }
`;

const Headline = styled.h1`
  font-size: clamp(2.75rem, 7.5vw, 6rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.035em;
  margin: 0;
  color: ${INK};

  em {
    font-style: normal;
    display: inline-block;
    background: ${SUN};
    padding: 0 14px 4px;
    border-radius: 18px;
    transform: rotate(-2deg);
    margin: 0 4px;
  }
`;

const Lead = styled.p`
  font-size: clamp(1.0625rem, 1.5vw, 1.3125rem);
  color: ${INK_SOFT};
  line-height: 1.55;
  margin: var(--space-10) auto 0;
  max-width: 620px;
  font-weight: 500;

  strong {
    color: ${INK};
    font-weight: 700;
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
  height: 60px;
  padding: 0 var(--space-10);
  border-radius: 100px;
  background: ${INK};
  color: ${PAPER};
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 4px 4px 0 ${PEACH};

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 ${PEACH};
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 60px;
  padding: 0 var(--space-8);
  border-radius: 100px;
  background: #ffffff;
  color: ${INK};
  border: 1.5px solid ${INK};
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: background var(--transition-fast);

  &:hover {
    background: ${SKY};
    color: ${INK};
  }
`;

const TrustLine = styled.p`
  font-size: 14px;
  color: ${INK_SOFT};
  margin-top: var(--space-12);
  font-weight: 500;

  strong {
    color: ${INK};
    font-weight: 700;
    background: linear-gradient(to top, ${MINT} 0%, ${MINT} 40%, transparent 40%);
    padding: 0 2px;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-20) var(--space-24);
`;

const WhyHead = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-12);
  text-align: center;
`;

const WhyLabel = styled.div`
  display: inline-block;
  padding: 6px 14px;
  background: ${PEACH};
  color: #ffffff;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: var(--space-4);
`;

const WhyTitle = styled.h2`
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0;
  color: ${INK};

  em {
    font-style: normal;
    background: linear-gradient(to top, ${SKY} 0%, ${SKY} 35%, transparent 35%);
    padding: 0 4px;
  }
`;

const WhyLead = styled.p`
  font-size: var(--text-lg);
  color: ${INK_SOFT};
  line-height: 1.55;
  margin: var(--space-6) auto 0;
  max-width: 560px;
  font-weight: 500;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article<{ $bg: string; $shadow: string }>`
  position: relative;
  padding: var(--space-8);
  background: ${({ $bg }) => $bg};
  border: 1.5px solid ${INK};
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  box-shadow: 6px 6px 0 ${({ $shadow }) => $shadow};
  transition: transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 ${({ $shadow }) => $shadow};
  }
`;

const Emoji = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #ffffff;
  border: 1.5px solid ${INK};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: var(--space-3);
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
  color: ${INK_SOFT};
  line-height: 1.55;
  margin: 0;
  font-weight: 500;
`;

const items = [
  {
    emoji: '🔁',
    title: 'Never repeat yourself.',
    body: 'Show your agent how to do it once — the next thousand times are on autopilot.',
    bg: '#fff0e6',
    shadow: PEACH,
  },
  {
    emoji: '📚',
    title: 'Capture tribal knowledge.',
    body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.',
    bg: '#e6f4ff',
    shadow: SKY,
  },
  {
    emoji: '🌐',
    title: 'Be in a hundred places.',
    body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.',
    bg: '#e6faf2',
    shadow: MINT,
  },
  {
    emoji: '⚡',
    title: 'Build leverage.',
    body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.',
    bg: '#fff5d6',
    shadow: SUN,
  },
];

export default function PastelVariantPage() {
  return (
    <Wrap>
      <StyleSwitcher active="pastel" tone="warm" />

      <Container>
        <Hero>
          <FloatingShape $top="60px" $left="8%" $color={PEACH} $rotate="-12deg" />
          <FloatingShape $top="140px" $left="86%" $color={SKY} $rotate="14deg" />
          <FloatingShape $top="320px" $left="4%" $color={MINT} $rotate="6deg" />

          <HeroInner>
            <Sticker>Cadeno — your personal FDE</Sticker>

            <Headline>
              Your Personal <em>FDE</em>.
            </Headline>

            <Lead>
              Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person can ship like a team</strong>.
            </Lead>

            <Ctas>
              <Primary href="#install">Create your first skill →</Primary>
              <Secondary href="#use-cases">See skills in action</Secondary>
            </Ctas>

            <TrustLine>
              Built for <strong>creators</strong>, <strong>operators</strong>, <strong>freelancers</strong>, and <strong>solopreneurs</strong>.
            </TrustLine>
          </HeroInner>
        </Hero>

        <Why>
          <WhyHead>
            <WhyLabel>Why a personal FDE</WhyLabel>
            <WhyTitle>
              You have one pair of hands. <em>Be in a hundred places.</em>
            </WhyTitle>
            <WhyLead>
              Big companies hire Forward Deployed Engineers to ship custom automation for them. Now you have one too.
            </WhyLead>
          </WhyHead>

          <Grid>
            {items.map(it => (
              <Card key={it.title} $bg={it.bg} $shadow={it.shadow}>
                <Emoji>{it.emoji}</Emoji>
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
