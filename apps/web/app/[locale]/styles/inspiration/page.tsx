'use client';

import styled, { keyframes } from 'styled-components';
import { StyleSwitcher } from '@/components/styles/Switcher';

/* Internal visual board — six product homepages compared head-to-head,
 * each rendered as a vibe-matched preview tile (not a real screenshot,
 * just a stylized thumbnail that recreates the brand feel in <200 lines
 * of CSS each). Below the grid: five patterns worth lifting for Cadeno.
 * Fetched 2026-06-06; refresh when references age out. */

const Wrap = styled.div`
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
`;

const Container = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding-block: var(--space-12) var(--space-24);
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Header = styled.header`
  max-width: 760px;
  margin: 0 auto var(--space-14);
  text-align: center;
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
  font-size: clamp(2rem, 4.5vw, 3.25rem);
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
  line-height: 1.55;
  margin: var(--space-5) auto 0;
  max-width: 620px;
`;

const Stamp = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: var(--color-text-faint);
  margin-top: var(--space-3);
  letter-spacing: 0.04em;
`;

/* ── reference card scaffolding ───────────────────────────────────── */

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);

  &:hover {
    border-color: var(--color-border-hover);
    transform: translateY(-2px);
    box-shadow: 0 22px 56px -32px rgba(7, 14, 36, 0.22);
  }
`;

const Tile = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
`;

const Meta = styled.div`
  padding: var(--space-6) var(--space-7) var(--space-7);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const MetaTop = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
`;

const Name = styled.h2`
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--color-gray-900);
  margin: 0;
`;

const Url = styled.a`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: var(--color-primary-600);
  text-decoration: none;
  white-space: nowrap;

  &::after {
    content: ' ↗';
  }

  &:hover {
    text-decoration: underline;
  }
`;

const Vibe = styled.p`
  font-size: 0.9375rem;
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: 0;

  & > strong {
    color: var(--color-gray-900);
    font-weight: 600;
  }
`;

const Distinct = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: var(--space-4);
  border-top: 1px dashed var(--color-border);

  & > .label {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  & > .body {
    font-size: 0.9375rem;
    color: var(--color-text);
    line-height: 1.55;
  }

  & > .body em {
    font-style: italic;
    color: var(--color-primary-600);
  }
`;

/* ── vibe-matched preview tiles ───────────────────────────────────── */

const ManusTile = styled(Tile)`
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: var(--space-6);

  & > .h1 {
    font-size: 22px;
    font-weight: 600;
    color: #111;
    letter-spacing: -0.02em;
  }
  & > .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  & > .pills > span {
    padding: 5px 11px;
    border-radius: 100px;
    background: #fff;
    border: 1px solid #e6e6e6;
    font-size: 11px;
    font-weight: 500;
    color: #333;
  }
`;

const GranolaTile = styled(Tile)`
  background: #fdfaf3;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  padding: 14px;

  & > .pane {
    background: #fff;
    border: 1px solid #ece5d2;
    border-radius: 8px;
    padding: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 9.5px;
    line-height: 1.5;
    color: #2d2d2d;
    overflow: hidden;
  }
  & > .pane.right {
    border-color: #5bb09b;
    box-shadow: 0 0 0 1px rgba(91, 176, 155, 0.2);
  }
  & > .pane .label {
    font-weight: 700;
    color: #5bb09b;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 9px;
  }
`;

const LinearTile = styled(Tile)`
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 12px;

  & > .h1 {
    font-size: 16px;
    font-weight: 600;
    color: #0d0e10;
    letter-spacing: -0.02em;
    text-align: center;
    max-width: 280px;
    line-height: 1.2;
  }
  & > .h1 em {
    font-style: italic;
    font-weight: 500;
    color: #5e6ad2;
  }
  & > .stack {
    position: relative;
    width: 220px;
    height: 64px;
  }
  & > .stack > .shot {
    position: absolute;
    inset: 0;
    background: #fff;
    border: 1px solid #e5e7ef;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }
  & > .stack > .shot:nth-child(1) {
    transform: translateY(-10px) translateX(-12px) rotate(-2deg);
  }
  & > .stack > .shot:nth-child(2) {
    transform: translateY(-2px) translateX(0) rotate(1deg);
    background: linear-gradient(135deg, #fff 0%, #f1f3fb 100%);
  }
  & > .stack > .shot:nth-child(3) {
    transform: translateY(6px) translateX(12px) rotate(-1deg);
  }
`;

