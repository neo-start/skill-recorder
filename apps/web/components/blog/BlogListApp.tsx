'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import type { IBlogList } from '@/types/blog';

const PAGE_SIZE = 9;

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
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
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
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

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-4) var(--space-8) 0;
`;

const BreadcrumbList = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  width: 100%;
  flex-wrap: wrap;
`;

const BreadcrumbLink = styled(Link)`
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
  &:hover { color: var(--color-accent); }
`;

const BreadcrumbSep = styled.span`
  color: var(--color-border);
  font-size: var(--text-xs);
`;

const BreadcrumbCurrent = styled.span`
  color: var(--color-text);
`;

const Header = styled.div`
  text-align: center;
  margin: var(--space-12) var(--space-8) var(--space-16);

  @media (max-width: 768px) {
    margin: var(--space-8) 0 var(--space-12);
  }
`;

const HeaderTitle = styled.h1`
  font-size: var(--text-4xl);
  font-weight: 700;
  margin-bottom: var(--space-4);
  color: var(--color-text);

  @media (max-width: 768px) { font-size: var(--text-3xl); }
  @media (max-width: 480px) { font-size: var(--text-2xl); }
`;

const HeaderDesc = styled.p`
  font-size: var(--text-lg);
  color: var(--color-neutral-500);
  line-height: 1.6;
  max-width: 680px;
  margin: 0 auto;

  @media (max-width: 768px) { font-size: var(--text-base); }
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 44vh;
  padding: var(--space-14) var(--space-6);
  margin-bottom: var(--space-8);
  background: var(--gradient-tint);
  border-radius: var(--radius-2xl);

  @media (max-width: 768px) {
    min-height: 36vh;
    padding: var(--space-10) var(--space-4);
  }
`;

const HeroTitle = styled.h2`
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  margin: 0 0 var(--space-4);

  @media (max-width: 768px) { font-size: var(--text-3xl); }
`;

const HeroDescription = styled.p`
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.7;
  max-width: 680px;
  margin: 0;

  @media (max-width: 768px) { font-size: var(--text-base); }
`;

const HeroStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-12);
  margin-top: var(--space-6);

  @media (max-width: 768px) { gap: var(--space-6); }
`;

const HeroStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeroStatValue = styled.span`
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-accent);

  @media (max-width: 768px) { font-size: var(--text-2xl); }
`;

const HeroStatLabel = styled.span`
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
`;

const SectionTitle = styled.h2`
  font-size: var(--text-2xl);
  font-weight: 700;
  text-align: center;
  color: var(--color-text);
  margin-bottom: var(--space-8);
  width: 100%;
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-10) var(--space-12);
  margin-bottom: var(--space-16);
  width: 100%;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: var(--space-6);
    margin-bottom: var(--space-8);
  }
`;

const BlogCard = styled(Link)`
  display: block;
  background: var(--color-bg);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base);
  color: inherit;
  overflow: hidden;

  &:hover {
    border-color: var(--color-neutral-300);
    box-shadow: var(--shadow-md);
  }
`;

const BlogCardImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #d6e0fb 0%, #adc1f7 60%, #305cde 120%);

  @media (max-width: 640px) { height: 160px; }
`;

const BlogCardContent = styled.div`
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const BlogCardMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-primary-700);
  font-size: var(--text-xs);
`;

const BlogCardTitle = styled.h3`
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-gray-900);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BlogCardDescription = styled.p`
  font-size: var(--text-sm);
  line-height: 1.65;
  color: var(--color-neutral-500);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BlogCardDate = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-neutral-100);
  margin-top: var(--space-1);

  & > svg {
    color: var(--color-accent);
  }
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: var(--space-16);
`;

const LoadMoreButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-8);
  height: 44px;
  background: transparent;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-300);
  color: var(--color-gray-700);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color var(--transition-base),
    background var(--transition-base);

  &:hover {
    border-color: var(--color-neutral-400);
    background: var(--color-neutral-50);
  }
`;

const DeferredSpacer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: var(--space-6) 0 var(--space-12);
  min-height: 100vh;
`;

interface BlogListAppProps {
  content: IBlogList;
}

export default function BlogListApp({ content }: BlogListAppProps) {
  const t = useTranslations('blog');
  const { title, description, blogs } = content;
  const [isAfterFirstScreen, setIsAfterFirstScreen] = useState(false);
  const [visibleBlogCount, setVisibleBlogCount] = useState(PAGE_SIZE);

  const visibleBlogs = useMemo(() => blogs.slice(0, visibleBlogCount), [blogs, visibleBlogCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const callback = () => setIsAfterFirstScreen(true);
    const win = window as any;

    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(callback, { timeout: 2000 });
      return () => win.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(callback, 1200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <Container>
      <ContentWrapper>
        <BreadcrumbList aria-label="Breadcrumb">
          <BreadcrumbLink href="/">{t('breadcrumbs.home')}</BreadcrumbLink>
          <BreadcrumbSep aria-hidden="true">/</BreadcrumbSep>
          <BreadcrumbCurrent>{t('breadcrumbs.blog')}</BreadcrumbCurrent>
        </BreadcrumbList>

        <Header>
          <HeaderTitle>{title}</HeaderTitle>
          <HeaderDesc>{description}</HeaderDesc>
        </Header>

        <HeroSection aria-label="Blog overview">
          <HeroTitle>{t('hero.title')}</HeroTitle>
          <HeroDescription>{t('hero.description')}</HeroDescription>
          <HeroStats>
            <HeroStat>
              <HeroStatValue>{`${blogs.length}+`}</HeroStatValue>
              <HeroStatLabel>{t('hero.articles')}</HeroStatLabel>
            </HeroStat>
            <HeroStat>
              <HeroStatValue>{t('hero.free')}</HeroStatValue>
              <HeroStatLabel>{t('hero.toRead')}</HeroStatLabel>
            </HeroStat>
          </HeroStats>
        </HeroSection>

        {isAfterFirstScreen ? (
          <>
            <SectionTitle>{t('recentArticles')}</SectionTitle>

            <BlogGrid>
              {visibleBlogs.map(blog => (
                <BlogCard key={blog.id} href={`/blog/${blog.id}`}>
                  <BlogCardImage />
                  <BlogCardContent>
                    <BlogCardMeta>
                      <Tag>
                        <ClockIcon />
                        {blog.readingTime} {t('minRead')}
                      </Tag>
                      <Tag>
                        <UserIcon />
                        {blog.author || 'Skill Recorder'}
                      </Tag>
                    </BlogCardMeta>
                    <BlogCardTitle>{blog.title}</BlogCardTitle>
                    <BlogCardDescription>{blog.description}</BlogCardDescription>
                    {blog.publishedTime && (
                      <BlogCardDate>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CalendarIcon />
                          {formatDate(blog.publishedTime)}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </BlogCardDate>
                    )}
                  </BlogCardContent>
                </BlogCard>
              ))}
            </BlogGrid>

            {visibleBlogCount < blogs.length && (
              <LoadMoreContainer>
                <LoadMoreButton
                  onClick={() => setVisibleBlogCount(prev => Math.min(prev + PAGE_SIZE, blogs.length))}
                >
                  {t('loadMore')}
                </LoadMoreButton>
              </LoadMoreContainer>
            )}
          </>
        ) : (
          <DeferredSpacer />
        )}
      </ContentWrapper>
    </Container>
  );
}
