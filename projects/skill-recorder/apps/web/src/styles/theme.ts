export const theme = {
  colors: {
    bg: '#0b0d10',
    bgElevated: '#11141a',
    surface: '#161a22',
    border: '#222732',
    borderStrong: '#2d3340',
    text: '#e6ebf2',
    textMuted: '#8a93a3',
    textFaint: '#5a6273',
    accent: '#fbbf24', // amber-400 — picks up the SKILL.md ⚠️ warning highlight
    accentSoft: 'rgba(251, 191, 36, 0.12)',
    primary: '#7c9cff',
    primarySoft: 'rgba(124, 156, 255, 0.14)',
    success: '#22c55e',
    danger: '#ef4444',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    pill: '999px',
  },
  font: {
    sans: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, "JetBrains Mono", "Fira Code", Menlo, monospace',
  },
  shadow: {
    soft: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.18)',
    lift: '0 24px 64px rgba(0,0,0,0.38)',
  },
  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  layout: {
    maxWidth: '1120px',
  },
} as const;

export type AppTheme = typeof theme;

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends AppTheme {}
}
