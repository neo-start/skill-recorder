'use client';

import styled from 'styled-components';

/* ────────────────────────────────────────────────────────────────────
 * Internal preview page — compare three Cadeno logo concepts at the
 * sizes they will actually be used (favicon · navbar · OG · hero).
 * Not linked from the public nav. Each mark is inlined as JSX so we
 * can recolor it for the dark-background tests.
 * ──────────────────────────────────────────────────────────────────── */

type ColorMode = 'brand' | 'mono-light' | 'mono-dark';

function colors(mode: ColorMode) {
  switch (mode) {
    case 'mono-light':
      return { primary: '#ffffff', accent: 'rgba(255,255,255,0.55)' };
    case 'mono-dark':
      return { primary: '#0a1535', accent: 'rgba(10,21,53,0.55)' };
    case 'brand':
    default:
      return { primary: '#305cde', accent: '#7a9ef5' };
  }
}

function HexMark({ size = 64, mode = 'brand' as ColorMode }) {
  const c = colors(mode);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M 32 6 L 53 19 L 53 45 L 32 58 L 11 45 L 11 19 Z" fill={c.primary} />
      <path d="M 32 6 L 53 19 L 32 32 Z" fill={c.accent} />
    </svg>
  );
}

function SparkMark({ size = 64, mode = 'brand' as ColorMode }) {
  const c = colors(mode);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M 32 4 C 32 18, 32 28, 60 32 C 32 36, 32 46, 32 60 C 32 46, 32 36, 4 32 C 32 28, 32 18, 32 4 Z"
        fill={c.primary}
      />
    </svg>
  );
}

function DropMark({ size = 64, mode = 'brand' as ColorMode }) {
  const c = colors(mode);
  // highlight color flips for dark backgrounds
  const highlight =
    mode === 'mono-dark' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.55)';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M 32 6 C 44 22, 50 32, 50 42 A 18 18 0 1 1 14 42 C 14 32, 20 22, 32 6 Z" fill={c.primary} />
      <path
        d="M 22 40 C 22 34, 26 28, 30 24"
        stroke={highlight}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

type Concept = {
  id: string;
  name: string;
  tagline: string;
  why: string;
  Mark: (props: { size?: number; mode?: ColorMode }) => JSX.Element;
};

const concepts: Concept[] = [
  {
    id: 'hex',
    name: 'Gem',
    tagline: 'Faceted · valuable · crafted',
    why:
      'A hexagon read as a cut gem — solid body, single highlighted facet. Premium and substantive at any size; says your skills are crafted assets, not throwaway scripts.',
    Mark: HexMark,
  },
  {
    id: 'spark',
    name: 'Spark',
    tagline: 'AI-canonical · confident',
    why:
      'A clean four-point sparkle — the universal AI shorthand, but heavy enough to feel owned rather than borrowed. Strongest at favicon scale; instantly legible as "intelligence."',
    Mark: SparkMark,
  },
  {
    id: 'drop',
    name: 'Drop',
    tagline: 'Distilled · essential',
    why:
      'A droplet with a single refraction line. Speaks the storyline literally: distill expertise → a concentrated drop the agent can pour out forever. Warm, almost botanical.',
    Mark: DropMark,
  },
];

/* ── styles ──────────────────────────────────────────────────────── */

const Page = styled.main`
  min-height: 100vh;
  background: var(--color-bg);
  padding-block: var(--space-16) var(--space-24);
`;

const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding-inline: var(--space-8);
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: var(--space-16);
`;

const Eyebrow = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-primary-600);
  margin-bottom: var(--space-4);
`;

const Title = styled.h1`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0;

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    color: var(--color-primary-600);
  }
`;

const Lead = styled.p`
  font-size: var(--text-lg);
  color: var(--color-gray-700);
  margin: var(--space-4) auto 0;
  max-width: 580px;
  line-height: 1.55;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const ConceptCard = styled.article`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
`;

const ConceptHead = styled.div`
  padding: var(--space-6) var(--space-6) var(--space-5);
  border-bottom: 1px solid var(--color-border);
`;

const ConceptKicker = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
`;

const ConceptName = styled.h2`
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0 0 var(--space-3);
  letter-spacing: -0.02em;
`;

