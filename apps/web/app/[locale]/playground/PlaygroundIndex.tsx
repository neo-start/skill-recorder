'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { CATEGORY_LABELS, SCENARIOS, type Scenario, type ScenarioCategory } from './scenarios';

/* ── Hero ────────────────────────────────────────────────────────── */
const Hero = styled.section`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-block: var(--space-16) var(--space-10);
  padding-inline: var(--space-8);
  text-align: center;

  @media (max-width: 767px) {
    padding-block: var(--space-12) var(--space-8);
    padding-inline: var(--space-6);
  }
`;

const Eyebrow = styled.div`
  font-family: var(--font-hand);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-primary-500);
  letter-spacing: 0.03em;
  margin-bottom: var(--space-2);
`;

const H1 = styled.h1`
  font-size: var(--text-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0 0 var(--space-4);
  color: var(--color-gray-900);

  @media (min-width: 768px) {
    font-size: var(--text-4xl);
  }
`;

const Lead = styled.p`
  font-size: var(--text-lg);
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
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
  text-align: left;
`;

const HowToTitle = styled.h2`
  margin: 0 0 var(--space-3);
  font-size: var(--text-lg);
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
  font-size: var(--text-sm);

  li code {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 1px 6px;
    font-size: 0.9em;
  }
`;

/* ── Body / category sections ───────────────────────────────────── */
const Body = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--space-8);
  padding-bottom: var(--space-20);

  @media (max-width: 767px) {
    padding-inline: var(--space-6);
    padding-bottom: var(--space-16);
  }
`;

const CategoryBlock = styled.section`
  margin-top: var(--space-12);
`;

const CategoryHeader = styled.header`
  margin-bottom: var(--space-5);
`;

const CategoryTitle = styled.h2`
  font-size: var(--text-2xl);
  font-weight: 700;
  margin: 0 0 var(--space-2);
  color: var(--color-gray-900);
  letter-spacing: -0.01em;
`;

const CategoryBlurb = styled.p`
  margin: 0;
  color: var(--color-gray-700);
  font-size: var(--text-sm);
  line-height: 1.55;
`;

/* ── Card grid (variant-aware) ──────────────────────────────────── */
const Grid = styled.div<{ $variant: 'composite' | 'simple' }>`
  display: grid;
  gap: var(--space-4);

  ${({ $variant }) =>
    $variant === 'composite'
      ? css`
          grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
          gap: var(--space-5);
        `
      : css`
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        `}
`;

const SimpleCard = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  color: var(--color-text);
  text-decoration: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);

  &:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-sm);
  }
`;

const SimpleCardTitle = styled.div`
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
`;

const SimpleCardTag = styled.div`
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  line-height: 1.55;
`;

const CompositeCard = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary-300);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
  color: var(--color-text);
  text-decoration: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);

  &:hover {
    border-color: var(--color-border-hover);
    border-left-color: var(--color-primary-500);
    box-shadow: var(--shadow-md);
  }
`;

const CompositeCardTitle = styled.div`
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.25;
  letter-spacing: -0.01em;
`;

const CompositeCardTag = styled.div`
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  line-height: 1.55;
`;

const CoverageCount = styled.div`
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-primary-500);
  margin-top: var(--space-2);
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background: rgba(48, 92, 222, 0.08);
  border: 1px solid rgba(48, 92, 222, 0.18);
  color: var(--color-primary-500);
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`;

const MoreText = styled.span`
  font-size: var(--text-xs);
  color: var(--color-gray-700);
  font-weight: 500;
`;

const CHIP_PREVIEW_COUNT = 6;

function CompositeCardBody({ scenario }: { scenario: Scenario }) {
  const cov = scenario.coverage ?? [];
  const preview = cov.slice(0, CHIP_PREVIEW_COUNT);
  const remainder = cov.length - preview.length;
  return (
    <CompositeCard href={`/playground/s/${scenario.slug}`}>
      <CompositeCardTitle>{scenario.title}</CompositeCardTitle>
      <CompositeCardTag>{scenario.tagline}</CompositeCardTag>
      {cov.length > 0 ? (
        <>
          <CoverageCount>
            Covers {cov.length} difficulty point{cov.length === 1 ? '' : 's'}
          </CoverageCount>
          <ChipRow>
            {preview.map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
            {remainder > 0 ? <MoreText>+{remainder} more</MoreText> : null}
          </ChipRow>
        </>
      ) : null}
    </CompositeCard>
  );
}

export default function PlaygroundIndex() {
  const byCat = new Map<ScenarioCategory, Scenario[]>();
  for (const s of SCENARIOS) {
    if (!byCat.has(s.category)) byCat.set(s.category, []);
    byCat.get(s.category)!.push(s);
  }

  return (
    <>
      <Hero>
        <Eyebrow>→ The playground</Eyebrow>
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
              Open any scenario below, click the extension icon, then press{' '}
              <code>Start recording</code>.
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
        {(['F', 'A', 'B', 'C', 'D'] as ScenarioCategory[]).map((cat) => {
          const list = byCat.get(cat);
          if (!list?.length) return null;
          const isComposite = cat === 'F';
          return (
            <CategoryBlock key={cat}>
              <CategoryHeader>
                <CategoryTitle>{CATEGORY_LABELS[cat].title}</CategoryTitle>
                <CategoryBlurb>{CATEGORY_LABELS[cat].blurb}</CategoryBlurb>
              </CategoryHeader>
              <Grid $variant={isComposite ? 'composite' : 'simple'}>
                {list.map((s) =>
                  isComposite ? (
                    <CompositeCardBody key={s.slug} scenario={s} />
                  ) : (
                    <SimpleCard key={s.slug} href={`/playground/s/${s.slug}`}>
                      <SimpleCardTitle>{s.title}</SimpleCardTitle>
                      <SimpleCardTag>{s.tagline}</SimpleCardTag>
                    </SimpleCard>
                  ),
                )}
              </Grid>
            </CategoryBlock>
          );
        })}
      </Body>
    </>
  );
}
