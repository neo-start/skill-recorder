'use client';

import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { Container, Section } from './Container';

const Wrap = styled(Section)`
  background: ${({ theme }) => theme.colors.bgElevated};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Heading = styled.h2`
  font-size: 28px;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
`;

const Lede = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 620px;
  font-size: 15px;
  margin: 0 0 32px;
`;

const Pre = styled.pre`
  font-family: ${({ theme }) => theme.font.mono};
  font-size: 12.5px;
  line-height: 1.55;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 22px;
  overflow-x: auto;
  color: ${({ theme }) => theme.colors.textMuted};

  b {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }

  span.accent {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const DIAGRAM = `┌──────────────────────┐                ┌───────────────────────────┐
│  Side Panel (React)  │ ── runtime ──▶ │  Background SW            │
│  recordings + save   │ ◀── msgs ───── │  capture state machine    │
└──────────────────────┘                └─────────────┬─────────────┘
                                                      │ port
                                                      ▼
                                          ┌───────────────────────────┐
                                          │  Content Script           │
                                          │  rrweb + action recorder  │
                                          └─────────────┬─────────────┘
                                                        │
                                ┌───────────────────────┴───────────────────────┐
                                ▼                                               ▼
                       ┌───────────────────┐                          ┌─────────────────────┐
                       │    IndexedDB      │                          │   Player tab         │
                       │  recordings       │                          │   (rrweb-player)     │
                       │  chunks           │                          └─────────────────────┘
                       │  actions          │
                       │  skills           │
                       └─────────┬─────────┘
                                 │ distill
                                 ▼
                       ┌────────────────────┐
                       │   SKILL.md  ✨     │   ── exported via chrome.downloads
                       │  (Claude Code)     │       → ~/Downloads/skill-recorder-skills/
                       └────────────────────┘
`;

export function ArchitectureDiagram() {
  const t = useTranslations('architecture');
  return (
    <Wrap>
      <Container>
        <Heading>{t('heading')}</Heading>
        <Lede>{t('lede')}</Lede>
        <Pre>{DIAGRAM}</Pre>
      </Container>
    </Wrap>
  );
}