const CursorTile = styled(Tile)`
  background: #f7f8f9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 18px 24px;
  gap: 12px;

  & > .h1 {
    font-size: 14px;
    font-weight: 600;
    color: #0a0a0a;
    letter-spacing: -0.015em;
    line-height: 1.3;
    max-width: 280px;
  }

  & > .windows {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    align-items: stretch;
  }
  & > .windows > .w {
    background: #16181d;
    border-radius: 6px;
    padding: 8px 10px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 8.5px;
    color: #cdd5f4;
    line-height: 1.5;
    border: 1px solid #2a2d34;
  }
  & > .windows > .w .dot {
    color: #6cd0ff;
  }
  & > .windows > .w .green {
    color: #7be0a0;
  }
`;

const NotionTile = styled(Tile)`
  background:
    radial-gradient(ellipse at 70% 30%, rgba(108, 208, 255, 0.18), transparent 55%),
    radial-gradient(ellipse at 20% 80%, rgba(157, 130, 255, 0.16), transparent 60%),
    #0d0d11;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 22px 26px;
  gap: 10px;
  color: #fff;

  & > .eyebrow {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6cd0ff;
  }
  & > .h1 {
    font-size: 19px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.02em;
    max-width: 280px;
  }
  & > .apps {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }
  & > .apps > i {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(108, 208, 255, 0.25);
    display: inline-block;
  }
`;

const DelphiTile = styled(Tile)`
  background: #ffffff;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 12px;
  padding: 22px 24px;
  align-items: center;

  & > .left .h1 {
    font-size: 18px;
    font-weight: 600;
    color: #0a0a0a;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }
  & > .left .h1 em {
    font-style: italic;
    color: #0a0a0a;
  }
  & > .left .sub {
    margin-top: 6px;
    font-size: 11px;
    color: #565b66;
    line-height: 1.4;
  }
  & > .right {
    background: #faf9f6;
    border: 1px solid #ebe8e0;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 10px;
    line-height: 1.4;
  }
  & > .right .who {
    font-weight: 700;
    color: #0a0a0a;
    margin-bottom: 4px;
    font-size: 9.5px;
  }
  & > .right .q {
    color: #2d2d2d;
    font-style: italic;
  }
`;

/* ── design-forward tiles (3D / motion / mesh gradient) ───────────── */

const VercelTile = styled(Tile)`
  background:
    radial-gradient(ellipse at 85% 15%, rgba(108, 208, 255, 0.45), transparent 55%),
    radial-gradient(ellipse at 12% 88%, rgba(180, 120, 255, 0.4), transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(255, 130, 200, 0.18), transparent 60%),
    #fafafe;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 26px;
  gap: 14px;

  & > .eyebrow {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6b46ff;
  }
  & > .h1 {
    font-size: 22px;
    font-weight: 700;
    color: #0a0a0a;
    letter-spacing: -0.025em;
    line-height: 1.1;
    max-width: 320px;
  }
  & > .row {
    display: flex;
    gap: 8px;
  }
  & > .row > .a {
    padding: 7px 14px;
    background: #0a0a0a;
    color: #fff;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
  }
  & > .row > .b {
    padding: 7px 14px;
    background: rgba(10, 10, 10, 0.08);
    color: #0a0a0a;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
  }
`;

const orbit3D = keyframes`
  from { transform: rotateY(0deg) rotateX(-18deg); }
  to   { transform: rotateY(360deg) rotateX(-18deg); }
`;

