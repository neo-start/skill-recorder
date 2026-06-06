'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant M: Cottagecore — warm peach canvas, sage green primary,
 * dusty rose accents, hand-drawn florals, Caveat for kicker lines.
 * References: Substack rural, Pinterest cottagecore, slow-living
 * blogs, Goop magazine, NPR's Splendid Table. */

const SERIF = "'Iowan Old Style', 'Georgia', 'Times New Roman', serif";
const PEACH = '#fbece2';
const SAGE = '#789978';
const ROSE = '#c97585';
const GOLD = '#c4a261';
const INK = '#3c2a26';
const INK_SOFT = 'rgba(60, 42, 38, 0.7)';

const Wrap = styled.div`
  min-height: 100vh;
  background: ${PEACH};
  color: ${INK};
  font-family: var(--font-sans);
  overflow-x: hidden;
  position: relative;
`;

const Container = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1080px;
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

/* ── floral SVGs ─────────────────────────────────────────────────── */

const Flower = ({ size = 60, color = ROSE, center = GOLD }: { size?: number; color?: string; center?: string }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none" aria-hidden="true">
    <g transform="translate(30 30)">
      {[0, 60, 120, 180, 240, 300].map(rot => (
        <ellipse key={rot} cx="0" cy="-14" rx="6.5" ry="11" fill={color} transform={`rotate(${rot})`} opacity="0.85" />
      ))}
      <circle r="5" fill={center} />
    </g>
  </svg>
);

const Sprig = ({ size = 80, color = SAGE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <path d="M 40 6 C 38 22, 36 38, 34 56 C 34 60, 40 64, 46 62" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <ellipse cx="32" cy="22" rx="9" ry="5" fill={color} opacity="0.5" transform="rotate(-30 32 22)" />
    <ellipse cx="46" cy="34" rx="9" ry="5" fill={color} opacity="0.5" transform="rotate(30 46 34)" />
    <ellipse cx="30" cy="42" rx="9" ry="5" fill={color} opacity="0.5" transform="rotate(-30 30 42)" />
    <ellipse cx="44" cy="52" rx="9" ry="5" fill={color} opacity="0.5" transform="rotate(30 44 52)" />
  </svg>
);

const FloatingFloral = styled.span<{ $top: string; $left: string; $rotate: string }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  z-index: 0;
  opacity: 0.7;
  transform: rotate(${({ $rotate }) => $rotate});

  @media (max-width: 768px) {
    display: none;
  }
`;

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  position: relative;
  padding-block: var(--space-20) var(--space-16);
  text-align: center;
`;

const Eyebrow = styled.div`
  font-family: var(--font-caveat), cursive;
  font-size: 28px;
  color: ${ROSE};
  line-height: 1;
  margin-bottom: var(--space-3);
  transform: rotate(-2deg);
  display: inline-block;

  &::before {
    content: '~ ';
  }
  &::after {
    content: ' ~';
  }
`;

const Headline = styled.h1`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: clamp(2.75rem, 7.5vw, 6rem);
  line-height: 1;
  letter-spacing: -0.02em;
  margin: 0;
  color: ${SAGE};

  em {
    font-style: italic;
    color: ${ROSE};
  }
`;

const Florette = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: var(--space-5);

  & > .rule {
    width: 60px;
    height: 1px;
    background: ${SAGE};
    opacity: 0.5;
  }
`;

const Lead = styled.p`
  font-family: ${SERIF};
  font-size: clamp(1.0625rem, 1.5vw, 1.25rem);
  color: ${INK};
  line-height: 1.65;
  margin: var(--space-8) auto 0;
  max-width: 580px;

  strong {
    color: ${SAGE};
    font-weight: 600;
    font-style: italic;
  }
`;

const Ctas = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-6);
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
  background: ${SAGE};
  color: ${PEACH};
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 100px;
  transition: background var(--transition-fast);
  box-shadow: 0 6px 16px rgba(120, 153, 120, 0.35);

  &:hover {
    background: ${ROSE};
    box-shadow: 0 6px 16px rgba(201, 117, 133, 0.35);
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${SERIF};
  font-style: italic;
  font-size: 19px;
  color: ${SAGE};
  text-decoration: underline;
  text-underline-offset: 6px;
  text-decoration-thickness: 1px;
  text-decoration-color: ${ROSE};
  transition: color var(--transition-fast);

  &::after {
    content: ' ❀';
  }

  &:hover {
    color: ${ROSE};
  }
`;

const TrustLine = styled.p`
  font-family: var(--font-caveat), cursive;
  font-size: 24px;
  color: ${INK_SOFT};
  margin-top: var(--space-12);
  line-height: 1;

  strong {
    color: ${ROSE};
    font-weight: 700;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  position: relative;
  padding-block: var(--space-20) var(--space-24);
  border-top: 1px dashed rgba(60, 42, 38, 0.25);
`;

const WhyHead = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-14);
  text-align: center;
