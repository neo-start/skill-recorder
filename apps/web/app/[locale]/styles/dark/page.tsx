'use client';

import styled, { keyframes } from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant A: Dark Cinematic — near-black canvas, electric lime accent,
 * display sans, ambient glow on the hero. Reference: Vercel × Cursor ×
 * Manus dark surfaces. Visual confidence over warmth. */

const Wrap = styled.div`
  min-height: 100vh;
  background: radial-gradient(ellipse at 50% -10%, rgba(163, 255, 94, 0.08), transparent 60%),
    #0a0a14;
  color: #ffffff;
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
  padding-block: var(--space-24) var(--space-20);
  text-align: center;
  position: relative;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #a3ff5e;
  margin-bottom: var(--space-8);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a3ff5e;
    box-shadow: 0 0 12px #a3ff5e;
  }
`;

const glow = keyframes`
  0%, 100% { text-shadow: 0 0 30px rgba(163, 255, 94, 0.15); }
  50% { text-shadow: 0 0 50px rgba(163, 255, 94, 0.3); }
`;

const Headline = styled.h1`
  font-size: clamp(3rem, 9vw, 7rem);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.045em;
  margin: 0;
  color: #ffffff;

  em {
    font-style: normal;
    color: #a3ff5e;
    animation: ${glow} 4s ease-in-out infinite;
  }
`;

const Lead = styled.p`
  font-size: clamp(1.0625rem, 1.5vw, 1.3125rem);
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
  margin: var(--space-10) auto 0;
  max-width: 620px;

  strong {
    color: #ffffff;
    font-weight: 500;
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
  border-radius: 100px;
  background: #a3ff5e;
  color: #0a0a14;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0 0 0 0 rgba(163, 255, 94, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 32px rgba(163, 255, 94, 0.55);
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 56px;
  padding: 0 var(--space-8);
  border-radius: 100px;
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
  transition: border-color var(--transition-fast), background var(--transition-fast);

  &::after {
    content: '→';
    transition: transform var(--transition-fast);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.04);
  }

  &:hover::after {
    transform: translateX(3px);
  }
`;

const TrustLine = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: var(--space-12);
  letter-spacing: 0.04em;

  strong {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-24);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const WhyHead = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-16);
  text-align: center;
`;

const WhyLabel = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #a3ff5e;
  margin-bottom: var(--space-4);
`;

const WhyTitle = styled.h2`
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 0;
  color: #ffffff;

  em {
    font-style: normal;
    color: #a3ff5e;
  }
`;

const WhyLead = styled.p`
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.6);
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
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: border-color var(--transition-base), background var(--transition-base), transform var(--transition-base);

  &:hover {
    border-color: rgba(163, 255, 94, 0.4);
    background: rgba(163, 255, 94, 0.03);
    transform: translateY(-2px);
  }
`;

const IconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(163, 255, 94, 0.08);
  border: 1px solid rgba(163, 255, 94, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #a3ff5e;
  margin-bottom: var(--space-3);
`;

const CardTitle = styled.h3`
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  margin: 0;
  color: #ffffff;
`;

const CardBody = styled.p`
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.55;
  margin: 0;
`;

const items = [
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

export default function DarkVariantPage() {
  return (
    <Wrap>
      <StyleSwitcher active="dark" tone="dark" />

      <Container>
        <Hero>
          <Eyebrow>Forward Deployed · For You</Eyebrow>

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
            Built for <strong>creators</strong> · <strong>operators</strong> · <strong>freelancers</strong> · <strong>solopreneurs</strong>
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
                <IconBox>{it.icon}</IconBox>
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
