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

/* ── Replay-log card (composites only) ────────────────────────────── */

const REPLAY_LOG: Record<string, string> = {
  'F1-notion': `▸ Reading ~/.claude/skills/notion-rename-and-publish/SKILL.md
  ✓ 9 steps · 3 params · 1 precondition (workspace cookie)

▸ Step 1/9 · rename page title  ({{title}})
  ✓ matched [contenteditable] via fingerprintIndex
▸ Step 2/9 · open slash menu, pick "Heading 1"
  ✓ comboboxContext.optionText="Heading 1" (filtered list)
▸ Step 3/9 · type heading + Cmd-Enter
  ✓ chord captured · new block inserted
▸ Step 4/9 · @-mention "Alex Chen"
  ✓ debounced typeahead resolved by optionText
▸ Step 5/9 · toggle "Engineering tasks" (lazy 200ms)
  ✓ elementVisible polled · child blocks mounted
▸ Step 6/9 · drag block — reordered
  ✓ dragstart → drop · dataTransfer.types=["text/html"]
▸ Step 7/9 · click sub-page (pushState → /page/{{uuid}})
  ✓ E2 parameter lifted · URL templated
▸ Step 8/9 · paste from clipboard
  ✓ navigator.clipboard.readText() restored
▸ Step 9/9 · save
  ✓ done in 6.4s · 0 retries`,

  'F2-linear': `▸ Reading ~/.claude/skills/linear-triage-issue/SKILL.md
  ✓ 12 steps · 4 params · 1 precondition

▸ Step 1/12 · Cmd-K palette → "Switch to Board view"
  ✓ chord + comboboxContext resolved
▸ Step 2/12 · drag card "In Progress" → "Done"
  ✓ dataTransfer captured · drop on column[data-status=done]
▸ Step 3/12 · filter input (debounce 400ms)
  ✓ awaited 412ms · 7 rows
▸ Step 4/12 · open row → side panel (lazy 200ms)
  ✓ panel mounted · resumed
▸ Step 5/12 · edit title (contenteditable)
  ✓ debounced 300ms · final innerText captured
▸ Steps 6-9 · status / priority / assignee combobox
  ✓ 4 typeahead picks · all by optionText fallback
▸ Step 10/12 · paste URL → auto-linkify
  ✓ ClipboardEvent · text/plain → <a> wrap
▸ Step 11/12 · Cmd-Enter to post
▸ Step 12/12 · Cmd-Shift-I new-issue modal
  ✓ done in 11.8s · 0 retries`,

  'F3-jira': `▸ Reading ~/.claude/skills/jira-update-sprint-card/SKILL.md
  ✓ 12 steps · 3 params · 2 preconditions (cookie + 2FA)

▸ Precondition 1 · supplier-portal cookie
  ✓ resolved
▸ Precondition 2 · 2FA challenge
  ⏸  paused for human, code received
  ✓ resumed
▸ Step 1/12 · drag card "To Do" → "In Progress"
▸ Step 2/12 · project picker → switch back
  ✓ B1 SPA transition awaited
▸ Step 3/12 · open card → side flyout (200ms)
▸ Step 4/12 · select + bold (D4 contenteditable)
▸ Step 5/12 · paste URL · auto-linkify
▸ Step 6/12 · drag file → attach zone
  ✓ fileMeta only · bytes not transmitted
▸ Step 7/12 · pencil-icon: phone — input mounted
  ⚠ sensitive field detected · masked: true (***)
▸ Step 8/12 · due-date picker (custom combobox)
▸ Step 9/12 · scroll → wiki iframe loaded
  ✓ frameId 4 re-resolved by URL
▸ Step 10/12 · "Print preview" target=_blank
  ✓ chrome.tabs.onCreated · openerTabId tracked
▸ done in 14.2s · 0 retries`,

  'F4-salesforce': `▸ Reading ~/.claude/skills/sf-update-account/SKILL.md
  ✓ 15 steps · 5 params · 2 preconditions

▸ Step 1/15 · click "Acme Corp" row 1 (of 3 identical)
  ✓ fingerprintIndex: 0 · row matched
▸ Step 2/15 · /r/Account/{{accountId}}/view
  ✓ URL segment lifted · param: accountId
▸ Step 3/15 · pencil → Phone (B3 lazy 200ms)
  ⚠ masked: true · *** stored
▸ Step 4/15 · Owner typeahead "ali" (350ms debounce)
  ✓ optionText="Alex Chen" resolved
▸ Step 5/15 · Country → United States (D6)
  ✓ State combobox unlocked
▸ Step 6/15 · State → California
▸ Step 7/15 · expand "Related Contacts (3)" (lazy)
▸ Step 8/15 · drag file → dropzone
  ✓ fileMeta captured · no bytes
▸ Step 9/15 · Notes (contenteditable)
▸ Step 10/15 · "Copy account number" → clipboard
▸ Step 11/15 · Cmd-S · save toast
▸ Steps 12-14 · Submit for approval (4-step modal)
  ✓ B3 lazy cascade · all steps stepped
▸ Step 15/15 · Generate quote → new tab
  ✓ chrome.tabs.create · openerTabId tracked
▸ done in 18.6s · 0 retries`,
};

const ReplayCard = styled.section`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-primary-900);
  color: var(--color-primary-100);
  padding: 0;
  overflow: hidden;
  grid-column: 1 / -1;
`;

const ReplayHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-5);
  background: rgba(122, 158, 245, 0.08);
  border-bottom: 1px solid rgba(122, 158, 245, 0.15);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(173, 193, 247, 0.85);

  span:last-child {
    color: rgba(122, 158, 245, 0.65);
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
  }
`;

const ReplayBody = styled.pre`
  margin: 0;
  padding: var(--space-5) var(--space-6);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: rgba(214, 224, 251, 0.92);
  white-space: pre-wrap;
  overflow-x: auto;

  /* simple syntax tinting via inline character substitutions */
  & {
    text-shadow: 0 0 0 transparent;
  }
`;

function ReplayLogCard({ slug }: { slug: string }) {
  const log = REPLAY_LOG[slug];
  if (!log) return null;
  // Lightly colour up the lines: prefix ▸ blue, ✓ green, ⚠ orange, ⏸ amber.
  const lines = log.split('\n').map((line, i) => {
    if (line.startsWith('▸')) return <span key={i} style={{ color: '#7a9ef5', fontWeight: 600 }}>{line}{'\n'}</span>;
    if (line.includes('✓')) return <span key={i} style={{ color: '#10b981' }}>{line}{'\n'}</span>;
    if (line.includes('⚠')) return <span key={i} style={{ color: '#fbbf24' }}>{line}{'\n'}</span>;
    if (line.includes('⏸')) return <span key={i} style={{ color: '#fbbf24' }}>{line}{'\n'}</span>;
    return <span key={i}>{line}{'\n'}</span>;
  });
  return (
    <ReplayCard>
      <ReplayHead>
        <span>Replay log · claude code · stdout</span>
        <span>simulated · not live data</span>
      </ReplayHead>
      <ReplayBody>{lines}</ReplayBody>
    </ReplayCard>
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
            <ReplayLogCard slug={scenario.slug} />
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
