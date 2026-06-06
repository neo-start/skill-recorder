'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Variant B: Editorial Warm — cream paper, serif display, drop cap,
 * narrow measure on prose. References: Letterboxd, Substack, NYT
 * Magazine, The New Yorker, Bloomberg Markets. Voice over volume. */

const SERIF = "'Iowan Old Style', 'Georgia', 'Times New Roman', serif";
const PAPER = '#fdf7ec';
const INK = '#1a1a1a';
const RULE = '#d8cdb7';
const ACCENT = '#9a2222';

const Wrap = styled.div`
  min-height: 100vh;
  background: ${PAPER};
  color: ${INK};
  font-family: ${SERIF};
  overflow-x: hidden;
`;

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Masthead = styled.div`
  text-align: center;
  padding-block: var(--space-12) var(--space-6);
  border-bottom: 1px solid ${RULE};

  & > .name {
    font-family: ${SERIF};
    font-style: italic;
    font-weight: 500;
    font-size: 28px;
    letter-spacing: -0.01em;
  }

  & > .meta {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(26, 26, 26, 0.55);
    margin-top: var(--space-3);
  }
`;

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding-block: var(--space-20) var(--space-16);
  text-align: center;
`;

const Eyebrow = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: ${ACCENT};
  margin-bottom: var(--space-8);
`;

const Headline = styled.h1`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: clamp(3rem, 8vw, 6.5rem);
  line-height: 0.98;
  letter-spacing: -0.025em;
  margin: 0;
  color: ${INK};

  em {
    font-style: italic;
    color: ${ACCENT};
  }
`;

const Lead = styled.p`
  font-family: ${SERIF};
  font-size: clamp(1.125rem, 1.5vw, 1.375rem);
  line-height: 1.55;
  margin: var(--space-10) auto 0;
  max-width: 620px;
  color: ${INK};

  &::first-letter {
    font-size: 3.2em;
    line-height: 0.85;
    float: left;
    font-style: italic;
    color: ${ACCENT};
    padding-right: 10px;
    padding-top: 6px;
    font-weight: 500;
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
  height: 52px;
  padding: 0 var(--space-10);
  background: ${INK};
  color: ${PAPER};
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.02em;
  text-decoration: none;
  text-transform: uppercase;
  border-radius: 2px;
  transition: background var(--transition-fast);

  &:hover {
    background: ${ACCENT};
  }
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${SERIF};
  font-style: italic;
  font-size: 17px;
  color: ${INK};
  text-decoration: underline;
  text-underline-offset: 5px;
  text-decoration-thickness: 1px;
  text-decoration-color: ${RULE};
  transition: text-decoration-color var(--transition-fast);

  &:hover {
    text-decoration-color: ${ACCENT};
    color: ${ACCENT};
  }
`;

const TrustLine = styled.p`
  font-family: ${SERIF};
  font-style: italic;
  font-size: 16px;
  color: rgba(26, 26, 26, 0.6);
  margin-top: var(--space-12);

  & > .rule {
    display: inline-block;
    width: 28px;
    height: 1px;
    background: ${RULE};
    margin: 0 12px;
    vertical-align: middle;
  }
`;

/* ── Why ──────────────────────────────────────────────────────────── */

const Why = styled.section`
  padding-block: var(--space-20);
  border-top: 1px solid ${RULE};
`;

const WhyHead = styled.div`
  max-width: 760px;
  margin: 0 auto var(--space-16);
  text-align: center;
`;

const SectionRule = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(26, 26, 26, 0.55);
  margin-bottom: var(--space-6);

  &::before,
  &::after {
    content: '·';
    margin: 0 var(--space-3);
  }
`;

const WhyTitle = styled.h2`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: clamp(2rem, 4.5vw, 3.25rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0;
  color: ${INK};

  em {
    font-style: italic;
    color: ${ACCENT};
  }
`;

const WhyLead = styled.p`
  font-family: ${SERIF};
  font-size: 18px;
  font-style: italic;
  line-height: 1.55;
  margin: var(--space-6) auto 0;
  max-width: 560px;
  color: rgba(26, 26, 26, 0.7);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  border-top: 1px solid ${RULE};

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  padding: var(--space-10) var(--space-8);
  border-right: 1px solid ${RULE};
  border-bottom: 1px solid ${RULE};

  &:nth-child(2n) {
    border-right: none;
  }

  @media (max-width: 560px) {
    border-right: none;
  }
`;

const CardNum = styled.div`
  font-family: ${SERIF};
  font-style: italic;
  font-weight: 500;
  font-size: 32px;
  color: ${ACCENT};
  margin-bottom: var(--space-3);
  line-height: 1;
`;

const CardTitle = styled.h3`
  font-family: ${SERIF};
  font-weight: 500;
  font-size: 24px;
  line-height: 1.25;
  letter-spacing: -0.015em;
  margin: 0 0 var(--space-3);
  color: ${INK};
`;

const CardBody = styled.p`
  font-family: ${SERIF};
  font-size: 16px;
  line-height: 1.55;
  margin: 0;
  color: rgba(26, 26, 26, 0.75);
`;

const items = [
  {
    title: 'Never repeat yourself.',
    body: 'Show your agent how to do it once — the next thousand times are on autopilot.',
  },
  {
    title: 'Capture tribal knowledge.',
    body: 'Turn the tutorials, docs, and videos you trust into skills your agent can actually execute.',
  },
  {
    title: 'Be in a hundred places.',
    body: 'Social, outreach, lead gen, listings — your agent shows up everywhere, on schedule, on brand.',
  },
  {
    title: 'Build leverage.',
    body: 'Package your best skills as services to clients. Deliver a week of work in an afternoon.',
  },
];

export default function EditorialVariantPage() {
  return (
    <Wrap>
      <StyleSwitcher active="editorial" tone="paper" />

      <Container>
        <Masthead>
          <div className="name">Cadeno</div>
          <div className="meta">Vol. I · The Forward-Deployed Edition</div>
        </Masthead>

        <Hero>
          <Eyebrow>The Story</Eyebrow>

          <Headline>
            Your Personal <em>FDE</em>.
          </Headline>

          <Lead>
            Record once. Paste a tutorial. Drop a doc. Anything you do or know becomes a skill your agent runs forever — so one person can ship like a team.
          </Lead>

          <Ctas>
            <Primary href="#install">Create your first skill</Primary>
            <Secondary href="#use-cases">See skills in action</Secondary>
          </Ctas>

          <TrustLine>
            For creators<span className="rule" />operators<span className="rule" />freelancers<span className="rule" />solopreneurs
          </TrustLine>
        </Hero>

        <Why>
          <WhyHead>
            <SectionRule>The Case</SectionRule>
            <WhyTitle>
              You have one pair of hands. <em>Be in a hundred places.</em>
            </WhyTitle>
            <WhyLead>
              Big companies hire Forward Deployed Engineers to ship custom automation for them. Now you have one too.
            </WhyLead>
          </WhyHead>

          <Grid>
            {items.map((it, i) => (
              <Card key={it.title}>
                <CardNum>{(i + 1).toString().padStart(2, '0')}</CardNum>
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
