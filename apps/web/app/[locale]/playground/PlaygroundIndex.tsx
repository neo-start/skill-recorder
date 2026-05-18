'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled, { css } from 'styled-components';
import { SCENARIOS, type Scenario, type ScenarioCategory } from './scenarios';

/* ────────────────────────────────────────────────────────────────────
 * Playground index — editorial pass.
 * Hero: left-aligned, asymmetric, with a coverage matrix on the right.
 * Compact "how to" rendered as a single instructional sentence.
 * Composites get product-coloured monograms and the full chip strip.
 * Simple fixtures expose a one-line technique signature as evidence.
 * ──────────────────────────────────────────────────────────────────── */

/* ── Hero ────────────────────────────────────────────────────────── */

const HeroSection = styled.section`
  background:
    radial-gradient(circle at 1px 1px, rgba(15, 30, 74, 0.05) 1px, transparent 0) 0 0 / 28px 28px,
    linear-gradient(180deg, #fbfcff 0%, #ffffff 100%);
  border-bottom: 1px solid var(--color-border);
`;

const HeroGrid = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-16) var(--space-8) var(--space-12);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: var(--space-12);
  align-items: end;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: var(--space-10);
    padding: var(--space-12) var(--space-6) var(--space-10);
  }
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
  font-family: var(--font-hand);
  font-size: 1.25rem;
  color: var(--color-primary-500);
  margin-bottom: var(--space-3);

  &::before {
    content: '→';
    font-family: var(--font-sans);
    font-size: 1.1rem;
  }
`;

const H1 = styled.h1`
  font-size: clamp(1.9rem, 4.4vw, 2.9rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 var(--space-5);
  color: var(--color-gray-900);

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', Georgia, serif;
    font-weight: 500;
    color: var(--color-primary-600);
  }
`;

const Lead = styled.p`
  font-size: var(--text-lg);
  line-height: 1.55;
  color: var(--color-gray-700);
  margin: 0 0 var(--space-6);
  max-width: 56ch;

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.9em;
    background: var(--color-bg-subtle);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 1px 5px;
    color: var(--color-primary-600);
  }
`;

const HowSteps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: var(--color-text-muted);
  counter-reset: how;

  li {
    counter-increment: how;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;

    &::before {
      content: counter(how, decimal-leading-zero);
      color: var(--color-primary-500);
      font-weight: 700;
    }
  }

  li:not(:last-child)::after {
    content: '→';
    color: var(--color-border-hover);
    margin: 0 var(--space-3);
  }

  code {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 3px;
    padding: 0 5px;
    color: var(--color-primary-600);
    font-weight: 600;
  }
`;

/* ── Matrix ─────────────────────────────────────────────────────── */

const MatrixWrap = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(7, 14, 36, 0.04);
`;

const MatrixHead = styled.div`
  padding: 10px var(--space-4);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MatrixRow = styled.div<{ $first?: boolean }>`
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 64px;
  gap: var(--space-3);
  align-items: center;
  padding: 10px var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text);
  border-top: ${({ $first }) => ($first ? 'none' : '1px dashed var(--color-border)')};
`;

const MatrixCat = styled.span`
  font-family: 'Iowan Old Style', Georgia, serif;
  font-style: italic;
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--color-primary-300);
`;

const MatrixDesc = styled.span`
  line-height: 1.5;
  font-size: 13px;
  color: var(--color-text);

  strong {
    color: var(--color-gray-900);
    font-weight: 600;
  }
`;

const MatrixCount = styled.span`
  text-align: right;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

/* ── Body / category sections ──────────────────────────────────── */

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
  margin-top: var(--space-14);
`;

const CategoryHeader = styled.header`
  margin-bottom: var(--space-6);
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
  justify-content: space-between;
  flex-wrap: wrap;

  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-4);
`;

const CategoryHeadLeft = styled.div`
  min-width: 0;
  flex: 1;
`;

const CategoryKicker = styled.div`
  font-family: 'Iowan Old Style', Georgia, serif;
  font-size: var(--text-2xl);
  font-style: italic;
  font-weight: 500;
  color: var(--color-primary-300);
  line-height: 1;
  margin-bottom: var(--space-1);
`;

const CategoryTitle = styled.h2`
  font-size: var(--text-2xl);
  font-weight: 700;
  margin: 0 0 var(--space-2);
  color: var(--color-gray-900);
  letter-spacing: -0.015em;
`;

const CategoryBlurb = styled.p`
  margin: 0;
  color: var(--color-gray-700);
  font-size: var(--text-sm);
  line-height: 1.55;
  max-width: 64ch;
`;

