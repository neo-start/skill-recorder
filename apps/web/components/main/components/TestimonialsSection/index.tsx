'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styled, { css } from 'styled-components';

type TestimonialItem = { quote: string; name: string; role: string };

function useCardsPerPage() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= 480) setCount(1);
      else if (window.innerWidth <= 768) setCount(2);
      else setCount(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {dir === 'left' ? (
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

const AVATAR_COLORS = [
  '#305cde',
  '#7c3aed',
  '#0891b2',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
];

const Section = styled.section`
  background-color: var(--color-bg);
  padding-block: var(--section-padding-y);
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  margin-bottom: var(--space-12);
`;

const CarouselWrap = styled.div`
  overflow: hidden;
  --carousel-gap: var(--space-5);

  @media (max-width: 480px) {
    --carousel-gap: 0px;
  }
`;

const Track = styled.div<{ $page: number }>`
  display: flex;
  gap: var(--carousel-gap);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(calc(-${({ $page }) => $page} * (100% + var(--carousel-gap))));
`;

const Card = styled.figure<{ $ellipsis?: boolean }>`
  flex: 0 0 calc((100% - 2 * var(--carousel-gap)) / 3);
  padding: var(--space-8);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin: 0;

  @media (max-width: 768px) {
    flex: 0 0 calc((100% - var(--carousel-gap)) / 2);
  }
  @media (max-width: 480px) {
    flex: 0 0 100%;
  }

  ${({ $ellipsis }) =>
    $ellipsis &&
    css`
      align-items: center;
      justify-content: center;
      border-style: dashed;
      background: var(--color-bg-subtle);
    `}
`;

const QuoteMark = styled.span`
  font-size: 3rem;
  line-height: 0.6;
  color: var(--color-primary-200);
  display: block;
`;

const Quote = styled.blockquote`
  font-size: var(--text-base);
  color: var(--color-gray-900);
  line-height: 1.7;
  flex: 1;
`;

const Author = styled.figcaption`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
`;

const Avatar = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
`;

const Name = styled.p`
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-gray-900);
`;

const Role = styled.p`
  font-size: var(--text-xs);
  color: var(--color-gray-700);
`;

const Ellipsis = styled.span`
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--color-border-hover);
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
`;

const NavBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);

  &:hover:not(:disabled) {
    border-color: var(--color-primary-500);
    color: var(--color-primary-500);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  border: none;
  background: ${({ $active }) =>
    $active ? 'var(--color-primary-500)' : 'var(--color-border)'};
  cursor: pointer;
  padding: 0;
  transition:
    background var(--transition-fast),
    transform var(--transition-fast);
  transform: ${({ $active }) => ($active ? 'scale(1.3)' : 'none')};
`;

export default function TestimonialsSection() {
  const t = useTranslations('main.testimonials');
  const items = t.raw('items') as TestimonialItem[];
  const cardsPerPage = useCardsPerPage();

  const totalCards = items.length + 1; // +1 for ellipsis card
  const totalPages = Math.ceil(totalCards / cardsPerPage);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(p => Math.min(p, totalPages - 1));
  }, [totalPages]);

  return (
    <Section id="testimonials">
      <div className="container">
        <Header>
          <h2 className="section-title">{t('title')}</h2>
        </Header>

        <CarouselWrap>
          <Track $page={page}>
            {items.map((item, i) => {
              const initial = item.name.trim().charAt(0).toUpperCase();
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <Card key={i}>
                  <QuoteMark aria-hidden="true">"</QuoteMark>
                  <Quote>{item.quote}</Quote>
                  <Author>
                    <Avatar $color={color} aria-hidden="true">{initial}</Avatar>
                    <div>
                      <Name>{item.name}</Name>
                      <Role>{item.role}</Role>
                    </div>
                  </Author>
                </Card>
              );
            })}

            <Card $ellipsis aria-hidden="true">
              <Ellipsis>•••</Ellipsis>
            </Card>
          </Track>
        </CarouselWrap>

        <Controls>
          <NavBtn
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous"
          >
            <ChevronIcon dir="left" />
          </NavBtn>

          <Dots>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Dot
                key={i}
                $active={i === page}
                onClick={() => setPage(i)}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </Dots>

          <NavBtn
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            aria-label="Next"
          >
            <ChevronIcon dir="right" />
          </NavBtn>
        </Controls>
      </div>
    </Section>
  );
}