const ConceptWhy = styled.p`
  font-size: 0.9375rem;
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: 0;
`;

const Section = styled.div`
  padding: var(--space-6);
  border-top: 1px dashed var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  &:first-of-type {
    border-top: none;
  }
`;

const SectionLabel = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > span:last-child {
    text-transform: none;
    letter-spacing: 0;
    color: var(--color-text-faint);
    font-weight: 500;
  }
`;

const HeroStage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #fbfcff 0%, #f0f4fe 100%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--space-10);
  min-height: 220px;
`;

const DarkStage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f1e4a 0%, #1a2f6e 100%);
  border-radius: var(--radius-lg);
  padding: var(--space-10);
  min-height: 220px;
`;

const NavbarStage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px var(--space-5);
`;

const Wordmark = styled.span<{ $variant?: 'plain' | 'editorial' }>`
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 22px;
  color: var(--color-gray-900);
  letter-spacing: -0.025em;

  ${({ $variant }) =>
    $variant === 'editorial' &&
    `
    &::first-letter {
      font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
      font-style: italic;
      font-weight: 500;
      color: var(--color-primary-600);
    }
  `}
`;

const TinyStage = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const FaviconBox = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TabSim = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 6px 8px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 6px 6px 0 0;
  border-bottom: none;
  font-size: 11px;
  color: var(--color-text);
`;

const PickRow = styled.div`
  padding: var(--space-5) var(--space-6);
  background: var(--color-bg-subtle);
  border-top: 1px solid var(--color-border);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: var(--color-text-muted);

  strong {
    color: var(--color-primary-600);
    font-weight: 700;
  }
`;

export default function LogoConceptsPage() {
  return (
    <Page>
      <Container>
        <Header>
          <Eyebrow>internal · cadeno brand · round 3</Eyebrow>
          <Title>
            Pick a <em>Cadeno</em> mark.
          </Title>
          <Lead>
            Round 3 — geometric primitives, no letterforms. Reply with the concept id (<code>hex</code>, <code>spark</code>, <code>drop</code>) and the wordmark variant.
          </Lead>
        </Header>

        <Grid>
          {concepts.map(({ id, name, tagline, why, Mark }) => (
            <ConceptCard key={id}>
              <ConceptHead>
                <ConceptKicker>concept · {id}</ConceptKicker>
                <ConceptName>{name}</ConceptName>
                <ConceptWhy>{why}</ConceptWhy>
              </ConceptHead>

              <Section>
                <SectionLabel>
                  <span>Brand · 160px</span>
                  <span>{tagline}</span>
                </SectionLabel>
                <HeroStage>
                  <Mark size={160} mode="brand" />
                </HeroStage>
              </Section>

              <Section>
                <SectionLabel>
                  <span>Mono · on dark</span>
                  <span>OG / dark mode</span>
                </SectionLabel>
                <DarkStage>
                  <Mark size={160} mode="mono-light" />
                </DarkStage>
              </Section>

              <Section>
                <SectionLabel>
                  <span>Navbar · 32px mark + wordmark</span>
                  <span>plain</span>
                </SectionLabel>
                <NavbarStage>
                  <Mark size={32} mode="brand" />
                  <Wordmark>Cadeno</Wordmark>
                </NavbarStage>

                <SectionLabel>
                  <span>Navbar · editorial wordmark</span>
                  <span>italic C</span>
                </SectionLabel>
                <NavbarStage>
                  <Mark size={32} mode="brand" />
                  <Wordmark $variant="editorial">Cadeno</Wordmark>
                </NavbarStage>
              </Section>

              <Section>
                <SectionLabel>
                  <span>Favicon · 16/32px</span>
                  <span>browser tab</span>
                </SectionLabel>
                <TinyStage>
                  <FaviconBox>
                    <Mark size={16} mode="brand" />
                  </FaviconBox>
                  <FaviconBox>
                    <Mark size={20} mode="brand" />
                  </FaviconBox>
                  <TabSim>
                    <Mark size={14} mode="brand" />
                    <span>Cadeno — Your Personal FDE</span>
                  </TabSim>
                </TinyStage>
              </Section>

              <PickRow>
                pick: <strong>{id}</strong>
              </PickRow>
            </ConceptCard>
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