const CategoryCount = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  white-space: nowrap;
  padding-top: var(--space-2);
`;

/* ── Grid (variant-aware) ──────────────────────────────────────── */

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

/* ── Simple card (A-D fixtures) ─────────────────────────────────── */

const SimpleCard = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: 10px;
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

const SimpleCardHead = styled.div`
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  justify-content: space-between;
`;

const SimpleCardTitle = styled.div`
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-gray-900);
  letter-spacing: -0.01em;
  line-height: 1.3;
`;

const SimpleCardTag = styled.div`
  font-size: 13px;
  color: var(--color-gray-700);
  line-height: 1.55;
  flex: 1;
`;

const Sig = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 2px 6px;
  align-self: start;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

/* ── Composite card (F fixtures) ────────────────────────────────── */

const CompositeCard = styled(Link)`
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: var(--space-5);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg);
  color: var(--color-text);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);

  &:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
`;

const Monogram = styled.div<{ $bg: string; $fg: string }>`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Iowan Old Style', Georgia, serif;
  font-weight: 700;
  font-size: 2rem;
  letter-spacing: -0.02em;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
`;

const CompositeBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
`;

const CompositeKicker = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-faint);
`;

const CompositeCardTitle = styled.div`
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.2;
  letter-spacing: -0.015em;
`;

const CompositeCardTag = styled.div`
  font-size: 13.5px;
  color: var(--color-gray-700);
  line-height: 1.55;
`;

const CoverageRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px dashed var(--color-border);
  flex-wrap: wrap;
`;

const CoverageCount = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  flex-shrink: 0;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background: rgba(48, 92, 222, 0.07);
  border: 1px solid rgba(48, 92, 222, 0.16);
  color: var(--color-primary-500);
  font-size: 10.5px;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-variant-numeric: tabular-nums;
