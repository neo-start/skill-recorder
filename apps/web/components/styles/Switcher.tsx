'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';

/* Single source of truth for the /styles variant switcher. Each variant
 * page imports this and passes `active` matching its own id (or omits
 * for the index page itself). Skin via the `tone` prop so the same
 * component looks right on dark, light, paper, and glass canvases. */

export const VARIANTS: Array<{ id: string; href: string; label: string }> = [
  { id: 'v1', href: '/', label: 'v1' },
  { id: 'dark', href: '/styles/dark', label: 'dark' },
  { id: 'editorial', href: '/styles/editorial', label: 'editorial' },
  { id: 'pastel', href: '/styles/pastel', label: 'pastel' },
  { id: 'brutalist', href: '/styles/brutalist', label: 'brutalist' },
  { id: 'aurora', href: '/styles/aurora', label: 'aurora' },
  { id: 'sketchy', href: '/styles/sketchy', label: 'sketchy' },
  { id: 'cyberpunk', href: '/styles/cyberpunk', label: 'cyberpunk' },
  { id: 'vapourwave', href: '/styles/vapourwave', label: 'vapourwave' },
  { id: 'botanical', href: '/styles/botanical', label: 'botanical' },
  { id: 'blueprint', href: '/styles/blueprint', label: 'blueprint' },
  { id: 'fashion', href: '/styles/fashion', label: 'fashion' },
  { id: 'y2k', href: '/styles/y2k', label: 'y2k' },
  { id: 'cottagecore', href: '/styles/cottagecore', label: 'cottagecore' },
  { id: 'inspiration', href: '/styles/inspiration', label: '+ inspiration' },
  { id: 'clones-delphi', href: '/styles/clones/delphi', label: 'clone · delphi' },
];

type Tone = 'dark' | 'light' | 'paper' | 'glass' | 'warm' | 'mono';

const palettes: Record<
  Tone,
  {
    border: string;
    idle: string;
    hover: string;
    activeBg: string;
    activeFg: string;
    activeBorder: string;
  }
> = {
  dark: {
    border: 'rgba(255,255,255,0.08)',
    idle: 'rgba(255,255,255,0.45)',
    hover: '#ffffff',
    activeBg: '#a3ff5e',
    activeFg: '#0a0a14',
    activeBorder: '#a3ff5e',
  },
  light: {
    border: 'rgba(0,0,0,0.08)',
    idle: 'rgba(0,0,0,0.5)',
    hover: '#0a1535',
    activeBg: '#305cde',
    activeFg: '#ffffff',
    activeBorder: '#305cde',
  },
  paper: {
    border: '#d8cdb7',
    idle: 'rgba(26,26,26,0.55)',
    hover: '#1a1a1a',
    activeBg: 'transparent',
    activeFg: '#9a2222',
    activeBorder: '#9a2222',
  },
  glass: {
    border: 'rgba(42,26,74,0.12)',
    idle: 'rgba(42,26,74,0.55)',
    hover: '#2a1a4a',
    activeBg: '#2a1a4a',
    activeFg: '#ffffff',
    activeBorder: '#2a1a4a',
  },
  warm: {
    border: 'rgba(45,39,72,0.10)',
    idle: 'rgba(45,39,72,0.66)',
    hover: '#2d2748',
    activeBg: '#ff7a59',
    activeFg: '#ffffff',
    activeBorder: '#ff7a59',
  },
  mono: {
    border: '#000000',
    idle: '#000000',
    hover: '#000000',
    activeBg: '#000000',
    activeFg: '#ffffff',
    activeBorder: '#000000',
  },
};

const Bar = styled.nav<{ $tone: Tone }>`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-4);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;

  ${({ $tone }) => {
    const p = palettes[$tone];
    return css`
      a {
        color: ${p.idle};
        text-decoration: none;
        padding: 6px 12px;
        border: 1px solid ${p.border};
        border-radius: 100px;
        transition: all var(--transition-fast);
      }

      a.active {
        color: ${p.activeFg};
        background: ${p.activeBg};
        border-color: ${p.activeBorder};
      }

      a:hover:not(.active) {
        color: ${p.hover};
        border-color: ${p.hover};
      }
    `;
  }}
`;

export function StyleSwitcher({ active, tone }: { active?: string; tone: Tone }) {
  return (
    <Bar $tone={tone}>
      {VARIANTS.map(v => (
        <Link
          key={v.id}
          href={v.href}
          className={active === v.id ? 'active' : undefined}
        >
          {v.id === 'v1' ? 'v1 (baseline)' : v.label}
        </Link>
      ))}
    </Bar>
  );
}