const SplineTile = styled(Tile)`
  background:
    radial-gradient(ellipse at 50% 50%, rgba(160, 100, 255, 0.25), transparent 65%),
    linear-gradient(135deg, #0d0a18 0%, #1a1028 100%);
  position: relative;
  perspective: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  & > .scene {
    width: 92px;
    height: 92px;
    position: relative;
    transform-style: preserve-3d;
    animation: ${orbit3D} 14s linear infinite;
  }
  & > .scene > div {
    position: absolute;
    inset: 0;
    border: 1.5px solid rgba(255, 255, 255, 0.42);
    background: rgba(168, 110, 255, 0.16);
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.06);
  }
  & > .scene > div:nth-child(1) { transform: translateZ(46px); }
  & > .scene > div:nth-child(2) { transform: rotateY(180deg) translateZ(46px); }
  & > .scene > div:nth-child(3) { transform: rotateY(90deg) translateZ(46px); }
  & > .scene > div:nth-child(4) { transform: rotateY(-90deg) translateZ(46px); }
  & > .scene > div:nth-child(5) { transform: rotateX(90deg) translateZ(46px); }
  & > .scene > div:nth-child(6) { transform: rotateX(-90deg) translateZ(46px); }

  & > .h1 {
    position: absolute;
    bottom: 16px;
    left: 22px;
    right: 22px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.015em;
    line-height: 1.3;
  }
  & > .hint {
    position: absolute;
    top: 14px;
    right: 18px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 9.5px;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.04em;
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.12); opacity: 0.8; }
`;

const RiveTile = styled(Tile)`
  background: #fafafa;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 14px;
  padding: 22px 24px;
  align-items: center;

  & > .left .h1 {
    font-size: 17px;
    font-weight: 600;
    color: #0a0a0a;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  & > .left .sub {
    margin-top: 6px;
    font-size: 11px;
    color: #565b66;
  }

  & > .right {
    position: relative;
    aspect-ratio: 1.4 / 1;
    background: #fff;
    border: 1px solid #ececf2;
    border-radius: 8px;
  }
  & > .right svg {
    width: 100%;
    height: 100%;
  }
  & > .right svg circle.node {
    fill: #fff;
    stroke: #555;
    stroke-width: 1.2;
  }
  & > .right svg circle.active {
    fill: #5e6ad2;
    stroke: #5e6ad2;
    transform-origin: center;
    animation: ${pulse} 1.6s ease-in-out infinite;
  }
  & > .right svg path.edge {
    stroke: #bbb;
    stroke-width: 1;
    fill: none;
  }
  & > .right svg text.lbl {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 6px;
    fill: #777;
  }
`;

/* ── toolbox card styling ─────────────────────────────────────────── */

const SectionHeader = styled.div`
  margin-top: var(--space-20);
  padding-top: var(--space-16);
  border-top: 1px solid var(--color-border);
  text-align: center;
  margin-bottom: var(--space-12);
`;

const SectionEyebrow = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-primary-600);
  margin-bottom: var(--space-3);
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.75rem, 3.4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  margin: 0;
  color: var(--color-gray-900);

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    color: var(--color-primary-600);
  }
`;

const SectionLead = styled.p`
  font-size: var(--text-base);
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: var(--space-3) auto 0;
  max-width: 560px;
`;

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ToolCard = styled.a`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    border-color: var(--color-border-hover);
    transform: translateY(-2px);
    box-shadow: 0 12px 28px -16px rgba(7, 14, 36, 0.18);
  }
`;

const ToolHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
`;

const ToolName = styled.h3`
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--color-gray-900);
`;

const ToolDomain = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
`;

const ToolTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span<{ $tone?: 'brand' | 'neutral' }>`
  display: inline-block;
  padding: 3px 9px;
  border-radius: 100px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: ${({ $tone }) =>
    $tone === 'brand' ? 'rgba(48, 92, 222, 0.1)' : 'rgba(7, 14, 36, 0.05)'};
  color: ${({ $tone }) =>
    $tone === 'brand' ? 'var(--color-primary-600)' : 'var(--color-text-muted)'};
`;

const ToolBody = styled.p`
  font-size: 0.9375rem;
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: 0;
  flex: 1;
`;

const ToolMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px dashed var(--color-border);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: var(--color-text-muted);
`;

const Dots = styled.span<{ $level: 1 | 2 | 3 }>`
  display: inline-flex;
  gap: 3px;
  vertical-align: middle;
  margin-left: 4px;

  &::before { content: '●'; color: var(--color-primary-500); }
  &::after  { content: ${({ $level }) => ($level >= 2 ? "'●●'" : "'○○'")}; color: ${({ $level }) => ($level >= 2 ? 'var(--color-primary-500)' : 'var(--color-border-hover)')}; letter-spacing: 3px; margin-left: 3px; }
`;

