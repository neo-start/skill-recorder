'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { useLocale } from 'next-intl';
import { Container } from './Container';

const Wrap = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 48px;
  padding: 56px 0 96px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 32px 0 64px;
  }
`;

const Side = styled.aside`
  position: sticky;
  top: 80px;
  align-self: start;
  font-size: 13.5px;

  h4 {
    color: ${({ theme }) => theme.colors.text};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 12px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 28px;
    display: grid;
    gap: 4px;
  }

  a {
    display: block;
    padding: 6px 10px;
    border-radius: ${({ theme }) => theme.radii.sm};
    color: ${({ theme }) => theme.colors.textMuted};

    &:hover {
      color: ${({ theme }) => theme.colors.text};
      background: ${({ theme }) => theme.colors.surface};
    }
  }

  a[data-active='true'] {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surface};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    position: static;
    margin-bottom: 28px;
  }
`;

const Article = styled.article`
  font-size: 15.5px;
  line-height: 1.7;
  max-width: 760px;

  h1 {
    font-size: 36px;
    letter-spacing: -0.02em;
    margin: 0 0 8px;
  }
  h2 {
    font-size: 22px;
    margin-top: 40px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    padding-top: 28px;
  }
  h3 {
    font-size: 18px;
    margin-top: 28px;
  }
  p {
    color: ${({ theme }) => theme.colors.text};
  }
  ul,
  ol {
    color: ${({ theme }) => theme.colors.text};
    padding-left: 22px;
  }
  li {
    margin: 6px 0;
  }
  blockquote {
    border-left: 3px solid ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.text};
    padding: 12px 16px;
    margin: 18px 0;
    border-radius: ${({ theme }) => theme.radii.sm};
    font-style: italic;
  }
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  pre,
  pre[data-language] {
    margin: 18px 0;
  }
`;

const Crumb = styled.div`
  color: ${({ theme }) => theme.colors.textFaint};
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

export interface DocNavItem {
  slug: string;
  title: string;
}

interface Props {
  items: DocNavItem[];
  currentSlug: string;
  description?: string;
  html: string;
}

export function DocLayout({ items, currentSlug, description, html }: Props) {
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return (
    <Container>
      <Wrap>
        <Side>
          <h4>Docs</h4>
          <ul>
            {items.map((it) => (
              <li key={it.slug}>
                <Link
                  href={`${prefix}/docs/${it.slug}`}
                  data-active={it.slug === currentSlug ? 'true' : 'false'}
                >
                  {it.title}
                </Link>
              </li>
            ))}
          </ul>
        </Side>
        <Article>
          {description && <Crumb>{description}</Crumb>}
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </Article>
      </Wrap>
    </Container>
  );
}
