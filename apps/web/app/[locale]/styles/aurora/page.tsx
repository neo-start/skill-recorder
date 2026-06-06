'use client';

import styled, { keyframes } from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant E: Aurora Glass — soft pastel aurora bg with floating color
 * orbs, frosted glass cards on top, deep purple ink. References:
 * Apple Vision Pro, watchOS, Linear's marketing, Cursor's hero pages,
 * Stripe's aurora era. Ethereal, premium-tech. */

const INK = '#2a1a4a';
const INK_SOFT = 'rgba(42, 26, 74, 0.65)';
const LAVENDER = '#9e7cff';
const PINK = '#ff8cb3';
const CYAN = '#6ce7e7';
const PEACH = '#ffb887';

const drift = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.08); }
  66% { transform: translate(-30px, 30px) scale(0.95); }
`;

const Wrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fae6f5 0%, #e8e0ff 45%, #dcefff 100%);
  color: ${INK};
  font-family: var(--font-sans);
  position: relative;
  overflow-x: hidden;
`;

const Orb = styled.span<{ $top: string; $left: string; $color: string; $size: string; $delay: string }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  border-radius: 50%;
  background: ${({ $color }) => $color};
  filter: blur(70px);
  opacity: 0.55;
  pointer-events: none;
  animation: ${drift} 18s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
`;

const Container = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1180px;
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

const GlassBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  color: ${INK};
  letter-spacing: -0.005em;
  margin-bottom: var(--space-8);
  box-shadow: 0 8px 24px -8px rgba(42, 26, 74, 0.18);

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${LAVENDER}, ${PINK});
    box-shadow: 0 0 12px ${LAVENDER};
  }
`;

const Headline = styled.h1`
  font-size: clamp(3rem, 8vw, 6.5rem);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -0.04em;
  margin: 0;
  color: ${INK};

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    background: linear-gradient(120deg, ${LAVENDER}, ${PINK}, ${PEACH});
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Lead = styled.p`
  font-size: clamp(1.0625rem, 1.5vw, 1.3125rem);
  color: ${INK_SOFT};
  line-height: 1.55;
  margin: var(--space-10) auto 0;
  max-width: 620px;

  strong {
    color: ${INK};
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
  height: 58px;
  padding: 0 var(--space-10);
  border-radius: 100px;
  background: ${INK};
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0 12px 32px -8px rgba(42, 26, 74, 0.45);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px -10px rgba(42, 26, 74, 0.55);
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 58px;
  padding: 0 var(--space-8);
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.7);
  color: ${INK};
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
  transition: background var(--transition-fast);

  &::after {
    content: '→';
    transition: transform var(--transition-fast);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.7);
  }

  &:hover::after {
    transform: translateX(3px);
  }
`;

const TrustLine = styled.p`
  font-size: 13px;
  color: ${INK_SOFT};
  margin-top: var(--space-12);
  letter-spacing: 0.01em;

  strong {
    color: ${INK};
    font-weight: 600;
  }
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
  display: inline-block;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${INK};
  margin-bottom: var(--space-5);
`;

const WhyTitle = styled.h2`
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0;
  color: ${INK};

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    background: linear-gradient(120deg, ${LAVENDER}, ${CYAN});
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const WhyLead = styled.p`
  font-size: var(--text-lg);
  color: ${INK_SOFT};
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
  position: relative;
  padding: var(--space-8);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  box-shadow: 0 16px 40px -16px rgba(42, 26, 74, 0.18);
  transition: transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 24px 56px -20px rgba(42, 26, 74, 0.28);
  }
`;

const IconBox = styled.div<{ $tint: string }>`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: ${({ $tint }) => $tint};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin-bottom: var(--space-3);
  box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.18);
`;

const CardTitle = styled.h3`
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  margin: 0;
  color: ${INK};
`;

const CardBody = styled.p`
  font-size: 0.9375rem;
  color: ${INK_SOFT};
  line-height: 1.55;
  margin: 0;
`;

const items = [
  {
    title: 'Never repeat yourself.',
    body: 'Show your agent how to do it once — the next thousand times are on autopilot.',
    tint: `linear-gradient(135deg, ${LAVENDER}, #6d4fff)`,
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
    tint: `linear-gradient(135deg, ${PINK}, #ff5d8f)`,
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
    tint: `linear-gradient(135deg, ${CYAN}, #4cb8b8)`,
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
    tint: `linear-gradient(135deg, ${PEACH}, #ff8c5d)`,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function AuroraVariantPage() {
  return (
    <Wrap>
      <Orb $top="-80px" $left="-60px" $color={LAVENDER} $size="360px" $delay="0s" />
      <Orb $top="160px" $left="78%" $color={PINK} $size="320px" $delay="-6s" />
      <Orb $top="60%" $left="-40px" $color={CYAN} $size="380px" $delay="-12s" />
      <Orb $top="78%" $left="68%" $color={PEACH} $size="280px" $delay="-3s" />

      <StyleSwitcher active="aurora" tone="glass" />

      <Container>
        <Hero>
          <GlassBadge>Cadeno — your personal FDE</GlassBadge>

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
              <Card key={it.title}>
                <IconBox $tint={it.tint}>{it.icon}</IconBox>
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
