'use client';

import Link from 'next/link';
import styled from 'styled-components';

/* Internal style picker. Compares three visual languages for the Cadeno
 * homepage against the saved v1 at /. Each variant route renders the
 * same Hero + Why content under a totally different design language. */

const Page = styled.main`
  min-height: 100vh;
  background: var(--color-bg);
  padding-block: var(--space-16) var(--space-24);
`;

const Container = styled.div`
  max-width: 1080px;
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
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const VariantCard = styled(Link)<{ $bg: string; $fg: string; $accent: string }>`
  display: block;
  text-decoration: none;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  transition: transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 56px -28px rgba(7, 14, 36, 0.32);
  }
`;

const Preview = styled.div<{ $accent: string; $serif?: boolean }>`
  padding: var(--space-10) var(--space-8);
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-3);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  ${({ $serif }) =>
    $serif &&
    `font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;`}

  & > .kicker {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  & > h2 {
    font-size: 36px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.035em;
    margin: 0;
  }

  & > h2 em {
    font-style: italic;
    color: ${({ $accent }) => $accent};
  }

  & > p {
    font-size: 14px;
    opacity: 0.7;
    line-height: 1.5;
    margin: 0;
    max-width: 32ch;
  }
`;

const Meta = styled.div`
  padding: var(--space-6) var(--space-8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-sans);

  & > .name {
    font-size: var(--text-lg);
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  & > .arrow {
    font-size: 18px;
    opacity: 0.6;
    transition: transform var(--transition-fast);
  }
`;

const Tag = styled.span<{ $tone: string }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: ${({ $tone }) => $tone};
  color: inherit;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-right: 6px;
`;

const variants = [
  {
    href: '/styles/dark',
    name: 'Dark Cinematic',
    desc: 'Near-black canvas, electric accent, big display type. Vercel × Cursor × Manus.',
    bg: '#0a0a14',
    fg: '#ffffff',
    accent: '#a3ff5e',
    tags: ['Dark', 'Display', 'Tech-confident'],
    serif: false,
  },
  {
    href: '/styles/editorial',
    name: 'Editorial Warm',
    desc: 'Cream paper, serif headlines, drop caps. Letterboxd × Substack × NYT.',
    bg: '#fdf7ec',
    fg: '#1a1a1a',
    accent: '#9a2222',
    tags: ['Cream', 'Serif', 'Premium'],
    serif: true,
  },
  {
    href: '/styles/pastel',
    name: 'Friendly Pastel',
    desc: 'Warm cream, multi-pastel accents, rounded everything. Notion × Granola.',
    bg: '#fff5ec',
    fg: '#2d2748',
    accent: '#ff7a59',
    tags: ['Warm', 'Rounded', 'Approachable'],
    serif: false,
  },
  {
    href: '/styles/brutalist',
    name: 'Brutalist Mono',
    desc: 'Mono fonts, heavy black rules, single red accent. Vercel OSS × YC × Hacker News.',
    bg: '#ffffff',
    fg: '#000000',
    accent: '#ff2400',
    tags: ['Mono', 'Raw', 'Indie'],
    serif: false,
  },
  {
    href: '/styles/aurora',
    name: 'Aurora Glass',
    desc: 'Soft pastel gradient, frosted glass panels, drifting orbs. Apple Vision × Linear-purple.',
    bg: 'linear-gradient(135deg, #fae6f5 0%, #e8e0ff 45%, #dcefff 100%)',
    fg: '#2a1a4a',
    accent: '#9e7cff',
    tags: ['Glass', 'Ethereal', 'Premium-tech'],
    serif: false,
  },
  {
    href: '/styles/sketchy',
    name: 'Sketchy Hand-drawn',
    desc: 'Paper texture, Caveat headings, doodle accents, dashed borders. Excalidraw × Tldraw × Loom.',
    bg: '#faf6ee',
    fg: '#1a1a1a',
    accent: '#c25e3a',
    tags: ['Paper', 'Caveat', 'Creator-friendly'],
    serif: false,
  },
  {
    href: '/styles/cyberpunk',
    name: 'Cyberpunk Neon',
    desc: 'Black canvas + magenta/cyan dual-neon glow + scanlines. AI Town × Cyberpunk 2077 menus.',
    bg: '#050010',
    fg: '#ffffff',
    accent: '#ff00ff',
    tags: ['Neon', 'Mono', 'Aggressive'],
    serif: false,
  },
  {
    href: '/styles/vapourwave',
    name: 'Vapourwave',
    desc: 'Pink → purple → teal gradient + sun + perspective grid. ＡＥＳＴＨＥＴＩＣ.',
    bg: 'linear-gradient(180deg, #ff6ad5 0%, #c774e8 35%, #ad8cff 65%, #8795e8 100%)',
    fg: '#ffffff',
    accent: '#ffd6ff',
    tags: ['Gradient', 'Retro', '80s'],
    serif: true,
  },
  {
    href: '/styles/botanical',
    name: 'Botanical Natural',
    desc: 'Warm cream + forest green + terracotta + line-art leaves. Slow tech.',
    bg: '#f5f0e1',
    fg: '#2d4a2d',
    accent: '#c97650',
    tags: ['Earthy', 'Slow', 'Sustainable'],
    serif: true,
  },
  {
    href: '/styles/blueprint',
    name: 'Industrial Blueprint',
    desc: 'Deep blue paper + cyan grid + schematic callouts. NASA × architectural drawings.',
    bg: '#0e2a47',
    fg: '#a8e8ff',
    accent: '#00d4ff',
    tags: ['Schematic', 'Technical', 'Precise'],
    serif: false,
  },
  {
    href: '/styles/fashion',
    name: 'Fashion Magazine',
    desc: 'Pure white + tall thin serif display + red accent + No. callouts. Vogue × Harper’s.',
    bg: '#ffffff',
    fg: '#0a0a0a',
    accent: '#dd0000',
    tags: ['Display', 'Serif', 'High-end'],
    serif: true,
  },
  {
    href: '/styles/y2k',
    name: 'Y2K Chrome',
    desc: 'Silver/baby-blue chrome gradient + Aqua bevel buttons + script accents. 2002 web.',
    bg: 'linear-gradient(180deg, #cbe3f0 0%, #a8c5d8 100%)',
    fg: '#0a2540',
    accent: '#ff80a8',
    tags: ['Chrome', 'Bubbly', 'Nostalgic'],
    serif: false,
  },
  {
    href: '/styles/cottagecore',
    name: 'Cottagecore',
    desc: 'Warm peach + sage green + dusty rose + soft florals. Slow living, cozy maker.',
    bg: '#fbece2',
    fg: '#3c2a26',
    accent: '#c97585',
    tags: ['Cozy', 'Floral', 'Slow'],
    serif: true,
  },
];

export default function StylesIndexPage() {
  return (
    <Page>
      <Container>
        <Header>
          <Eyebrow>internal · style explorations</Eyebrow>
          <Title>
            Pick a <em>visual language</em>.
          </Title>
          <Lead>
            Same content (Your Personal FDE), three different aesthetic territories. v1 lives at <code>/</code> if you want the baseline.
          </Lead>
        </Header>

        <Grid>
          {variants.map(v => (
            <VariantCard
              key={v.href}
              href={v.href}
              $bg={v.bg}
              $fg={v.fg}
              $accent={v.accent}
            >
              <Preview $accent={v.accent} $serif={v.serif}>
                <span className="kicker">your personal</span>
                <h2>
                  Your <em>FDE</em>.
                </h2>
                <p>{v.desc}</p>
              </Preview>

              <Meta>
                <span className="name">
                  {v.tags.map(t => (
                    <Tag key={t} $tone="rgba(0,0,0,0.06)">
                      {t}
                    </Tag>
                  ))}
                  <br />
                  <span style={{ display: 'inline-block', marginTop: 10 }}>{v.name}</span>
                </span>
                <span className="arrow">→</span>
              </Meta>
            </VariantCard>
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
