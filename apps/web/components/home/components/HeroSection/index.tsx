'use client';

import styled from 'styled-components';

/* Delphi-style hero. Copy is preserved verbatim from v1; everything
 * visual is rebuilt against Delphi.ai's actual design tokens (per
 * memory: clone with fidelity, not Cadeno's design system).
 *
 * Stripped: Iowan italic accent on FDE, Caveat hand kicker, royal-blue
 * eyebrow + dotted radial-gradient background, drop-shadow glow on
 * primary CTA.
 *
 * Adopted: Inter system stack, near-black ink, medium-gray subhead,
 * fully rounded black/white CTA pair, flat white canvas with generous
 * vertical breath. */

const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const INK = '#0a0a0a';
const SUB = '#6b6b6b';
const HAIRLINE = '#e8e6e1';
const FAINT = '#999999';

const Section = styled.section`
  position: relative;
  background: #ffffff;
  padding-block: calc(var(--navbar-height) + 80px) 120px;
  border-bottom: 1px solid ${HAIRLINE};

  @media (max-width: 768px) {
    padding-block: calc(var(--navbar-height) + 56px) 80px;
  }
`;

const Inner = styled.div`
  max-width: 920px;
  margin: 0 auto;
  padding-inline: 32px;
  text-align: center;
  font-family: ${SANS};
  color: ${INK};

  @media (max-width: 768px) {
    padding-inline: 22px;
  }
`;

const Eyebrow = styled.div`
  font-family: ${SANS};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${FAINT};
  margin-bottom: 28px;
`;

const Headline = styled.h1`
  font-family: ${SANS};
  font-size: clamp(2.5rem, 6.5vw, 5rem);
  font-weight: 700;
  color: ${INK};
  line-height: 1.04;
  letter-spacing: -0.035em;
  margin: 0 auto;
  max-width: 14ch;

  em {
    font-style: italic;
    font-weight: 700;
    color: ${INK};
  }
`;

const Kicker = styled.p`
  font-family: ${SANS};
  font-style: italic;
  font-size: clamp(1.0625rem, 1.5vw, 1.25rem);
  font-weight: 500;
  color: ${SUB};
  line-height: 1.4;
  margin: 24px 0 0;
`;

const Lead = styled.p`
  font-family: ${SANS};
  font-size: clamp(1.0625rem, 1.4vw, 1.25rem);
  color: ${SUB};
  line-height: 1.55;
  margin: 36px auto 0;
  max-width: 580px;
  font-weight: 400;

  strong {
    color: ${INK};
    font-weight: 600;
  }
`;

const Ctas = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 40px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Primary = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  padding: 0 28px;
  background: ${INK};
  color: #ffffff;
  font-family: ${SANS};
  font-weight: 500;
  font-size: 15px;
  letter-spacing: -0.005em;
  text-decoration: none;
  border-radius: 100px;
  transition: background 160ms ease, transform 120ms ease;

  &:hover {
    background: #2a2a2a;
    transform: translateY(-1px);
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 52px;
  padding: 0 26px;
  background: #ffffff;
  color: ${INK};
  border: 1px solid ${HAIRLINE};
  font-family: ${SANS};
  font-weight: 500;
  font-size: 15px;
  letter-spacing: -0.005em;
  text-decoration: none;
  border-radius: 100px;
  transition: border-color 160ms ease, background 160ms ease;

  &::after {
    content: '→';
    transition: transform 120ms ease;
  }

  &:hover {
    border-color: ${INK};
    background: #fafafa;
  }

  &:hover::after {
    transform: translateX(3px);
  }
`;

const TrustLine = styled.p`
  font-family: ${SANS};
  font-size: 13px;
  color: ${SUB};
  margin-top: 56px;
  letter-spacing: 0.01em;

  strong {
    color: ${INK};
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
          <Primary href="#waitlist">
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
