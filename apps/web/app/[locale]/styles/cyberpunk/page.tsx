'use client';

import styled, { keyframes } from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant G: Cyberpunk Neon — pure black canvas, magenta/cyan dual-
 * neon, scanline overlay, glow on type. References: Cyberpunk 2077
 * menus, AI Town, Discord creator pages, vapor-future hacker stacks. */

const MONO = 'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace';
const BLACK = '#050010';
const MAGENTA = '#ff00ff';
const CYAN = '#00ffff';
const YELLOW = '#ffff00';
const WHITE = '#ffffff';

const flicker = keyframes`
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.6; }
  94% { opacity: 1; }
  96% { opacity: 0.8; }
`;

const Wrap = styled.div`
  min-height: 100vh;
  background: ${BLACK};
  background-image:
    repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.025) 0 1px, transparent 1px 4px),
    radial-gradient(ellipse at 50% 0%, rgba(255, 0, 255, 0.18), transparent 60%),
    radial-gradient(ellipse at 50% 100%, rgba(0, 255, 255, 0.14), transparent 60%);
  color: ${WHITE};
  font-family: ${MONO};
  overflow-x: hidden;
  position: relative;
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
  padding-block: var(--space-20) var(--space-16);
  text-align: center;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: ${CYAN};
  text-shadow: 0 0 12px ${CYAN};
  border: 1px solid ${CYAN};
  padding: 8px 18px;
  margin-bottom: var(--space-8);
  animation: ${flicker} 8s linear infinite;

  &::before {
    content: '▸';
    color: ${MAGENTA};
  }
`;

const Headline = styled.h1`
  font-family: ${MONO};
  font-size: clamp(2.75rem, 8vw, 6.5rem);
  font-weight: 800;
  line-height: 0.96;
  letter-spacing: -0.04em;
  margin: 0;
  color: ${WHITE};
  text-transform: uppercase;
  text-shadow: 0 0 24px rgba(255, 255, 255, 0.35);

  em {
    font-style: normal;
    color: ${MAGENTA};
    text-shadow:
      0 0 12px ${MAGENTA},
      0 0 24px ${MAGENTA},
      0 0 48px rgba(255, 0, 255, 0.5);
  }
`;

const Lead = styled.p`
  font-family: ${MONO};
  font-size: clamp(14px, 1.4vw, 17px);
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin: var(--space-10) auto 0;
  max-width: 640px;

  strong {
    color: ${YELLOW};
    font-weight: 700;
    text-shadow: 0 0 8px rgba(255, 255, 0, 0.6);
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
  height: 56px;
  padding: 0 var(--space-10);
  background: transparent;
  color: ${MAGENTA};
  font-family: ${MONO};
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1.5px solid ${MAGENTA};
  box-shadow: 0 0 0 0 ${MAGENTA}, inset 0 0 24px rgba(255, 0, 255, 0.1);
  transition: all var(--transition-fast);
  text-shadow: 0 0 8px ${MAGENTA};

  &:hover {
    background: ${MAGENTA};
    color: ${BLACK};
    box-shadow: 0 0 32px ${MAGENTA};
    text-shadow: none;
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 56px;
  padding: 0 var(--space-8);
  background: transparent;
  color: ${CYAN};
  font-family: ${MONO};
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1.5px solid ${CYAN};
  text-shadow: 0 0 8px ${CYAN};
  transition: all var(--transition-fast);

  &::after {
    content: '➝';
  }

  &:hover {
    background: ${CYAN};
    color: ${BLACK};
    box-shadow: 0 0 32px ${CYAN};
    text-shadow: none;
  }
`;

const TrustLine = styled.p`
  font-family: ${MONO};
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-top: var(--space-12);

  strong {
    color: ${YELLOW};
    font-weight: 700;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-20) var(--space-24);
  border-top: 1px solid rgba(0, 255, 255, 0.18);
`;

const WhyHead = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-14);
  text-align: center;
`;

const WhyLabel = styled.div`
  font-family: ${MONO};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: ${MAGENTA};
  text-shadow: 0 0 12px ${MAGENTA};
  margin-bottom: var(--space-4);
`;

const WhyTitle = styled.h2`
  font-family: ${MONO};
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0;
  color: ${WHITE};
  text-transform: uppercase;

  em {
    font-style: normal;
    color: ${CYAN};
    text-shadow: 0 0 16px ${CYAN};
  }
`;

const WhyLead = styled.p`
  font-family: ${MONO};
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
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

const Card = styled.article<{ $glow: string }>`
  position: relative;
  padding: var(--space-8);
  background: rgba(255, 255, 255, 0.02);
  border: 1.5px solid ${({ $glow }) => $glow};
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: 0 0 32px ${({ $glow }) => $glow};
    transform: translateY(-3px);
  }
`;

const CardTag = styled.div<{ $color: string }>`
  font-family: ${MONO};
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  text-shadow: 0 0 8px ${({ $color }) => $color};
  margin-bottom: var(--space-2);
`;

const CardTitle = styled.h3`
  font-family: ${MONO};
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0;
  color: ${WHITE};
  text-transform: uppercase;
`;

const CardBody = styled.p`
  font-family: ${MONO};
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
  margin: 0;
`;

const items = [
  { tag: '> /01', title: 'Never repeat yourself.', body: 'Show your agent how to do it once — the next thousand times are on autopilot.', glow: MAGENTA },
  { tag: '> /02', title: 'Capture tribal knowledge.', body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.', glow: CYAN },
  { tag: '> /03', title: 'Be in a hundred places.', body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.', glow: YELLOW },
  { tag: '> /04', title: 'Build leverage.', body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.', glow: MAGENTA },
];

export default function CyberpunkVariantPage() {
  return (
    <Wrap>
      <StyleSwitcher active="cyberpunk" tone="dark" />

      <Container>
        <Hero>
          <Eyebrow>node.fde / status: online</Eyebrow>
          <Headline>
            Your Personal <em>FDE</em>.
          </Headline>
          <Lead>
            Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person ships like a team</strong>.
          </Lead>
          <Ctas>
            <Primary href="#install">▸ init.skill</Primary>
            <Secondary href="#use-cases">view.cases</Secondary>
          </Ctas>
          <TrustLine>
            users: <strong>creators</strong> · <strong>operators</strong> · <strong>freelancers</strong> · <strong>solopreneurs</strong>
          </TrustLine>
        </Hero>

        <Why>
          <WhyHead>
            <WhyLabel>// why a personal FDE</WhyLabel>
            <WhyTitle>
              One pair of hands. <em>A hundred places.</em>
            </WhyTitle>
            <WhyLead>
              Big companies hire Forward Deployed Engineers to ship custom automation for them. Now you have one too.
            </WhyLead>
          </WhyHead>

          <Grid>
            {items.map(it => (
              <Card key={it.title} $glow={it.glow}>
                <CardTag $color={it.glow}>{it.tag}</CardTag>
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
