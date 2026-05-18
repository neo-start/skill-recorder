'use client';

import Link from 'next/link';
import styled from 'styled-components';

/* ────────────────────────────────────────────────────────────────────
 * Catalog — a spec-sheet table of what the recorder handles, with each
 * row linked to the corresponding playground fixture. Replaces the
 * 7-card UseCases grid + the bottom two feature cards. Reads like
 * Stripe API docs, not a marketing landing.
 * ──────────────────────────────────────────────────────────────────── */

type Row = {
  category: string;
  technique: string;
  detail: string;
  state: 'shipped' | 'auto' | 'partial';
  fixture: { tag: string; slug: string };
};

const ROWS: Row[] = [
  {
    category: 'Selectors',
    technique: 'Hashed class & ID rotation',
    detail: 'Tailwind-style classes such as btn__primary--ab3f9c rotate on every deploy; the resolver falls through 6 tiers (testid → id → aria → text → css → xpath) so a re-hashed button still picks.',
    state: 'shipped',
    fixture: { tag: 'A2', slug: 'A2-dynamic-classes' },
  },
  {
    category: 'Selectors',
    technique: 'Identical sibling rows',
    detail: 'Six rows with literally identical "Pick" buttons — only position distinguishes them. We anchor each click by fingerprintIndex so the right row is clicked, even after the list reorders.',
    state: 'shipped',
    fixture: { tag: 'A3', slug: 'A3-identical-siblings' },
  },
  {
    category: 'Selectors',
    technique: 'Locale-stable identifiers',
    detail: '"Continue" / "继续" / "Weiter" all map to the same data-i18n-key="action.continue". The recorder prefers locale-independent attributes so a skill recorded in English replays under Chinese.',
    state: 'shipped',
    fixture: { tag: 'A4', slug: 'A4-i18n' },
  },
  {
    category: 'Async',
    technique: 'SPA route transitions',
    detail: 'pushState and hashchange transitions are tracked without reload; replay waits for the new content to mount instead of probing an empty container.',
    state: 'shipped',
    fixture: { tag: 'B1', slug: 'B1-spa-route' },
  },
  {
    category: 'Async',
    technique: 'Lazy-mounted modals',
    detail: 'The Confirm button doesn\'t exist when the trigger is clicked. elementVisible polls until the target shows up before dispatching the next step — no flaky timeouts.',
    state: 'shipped',
    fixture: { tag: 'B3', slug: 'B3-lazy-modal' },
  },
  {
    category: 'Surfaces',
    technique: 'Same-origin iframes',
    detail: 'all_frames: true injects per-frame; actions are tagged with the originating frameId, then re-resolved by URL across re-renders so a stale frameId never blocks replay.',
    state: 'shipped',
    fixture: { tag: 'C1', slug: 'C1-iframe-same-origin' },
  },
  {
    category: 'Surfaces',
    technique: 'Sensitive-field redaction',
    detail: 'password / phone / credit-card / SSN inputs are detected by type + autocomplete + name and replaced with *** before they ever hit storage. The bytes never leave the page.',
    state: 'shipped',
    fixture: { tag: 'C2', slug: 'C2-iframe-cross-origin' },
  },
  {
    category: 'Surfaces',
    technique: 'Shadow DOM piercing',
    detail: 'A custom shadow selector kind encodes the path as { host, inner } segments; the resolver walks shadowRoot.querySelector at each boundary, so Web Components are first-class.',
    state: 'shipped',
    fixture: { tag: 'C3', slug: 'C3-shadow-dom' },
  },
  {
    category: 'Surfaces',
    technique: 'Cross-tab handoff',
    detail: 'When a flow opens a new tab — print preview, OAuth, quote generation — recording follows via chrome.tabs.onCreated. Replay re-creates the tab through chrome.tabs.create.',
    state: 'shipped',
    fixture: { tag: 'C4', slug: 'C4-multi-tab' },
  },
  {
    category: 'Input',
    technique: 'Native drag & drop',
    detail: 'A dragstart → dragover → drop chain with a shared DataTransfer coalesces into one drag step (source + target + types observed). No brittle pixel coordinates.',
    state: 'shipped',
    fixture: { tag: 'D1', slug: 'D1-dragdrop' },
  },
  {
    category: 'Input',
    technique: 'Modifier-key chords',
    detail: 'A bare "k" keypress is text-input noise; with metaKey: true it\'s a Cmd-K shortcut. The recorder keeps the chord and drops the noise, preserving modifier state for replay.',
    state: 'shipped',
    fixture: { tag: 'D3', slug: 'D3-modifier-keys' },
  },
  {
    category: 'Input',
    technique: 'contenteditable blocks',
    detail: 'change never fires on contenteditable. We hook input + compositionend, debounce 300ms, and emit one change step with the final innerText — same shape as a text input.',
    state: 'shipped',
    fixture: { tag: 'D4', slug: 'D4-contenteditable' },
  },
  {
    category: 'Input',
    technique: 'ARIA combobox & typeahead',
    detail: 'Each click step is enriched with comboboxContext (option text, root selector); if the direct click fails on replay, the fallback types the text, ArrowDown until aria-activedescendant matches, then Enter.',
    state: 'shipped',
    fixture: { tag: 'D6', slug: 'D6-combobox' },
  },
];

