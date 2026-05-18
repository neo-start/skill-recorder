'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { CATEGORY_LABELS, SCENARIOS, type ScenarioCategory } from './scenarios';

const Hero = styled.section`
  padding: var(--space-16) var(--space-8) var(--space-10);
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;

  @media (max-width: 767px) {
    padding: var(--space-12) var(--space-6) var(--space-8);
  }
`;

const Eyebrow = styled.div`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-primary-500);
  margin-bottom: var(--space-3);
`;

const H1 = styled.h1`
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-4);
  color: var(--color-text);
`;

const Lead = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: var(--color-gray-700);
  margin: 0 auto;
  max-width: 740px;
`;

const HowTo = styled.div`
  max-width: 880px;
  margin: var(--space-10) auto 0;
  padding: var(--space-6) var(--space-7);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-bg-subtle);
  text-align: left;
`;

const HowToTitle = styled.h2`
  margin: 0 0 var(--space-3);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
`;

const Steps = styled.ol`
  margin: 0;
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--color-gray-700);
  line-height: 1.55;

  li code {
    background: white;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 0.9em;
  }
`;

const Body = styled.div`
  padding: 0 var(--space-8) var(--space-20);
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 767px) {
    padding: 0 var(--space-6) var(--space-16);
  }
`;

const CategoryBlock = styled.section`
  margin-top: var(--space-12);
`;

const CategoryHeader = styled.header`
  margin-bottom: var(--space-5);
`;

const CategoryTitle = styled.h2`
  font-size: 24px;
  margin: 0 0 var(--space-2);
  color: var(--color-text);
`;

const CategoryBlurb = styled.p`
  margin: 0;
  color: var(--color-gray-700);
  font-size: 15px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg);
  color: var(--color-text);
  text-decoration: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

  &:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-sm);
  }
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
`;

const CardTag = styled.div`
  font-size: 13px;
  color: var(--color-gray-700);
  line-height: 1.5;
`;

export default function PlaygroundIndex() {
  const byCat = new Map<ScenarioCategory, typeof SCENARIOS>();
  for (const s of SCENARIOS) {
    if (!byCat.has(s.category)) byCat.set(s.category, [] as unknown as typeof SCENARIOS);
    byCat.get(s.category)!.push(s);
  }

  return (
    <>
      <Hero>
        <Eyebrow>Playground</Eyebrow>
        <H1>Stress-test scenarios for the recorder</H1>
        <Lead>
          A curated set of pages that break naïve recorders — dynamic class hashes, identical
          siblings, locale switches, iframe and shadow-DOM boundaries, lazy modals, drag-and-drop,
          file pickers, modifier keys, ARIA comboboxes, multi-tab flows. Install the extension and
          try each one to see what Skill Recorder captures.
        </Lead>

        <HowTo>
          <HowToTitle>How to use this page</HowToTitle>
          <Steps>
            <li>Install the Skill Recorder Chrome extension and pin it to your toolbar.</li>
            <li>
              Open any scenario below, click the extension icon, then press <code>Start recording</code>.
            </li>
            <li>Follow the "Try this" steps on the scenario page.</li>
            <li>
              Open the side panel, hit <code>Stop</code>, then <code>Save as Skill</code> to inspect
              the captured <code>ActionStep[]</code> and the distilled SKILL.md.
            </li>
          </Steps>
        </HowTo>
      </Hero>

      <Body>
        {(['A', 'B', 'C', 'D'] as ScenarioCategory[]).map((cat) => {
          const list = byCat.get(cat);
          if (!list?.length) return null;
          return (
            <CategoryBlock key={cat}>
              <CategoryHeader>
                <CategoryTitle>{CATEGORY_LABELS[cat].title}</CategoryTitle>
                <CategoryBlurb>{CATEGORY_LABELS[cat].blurb}</CategoryBlurb>
              </CategoryHeader>
              <Grid>
                {list.map((s) => (
                  <Card key={s.slug} href={`/playground/s/${s.slug}`}>
                    <CardTitle>{s.title}</CardTitle>
                    <CardTag>{s.tagline}</CardTag>
                  </Card>
                ))}
              </Grid>
            </CategoryBlock>
          );
        })}
      </Body>
    </>
  );
}
