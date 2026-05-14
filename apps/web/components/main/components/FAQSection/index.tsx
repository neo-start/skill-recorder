'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styled, { css } from 'styled-components';

const Section = styled.section`
  background-color: var(--color-bg);
  padding-block: var(--section-padding-y);
`;

const Inner = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);
  max-width: 800px;
  margin-inline: auto;

  @media (min-width: 900px) {
    grid-template-columns: 2fr 3fr;
    gap: var(--space-16);
    max-width: unset;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
`;

const Title = styled.h2`
  max-width: 300px;
`;

const EmailLink = styled.a`
  color: var(--color-primary-500);
  text-decoration: underline;
  text-decoration-color: var(--color-primary-100);
  text-underline-offset: 3px;
  transition: text-decoration-color var(--transition-fast);

  &:hover {
    text-decoration-color: var(--color-primary-500);
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Item = styled.div<{ $open: boolean }>`
  border-bottom: 1px solid var(--color-border);

  &:first-child {
    border-top: 1px solid var(--color-border);
  }

  ${({ $open }) =>
    $open &&
    css`
      & svg {
        transform: rotate(180deg);
        color: var(--color-primary-500);
      }
    `}
`;

const Trigger = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) 0;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-gray-900);
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--color-primary-600);
  }
`;

const Chevron = styled.span`
  color: var(--color-text-muted);
  flex-shrink: 0;
  display: inline-flex;

  & svg {
    transition: transform var(--transition-base), color var(--transition-fast);
  }
`;

const Answer = styled.div`
  font-size: var(--text-base);
  color: var(--color-gray-700);
  line-height: 1.7;
  padding-bottom: var(--space-5);
`;

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Item $open={open}>
      <Trigger onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{question}</span>
        <Chevron aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Chevron>
      </Trigger>
      {open && <Answer>{answer}</Answer>}
    </Item>
  );
}

export default function FAQSection() {
  const t = useTranslations('main.faq');
  const rawItems = t.raw('items');
  const items = (
    Array.isArray(rawItems)
      ? (rawItems as { question: string; answer: string }[])
      : []
  ).filter(item => item.question);

  return (
    <Section id="faq">
      <div className="container">
        <Inner>
          <Header>
            <Title className="section-title">{t('title')}</Title>
            <p className="section-subtitle">
              {t('contact')}{' '}
              <EmailLink href="mailto:support@skill-recorder.dev">
                support@skill-recorder.dev
              </EmailLink>
            </p>
          </Header>

          <List>
            {items.map(faq => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </List>
        </Inner>
      </div>
    </Section>
  );
}
