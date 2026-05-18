'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { SCENARIOS, type Scenario } from '../../scenarios';

/** Map a coverage tag like "A2" → the slug of the fixture that demos it. */
function coverageSlug(tag: string): string | null {
  const match = SCENARIOS.find((s) => s.slug.startsWith(tag + '-') || s.slug === tag);
  return match?.slug ?? null;
}

const Wrap = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-block: var(--space-10) var(--space-20);
  padding-inline: var(--space-8);

  @media (max-width: 767px) {
    padding-block: var(--space-8) var(--space-16);
    padding-inline: var(--space-6);
  }
`;

const Crumbs = styled.div`
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  margin-bottom: var(--space-3);

  a {
    color: var(--color-primary-500);
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;

const H1 = styled.h1`
  font-size: var(--text-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 var(--space-2);
  line-height: 1.15;
  color: var(--color-gray-900);

  @media (min-width: 768px) {
    font-size: var(--text-4xl);
  }
`;

const Tag = styled.p`
  margin: 0 0 var(--space-8);
  color: var(--color-gray-700);
  font-size: var(--text-lg);
  line-height: 1.55;
`;

/* ── Sidebar layout (A-D) ────────────────────────────────────────── */
const SidebarLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 420px);
  gap: var(--space-8);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/* ── Theater layout (F composites) ──────────────────────────────── */
const TheaterLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr;
  gap: var(--space-5);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FrameWrap = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg);
  box-shadow: var(--shadow-sm);
`;

const FrameHead = styled.div`
  background: var(--color-bg-subtle);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-xs);
  color: var(--color-gray-700);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
`;

const FrameLink = styled.a`
  color: var(--color-primary-500);
  text-decoration: none;
  font-size: var(--text-xs);
  &:hover {
    text-decoration: underline;
  }
`;

const Frame = styled.iframe<{ $tall?: boolean }>`
  width: 100%;
  height: ${({ $tall }) => ($tall ? 'clamp(600px, 70vh, 800px)' : '560px')};
  border: 0;
  display: block;
  background: var(--color-bg);
`;

const Side = styled.aside`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

const Card = styled.section`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  background: var(--color-bg);
`;

const CardTitle = styled.h3`
  margin: 0 0 var(--space-2);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-gray-700);
`;

const CardBody = styled.div`
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text);
  white-space: pre-wrap;
`;

const CoverageHelp = styled.p`
  margin: 0 0 var(--space-3);
  font-size: var(--text-sm);
  line-height: 1.55;
  color: var(--color-text);
`;

const TryList = styled.ol`
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-text);
  font-size: var(--text-sm);
  line-height: 1.55;
`;

const CodeBlock = styled.pre`
  margin: 0;
  padding: var(--space-4);
  background: var(--color-primary-800);
  color: var(--color-primary-100);
  border-radius: var(--radius-md);
  overflow: auto;
  font-size: var(--text-xs);
  line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`;

const CoverageGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const CoverageChip = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(48, 92, 222, 0.08);
  border: 1px solid rgba(48, 92, 222, 0.18);
  color: var(--color-primary-500);
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  text-decoration: none;

  &:hover {
    background: rgba(48, 92, 222, 0.14);
  }
`;

const CoverageChipDisabled = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(48, 92, 222, 0.08);
  border: 1px solid rgba(48, 92, 222, 0.18);
  color: var(--color-primary-500);
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  opacity: 0.6;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--color-primary-500);
  text-decoration: none;
  margin-bottom: var(--space-4);

  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  scenario: Scenario;
}

function TryThisCard({ tryThis }: { tryThis: string[] }) {
  return (
    <Card>
      <CardTitle>Try this</CardTitle>
      <TryList>
        {tryThis.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </TryList>
    </Card>
  );
}

function WhyHardCard({ whyHard }: { whyHard: string }) {
  return (
    <Card>
      <CardTitle>Why this is hard</CardTitle>
      <CardBody>{whyHard}</CardBody>
    </Card>
  );
}

function CoverageCard({ coverage }: { coverage: string[] }) {
  return (
    <Card>
      <CardTitle>Difficulty points covered</CardTitle>
      <CoverageHelp>
        Each tag below links to the isolated demo for that single difficulty point — useful if the
        composite breaks somewhere and you want to bisect.
      </CoverageHelp>
      <CoverageGrid>
        {coverage.map((tag) => {
          const slug = coverageSlug(tag);
          return slug ? (
            <CoverageChip key={tag} href={`/playground/s/${slug}`}>
              {tag}
            </CoverageChip>
          ) : (
            <CoverageChipDisabled key={tag}>{tag}</CoverageChipDisabled>
          );
        })}
      </CoverageGrid>
    </Card>
  );
}

function ExpectedJsonCard({ expected }: { expected: unknown }) {
  return (
    <Card>
      <CardTitle>Expected recorder output</CardTitle>
      <CodeBlock>{JSON.stringify(expected, null, 2)}</CodeBlock>
    </Card>
  );
}

export default function ScenarioView({ scenario }: Props) {
  const fixtureUrl = `/playground/${scenario.slug}.html`;
  const isComposite = !!scenario.coverage?.length;

  const frame = (
    <FrameWrap>
      <FrameHead>
        <span>Live fixture · interact with it while the recorder is running</span>
        <FrameLink href={fixtureUrl} target="_blank" rel="noopener">
          Open in new tab ↗
        </FrameLink>
      </FrameHead>
      <Frame src={fixtureUrl} title={scenario.title} $tall={isComposite} />
    </FrameWrap>
  );

  return (
    <Wrap>
      <Crumbs>
        <Link href="/playground">Playground</Link> &nbsp;/&nbsp; Category {scenario.category}
      </Crumbs>
      <BackLink href="/playground">← All scenarios</BackLink>
      <H1>{scenario.title}</H1>
      <Tag>{scenario.tagline}</Tag>

      {isComposite ? (
        <TheaterLayout>
          {frame}
          <MetaGrid>
            <TryThisCard tryThis={scenario.tryThis} />
            <WhyHardCard whyHard={scenario.whyHard} />
            <CoverageCard coverage={scenario.coverage!} />
          </MetaGrid>
        </TheaterLayout>
      ) : (
        <SidebarLayout>
          {frame}
          <Side>
            <TryThisCard tryThis={scenario.tryThis} />
            <WhyHardCard whyHard={scenario.whyHard} />
            <ExpectedJsonCard expected={scenario.expected} />
          </Side>
        </SidebarLayout>
      )}
    </Wrap>
  );
}
