'use client';

import styled from 'styled-components';
import Button from '@/components/ui/Button';

/* ────────────────────────────────────────────────────────────────────
 * Hero — centered editorial typography. No product card on the right.
 * Delphi-style: leads with positioning ("Your Personal FDE"), backs it
 * with the storyline kicker, then a single CTA pair. Subtle dotted
 * background instead of a hero image.
 * ──────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  position: relative;
  padding-block: calc(var(--navbar-height) + var(--space-20)) var(--space-24);
  background:
    radial-gradient(circle at 1px 1px, rgba(15, 30, 74, 0.05) 1px, transparent 0) 0 0 / 28px 28px,
    radial-gradient(ellipse at 50% 0%, rgba(48, 92, 222, 0.08), transparent 65%),
    linear-gradient(180deg, #fbfcff 0%, #ffffff 80%);
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 768px) {
    padding-block: calc(var(--navbar-height) + var(--space-12)) var(--space-16);
  }
`;

const Inner = styled.div`
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  padding-inline: var(--space-6);
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-primary-600);
  margin-bottom: var(--space-8);

  &::before,
  &::after {
    content: '';
    display: block;
    width: 28px;
    height: 1px;
    background: var(--color-primary-300);
  }
`;

const Headline = styled.h1`
  font-size: clamp(2.75rem, 7vw, 5.75rem);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 0.98;
  letter-spacing: -0.04em;
  margin: 0;

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    color: var(--color-primary-600);
    letter-spacing: -0.02em;
  }
`;

const Kicker = styled.p`
  font-family: var(--font-hand);
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  color: var(--color-primary-500);
  line-height: 1.2;
  margin: var(--space-6) 0 0;
`;

const Lead = styled.p`
  font-size: clamp(1.0625rem, 1.4vw, 1.25rem);
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: var(--space-8) auto 0;
  max-width: 620px;

  strong {
    color: var(--color-gray-900);
    font-weight: 600;
  }
`;

const Ctas = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-6);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--space-10);
`;

const Primary = styled(Button)`
  height: 56px;
  padding: 0 var(--space-10);
  border-radius: 12px;
  font-size: var(--text-base);
  font-weight: 600;
  box-shadow: 0 12px 28px rgba(48, 92, 222, 0.28);
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  transition: color var(--transition-fast);

  &::after {
    content: '→';
    transition: transform var(--transition-fast);
  }

  &:hover {
    color: var(--color-primary-500);
  }

  &:hover::after {
    transform: translateX(3px);
  }
`;

const TrustLine = styled.p`
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-12);
  letter-spacing: 0.01em;

  strong {
    color: var(--color-gray-900);
    font-weight: 600;
  }
`;

export default function HeroSection() {
  return (
    <Section id="hero">
      <Inner>
        <Eyebrow>Forward Deployed Engineer · For You</Eyebrow>

        <Headline>
          Your Personal <em>FDE</em>.
        </Headline>

        <Kicker>Distill your expertise to skill.</Kicker>

        <Lead>
          Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person can ship like a team</strong>.
        </Lead>

        <Ctas>
          <Primary size="lg" href="#waitlist">
            Join the waitlist
          </Primary>
          <Secondary href="#use-cases">See what skills can do</Secondary>
        </Ctas>

        <TrustLine>
          Built for <strong>creators</strong>, <strong>operators</strong>, <strong>freelancers</strong>, and <strong>solopreneurs</strong> running a one-person company.
        </TrustLine>
      </Inner>
    </Section>
  );
}