`;

const WhyLabel = styled.div`
  font-family: var(--font-caveat), cursive;
  font-size: 26px;
  color: ${ROSE};
  margin-bottom: var(--space-3);
`;

const WhyTitle = styled.h2`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: clamp(2rem, 4.5vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.015em;
  margin: 0;
  color: ${SAGE};

  em {
    font-style: italic;
    color: ${ROSE};
  }
`;

const WhyLead = styled.p`
  font-family: ${SERIF};
  font-size: 18px;
  color: ${INK};
  line-height: 1.6;
  margin: var(--space-6) auto 0;
  max-width: 560px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  position: relative;
  padding: var(--space-8);
  background: #fff7ef;
  border: 1px solid rgba(120, 153, 120, 0.3);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  box-shadow: 0 4px 12px rgba(120, 153, 120, 0.08);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(120, 153, 120, 0.18);
  }
`;

const CardFlower = styled.div`
  margin-bottom: var(--space-2);
`;

const CardTitle = styled.h3`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: 24px;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0;
  color: ${SAGE};
`;

const CardBody = styled.p`
  font-family: ${SERIF};
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  color: ${INK_SOFT};
`;

const items = [
  { title: 'Never repeat yourself.', body: 'Show your agent how to do it once — the next thousand times are on autopilot.', petal: ROSE },
  { title: 'Capture tribal knowledge.', body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.', petal: SAGE },
  { title: 'Be in a hundred places.', body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.', petal: GOLD },
  { title: 'Build leverage.', body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.', petal: ROSE },
];

export default function CottagecoreVariantPage() {
  return (
    <Wrap>
      <FloatingFloral $top="100px" $left="5%" $rotate="-12deg"><Sprig size={140} color={SAGE} /></FloatingFloral>
      <FloatingFloral $top="220px" $left="87%" $rotate="20deg"><Sprig size={120} color={SAGE} /></FloatingFloral>
      <FloatingFloral $top="68%" $left="3%" $rotate="14deg"><Flower size={80} color={ROSE} center={GOLD} /></FloatingFloral>
      <FloatingFloral $top="76%" $left="90%" $rotate="-8deg"><Flower size={90} color={GOLD} center={ROSE} /></FloatingFloral>

      <StyleSwitcher active="cottagecore" tone="paper" />

      <Container>
        <Hero>
          <Eyebrow>your gentle, personal FDE</Eyebrow>

          <Headline>
            Your Personal <em>FDE</em>.
          </Headline>

          <Florette>
            <span className="rule" />
            <Flower size={28} color={ROSE} center={GOLD} />
            <span className="rule" />
          </Florette>

          <Lead>
            Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent tends for you forever — so <strong>one person can ship like a team</strong>.
          </Lead>

          <Ctas>
            <Primary href="#install">Create your first skill</Primary>
            <Secondary href="#use-cases">See skills in action</Secondary>
          </Ctas>

          <TrustLine>
            for <strong>creators</strong>, <strong>operators</strong>, <strong>freelancers</strong> &amp; <strong>solopreneurs</strong>
          </TrustLine>
        </Hero>

        <Why>
          <WhyHead>
            <WhyLabel>~ why a personal FDE ~</WhyLabel>
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
                <CardFlower>
                  <Flower size={36} color={it.petal} center={GOLD} />
                </CardFlower>
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
