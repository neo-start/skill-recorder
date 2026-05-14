'use client';

import styled from 'styled-components';

export const PolicyMain = styled.main`
  min-height: 100vh;
  background: var(--color-bg);
  padding: var(--space-20) 0 var(--space-24);
`;

export const PolicyContent = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--space-6);

  h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.02em;
    margin: 0 0 var(--space-2);
    line-height: 1.2;
  }

  h2 {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-text);
    margin: var(--space-10) 0 var(--space-3);
    line-height: 1.3;
  }

  p, li {
    font-size: var(--text-base);
    color: var(--color-text-muted);
    line-height: 1.75;
    margin: 0 0 var(--space-4);
  }

  ul {
    padding-left: var(--space-6);
    margin: 0 0 var(--space-4);
  }

  li {
    margin-bottom: var(--space-2);
  }

  strong {
    color: var(--color-text);
    font-weight: 600;
  }

  a {
    color: var(--color-primary-600);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

export const PolicyMeta = styled.p`
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  margin: 0 0 var(--space-10);
`;
