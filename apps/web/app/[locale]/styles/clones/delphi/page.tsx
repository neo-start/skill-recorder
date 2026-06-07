'use client';

import styled from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Delphi.ai's hero pattern rebuilt with Cadeno content.
 *
 * Source: https://www.delphi.ai/ (re-fetched 2026-06-07).
 *
 * Fidelity rule (per memory: clone with the source's visual language,
 * not the host site's tokens). Everything below is sourced from Delphi:
 *
 *   - palette: pure white + near-black `#0a0a0a` + medium gray `#6b6b6b`
 *     for subheads + warm cream `#faf8f4` for the featured card
 *   - typography: Inter / system sans only — NO Lexend, NO Iowan italic
 *     accent, NO Caveat hand kicker
 *   - H1: single declarative sentence, 700, near-black, no per-word color
 *   - CTAs: fully rounded (100px) pills — black-fill / white-outline pair
 *   - featured card: hairline border, generous radius (20px), no colored
 *     left rule on the quote, neutral avatar dot, sample text italicized
 *     in the body sans (not in a serif)
 *
 * Only the *content* is Cadeno (Your Personal FDE storyline + a
 * representative skill). The stamp at the top notes the clone provenance.
 */

const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const BG = '#ffffff';
const INK = '#0a0a0a';
const SUB = '#6b6b6b';
const HAIRLINE = '#e8e6e1';
const CARD_BG = '#faf8f4';
const FAINT = '#999999';

const Wrap = styled.div`
  min-height: 100vh;
  background: ${BG};
  color: ${INK};
  font-family: ${SANS};
  -webkit-font-smoothing: antialiased;
`;

const Note = styled.div`
  text-align: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid ${HAIRLINE};
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: ${SUB};

  & > strong {
    color: ${INK};
    font-weight: 600;
  }

  & > a {
    color: ${INK};
    text-decoration: underline;
    text-underline-offset: 3px;
    margin-left: 14px;
  }
`;

const Container = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding-inline: 32px;

  @media (max-width: 768px) {
    padding-inline: 22px;
  }
`;

/* ── Hero ─────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding-block: 100px 140px;
  text-align: center;

  @media (max-width: 768px) {
    padding-block: 64px 96px;
  }
`;

const Headline = styled.h1`
  font-family: ${SANS};
  font-size: clamp(2.5rem, 6vw, 4.75rem);
  font-weight: 700;
  color: ${INK};
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 0 auto;
  max-width: 18ch;
`;

const Lead = styled.p`
  font-family: ${SANS};
  font-size: clamp(1.0625rem, 1.4vw, 1.25rem);
  color: ${SUB};
  line-height: 1.5;
  margin: 28px auto 0;
  max-width: 580px;
  font-weight: 400;
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
  color: ${BG};
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
  gap: 8px;
  height: 52px;
  padding: 0 26px;
  background: ${BG};
  color: ${INK};
  border: 1px solid ${HAIRLINE};
  font-family: ${SANS};
  font-weight: 500;
  font-size: 15px;
  letter-spacing: -0.005em;
  text-decoration: none;
  border-radius: 100px;
  transition: border-color 160ms ease, background 160ms ease;

  &:hover {
    border-color: ${INK};
    background: #fafafa;
  }
`;

/* ── Featured "Skill" card (replaces Delphi's expert card) ────────── */

const CardWrap = styled.div`
  margin: 72px auto 0;
  max-width: 520px;

  @media (max-width: 768px) {
    margin-top: 56px;
  }
`;

const CardKicker = styled.div`
  font-family: ${SANS};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: ${FAINT};
  margin-bottom: 12px;
  text-align: center;
`;

const Card = styled.a`
  display: block;
  background: ${CARD_BG};
  border: 1px solid ${HAIRLINE};
  border-radius: 20px;
  padding: 28px 30px;
  text-align: left;
  text-decoration: none;
  color: inherit;
  transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;

  &:hover {
    border-color: ${INK};
    transform: translateY(-2px);
    box-shadow: 0 20px 56px -32px rgba(0, 0, 0, 0.2);
  }
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e4dfd4;
  color: ${INK};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${SANS};
  font-weight: 600;
  font-size: 15px;
  flex-shrink: 0;
`;

const CardHeadText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  & > .name {
    font-family: ${SANS};
    font-size: 15px;
    font-weight: 600;
    color: ${INK};
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  & > .who {
    font-family: ${SANS};
    font-size: 13px;
    color: ${SUB};
    margin-top: 2px;
    font-weight: 400;
  }
`;

const Sample = styled.p`
  font-family: ${SANS};
  font-style: italic;
  font-size: 1rem;
  line-height: 1.55;
  color: ${INK};
  margin: 0;
  font-weight: 400;
`;

const CardFoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid ${HAIRLINE};
  font-family: ${SANS};
  font-size: 13px;
  color: ${SUB};
  font-weight: 400;
`;

const RunLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${INK};
  font-weight: 500;

  &::after {
    content: '→';
    transition: transform 120ms ease;
  }

  ${Card}:hover &::after {
    transform: translateX(3px);
  }
`;

export default function DelphiCloneHero() {
  return (
    <Wrap>
      <StyleSwitcher active="clones-delphi" tone="light" />

      <Note>
        <strong>clone</strong> · Delphi.ai hero pattern, rebuilt with Cadeno content
        <a href="https://www.delphi.ai/" target="_blank" rel="noreferrer noopener">
          see original ↗
        </a>
      </Note>

      <Container>
        <Hero>
          <Headline>
            Distill your expertise into skills that ship themselves.
          </Headline>

          <Lead>
            Cadeno is the Forward Deployed Engineer for one-person companies. Record once, paste a tutorial, drop a doc — your agent runs it forever, so one person can ship like a team.
          </Lead>

          <Ctas>
            <Primary href="#waitlist">Create your first skill</Primary>
            <Secondary href="#popular">See popular skills</Secondary>
          </Ctas>

          <CardWrap>
            <CardKicker>FEATURED SKILL</CardKicker>
            <Card href="#skill" aria-label="Watch this skill run">
              <CardHead>
                <Avatar>N</Avatar>
                <CardHeadText>
                  <div className="name">Daily LinkedIn from YouTube</div>
                  <div className="who">a skill by Neo · 3 runs this week</div>
                </CardHeadText>
              </CardHead>

              <Sample>
                Pull my latest YouTube, find the three best hooks, draft three LinkedIn posts in my voice, and queue them for 9&nbsp;am Monday.
              </Sample>

              <CardFoot>
                <span>Runs every Sunday at 6 pm</span>
                <RunLink>watch it run</RunLink>
              </CardFoot>
            </Card>
          </CardWrap>
        </Hero>
      </Container>
    </Wrap>
  );
}
