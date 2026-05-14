import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Markdown from 'react-markdown';
import gfm from 'remark-gfm';
import raw from 'rehype-raw';
import styled from 'styled-components';
import type { IBlogPageConfig, IBlogItem } from '@/types/blog';
import TocSidebar, { TocHeading } from './TocSidebar';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractHeadings(markdown: string): TocHeading[] {
  return markdown
    .split('\n')
    .filter(line => /^#{2,3}\s/.test(line))
    .map(line => {
      const level = line.startsWith('### ') ? 3 : 2;
      const text = line.replace(/^#{2,3}\s+/, '').trim();
      return { id: slugify(text), text, level: level as 2 | 3 };
    });
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

const Container = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg);
  padding-top: var(--navbar-height);
`;

const Inner = styled.div`
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-8) var(--space-16);
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
`;

const BreadLink = styled(Link)`
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
  &:hover { color: var(--color-accent); }
`;

const BreadSep = styled.span`
  color: var(--color-border);
  font-size: var(--text-xs);
`;

const BreadCurrent = styled.span`
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const ArticleHeader = styled.header`
  padding: var(--space-6) 0 var(--space-8);
  margin-bottom: var(--space-8);
`;

const ArticleTitle = styled.h1`
  font-size: var(--text-5xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  margin-bottom: var(--space-6);
  letter-spacing: -0.02em;

  @media (max-width: 768px) { font-size: var(--text-3xl); }
  @media (max-width: 480px) { font-size: var(--text-2xl); }
`;

const ArticleDescription = styled.p`
  font-size: var(--text-xl);
  color: var(--color-neutral-500);
  line-height: 1.6;
  margin-bottom: var(--space-8);
  max-width: 640px;

  @media (max-width: 768px) {
    font-size: var(--text-lg);
    margin-bottom: var(--space-6);
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: var(--space-1);
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: var(--space-12);
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Body = styled.article`
  min-width: 0;
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--color-text);
  word-break: break-word;

  h1, h2, h3, h4 {
    color: var(--color-text);
    font-weight: 700;
    line-height: 1.3;
    margin-top: var(--space-8);
    margin-bottom: var(--space-3);
  }
  h1 { font-size: var(--text-3xl); }
  h2 { font-size: var(--text-2xl); }
  h3 { font-size: var(--text-xl); }
  h4 { font-size: var(--text-lg); }

  p { margin-bottom: var(--space-5); }

  a {
    color: var(--color-accent);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color var(--transition-fast);
  }
  a:hover { color: var(--color-accent-dark); }

  ul, ol { padding-left: var(--space-6); margin-bottom: var(--space-5); }
  li { margin-bottom: var(--space-1); }

  blockquote {
    border-left: 4px solid var(--color-neutral-300);
    padding: var(--space-2) var(--space-4);
    margin: var(--space-6) 0;
    color: var(--color-text-muted);
    font-style: italic;
    background: var(--color-neutral-50);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  code {
    background: var(--color-bg-subtle);
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
    font-size: 0.875em;
    color: var(--color-accent);
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }

  pre {
    background: var(--color-primary-800);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    overflow-x: auto;
    margin-bottom: var(--space-6);
  }

  pre code {
    background: transparent;
    color: var(--color-primary-100);
    font-size: var(--text-sm);
    padding: 0;
  }
`;

interface BlogDetailAppProps {
  content: IBlogPageConfig;
  locale: string;
  relatedPosts: IBlogItem[];
}

export default async function BlogDetailApp({ content, locale }: BlogDetailAppProps) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  const { title, description, markdown, author, readingTime, publishedTime } = content;
  const headings = extractHeadings(markdown ?? '');

  return (
    <Container>
      <Inner>
        <Breadcrumb aria-label="Breadcrumb">
          <BreadLink href="/">{t('breadcrumbs.home')}</BreadLink>
          <BreadSep aria-hidden="true">/</BreadSep>
          <BreadLink href="/blog">{t('breadcrumbs.blog')}</BreadLink>
          <BreadSep aria-hidden="true">/</BreadSep>
          <BreadCurrent>{title}</BreadCurrent>
        </Breadcrumb>

        <ArticleHeader>
          <ArticleTitle>{title}</ArticleTitle>
          {description && <ArticleDescription>{description}</ArticleDescription>}
          <Meta>
            {author && (
              <MetaItem><UserIcon />{author}</MetaItem>
            )}
            {readingTime > 0 && (
              <MetaItem><ClockIcon />{readingTime} {t('minRead')}</MetaItem>
            )}
            {publishedTime && (
              <MetaItem><CalendarIcon />{formatDate(publishedTime)}</MetaItem>
            )}
          </Meta>
        </ArticleHeader>

        <Layout>
          <div style={{ minWidth: 0 }}>
            {markdown && (
              <Body>
                <Markdown
                  remarkPlugins={[gfm]}
                  rehypePlugins={[raw as any]}
                  components={{
                    h2({ children }: any) {
                      const id = slugify(String(children));
                      return <h2 id={id}>{children}</h2>;
                    },
                    h3({ children }: any) {
                      const id = slugify(String(children));
                      return <h3 id={id}>{children}</h3>;
                    },
                  }}
                >
                  {markdown}
                </Markdown>
              </Body>
            )}
          </div>

          <TocSidebar headings={headings} />
        </Layout>
      </Inner>
    </Container>
  );
}