/* ── takeaways ────────────────────────────────────────────────────── */

const TakeawaysSection = styled.section`
  margin-top: var(--space-20);
  padding-top: var(--space-16);
  border-top: 1px solid var(--color-border);
`;

const TakeawayHead = styled.div`
  text-align: center;
  margin-bottom: var(--space-12);
`;

const Takeaways = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Takeaway = styled.div`
  padding: var(--space-7);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const TakeawayLabel = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-primary-600);

  & > .src {
    color: var(--color-text-faint);
    font-weight: 500;
    margin-left: 8px;
  }
`;

const TakeawayTitle = styled.h3`
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--color-gray-900);

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    color: var(--color-primary-600);
  }
`;

const TakeawayBody = styled.p`
  font-size: 0.9375rem;
  color: var(--color-gray-700);
  line-height: 1.6;
  margin: 0;
`;

const Apply = styled.div`
  margin-top: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px dashed var(--color-border);
  font-size: 0.9375rem;
  color: var(--color-text);
  line-height: 1.55;

  & > strong {
    color: var(--color-primary-600);
    font-weight: 600;
  }
`;

/* ── data ─────────────────────────────────────────────────────────── */

type Ref = {
  name: string;
  url: string;
  href: string;
  vibe: React.ReactNode;
  distinct: React.ReactNode;
  Tile: React.ReactNode;
};

const references: Ref[] = [
  {
    name: 'Manus',
    url: 'manus.im',
    href: 'https://manus.im/',
    vibe: (
      <>
        Light + minimal. <strong>Skips the traditional hero</strong> — drops you straight into a question + 5 verb pills.
      </>
    ),
    distinct: (
      <>
        <em>"What can I do for you?"</em> as the H1 puts the ball back in the user's court. No selling — it just asks.
      </>
    ),
    Tile: (
      <ManusTile>
        <div className="h1">What can I do for you?</div>
        <div className="pills">
          <span>Create slides</span>
          <span>Build website</span>
          <span>Develop apps</span>
          <span>Design</span>
          <span>More</span>
        </div>
      </ManusTile>
    ),
  },
  {
    name: 'Granola',
    url: 'granola.ai',
    href: 'https://www.granola.ai/',
    vibe: (
      <>
        Light + teal. <strong>Real before/after</strong> as hero — raw notes ↔ structured output, not a mockup.
      </>
    ),
    distinct: (
      <>
        Dual-panel transformation: messy timestamps on left, clean structured brief on right. Sells the product without saying what it does.
      </>
    ),
    Tile: (
      <GranolaTile>
        <div className="pane">
          <div className="label">RAW NOTES</div>
          <div>10:04 sarah — budget?</div>
          <div>10:05 — ~50k? maybe</div>
          <div>10:08 next steps tbd</div>
          <div>10:11 follow-up fri?</div>
        </div>
        <div className="pane right">
          <div className="label">GRANOLA BRIEF</div>
          <div>· Budget: ~$50k</div>
          <div>· Decision: Friday</div>
          <div>· Owner: Sarah</div>
          <div>· Next: send recap</div>
        </div>
      </GranolaTile>
    ),
  },
  {
    name: 'Linear',
    url: 'linear.app',
    href: 'https://linear.app/',
    vibe: (
      <>
        Light + soft cyan. Premium minimal. H1 reads <strong>"for teams and agents"</strong> — agents = first-class citizen.
      </>
    ),
    distinct: (
      <>
        Showing <em>@Codex</em> being mentioned in PR comments like a teammate. AI isn't behind a menu, it's in the thread.
      </>
    ),
    Tile: (
      <LinearTile>
        <div className="h1">
          The product development system for teams and <em>agents</em>.
        </div>
        <div className="stack">
          <div className="shot" />
          <div className="shot" />
          <div className="shot" />
        </div>
      </LinearTile>
    ),
  },
  {
    name: 'Cursor',
    url: 'cursor.com',
    href: 'https://www.cursor.com/',
    vibe: (
      <>
        Light hero + dark product windows. <strong>"In every tool"</strong> story — Desktop, CLI, Slack rotating.
      </>
    ),
    distinct: (
      <>
        Multi-surface presence story: same agent visible in IDE, CLI, and Slack. Positions Cursor as a teammate that follows you across tools.
      </>
    ),
    Tile: (
      <CursorTile>
        <div className="h1">
          Built to make you extraordinarily productive. The best coding agent.
        </div>
        <div className="windows">
          <div className="w">
            <div><span className="dot">▸</span> agent.run()</div>
            <div className="green">✓ Build landing page</div>
            <div>⏳ Analyze tabs</div>
          </div>
          <div className="w">
            <div><span className="dot">$</span> cursor cli</div>
            <div className="green">✓ pushed PR #482</div>
            <div>⟳ in review</div>
          </div>
        </div>
      </CursorTile>
    ),
  },
  {
    name: 'Notion',
    url: 'notion.com',
    href: 'https://www.notion.com/',
    vibe: (
      <>
        Dark + electric blue. <strong>"Meet the night shift"</strong> humanizes the agent as a 24/7 worker.
      </>
    ),
    distinct: (
      <>
        Animated multi-app editorial — Slack, Gmail, HubSpot, GitHub icons orbiting around the agent. Frames it as an ecosystem worker.
      </>
    ),
    Tile: (
      <NotionTile>
        <div className="eyebrow">▸ Meet the night shift</div>
        <div className="h1">The AI workspace that works for you.</div>
        <div className="apps">
          <i /><i /><i /><i /><i /><i />
        </div>
      </NotionTile>
    ),
  },
  {
    name: 'Delphi',
    url: 'delphi.ai',
    href: 'https://www.delphi.ai/',
    vibe: (
      <>
        Pure white + editorial premium. Real named experts as hero proof, not stock illustrations.
      </>
    ),
    distinct: (
      <>
        Ramit Sethi appears <em>in the hero</em> with a real Q&amp;A card. Each expert page reads as a literary product, not a SaaS sell.
      </>
    ),
    Tile: (
      <DelphiTile>
        <div className="left">
          <div className="h1">
            Scale your <em>insight</em>.
          </div>
          <div className="sub">Turn your expertise into an always-on presence.</div>
        </div>
        <div className="right">
          <div className="who">Ramit Sethi · personal finance</div>
          <div className="q">"How should couples talk about money without fighting?"</div>
        </div>
      </DelphiTile>
    ),
  },
];