const Section = styled.section`
  background: var(--color-bg-subtle);
  padding-block: var(--section-padding-y);
  border-bottom: 1px solid var(--color-border);

  /* a faint horizontal-rule-spacing background — like ledger paper */
  background-image:
    linear-gradient(180deg, transparent 0 calc(100% - 1px), var(--color-border) calc(100% - 1px) 100%),
    repeating-linear-gradient(180deg, transparent 0 31px, rgba(48, 92, 222, 0.04) 31px 32px),
    linear-gradient(180deg, #f7faff 0%, #f0f4fe 100%);
`;

const Container = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Head = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: var(--space-12);
  align-items: end;
  margin-bottom: var(--space-10);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: var(--space-6);
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
  margin: 0;

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', Georgia, serif;
    font-weight: 500;
    color: var(--color-primary-600);
  }
`;

const Lead = styled.p`
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--color-gray-700);
  margin: 0;
  max-width: 48ch;
`;

const SmallNote = styled.div`
  font-family: var(--font-hand);
  font-size: 1.05rem;
  color: var(--color-primary-500);
  margin-top: var(--space-3);

  &::before {
    content: '↑ ';
  }
`;

/* ── Table ───────────────────────────────────────────────────────── */

const Sheet = styled.div`
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(7, 14, 36, 0.04);
`;

const SheetHead = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1.5fr) minmax(0, 2.3fr) 96px;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-3) var(--space-5);
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-faint);

  @media (max-width: 768px) {
    display: none;
  }
`;

const RowLink = styled(Link)<{ $first?: boolean }>`
  display: grid;
  grid-template-columns: 120px minmax(0, 1.5fr) minmax(0, 2.3fr) 96px;
  gap: var(--space-4);
  align-items: start;
  padding: var(--space-4) var(--space-5);
  border-top: ${({ $first }) => ($first ? 'none' : '1px solid var(--color-border)')};
  color: var(--color-text);
  text-decoration: none;
  transition: background var(--transition-fast);
  position: relative;

  &:hover {
    background: rgba(48, 92, 222, 0.03);
  }

  &:hover .row-fixture {
    color: var(--color-primary-500);
    border-color: var(--color-primary-500);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto auto;
    padding: var(--space-5) var(--space-4);
    gap: var(--space-2);
  }
`;

const Cat = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding-top: 2px;

  @media (max-width: 768px) {
    grid-column: 1 / 2;
  }
`;

const Tech = styled.div`
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-gray-900);
  line-height: 1.4;
  letter-spacing: -0.01em;
  display: flex;
  align-items: baseline;
  gap: var(--space-2);

  @media (max-width: 768px) {
    grid-column: 1 / 3;
  }
`;

const StateDot = styled.span<{ $state: Row['state'] }>`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $state }) =>
    $state === 'shipped' ? 'var(--color-success)' :
    $state === 'auto' ? 'var(--color-primary-500)' :
    'var(--color-warning)'};
`;

const Detail = styled.p`
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.65;
  color: var(--color-gray-700);

  @media (max-width: 768px) {
    grid-column: 1 / 3;
  }
`;

const FixtureLink = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: start;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 3px 10px;
  background: var(--color-bg);
  transition: color var(--transition-fast), border-color var(--transition-fast);
  white-space: nowrap;

  @media (max-width: 768px) {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    justify-self: end;
  }
`;

/* ── Footer note ─────────────────────────────────────────────────── */

const FootNote = styled.p`
  font-size: var(--text-sm);
  line-height: 1.65;
  color: var(--color-text-muted);
  text-align: center;
  margin: var(--space-8) auto 0;
  max-width: 56ch;
  font-style: italic;
  font-family: 'Iowan Old Style', Georgia, serif;
  font-size: var(--text-base);

  strong {
    font-style: normal;
    font-family: var(--font-sans);
    color: var(--color-gray-900);
    font-weight: 600;
  }

  a {
    color: var(--color-primary-500);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export default function CatalogSection() {
  return (
    <Section id="catalog">
      <Container>
        <Head>
          <div>
            <Tag>Specification</Tag>
            <Title>
              What survives a recording?{' '}
              <em>Eleven hard cases, end-to-end.</em>
            </Title>
          </div>
          <div>
            <Lead>
              The browser is full of recorder traps — hashed classes, lazy modals, shadow DOM,
              cross-tab flows, IME composition, drag-and-drop. Each row below is a real
              fixture in the playground; click any of them to record against it yourself.
            </Lead>
            <SmallNote>green dot = shipped · blue = automatic</SmallNote>
          </div>
        </Head>

        <Sheet>
          <SheetHead>
            <span>Category</span>
            <span>Technique</span>
            <span>What we do about it</span>
            <span style={{ textAlign: 'right' }}>Fixture</span>
          </SheetHead>

          {ROWS.map((row, i) => (
            <RowLink
              key={`${row.fixture.slug}`}
              href={`/playground/s/${row.fixture.slug}`}
              $first={i === 0}
            >
              <Cat>{row.category}</Cat>
              <Tech>
                <StateDot $state={row.state} aria-hidden="true" title={row.state} />
                {row.technique}
              </Tech>
              <Detail>{row.detail}</Detail>
              <FixtureLink className="row-fixture">
                {row.fixture.tag} →
              </FixtureLink>
            </RowLink>
          ))}
        </Sheet>

        <FootNote>
          <strong>Thirteen of sixteen.</strong> Plus four <em>composite</em> fixtures —{' '}
          Notion, Linear, Jira, Salesforce — that chain twelve to fifteen of these techniques
          into a single coherent flow. <Link href="/playground">See the playground →</Link>
        </FootNote>
      </Container>
    </Section>
  );
}
