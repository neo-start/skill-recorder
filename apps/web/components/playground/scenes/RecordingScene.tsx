'use client';

import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import { SCENE_NARRATIVES, type SceneKey } from '@/lib/playgroundData';

interface Props {
  sceneKey: SceneKey;
}

const Wrap = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: var(--space-16) var(--space-6);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: var(--space-12) var(--space-6);
  }
`;

const Pane = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const PaneLabel = styled.p`
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: var(--color-text-faint);
`;

const PaneTitle = styled.h2`
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0;
`;

const BrowserFrame = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: #ffffff;
`;

const BrowserChrome = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f5f6fb;
  border-bottom: 1px solid var(--color-border);
`;

const TrafficLight = styled.span<{ $color: string }>`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: inline-block;
`;

const UrlBar = styled.div`
  flex: 1;
  margin-left: 12px;
  padding: 5px 12px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  font-family: monospace;
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StepList = styled.ol`
  list-style: none;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const StepRow = styled.li`
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-gray-900);
`;

const StepNum = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
`;

const SkillBlock = styled.pre`
  margin: 0;
  padding: var(--space-5) var(--space-6);
  background: #0f1e4a;
  color: #eaeeff;
  border-radius: var(--radius-xl);
  font-family: monospace;
  font-size: 13px;
  line-height: 1.7;
  overflow-x: auto;
`;

const OutputCard = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-100);
  border-radius: var(--radius-lg);
  font-family: monospace;
  font-size: 13px;
  color: var(--color-primary-700);
`;

const Hint = styled.p`
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.6;
`;

const urlForScene: Record<SceneKey, string> = {
  ecommerce: 'https://supplier.example.com/orders/new',
  leads: 'https://directory.example.com/search?industry=saas',
  social: 'https://analytics.example.com/dashboard',
  realestate: 'https://listings.example.com/search',
  hospitality: 'https://hotels.example.com/search?city=tokyo',
};

export default function RecordingScene({ sceneKey }: Props) {
  const t = useTranslations('main.playground');
  const narrative = SCENE_NARRATIVES[sceneKey];

  return (
    <Wrap>
      <Pane>
        <PaneLabel>{t('sceneLabel')}</PaneLabel>
        <PaneTitle>{t(`scenes.${sceneKey}` as any)}</PaneTitle>
        <BrowserFrame>
          <BrowserChrome>
            <TrafficLight $color="#ff5f57" />
            <TrafficLight $color="#febc2e" />
            <TrafficLight $color="#28c840" />
            <UrlBar>{urlForScene[sceneKey]}</UrlBar>
          </BrowserChrome>
          <StepList>
            {narrative.steps.map((step, i) => (
              <StepRow key={i}>
                <StepNum>{i + 1}</StepNum>
                <span>{step}</span>
              </StepRow>
            ))}
          </StepList>
        </BrowserFrame>
        <Hint>Hit Record in the side panel and walk through the flow above once.</Hint>
      </Pane>

      <Pane>
        <PaneLabel>Output</PaneLabel>
        <PaneTitle>Generated SKILL.md</PaneTitle>
        <SkillBlock>{`# ${narrative.output.replace('.SKILL.md', '')}

## inputs
${narrative.steps
  .filter(s => /\\{|\\b\\w+\\b/.test(s))
  .map((_, i) => `- arg${i + 1}: string`)
  .slice(0, 2)
  .join('\\n') || '- (none)'}

## precondition
- signed in to the site

## steps
${narrative.steps.map((s, i) => `${i + 1}. ${s}`).join('\\n')}
`}</SkillBlock>
        <OutputCard>📄 {narrative.output}</OutputCard>
        <Hint>
          Drop this file into <code>~/.claude/skills/</code> and Claude Code will replay it via
          the <code>browse</code> CLI.
        </Hint>
      </Pane>
    </Wrap>
  );
}
