'use client';

import Link from 'next/link';
import styled from 'styled-components';

/* ────────────────────────────────────────────────────────────────────
 * Worked example — a long-form editorial walk-through. Replaces the
 * fabricated testimonials. Structured like a magazine feature: a
 * dropped capital, asides in the margin, evidence panels, and a
 * numerical postscript.
 * ──────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  background: var(--color-bg);
  padding-block: var(--section-padding-y);
  border-bottom: 1px solid var(--color-border);
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Tag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary-600);
  margin-bottom: var(--space-3);

  &::before {
    content: '§';
    font-family: 'Iowan Old Style', Georgia, serif;
    font-size: 1.3em;
    color: var(--color-primary-300);
  }
`;

const Title = styled.h2`
  font-size: clamp(1.75rem, 3.4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--color-gray-900);
  margin: 0 0 var(--space-5);

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', Georgia, serif;
    font-weight: 500;
    color: var(--color-primary-600);
  }
`;

const Byline = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: var(--color-text-muted);
  margin-bottom: var(--space-10);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);

  & > span:not(:last-child)::after {
    content: '·';
    margin-left: var(--space-3);
    color: var(--color-border-hover);
  }
`;

/* ── Article body ─────────────────────────────────────────────────── */

const Article = styled.article`
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
`;

const Para = styled.p`
  font-family: 'Iowan Old Style', Georgia, 'Times New Roman', serif;
  font-size: 1.125rem;
  line-height: 1.65;
  color: var(--color-text);
  margin: 0;

  &.lead::first-letter {
    font-family: 'Iowan Old Style', Georgia, serif;
    font-size: 4.2rem;
    line-height: 0.92;
    font-weight: 700;
    float: left;
    margin: 6px 12px 0 0;
    color: var(--color-primary-500);
  }

  em {
    font-style: italic;
  }

  strong {
    font-family: var(--font-sans);
    font-weight: 600;
    color: var(--color-gray-900);
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.88em;
    background: var(--color-bg-subtle);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 1px 6px;
    color: var(--color-primary-600);
  }
`;

const Sub = styled.h3`
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--color-gray-900);
  margin: var(--space-4) 0 var(--space-1);
  display: flex;
  align-items: baseline;
  gap: var(--space-3);

  &::before {
    content: counter(sub) ' ·';
    counter-increment: sub;
    font-family: 'Iowan Old Style', Georgia, serif;
    font-style: italic;
    font-weight: 500;
    color: var(--color-primary-300);
  }
`;

const ArticleInner = styled.div`
  counter-reset: sub;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
`;

/* ── Evidence panels ──────────────────────────────────────────────── */

const Evidence = styled.figure`
  margin: var(--space-2) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const EvidenceCard = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(7, 14, 36, 0.04);
`;

const EvHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px var(--space-4);
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);

  span:last-child {
    color: var(--color-text-faint);
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
  }
`;

const EvBody = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.65;
  padding: var(--space-4);
  color: var(--color-text);
  overflow-x: auto;
`;

const EvCaption = styled.figcaption`
  font-family: 'Iowan Old Style', Georgia, serif;
  font-style: italic;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
  padding-left: var(--space-2);
`;

const Cmt = styled.span`
  color: var(--color-text-faint);
`;
const Kw = styled.span`
  color: var(--color-primary-500);
  font-weight: 600;
`;
const Param = styled.span`
  color: var(--color-primary-600);
  font-weight: 600;
  background: rgba(48, 92, 222, 0.09);
  border-radius: 3px;
  padding: 0 4px;
`;
const Str = styled.span`
  color: #b91c1c;
`;
const Ok = styled.span`
  color: var(--color-success);
  font-weight: 600;
`;

const Diff = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-top: 1px solid var(--color-border);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const DiffSide = styled.div`
  padding: var(--space-4);
  border-right: 1px solid var(--color-border);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.6;

  &:last-child {
    border-right: none;
  }

  @media (max-width: 640px) {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    &:last-child { border-bottom: none; }
  }

  & > .head {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-faint);
    margin-bottom: var(--space-2);
    font-weight: 600;
  }
`;

/* ── Closing numbers ──────────────────────────────────────────────── */

const Postscript = styled.div`
  margin-top: var(--space-6);
  padding: var(--space-8) var(--space-8);
  border-top: 2px solid var(--color-gray-900);
  border-bottom: 2px solid var(--color-gray-900);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1fr;
  gap: var(--space-10);
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: var(--space-6) var(--space-4);
    gap: var(--space-6);
  }
`;

