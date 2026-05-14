'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TocSidebarProps {
  headings: TocHeading[];
}

const Sidebar = styled.nav`
  position: sticky;
  top: calc(var(--navbar-height) + var(--space-8));
  max-height: calc(100vh - var(--navbar-height) - var(--space-16));
  overflow-y: auto;
  padding: var(--space-5);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);

  @media (max-width: 900px) {
    display: none;
  }
`;

const Title = styled.p`
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-gray-700);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: var(--space-3);
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

const Item = styled.li<{ $level: 2 | 3 }>`
  ${({ $level }) => $level === 3 && css`padding-left: var(--space-3);`}
`;

const TocLink = styled.a<{ $active: boolean }>`
  display: block;
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  text-decoration: none;
  line-height: 1.5;
  padding: var(--space-1) 0 var(--space-1) var(--space-3);
  border-left: 2px solid transparent;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);

  &:hover { color: var(--color-gray-900); }

  ${({ $active }) =>
    $active &&
    css`
      color: var(--color-accent);
      border-left-color: var(--color-accent);
    `}
`;

export default function TocSidebar({ headings }: TocSidebarProps) {
  const [activeId, setActiveId] = useState('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActiveId(entry.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <Sidebar aria-label="Table of contents">
      <Title>Contents</Title>
      <List>
        {headings.map(({ id, text, level }) => (
          <Item key={id} $level={level}>
            <TocLink
              href={`#${id}`}
              $active={activeId === id}
              onClick={e => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {text}
            </TocLink>
          </Item>
        ))}
      </List>
    </Sidebar>
  );
}