const designForwardRefs: Ref[] = [
  {
    name: 'Vercel',
    url: 'vercel.com',
    href: 'https://vercel.com/',
    vibe: (
      <>
        Soft mesh-gradient corners + restraint. <strong>Tab-switched product visuals</strong> for AI / Web / Ecommerce — same hero, three faces.
      </>
    ),
    distinct: (
      <>
        The hero copy is short, the data is loud. Customer metrics like <em>"7m → 40s build"</em> and <em>"95% page load reduction"</em> do the persuasion, not animation.
      </>
    ),
    Tile: (
      <VercelTile>
        <div className="eyebrow">▸ AI Cloud</div>
        <div className="h1">Build and deploy on the AI Cloud.</div>
        <div className="row">
          <div className="a">Start Deploying</div>
          <div className="b">Get a Demo</div>
        </div>
      </VercelTile>
    ),
  },
  {
    name: 'Spline',
    url: 'spline.design',
    href: 'https://spline.design/',
    vibe: (
      <>
        Dark + violet. <strong>Live 3D viewport as the hero</strong> — drag-to-orbit instructions sit on top of an actual scene.
      </>
    ),
    distinct: (
      <>
        The product <em>is</em> the hero. No mockup, no video — a real 3D scene you can manipulate before you even sign up. Highest "show, don't tell" ratio on the list.
      </>
    ),
    Tile: (
      <SplineTile>
        <span className="hint">⤲ orbit</span>
        <div className="scene">
          <div /><div /><div /><div /><div /><div />
        </div>
        <div className="h1">The all-in-one platform for 3D and design.</div>
      </SplineTile>
    ),
  },
  {
    name: 'Rive',
    url: 'rive.app',
    href: 'https://rive.app/',
    vibe: (
      <>
        Clean white + indigo accent. <strong>Live state-machine</strong> in the hero — animations <em>running</em>, not playing.
      </>
    ),
    distinct: (
      <>
        Powers Spotify Wrapped, Duolingo. The hero gives you the editor itself: nodes, transitions, an active state pulsing. "What you see is what ships" — no export round-trip.
      </>
    ),
    Tile: (
      <RiveTile>
        <div className="left">
          <div className="h1">The Interactive experience engine.</div>
          <div className="sub">Design, animate, code. Ship everywhere.</div>
        </div>
        <div className="right">
          <svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
            <path className="edge" d="M 18 18 L 50 35" />
            <path className="edge" d="M 50 35 L 82 18" />
            <path className="edge" d="M 50 35 L 50 58" />
            <path className="edge" d="M 18 18 L 18 58" />
            <path className="edge" d="M 82 18 L 82 58" />
            <path className="edge" d="M 18 58 L 50 58" />
            <path className="edge" d="M 50 58 L 82 58" />
            <circle className="node" cx="18" cy="18" r="4.5" />
            <circle className="node active" cx="50" cy="35" r="5.5" />
            <circle className="node" cx="82" cy="18" r="4.5" />
            <circle className="node" cx="18" cy="58" r="4.5" />
            <circle className="node" cx="50" cy="58" r="4.5" />
            <circle className="node" cx="82" cy="58" r="4.5" />
            <text className="lbl" x="11" y="11">idle</text>
            <text className="lbl" x="45" y="28">hover</text>
            <text className="lbl" x="76" y="11">click</text>
            <text className="lbl" x="11" y="68">reset</text>
            <text className="lbl" x="44" y="68">ship</text>
            <text className="lbl" x="76" y="68">done</text>
          </svg>
        </div>
      </RiveTile>
    ),
  },
];