const PsLabel = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
`;

const PsTitle = styled.div`
  font-family: 'Iowan Old Style', Georgia, serif;
  font-size: 1.3rem;
  font-style: italic;
  line-height: 1.4;
  color: var(--color-gray-900);
`;

const Numbers = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const NumCell = styled.div`
  text-align: left;
`;

const NumValue = styled.div`
  font-family: 'Iowan Old Style', Georgia, serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-primary-600);
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

const NumUnit = styled.span`
  font-size: 0.5em;
  font-style: italic;
  font-weight: 400;
  color: var(--color-text-muted);
  margin-left: 6px;
`;

const NumLabel = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-top: var(--space-2);
`;

const ReadMore = styled.div`
  margin-top: var(--space-6);
  text-align: center;
  font-family: 'Iowan Old Style', Georgia, serif;
  font-style: italic;
  font-size: var(--text-base);
  color: var(--color-text-muted);

  a {
    color: var(--color-primary-500);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export default function WorkedExampleSection() {
  return (
    <Section id="example">
      <Container>
        <Tag>Worked example</Tag>
        <Title>
          A five-minute browser ritual,{' '}
          <em>distilled to thirty seconds.</em>
        </Title>
        <Byline>
          <span>Field notebook</span>
          <span>Recorded 2026-02-19, 16:42 UTC</span>
          <span>Replay 50× without intervention</span>
        </Byline>

        <Article>
          <ArticleInner>
            <Para className="lead">
              Every Monday morning an operations engineer at a small supplier opens the same portal,
              clicks <strong>New purchase order</strong>, pastes a SKU from a CSV, types a quantity, and clicks{' '}
              <strong>Submit</strong>. Then they do it again. And again. Two hundred rows a week,
              every week, for the last fourteen months. It is a five-minute ritual repeated until
              the spreadsheet ends.
            </Para>

            <Para>
              This is the kind of task that gets a recorder pitched at it — and exactly the kind of task most
              recorders fail at. The supplier portal rotates Tailwind class hashes on every deploy. The submit
              button lives inside a dynamic table row that re-renders after each save. The auth cookie expires
              at noon. Selenium scripts written against this page survive two weeks on average, then quietly
              start failing.
            </Para>

            <Sub>The recording</Sub>

            <Para>
              The engineer pins the extension to their toolbar, opens the portal, clicks <strong>Start recording</strong>,
              and performs the task exactly once. Eight clicks, two typed values, one submit. The side panel shows
              a live feed of events as they happen — including the noise: scroll, focus, blur, accidental mousemoves
              over the help icon. Twenty-three events captured in 4.6 seconds.
            </Para>

            <Evidence>
              <EvidenceCard>
                <EvHead>
                  <span>raw events · 23</span>
                  <span>elapsed 4.6s</span>
                </EvHead>
                <EvBody>
{`01  `}<Kw>navigate</Kw>{`  `}<Str>"/orders/new"</Str>{`            `}<Cmt>// 304 → 200</Cmt>{`
02  `}<Kw>click</Kw>{`     `}<Str>"button.tabs__new"</Str>{`       `}<Cmt>// data-tab=create</Cmt>{`
03  `}<Kw>focus</Kw>{`     `}<Str>"#sku"</Str>{`
04  `}<Kw>type</Kw>{`      `}<Str>"SKU-1029"</Str>{`               `}<Cmt>// 8 keystrokes</Cmt>{`
05  `}<Kw>blur</Kw>{`      `}<Str>"#sku"</Str>{`
06  `}<Kw>focus</Kw>{`     `}<Str>"#qty"</Str>{`
07  `}<Kw>type</Kw>{`      `}<Str>"50"</Str>{`
08  `}<Kw>click</Kw>{`     `}<Str>"button.submit"</Str>{`           ⚠`}<Cmt> inside .row[data-id=r9]</Cmt>{`
…   `}<Cmt>16 more (scroll · focus · mousemove · blur · resize)</Cmt>
                </EvBody>
              </EvidenceCard>
              <EvCaption>The raw log keeps everything; the distiller decides what matters.</EvCaption>
            </Evidence>

            <Sub>The distillation</Sub>

            <Para>
              Inside the service worker, six small passes turn the noisy log into a deterministic spec.
              Consecutive clicks merge. Keystroke groups fold into a single <code>type()</code> call. The
              typed values — <code>"SKU-1029"</code> and <code>"50"</code> — are scored against
              ten regex priors; both clear the 0.7 threshold and become <code>{`{{sku}}`}</code> and{' '}
              <code>{`{{quantity}}`}</code>. The submit button click is flagged with a warning because
              its target sits inside a dynamic list, so the SKILL.md adds a row-match condition rather than
              clicking a fixed CSS path.
            </Para>

            <Evidence>
              <EvidenceCard>
                <EvHead>
                  <span>before / after</span>
                  <span>23 events → 4 steps</span>
                </EvHead>
                <Diff>
                  <DiffSide>
                    <div className="head">— BEFORE (raw)</div>
                    <div><Cmt>type</Cmt> <Str>"S"</Str> → #sku</div>
                    <div><Cmt>type</Cmt> <Str>"K"</Str> → #sku</div>
                    <div><Cmt>type</Cmt> <Str>"U"</Str> → #sku</div>
                    <div><Cmt>type</Cmt> <Str>"-"</Str> → #sku</div>
                    <div><Cmt>type</Cmt> <Str>"1"</Str> → #sku</div>
                    <div><Cmt>type</Cmt> <Str>"0"</Str> → #sku</div>
                    <div><Cmt>type</Cmt> <Str>"2"</Str> → #sku</div>
                    <div><Cmt>type</Cmt> <Str>"9"</Str> → #sku</div>
                  </DiffSide>
                  <DiffSide>
                    <div className="head">+ AFTER (distilled)</div>
                    <div><Ok>fill</Ok> <Str>"#sku"</Str> with <Param>{`{{sku}}`}</Param></div>
                    <div style={{ height: 12 }} />
                    <div className="head" style={{ marginTop: 8 }}>+ AUTO-DETECTED</div>
                    <div><Cmt>// 8 chars · alphanumeric · prefix SKU-</Cmt></div>
                    <div><Cmt>// confidence 0.94</Cmt></div>
                  </DiffSide>
                </Diff>
              </EvidenceCard>
              <EvCaption>Eight keystrokes become one parameterized fill — the same shape every replay.</EvCaption>
            </Evidence>

            <Sub>The hand-off</Sub>

            <Para>
              The engineer drops the resulting markdown into{' '}
              <code>~/.claude/skills/create-purchase-order/SKILL.md</code> and types a single sentence into
              Claude Code. The agent finds the skill by name, resolves the precondition (the saved cookie
              is still valid until noon), iterates over the fifty rows in the CSV, and reports back.
              Three minutes eleven seconds later, the work is done. No human watched it run.
            </Para>

            <Evidence>
              <EvidenceCard>
                <EvHead>
                  <span>claude code · stdout</span>
                  <span>3m 11s · 0 retries</span>
                </EvHead>
                <EvBody>
{`> `}<Cmt>create purchase orders for the rows in ~/Desktop/feb-orders.csv</Cmt>{`

`}<Kw>▸</Kw>{` Reading ~/.claude/skills/create-purchase-order/SKILL.md
  `}<Ok>✓</Ok>{` 4 steps · 2 params · 1 precondition

`}<Kw>▸</Kw>{` Resolving precondition: signed in to supplier portal
  `}<Ok>✓</Ok>{` cookie present (expires 2026-02-19 12:00 UTC)

`}<Kw>▸</Kw>{` Running batch (50 rows)
  `}<Ok>✓</Ok>{` 50/50 submitted
  `}<Ok>✓</Ok>{` 0 retries · 0 manual rescues
  `}<Ok>✓</Ok>{` median 3.8s per row · longest 5.1s
`}
                </EvBody>
              </EvidenceCard>
              <EvCaption>One sentence in, fifty purchase orders out. The agent never asked a question.</EvCaption>
            </Evidence>
          </ArticleInner>

          <Postscript>
            <div>
              <PsLabel>Postscript</PsLabel>
              <PsTitle>
                The cost of a five-minute ritual,<br />amortized over a working year.
              </PsTitle>
            </div>
            <Numbers>
              <NumCell>
                <NumValue>4:18<NumUnit>min</NumUnit></NumValue>
                <NumLabel>median manual run</NumLabel>
              </NumCell>
              <NumCell>
                <NumValue>3.8<NumUnit>sec</NumUnit></NumValue>
                <NumLabel>median agent run</NumLabel>
              </NumCell>
              <NumCell>
                <NumValue>~187<NumUnit>hrs/yr</NumUnit></NumValue>
                <NumLabel>recovered, this task alone</NumLabel>
              </NumCell>
            </Numbers>
          </Postscript>

          <ReadMore>
            Want to see it on harder fixtures? <Link href="/playground">Try the playground →</Link>
          </ReadMore>
        </Article>
      </Container>
    </Section>
  );
}
