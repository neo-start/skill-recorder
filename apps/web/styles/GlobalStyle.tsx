'use client';

import { createGlobalStyle } from 'styled-components';

// Mirrors web-scraper/web's globals.css: design tokens via :root CSS variables
// plus a minimal reset and a handful of utility classes that landing-section
// components reference directly (.container, .section-title, .btn variants).
export const GlobalStyle = createGlobalStyle`
  :root {
    /* ── Primary scale (royal blue) ── */
    --color-primary-50:  #eef2fd;
    --color-primary-100: #d6e0fb;
    --color-primary-200: #adc1f7;
    --color-primary-300: #7a9ef5;
    --color-primary-400: #4e72e8;
    --color-primary-500: #305cde;
    --color-primary-600: #2449b8;
    --color-primary-700: #1a2f6e;
    --color-primary-800: #0f1e4a;
    --color-primary-900: #070e24;

    --color-gray-1000: #000000;
    --color-gray-900:  #292A2D;
    --color-gray-700:  #3F4042;
    --color-gray-650:  #2a2a2a;

    --color-neutral-50:  #fafafa;
    --color-neutral-100: #f5f5f5;
    --color-neutral-200: #e5e5e5;
    --color-neutral-300: #d4d4d4;
    --color-neutral-400: #a3a3a3;
    --color-neutral-500: #737373;

    --color-bg:           #ffffff;
    --color-bg-subtle:    #f0f4fe;
    --color-border:       #d6e0fb;
    --color-border-hover: #adc1f7;
    --color-text:         #0a1535;
    --color-text-muted:   #3d5299;
    --color-text-faint:   #7a9ef5;

    --color-accent:        #305cde;
    --color-accent-light:  #7a9ef5;
    --color-accent-dark:   #2449b8;
    --color-content:       #eaeeff;

    --color-success:      #10b981;
    --color-success-bg:   #d1fae5;
    --color-warning:      #f59e0b;
    --color-warning-bg:   #fef3c7;
    --color-error:        #ef4444;
    --color-error-bg:     #fee2e2;

    --gradient-brand:          linear-gradient(135deg, #7a9ef5 0%, #305cde 100%);
    --gradient-brand-deep:     linear-gradient(135deg, #305cde 0%, #1a2f6e 100%);
    --gradient-tint:           linear-gradient(90deg,  #eef2fd 0%, #d6e0fb 50%, #adc1f7 100%);
    --gradient-fade:           linear-gradient(180deg, #eef2fd 0%, #ffffff 100%);

    --overlay-hover:        rgba(0, 0, 0, 0.05);
    --overlay-hover-subtle: rgba(0, 0, 0, 0.03);

    /* ── Typography ── */
    --font-sans: var(--font-lexend), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-hand: var(--font-caveat), cursive;

    --text-xs:   0.75rem;
    --text-sm:   0.875rem;
    --text-base: 1rem;
    --text-lg:   1.125rem;
    --text-xl:   1.25rem;
    --text-2xl:  1.5rem;
    --text-3xl:  2rem;
    --text-4xl:  2.5rem;
    --text-5xl:  3.5rem;

    /* ── Spacing (4px base) ── */
    --space-1:  0.25rem;
    --space-2:  0.5rem;
    --space-3:  0.75rem;
    --space-4:  1rem;
    --space-5:  1.25rem;
    --space-6:  1.5rem;
    --space-7:  1.75rem;
    --space-8:  2rem;
    --space-10: 2.5rem;
    --space-12: 3rem;
    --space-14: 3.5rem;
    --space-16: 4rem;
    --space-20: 5rem;
    --space-24: 6rem;

    --radius-sm:   4px;
    --radius-md:   8px;
    --radius-lg:   12px;
    --radius-xl:   16px;
    --radius-2xl:  24px;
    --radius-full: 9999px;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.10);
    --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12);

    --transition-fast: 120ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 300ms ease;

    --container-max:     1120px;
    --section-padding-y: var(--space-24);
    --navbar-height:     64px;
  }

  /* ── Reset ── */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: var(--font-sans);
    color: var(--color-text);
    background-color: var(--color-bg);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  img, video, svg {
    max-width: 100%;
    height: auto;
    display: block;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  ul, ol {
    list-style: none;
  }

  /* ── Layout Utilities ── */
  .container {
    width: 100%;
    max-width: var(--container-max);
    margin-inline: auto;
    padding-inline: var(--space-6);
  }

  @media (min-width: 768px) {
    .container { padding-inline: var(--space-8); }
  }

  .section-label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-hand);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--color-primary-500);
    margin-bottom: var(--space-4);
  }

  .section-title {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-gray-900);
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  @media (min-width: 768px) {
    .section-title { font-size: var(--text-4xl); }
  }

  .section-subtitle {
    font-size: var(--text-lg);
    color: var(--color-gray-700);
    line-height: 1.6;
    max-width: 560px;
  }

  /* ── Animations ── */
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;
