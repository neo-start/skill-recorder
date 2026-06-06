'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant I: Botanical Natural — warm cream canvas, forest green
 * primary, terracotta and dusty gold accents, line-art leaf SVGs
 * scattered as page furniture. References: NPR magazine, Substack
 * botanical, Slow living, Sustainable mag. */

const SERIF = "'Iowan Old Style', 'Georgia', 'Times New Roman', serif";
const CREAM = '#f5f0e1';
const GREEN = '#2d5a3e';
const TERRACOTTA = '#c97650';
const GOLD = '#d4a456';
const INK = '#2d3a2d';
const INK_SOFT = 'rgba(45, 58, 45, 0.72)';

const Wrap = styled.div`
  min-height: 100vh;
  background: ${CREAM};
  color: ${INK};
  font-family: var(--font-sans);
  overflow-x: hidden;
  position: relative;
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

const Leaf = ({ rotate = 0, size = 80, color = GREEN }: { rotate?: number; size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
    style={{ transform: `rotate(${rotate}deg)` }}
  >
    <path d="M 40 6 C 20 18, 12 36, 14 56 C 14 60, 18 64, 22 62 C 38 56, 56 42, 64 22 C 66 16, 60 8, 54 8 C 48 8, 44 8, 40 6 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M 40 12 C 36 26, 30 40, 22 56" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
    <path d="M 30 30 L 36 28 M 28 38 L 34 36 M 26 46 L 32 44" stroke={color} strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const FloatingLeaf = styled.span<{ $top: string; $left: string }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  z-index: 0;
  opacity: 0.45;

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
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-family: ${SERIF};
  font-style: italic;
  font-size: 17px;
  color: ${TERRACOTTA};
  margin-bottom: var(--space-6);

  &::before,
  &::after {
    content: '';
    width: 22px;
    height: 1px;
    background: ${TERRACOTTA};
    opacity: 0.6;
  }
`;

const Headline = styled.h1`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: clamp(2.75rem, 7.5vw, 6rem);
  line-height: 1;
  letter-spacing: -0.02em;
  margin: 0;
  color: ${GREEN};

  em {
    font-style: italic;
    color: ${TERRACOTTA};
  }
`;

const Lead = styled.p`
  font-family: ${SERIF};
  font-size: clamp(1.0625rem, 1.5vw, 1.3125rem);
  color: ${INK};
  line-height: 1.6;
  margin: var(--space-10) auto 0;
  max-width: 600px;

  strong {
    color: ${GREEN};
    font-weight: 600;
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
  background: ${GREEN};
  color: ${CREAM};
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.02em;
  text-decoration: none;
  text-transform: uppercase;
  border-radius: 100px;
  transition: background var(--transition-fast);

  &:hover {
    background: ${TERRACOTTA};
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${SERIF};
  font-style: italic;
  font-size: 18px;
  color: ${GREEN};
  text-decoration: underline;
  text-underline-offset: 6px;
  text-decoration-thickness: 1px;
  text-decoration-color: ${GOLD};
  transition: color var(--transition-fast);

  &:hover {
    color: ${TERRACOTTA};
  }
`;

const TrustLine = styled.p`
  font-family: ${SERIF};
  font-style: italic;
  font-size: 15px;
  color: ${INK_SOFT};
  margin-top: var(--space-12);
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  position: relative;
  padding-block: var(--space-20) var(--space-24);
  border-top: 1px solid rgba(45, 90, 62, 0.18);
`;

const WhyHead = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-14);
  text-align: center;
`;

const WhyLabel = styled.div`
  font-family: ${SERIF};
  font-style: italic;
  font-size: 16px;
  color: ${TERRACOTTA};
  margin-bottom: var(--space-3);
`;

const WhyTitle = styled.h2`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: clamp(2rem, 4.5vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.015em;
  margin: 0;
  color: ${GREEN};

  em {
    font-style: italic;
    color: ${TERRACOTTA};
  }
`;

const WhyLead = styled.p`
  font-family: ${SERIF};
  font-size: 17px;
  color: ${INK};
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

const Card = styled.article`
  position: relative;
  padding: var(--space-8);
  background: #fbf6e8;
  border: 1px solid rgba(45, 90, 62, 0.2);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: border-color var(--transition-base), transform var(--transition-base);

  &:hover {
    border-color: ${GREEN};
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $color }) => $color}22;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-3);
`;

const CardTitle = styled.h3`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0;
  color: ${GREEN};
`;

const CardBody = styled.p`
  font-family: ${SERIF};
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  color: ${INK_SOFT};
`;

const items = [
  { title: 'Never repeat yourself.', body: 'Show your agent how to do it once — the next thousand times are on autopilot.', color: GREEN },
  { title: 'Capture tribal knowledge.', body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.', color: TERRACOTTA },
  { title: 'Be in a hundred places.', body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.', color: GOLD },
  { title: 'Build leverage.', body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.', color: GREEN },
];

export default function BotanicalVariantPage() {
  return (
    <Wrap>
      <FloatingLeaf $top="100px" $left="6%"><Leaf rotate={-22} size={120} color={GREEN} /></FloatingLeaf>
      <FloatingLeaf $top="220px" $left="86%"><Leaf rotate={28} size={110} color={GREEN} /></FloatingLeaf>
      <FloatingLeaf $top="60%" $left="4%"><Leaf rotate={14} size={90} color={GOLD} /></FloatingLeaf>
      <FloatingLeaf $top="74%" $left="88%"><Leaf rotate={-44} size={100} color={TERRACOTTA} /></FloatingLeaf>

      <StyleSwitcher active="botanical" tone="paper" />

      <Container>
        <Hero>
          <Eyebrow>cadeno · your personal FDE</Eyebrow>

          <Headline>
            Your Personal <em>FDE</em>.
          </Headline>

          <Lead>
            Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person can ship like a team</strong>.
          </Lead>

          <Ctas>
            <Primary href="#install">Create your first skill</Primary>
            <Secondary href="#use-cases">See skills in action ↗</Secondary>
          </Ctas>

          <TrustLine>
            Tended for creators, operators, freelancers &amp; solopreneurs.
          </TrustLine>
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
                <CardIcon $color={it.color}>
                  <Leaf size={20} color={it.color} rotate={20} />
                </CardIcon>
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