type Tool = {
  name: string;
  domain: string;
  href: string;
  tags: Array<{ label: string; tone?: 'brand' | 'neutral' }>;
  body: string;
  setup: string;
  difficulty: 1 | 2 | 3;
};

const toolbox: Tool[] = [
  {
    name: 'Spline',
    domain: 'spline.design',
    href: 'https://spline.design/',
    tags: [
      { label: '3D scene', tone: 'brand' },
      { label: 'no-code editor' },
      { label: 'React embed' },
    ],
    body:
      'Drag-and-drop 3D editor that exports to an iframe or @splinetool/react-spline component. Zero shader code. Designer-friendly, low control.',
    setup: '<Spline scene="…/scene.splinecode" />',
    difficulty: 1,
  },
  {
    name: 'React Three Fiber + drei',
    domain: 'r3f.docs.pmnd.rs',
    href: 'https://r3f.docs.pmnd.rs/',
    tags: [
      { label: '3D scene', tone: 'brand' },
      { label: 'programmatic' },
      { label: 'full control' },
    ],
    body:
      'Three.js as React components. drei ships the kits (orbit controls, environment, sky, postprocessing) so you skip 80% of the Three.js boilerplate.',
    setup: 'pnpm add @react-three/{fiber,drei}',
    difficulty: 3,
  },
  {
    name: 'Vanta.js',
    domain: 'vantajs.com',
    href: 'https://www.vantajs.com/',
    tags: [
      { label: 'WebGL bg', tone: 'brand' },
      { label: '10 presets' },
      { label: '<5 LOC' },
    ],
    body:
      'Ten plug-and-play animated backgrounds (waves, fog, net, globe, halo, dots, birds, cells, rings, clouds). Drop into any div via a CDN script tag.',
    setup: 'VANTA.WAVES({ el: "#hero" })',
    difficulty: 1,
  },
  {
    name: 'Rive',
    domain: 'rive.app',
    href: 'https://rive.app/',
    tags: [
      { label: 'motion', tone: 'brand' },
      { label: 'state machine' },
      { label: 'interactive' },
    ],
    body:
      'Vector animation + state machines for inputs (hover/click/scroll). Lottie\'s spiritual successor — same lightweight feel, but actually interactive.',
    setup: '@rive-app/react-canvas',
    difficulty: 2,
  },
  {
    name: 'Lottie',
    domain: 'lottiefiles.com',
    href: 'https://lottiefiles.com/',
    tags: [
      { label: 'motion', tone: 'brand' },
      { label: 'no interaction' },
      { label: 'huge gallery' },
    ],
    body:
      'After Effects → JSON → web. Massive free gallery. One-way playback (no state), but the lightest possible way to add polish in two lines.',
    setup: '@lottiefiles/react-lottie-player',
    difficulty: 1,
  },
  {
    name: 'Paper / Shaders',
    domain: 'paper.design',
    href: 'https://paper.design/',
    tags: [
      { label: 'shader', tone: 'brand' },
      { label: 'mesh gradient' },
      { label: 'GPU' },
    ],
    body:
      'GPU shaders for hero gradients, fluid backgrounds, kaleidoscope effects. The Stripe / Vercel mesh-gradient look, without rolling your own GLSL.',
    setup: '@paper-design/shaders-react',
    difficulty: 2,
  },
];