`;

/* ── Brand-ish palettes (monograms — not real logos) ──────────── */

const COMPOSITE_STYLE: Record<string, { mono: string; bg: string; fg: string }> = {
  'F1-notion': { mono: 'N', bg: '#1f1f1f', fg: '#ffffff' },
  'F2-linear': { mono: 'L', bg: '#5e6ad2', fg: '#ffffff' },
  'F3-jira': { mono: 'J', bg: '#0052cc', fg: '#ffffff' },
  'F4-salesforce': { mono: 'S', bg: '#00a1e0', fg: '#ffffff' },
};

/* ── Technique signatures for simple fixtures ───────────────────── */

const SIGNATURES: Record<string, string> = {
  'A1-static-form': '[data-testid="*-input"]',
  'A2-dynamic-classes': '.btn__primary--ab3f9c',
  'A3-identical-siblings': 'fingerprintIndex: 3',
  'A4-i18n': 'data-i18n-key="action.continue"',
  'B1-spa-route': 'pushState → waitFor()',
  'B3-lazy-modal': 'elementVisible(700ms)',
  'C1-iframe-same-origin': 'frameId: <non-zero>',
  'C2-iframe-cross-origin': 'masked: true · ***',
  'C3-shadow-dom': 'kind: "shadow"',
  'C4-multi-tab': 'switchTab → tabs.create',
  'D1-dragdrop': 'drag → dataTransfer',
  'D2-file-upload': 'fileMeta · no bytes',
  'D3-modifier-keys': 'metaKey + "k"',
  'D4-contenteditable': 'inputType: "contenteditable"',
  'D5-clipboard': 'Cmd-C → Cmd-V',
  'D6-combobox': 'comboboxContext.optionText',
};

/* ── Components ────────────────────────────────────────────────── */

function CompositeBlock({ scenario }: { scenario: Scenario }) {
  const t = useTranslations('playground');
  const cov = scenario.coverage ?? [];
  const style = COMPOSITE_STYLE[scenario.slug] ?? { mono: '?', bg: '#3F4042', fg: '#fff' };
  const kicker = (() => {
    try {
      return t(`compositeKicker.${scenario.slug}`);
    } catch {
      return scenario.slug;
    }
  })();
  return (
    <CompositeCard href={`/playground/s/${scenario.slug}`}>
      <Monogram $bg={style.bg} $fg={style.fg} aria-hidden="true">
        {style.mono}
      </Monogram>
      <CompositeBody>
        <CompositeKicker>{kicker}</CompositeKicker>
        <CompositeCardTitle>{scenario.title}</CompositeCardTitle>
        <CompositeCardTag>{scenario.tagline}</CompositeCardTag>
        {cov.length > 0 ? (
          <CoverageRow>
            <CoverageCount>
              {cov.length} {t('difficultyPoints')}
            </CoverageCount>
            <ChipRow>
              {cov.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </ChipRow>
          </CoverageRow>
        ) : null}
      </CompositeBody>
    </CompositeCard>
  );
}

function SimpleBlock({ scenario }: { scenario: Scenario }) {
  const sig = SIGNATURES[scenario.slug];
  return (
    <SimpleCard href={`/playground/s/${scenario.slug}`}>
      <SimpleCardHead>
        <SimpleCardTitle>{scenario.title}</SimpleCardTitle>
      </SimpleCardHead>
      <SimpleCardTag>{scenario.tagline}</SimpleCardTag>
      {sig ? <Sig title={sig}>{sig}</Sig> : null}
    </SimpleCard>
  );
}

/* ── Matrix rows — order-stable; copy comes from i18n via the `cat` key. */

const MATRIX_ROWS: Array<{ cat: ScenarioCategory; count: number }> = [
  { cat: 'F', count: 4 },
  { cat: 'A', count: 4 },
  { cat: 'B', count: 2 },
  { cat: 'C', count: 4 },
  { cat: 'D', count: 6 },
];

const matrixDescElement = (short: string) => {
  const dashIdx = short.indexOf(' — ');
  if (dashIdx < 0) return short;
  return (
    <>
      <strong>{short.slice(0, dashIdx)}</strong>
      {short.slice(dashIdx)}
    </>
  );
};

/* ── Default export ─────────────────────────────────────────────── */

export default function PlaygroundIndex() {
  const t = useTranslations('playground');
  const byCat = new Map<ScenarioCategory, Scenario[]>();
  for (const s of SCENARIOS) {
    if (!byCat.has(s.category)) byCat.set(s.category, []);
    byCat.get(s.category)!.push(s);
  }

  const totalCount = SCENARIOS.length;
  const steps = t.raw('hero.steps') as string[];

  return (
    <>
      <HeroSection>
        <HeroGrid>
          <div>
            <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
            <H1>
              {t('hero.titleLine1')}{' '}
              <em>{t('hero.titleLine2Em')}</em>
            </H1>
            <Lead>
              {t.rich('hero.lead', {
                code: (chunks) => <code>{chunks}</code>,
                em: (chunks) => <em>{chunks}</em>,
              })}
            </Lead>
            <HowSteps>
              {steps.map((step, i) => (
                <li key={i}>
                  {/^[A-Z]/.test(step) || step.includes('"') ? <code>{step}</code> : step}
                </li>
              ))}
            </HowSteps>
          </div>

          <MatrixWrap aria-label={t('matrix.heading')}>
            <MatrixHead>
              <span>{t('matrix.heading')}</span>
              <span style={{ fontFamily: 'inherit', color: 'var(--color-text-faint)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
                {totalCount} {t('matrix.totalSuffix')}
              </span>
            </MatrixHead>
            {MATRIX_ROWS.map((row, i) => (
              <MatrixRow key={row.cat} $first={i === 0}>
                <MatrixCat>{row.cat}.</MatrixCat>
                <MatrixDesc>{matrixDescElement(t(`matrix.rows.${row.cat}`))}</MatrixDesc>
                <MatrixCount>
                  {row.count} {t('fixtures')}
                </MatrixCount>
              </MatrixRow>
            ))}
          </MatrixWrap>
        </HeroGrid>
      </HeroSection>

      <Body>
        {(['F', 'A', 'B', 'C', 'D'] as ScenarioCategory[]).map((cat) => {
          const list = byCat.get(cat);
          if (!list?.length) return null;
          const isComposite = cat === 'F';
          return (
            <CategoryBlock key={cat}>
              <CategoryHeader>
                <CategoryHeadLeft>
                  <CategoryKicker>{cat}.</CategoryKicker>
                  <CategoryTitle>{t(`category.${cat}.title`)}</CategoryTitle>
                  <CategoryBlurb>{t(`category.${cat}.blurb`)}</CategoryBlurb>
                </CategoryHeadLeft>
                <CategoryCount>
                  {list.length} {t('fixtures')}
                </CategoryCount>
              </CategoryHeader>
              <Grid $variant={isComposite ? 'composite' : 'simple'}>
                {list.map((s) =>
                  isComposite ? <CompositeBlock key={s.slug} scenario={s} /> : <SimpleBlock key={s.slug} scenario={s} />,
                )}
              </Grid>
            </CategoryBlock>
          );
        })}
      </Body>
    </>
  );
}
