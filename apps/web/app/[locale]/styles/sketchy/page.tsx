'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant F: Sketchy Hand-drawn — paper texture canvas, Caveat
 * headings, hand-drawn underlines/circles, dashed wavy borders.
 * References: Excalidraw, Tldraw, Tella.tv, Loom-creator pages,
 * Linear's whiteboard era. Casual, creator-friendly, doodled. */

const PAPER = '#faf6ee';
const INK = '#1a1a1a';
const INK_SOFT = 'rgba(26, 26, 26, 0.72)';
const RED = '#c25e3a';
const OCEAN = '#3a6ec2';
const LEAF = '#5a8a3a';

const NOISE_BG = `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3CfeColorMatrix values='0 0 0 0 0.08 0 0 0 0 0.06 0 0 0 0 0.04 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const Wrap = styled.div`
  min-height: 100vh;
  background: ${PAPER};
  background-image: ${NOISE_BG};
  color: ${INK};
  font-family: var(--font-sans);
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

/* ── Inline SVG accents ───────────────────────────────────────────── */

const Squiggle = (props: { color?: string; width?: number; height?: number }) => (
  <svg
    width={props.width ?? 220}
    height={props.height ?? 18}
    viewBox="0 0 220 18"
    fill="none"
    aria-hidden="true"
    style={{ display: 'block', marginTop: -8 }}
  >
    <path
      d="M2 11 C 30 4, 60 16, 90 9 C 120 3, 150 15, 180 8 C 200 4, 215 12, 218 9"
      stroke={props.color ?? RED}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const Arrow = (props: { color?: string }) => (
  <svg width="48" height="80" viewBox="0 0 48 80" fill="none" aria-hidden="true">
    <path
      d="M 24 4 C 28 16, 32 28, 28 40 C 24 50, 16 56, 22 70"
      stroke={props.color ?? OCEAN}
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 16 64 L 22 72 L 30 66"
      stroke={props.color ?? OCEAN}
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Circle = (props: { color?: string }) => (
  <svg
    width="180"
    height="80"
    viewBox="0 0 180 80"
    fill="none"
    aria-hidden="true"
    style={{ position: 'absolute', top: '-12px', left: '-14px', pointerEvents: 'none' }}
  >
    <path
      d="M 90 8 C 132 8, 168 24, 168 40 C 168 58, 132 72, 90 72 C 48 72, 12 58, 12 40 C 12 24, 48 8, 92 8"
      stroke={props.color ?? RED}
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding-block: var(--space-20) var(--space-16);
  text-align: center;
`;

const Eyebrow = styled.div`
  font-family: var(--font-caveat), cursive;
  font-size: 26px;
  color: ${RED};
  margin-bottom: var(--space-4);
  line-height: 1;
  transform: rotate(-2deg);
  display: inline-block;
`;

const Headline = styled.h1`
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.025em;
  margin: 0;
  color: ${INK};

  & > .fde-wrap {
    position: relative;
    display: inline-block;
    font-family: var(--font-caveat), cursive;
    font-style: normal;
    font-weight: 700;
    color: ${OCEAN};
    padding: 0 18px;
    margin: 0 6px;
  }
`;

const HeadlineUnderline = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 4px;
`;

const Lead = styled.p`
  font-size: clamp(1.0625rem, 1.5vw, 1.25rem);
  color: ${INK_SOFT};
  line-height: 1.6;
  margin: var(--space-10) auto 0;
  max-width: 620px;

  strong {
    color: ${INK};
    font-weight: 600;
    background: linear-gradient(to top, ${LEAF} 0%, ${LEAF} 30%, transparent 30%);
    padding: 0 3px;
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

const PrimaryWrap = styled.div`
  position: relative;
  display: inline-block;
`;

const Primary = styled.a`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 58px;
  padding: 0 var(--space-10);
  background: ${INK};
  color: ${PAPER};
  font-family: var(--font-caveat), cursive;
  font-weight: 700;
  font-size: 22px;
  text-decoration: none;
  border-radius: 14px;
  z-index: 1;
  transition: transform var(--transition-fast);

  &:hover {
    transform: rotate(-1deg);
  }
`;

const PrimaryShadow = styled.span`
  position: absolute;
  inset: 0;
  background: ${RED};
  border-radius: 14px;
  transform: translate(6px, 6px) rotate(0deg);
  z-index: 0;
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-caveat), cursive;
  font-size: 26px;
  color: ${OCEAN};
  text-decoration: underline;
  text-decoration-style: wavy;
  text-underline-offset: 7px;
  text-decoration-thickness: 1.5px;
  transition: color var(--transition-fast);

  &::after {
    content: '→';
  }

  &:hover {
    color: ${RED};
  }
`;

const TrustLine = styled.p`
  font-family: var(--font-caveat), cursive;
  font-size: 22px;
  color: ${INK_SOFT};
  margin-top: var(--space-12);
  line-height: 1;

  strong {
    color: ${INK};
    font-weight: 700;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-20) var(--space-24);
  position: relative;
`;

const WhyHead = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-14);
  text-align: center;
  position: relative;
`;

const WhyLabel = styled.div`
  font-family: var(--font-caveat), cursive;
  font-size: 26px;
  color: ${RED};
  transform: rotate(-2deg);
  display: inline-block;
  margin-bottom: var(--space-3);
`;

const WhyTitle = styled.h2`
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin: 0;
  color: ${INK};

  & > .accent {
    position: relative;
    display: inline-block;
    font-family: var(--font-caveat), cursive;
    font-weight: 700;
    color: ${OCEAN};
    padding: 0 10px;
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
  gap: var(--space-8);

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article<{ $rot: string; $accent: string }>`
  position: relative;
  padding: var(--space-8);
  background: ${PAPER};
  border: 2px solid ${INK};
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transform: rotate(${({ $rot }) => $rot});
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  box-shadow: 6px 6px 0 ${({ $accent }) => $accent};

  &:hover {
    transform: rotate(0deg) translate(-2px, -2px);
    box-shadow: 9px 9px 0 ${({ $accent }) => $accent};
  }
`;

const CardEmoji = styled.div<{ $bg: string }>`
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: ${({ $bg }) => $bg};
  border: 2px solid ${INK};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: var(--space-3);
  transform: rotate(-3deg);
`;

const CardTitle = styled.h3`
  font-family: var(--font-caveat), cursive;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.01em;
  margin: 0;
  color: ${INK};
`;

const CardBody = styled.p`
  font-size: 15px;
  color: ${INK_SOFT};
  line-height: 1.6;
  margin: 0;
`;

const items = [
  {
    emoji: '🔁',
    title: 'Never repeat yourself.',
    body: 'Show your agent how to do it once — the next thousand times are on autopilot.',
    bg: '#ffd4c2',
    accent: RED,
    rot: '-1.5deg',
  },
  {
    emoji: '📚',
    title: 'Capture tribal knowledge.',
    body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.',
    bg: '#cee0f5',
    accent: OCEAN,
    rot: '1.2deg',
  },
  {
    emoji: '🌐',
    title: 'Be in a hundred places.',
    body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.',
    bg: '#d4e8c8',
    accent: LEAF,
    rot: '-1deg',
  },
  {
    emoji: '⚡',
    title: 'Build leverage.',
    body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.',
    bg: '#ffeebf',
    accent: '#c29a3a',
    rot: '1.4deg',
  },
];

export default function SketchyVariantPage() {
  return (
    <Wrap>
      <StyleSwitcher active="sketchy" tone="paper" />

      <Container>
        <Hero>
          <Eyebrow>~ your personal FDE ~</Eyebrow>

          <Headline>
            Your Personal{' '}
            <span className="fde-wrap">
              FDE
              <Circle color={RED} />
            </span>
            .
          </Headline>

          <HeadlineUnderline>
            <Squiggle color={RED} width={280} />
          </HeadlineUnderline>

          <Lead>
            Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so <strong>one person can ship like a team</strong>.
          </Lead>

          <Ctas>
            <PrimaryWrap>
              <PrimaryShadow />
              <Primary href="#install">Create your first skill →</Primary>
            </PrimaryWrap>
            <Secondary href="#use-cases">See skills in action</Secondary>
          </Ctas>

          <TrustLine>
            for <strong>creators</strong> · <strong>operators</strong> · <strong>freelancers</strong> · <strong>solopreneurs</strong>
          </TrustLine>
        </Hero>

        <Why>
          <WhyHead>
            <WhyLabel>why a personal FDE?</WhyLabel>
            <WhyTitle>
              One pair of hands.{' '}
              <span className="accent">a hundred places.</span>
            </WhyTitle>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Squiggle color={OCEAN} width={200} />
            </div>
            <WhyLead>
              Big companies hire Forward Deployed Engineers to ship custom automation for them. Now you have one too.
            </WhyLead>
          </WhyHead>

          <Grid>
            {items.map(it => (
              <Card key={it.title} $rot={it.rot} $accent={it.accent}>
                <CardEmoji $bg={it.bg}>{it.emoji}</CardEmoji>
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