const takeaways = [
  {
    src: 'Granola · Delphi · Linear',
    title: (
      <>
        Real output, <em>not mockup</em>.
      </>
    ),
    body: 'The three strongest hero visuals here all ship a concrete artifact — a transformed note, a real expert Q&A, three actual screenshots — not an abstract illustration.',
    apply: (
      <>
        <strong>For Cadeno:</strong> drop the SKILL.md anatomy. Show a real skill card — <em>"Repurpose my YouTube → 5 LinkedIn drafts, every Monday 9am"</em> — with this morning's actual output on the right.
      </>
    ),
  },
  {
    src: 'Notion · Linear',
    title: (
      <>
        Write the agent <em>as a person</em>.
      </>
    ),
    body: 'Notion calls it "the night shift." Linear gives the agent a name (@Codex) and lets you @mention it in comments. Humanizing the agent reads warmer than "automation platform."',
    apply: (
      <>
        <strong>For Cadeno:</strong> add a "Your FDE today" timeline section — 10:00 posted on LinkedIn · 10:30 scraped 50 KOLs · 11:00 submitted to ProductHunt. The agent is on the clock.
      </>
    ),
  },
  {
    src: 'Cursor · Notion',
    title: (
      <>
        Show <em>everywhere</em> the skill runs.
      </>
    ),
    body: 'Cursor rotates Desktop / CLI / Slack. Notion orbits twelve app icons around the agent. Both sell omnipresence, not capability.',
    apply: (
      <>
        <strong>For Cadeno:</strong> add a marquee strip of surfaces a skill touches — X, LinkedIn, Notion, Airtable, Slack, Gmail, Calendly, ProductHunt — all scrolling sideways. Magic UI's marquee component drops right in.
      </>
    ),
  },
  {
    src: 'Manus',
    title: (
      <>
        Bottom-of-page <em>question hero</em>.
      </>
    ),
    body: "Manus throws the ball back: \"What can I do for you?\" + verb pills. Risky as a top-of-page bet for a beta product, but useful at the bottom.",
    apply: (
      <>
        <strong>For Cadeno:</strong> replace the final "Hire your Personal FDE" with <em>"What would you have your FDE do first?"</em> + a free-text input. Submit = joins waitlist with the first skill idea pre-filled.
      </>
    ),
  },
  {
    src: 'Granola · Linear · Notion',
    title: (
      <>
        One <em>named</em> testimonial beats ten stars.
      </>
    ),
    body: 'All three skip the anonymous five-star carousel. Granola has John Borthwick. Linear has a quote from OpenAI. Notion has G2 badges + Fortune Cloud 100.',
    apply: (
      <>
        <strong>For Cadeno:</strong> no users yet, but waitlist phase can run three "why I signed up" quotes from early conversations — or one founder note explaining the bet. Both beat fake stars.
      </>
    ),
  },
  {
    src: 'Spline · Vercel · Paper Design',
    title: (
      <>
        3D as <em>garnish</em>, not as the meal.
      </>
    ),
    body:
      "Spline puts a literal 3D viewport in the hero because the product is 3D. Vercel keeps the mesh in the corners. Most products that try to copy Spline’s hero end up with slow, fragile pages.",
    apply: (
      <>
        <strong>For Cadeno:</strong> a soft mesh gradient (paper-design or CSS) behind the hero adds 80% of the "premium tech" feel for 5% of the perf cost. Skip the WebGL scene; the copy and skill card carry the message.
      </>
    ),
  },
];

