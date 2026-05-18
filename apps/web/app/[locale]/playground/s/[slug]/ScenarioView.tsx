'use client';

import Link from 'next/link';
import styled from 'styled-components';
import type { Scenario } from '../../scenarios';

const Wrap = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-10) var(--space-8) var(--space-20);

  @media (max-width: 767px) {
    padding: var(--space-8) var(--space-6) var(--space-16);
  }
`;

const Crumbs = styled.div`
  font-size: 13px;
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
  font-size: clamp(28px, 4vw, 38px);
  margin: 0 0 var(--space-2);
  line-height: 1.15;
  color: var(--color-text);
`;

const Tag = styled.p`
  margin: 0 0 var(--space-8);
  color: var(--color-gray-700);
  font-size: 17px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 420px);
  gap: var(--space-8);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FrameWrap = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow-sm);
`;

const FrameHead = styled.div`
  background: var(--color-bg-subtle);
  padding: 10px 14px;
  font-size: 12px;
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
  font-size: 12px;
  &:hover { text-decoration: underline; }
`;

const Frame = styled.iframe`
  width: 100%;
  height: 560px;
  border: 0;
  display: block;
  background: white;
`;

const Side = styled.aside`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

const Card = styled.section`
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-5);
  background: var(--color-bg);
`;

const CardTitle = styled.h3`
  margin: 0 0 var(--space-2);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-gray-700);
`;

const CardBody = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text);
  white-space: pre-wrap;
`;

const TryList = styled.ol`
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.55;
`;

const CodeBlock = styled.pre`
  margin: 0;
  padding: var(--space-4);
  background: #0f1e4a;
  color: #d6e0fb;
  border-radius: 10px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-primary-500);
  text-decoration: none;
  margin-bottom: var(--space-4);

  &:hover { text-decoration: underline; }
`;

interface Props {
  scenario: Scenario;
}

export default function ScenarioView({ scenario }: Props) {
  const fixtureUrl = `/playground/${scenario.slug}.html`;
  return (
    <Wrap>
      <Crumbs>
        <Link href="/playground">Playground</Link> &nbsp;/&nbsp; Category {scenario.category}
      </Crumbs>
      <BackLink href="/playground">← All scenarios</BackLink>
      <H1>{scenario.title}</H1>
      <Tag>{scenario.tagline}</Tag>

      <Layout>
        <FrameWrap>
          <FrameHead>
            <span>Live fixture · interact with it while the recorder is running</span>
            <FrameLink href={fixtureUrl} target="_blank" rel="noopener">
              Open in new tab ↗
            </FrameLink>
          </FrameHead>
          <Frame src={fixtureUrl} title={scenario.title} />
        </FrameWrap>

        <Side>
          <Card>
            <CardTitle>Try this</CardTitle>
            <TryList>
              {scenario.tryThis.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </TryList>
          </Card>

          <Card>
            <CardTitle>Why this is hard</CardTitle>
            <CardBody>{scenario.whyHard}</CardBody>
          </Card>

          <Card>
            <CardTitle>Expected recorder output</CardTitle>
            <CodeBlock>{JSON.stringify(scenario.expected, null, 2)}</CodeBlock>
          </Card>
        </Side>
      </Layout>
    </Wrap>
  );
}
