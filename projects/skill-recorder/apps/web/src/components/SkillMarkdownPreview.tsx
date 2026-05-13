'use client';

import { useMemo } from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { renderSkillAsMarkdown } from '@skill-recorder/render';
import type { Skill } from '@skill-recorder/types';
import { Container, Section } from './Container';

const FIXTURE: Skill = {
  id: 'demo',
  title: 'Amazon.sg — search and add to cart',
  description: 'Search a keyword on Amazon.sg and add the first result to cart.',
  domain: 'www.amazon.sg',
  startUrl: 'https://www.amazon.sg/',
  parameters: [
    {
      name: 'search_term',
      type: 'string',
      description: 'Keyword to search for on Amazon.sg',
      example: 'iphone',
    },
  ],
  steps: [
    {
      id: 's1',
      intent: 'Navigate to https://www.amazon.sg/',
      action: 'navigate',
      url: 'https://www.amazon.sg/',
      expectation: { description: '"Search Amazon.sg" becomes interactable' },
    },
    {
      id: 's2',
      intent: 'Fill "Search Amazon.sg"',
      action: 'fill',
      selectors: [
        { kind: 'id', value: '#twotabsearchtextbox', score: 80 },
        { kind: 'aria', value: 'searchbox:Search Amazon.sg', score: 70 },
      ],
      fingerprint: {
        tag: 'input',
        role: 'searchbox',
        text: '',
        attrs: { 'aria-label': 'Search Amazon.sg', type: 'text' },
      },
      valueTemplate: '${search_term}',
      expectation: { description: 'URL becomes www.amazon.sg/s' },
    },
    {
      id: 's3',
      intent: 'Click the first product result',
      action: 'click',
      selectors: [
        { kind: 'css', value: 'div.s-card-container a.a-link-normal.s-no-outline', score: 45 },
      ],
      fingerprint: {
        tag: 'a',
        role: 'link',
        text: 'First product in results',
        attrs: {},
      },
      expectation: { description: 'A product detail page loads' },
    },
    {
      id: 's4',
      intent: 'Click Add to cart',
      action: 'click',
      selectors: [
        { kind: 'id', value: '#add-to-cart-button', score: 80 },
        { kind: 'aria', value: 'button:Add to cart', score: 70 },
      ],
      fingerprint: {
        tag: 'input',
        role: 'button',
        text: 'Add to cart',
        attrs: { 'aria-label': 'Add to cart' },
      },
    },
  ],
  sourceRecordingId: 'demo',
  createdAt: 0,
  updatedAt: 0,
};

const Heading = styled.h2`
  font-size: 32px;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
`;

const Lede = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 620px;
  font-size: 15px;
  margin: 0 0 32px;
`;

const Frame = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`;

const FrameHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};

  span.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const Pre = styled.pre`
  margin: 0;
  padding: 22px;
  overflow-x: auto;
  max-height: 520px;
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 12.5px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
`;

export function SkillMarkdownPreview() {
  const t = useTranslations('preview');
  const md = useMemo(() => renderSkillAsMarkdown(FIXTURE), []);

  return (
    <Section>
      <Container>
        <Heading>{t('heading')}</Heading>
        <Lede>{t('lede')}</Lede>
        <Frame>
          <FrameHead>
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span style={{ marginLeft: 8 }}>
              ~/.claude/skills/amazon-sg-search-and-add-to-cart/SKILL.md
            </span>
          </FrameHead>
          <Pre>{md}</Pre>
        </Frame>
      </Container>
    </Section>
  );
}