export default function InspirationPage() {
  return (
    <Wrap>
      <StyleSwitcher active="inspiration" tone="light" />

      <Container>
        <Header>
          <Eyebrow>internal · visual board</Eyebrow>
          <Title>
            What the best <em>agent products</em> are doing.
          </Title>
          <Lead>
            Six homepages compared head-to-head. Each tile recreates the brand feel — click through for the live page. Below the grid: five patterns worth lifting for Cadeno.
          </Lead>
          <Stamp>fetched 2026-06-06 · refresh when references age out</Stamp>
        </Header>

        <Grid>
          {references.map(ref => (
            <Card key={ref.name}>
              {ref.Tile}
              <Meta>
                <MetaTop>
                  <Name>{ref.name}</Name>
                  <Url href={ref.href} target="_blank" rel="noreferrer noopener">
                    {ref.url}
                  </Url>
                </MetaTop>
                <Vibe>{ref.vibe}</Vibe>
                <Distinct>
                  <span className="label">Standout</span>
                  <span className="body">{ref.distinct}</span>
                </Distinct>
              </Meta>
            </Card>
          ))}
        </Grid>

        <SectionHeader>
          <SectionEyebrow>design-forward · 3D · mesh · motion</SectionEyebrow>
          <SectionTitle>
            When the page <em>does the thing</em>.
          </SectionTitle>
          <SectionLead>
            Three sites where the visual language is the product pitch — mesh gradients, real 3D, live state machines.
          </SectionLead>
        </SectionHeader>

        <Grid>
          {designForwardRefs.map(ref => (
            <Card key={ref.name}>
              {ref.Tile}
              <Meta>
                <MetaTop>
                  <Name>{ref.name}</Name>
                  <Url href={ref.href} target="_blank" rel="noreferrer noopener">
                    {ref.url}
                  </Url>
                </MetaTop>
                <Vibe>{ref.vibe}</Vibe>
                <Distinct>
                  <span className="label">Standout</span>
                  <span className="body">{ref.distinct}</span>
                </Distinct>
              </Meta>
            </Card>
          ))}
        </Grid>

        <SectionHeader>
          <SectionEyebrow>3D &amp; motion toolbox</SectionEyebrow>
          <SectionTitle>
            Pick a <em>weapon</em>.
          </SectionTitle>
          <SectionLead>
            Six libraries that ship the look without writing a shader. Difficulty dots: ● easy · ●● medium · ●●● real work.
          </SectionLead>
        </SectionHeader>

        <ToolGrid>
          {toolbox.map(tool => (
            <ToolCard key={tool.name} href={tool.href} target="_blank" rel="noreferrer noopener">
              <ToolHead>
                <ToolName>{tool.name}</ToolName>
                <ToolDomain>{tool.domain}</ToolDomain>
              </ToolHead>
              <ToolTags>
                {tool.tags.map(t => (
                  <Tag key={t.label} $tone={t.tone}>{t.label}</Tag>
                ))}
              </ToolTags>
              <ToolBody>{tool.body}</ToolBody>
              <ToolMeta>
                <span>{tool.setup}</span>
                <span>
                  difficulty
                  <Dots $level={tool.difficulty} />
                </span>
              </ToolMeta>
            </ToolCard>
          ))}
        </ToolGrid>

        <TakeawaysSection>
          <TakeawayHead>
            <Eyebrow>patterns to steal</Eyebrow>
            <Title>
              Five recipes <em>for Cadeno</em>.
            </Title>
          </TakeawayHead>

          <Takeaways>
            {takeaways.map((t, i) => (
              <Takeaway key={i}>
                <TakeawayLabel>
                  ▸ pattern {i + 1}
                  <span className="src">— {t.src}</span>
                </TakeawayLabel>
                <TakeawayTitle>{t.title}</TakeawayTitle>
                <TakeawayBody>{t.body}</TakeawayBody>
                <Apply>{t.apply}</Apply>
              </Takeaway>
            ))}
          </Takeaways>
        </TakeawaysSection>
      </Container>
    </Wrap>
  );
}
