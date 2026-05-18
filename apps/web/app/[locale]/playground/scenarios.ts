// Source-of-truth metadata for the /playground pages.
//
// The HTML fixtures themselves live in `apps/crx/e2e/fixtures/` (mirrored into
// `public/playground/` by scripts/sync-playground.mjs). The descriptions below
// are written so a real user can read them and know (a) what the page does
// when they interact with it, (b) what the recorder is supposed to capture,
// and (c) why this case is interesting / hard.

export type ScenarioCategory = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Scenario {
  /** URL slug = fixture filename without `.html` */
  slug: string;
  category: ScenarioCategory;
  /** Short label shown in the index. */
  title: string;
  /** One-sentence pitch under the title. */
  tagline: string;
  /** Why this is hard for a typical recorder. Plain text, may have line breaks. */
  whyHard: string;
  /** What the user should do on the page to trigger the interesting recording. */
  tryThis: string[];
  /** What the recorder is expected to capture. JSON-shape preview (rendered as code). */
  expected: unknown;
}

export const CATEGORY_LABELS: Record<ScenarioCategory, { title: string; blurb: string }> = {
  A: {
    title: 'A · Selector stability',
    blurb: 'Selectors must keep working after dynamic classes, identical siblings, and locale changes.',
  },
  B: {
    title: 'B · Async + timing',
    blurb: 'Replay must wait for SPA routes, debounced searches, and lazy-mounted modals.',
  },
  C: {
    title: 'C · Multi-surface',
    blurb: 'Iframes, shadow DOM, and multi-tab flows are first-class.',
  },
  D: {
    title: 'D · Input specialness',
    blurb: 'Drag/drop, file upload, modifier chords, contenteditable, clipboard, ARIA combobox.',
  },
  E: {
    title: 'E · Parameterization',
    blurb: 'Auto-detect which typed values and URL segments should become reusable parameters.',
  },
};

export const SCENARIOS: Scenario[] = [
  // ── A ────────────────────────────────────────────────────────────────
  {
    slug: 'A1-static-form',
    category: 'A',
    title: 'A1 · Static form (smoke)',
    tagline: 'Three text fields + submit. The baseline every recorder must pass.',
    whyHard:
      'Not hard at all — this is the smoke test. If selectors, fills, and submit don\'t round-trip here, nothing else matters.',
    tryThis: [
      'Click into "Name" and type something.',
      'Tab through to "Email" and "Message", fill them.',
      'Click Submit.',
    ],
    expected: [
      { type: 'navigate' },
      { type: 'change', selectors: ['[data-testid="name-input"]'], value: '<your text>' },
      { type: 'change', selectors: ['[data-testid="email-input"]'] },
      { type: 'change', selectors: ['[data-testid="message-input"]'] },
      { type: 'click', selectors: ['[data-testid="submit-button"]'] },
    ],
  },
  {
    slug: 'A2-dynamic-classes',
    category: 'A',
    title: 'A2 · Dynamic class hashes',
    tagline: 'Buttons get fresh `btn__primary--ab3f9c` classes on every load.',
    whyHard:
      'A naïve CSS selector recorded against `.btn__primary--ab3f9c` will never match again on the next pageload. The recorder must pick selectors from STABLE attributes (id, aria-label, testid) and ignore hash-looking class names.',
    tryThis: ['Click "Continue".', 'Reload the page (Cmd/Ctrl-R) and replay the recording.'],
    expected: [
      { type: 'click', selectors: ['[aria-label="primary action"]', '#btn-primary'], fingerprint: { text: 'Continue' } },
    ],
  },
  {
    slug: 'A3-identical-siblings',
    category: 'A',
    title: 'A3 · Identical sibling tiebreak',
    tagline: 'Six rows with identical "Pick" buttons. Only position distinguishes them.',
    whyHard:
      'Same role, same text, same attrs — selectors alone don\'t disambiguate. The recorder must record a `fingerprintIndex` (which sibling among look-alikes) so replay clicks the right row.',
    tryThis: ['Click the "Pick" button in row 4.'],
    expected: [
      {
        type: 'click',
        selectors: ['#rows li:nth-of-type(4) button'],
        fingerprint: { text: 'Pick', fingerprintIndex: 3 },
      },
    ],
  },
  {
    slug: 'A4-i18n',
    category: 'A',
    title: 'A4 · Locale-stable selectors via data-i18n-key',
    tagline: '"Continue" / "继续" / "Weiter" — same DOM, three languages.',
    whyHard:
      'A text-based selector against "Continue" breaks the moment the user opens the same page in Chinese. The recorder must prefer the language-independent `data-i18n-key` attribute when present.',
    tryThis: [
      'Click "Continue".',
      'Open this same page with `?lang=zh` (or set `localStorage.lang = "zh"`) and replay — should still pick the button.',
    ],
    expected: [
      {
        type: 'click',
        fingerprint: { i18nKey: 'action.continue', attrs: { 'data-i18n-key': 'action.continue' } },
      },
    ],
  },

  // ── B ────────────────────────────────────────────────────────────────
  {
    slug: 'B1-spa-route',
    category: 'B',
    title: 'B1 · SPA route transition',
    tagline: 'Tab switches mount different content 350ms later — no real navigation.',
    whyHard:
      'URL stays the same, but selectors before vs. after point at different elements. Replay must wait for the new content to mount instead of probing an empty container.',
    tryThis: ['Click "Orders". Wait for it to render. Click "Confirm order".'],
    expected: [
      { type: 'click', selectors: ['[data-testid="nav-orders"]'] },
      { type: 'click', selectors: ['[data-testid="confirm-order"]'] },
    ],
  },
  {
    slug: 'B3-lazy-modal',
    category: 'B',
    title: 'B3 · Lazy-mounted modal',
    tagline: 'The modal appears 700ms after you click the trigger button.',
    whyHard:
      'If replay probes for the Confirm button immediately, it\'s not in the DOM yet. The `elementVisible` expectation polls until the target shows up before dispatching the next click.',
    tryThis: ['Click "Open settings". Wait. Click "Confirm".'],
    expected: [
      { type: 'click', selectors: ['[data-testid="open-modal"]'] },
      { type: 'click', selectors: ['[data-testid="confirm-settings"]'] },
    ],
  },

  // ── C ────────────────────────────────────────────────────────────────
  {
    slug: 'C1-iframe-same-origin',
    category: 'C',
    title: 'C1 · Same-origin iframe',
    tagline: 'A button inside an iframe. Recorder injects into the iframe; actions carry a `frameId`.',
    whyHard:
      'A page-level recorder typically misses iframe events entirely. Skill Recorder runs the content script in every frame (`all_frames: true`) and tags actions with the originating frame so replay routes the EXECUTE_STEP back to the correct frame.',
    tryThis: ['Click the "Run inner action" button inside the embedded iframe.'],
    expected: [
      {
        type: 'click',
        frameId: '<non-zero>',
        selectors: ['[data-testid="inner-btn"]'],
      },
    ],
  },
  {
    slug: 'C2-iframe-cross-origin',
    category: 'C',
    title: 'C2 · Sensitive-field redaction',
    tagline: 'Password, phone, and credit-card inputs are auto-masked before they hit storage.',
    whyHard:
      'Cross-origin iframe injection means recording can technically see payment-card fields. The recorder detects them by type / autocomplete / name and redacts the value to `***` with `masked: true` — bytes never leave the page.',
    tryThis: [
      'Fill in your email, password, phone, card number, and CVC.',
      'Only the email should round-trip in cleartext.',
    ],
    expected: [
      { type: 'change', selectors: ['[data-testid="email"]'], value: '<cleartext>' },
      { type: 'change', selectors: ['[data-testid="pw"]'], masked: true, value: '***' },
      { type: 'change', selectors: ['[data-testid="phone"]'], masked: true },
      { type: 'change', selectors: ['[data-testid="cc"]'], masked: true },
      { type: 'change', selectors: ['[data-testid="cvc"]'], masked: true },
    ],
  },
  {
    slug: 'C3-shadow-dom',
    category: 'C',
    title: 'C3 · Shadow DOM piercing',
    tagline: '`<my-card>` Web Component with an open shadow root.',
    whyHard:
      '`document.querySelector` can\'t reach inside a shadow root. The recorder emits a `shadow` selector kind — JSON-encoded path of `{ host, inner }` segments — and the resolver walks `shadowRoot.querySelector` at each boundary.',
    tryThis: ['Click "Click me (shadow)".'],
    expected: [
      {
        type: 'click',
        selectors: [{ kind: 'shadow', value: '[{ host: "my-card", inner: "#inside-btn" }]' }],
      },
    ],
  },
  {
    slug: 'C4-multi-tab',
    category: 'C',
    title: 'C4 · Multi-tab (target="_blank")',
    tagline: 'Click a link that opens a second tab, then click on that new tab.',
    whyHard:
      'Most recorders are bound to a single tab. Skill Recorder tracks `chrome.tabs.onCreated` whose `openerTabId` is part of the session, emits a `switchTab` step, and routes subsequent actions to the new tab. Replay opens the new tab via `chrome.tabs.create` (synthetic clicks can\'t open popups).',
    tryThis: ['Click "Open second tab", then in the new tab click "Confirm on second tab".'],
    expected: [
      { type: 'click', selectors: ['[data-testid="open-second"]'] },
      { type: 'switchTab', targetTabIndex: 1 },
      { type: 'click', selectors: ['[data-testid="confirm-on-second"]'] },
    ],
  },

  // ── D ────────────────────────────────────────────────────────────────
  {
    slug: 'D1-dragdrop',
    category: 'D',
    title: 'D1 · HTML5 drag & drop',
    tagline: 'Drag a card from "Backlog" onto "In progress".',
    whyHard:
      'Drag is a sequence of `dragstart` → `dragover` → `drop` → `dragend` events with a shared `DataTransfer`. The recorder coalesces the chain into a single `drag` step capturing source + target + the DataTransfer types observed.',
    tryThis: ['Drag "Build prototype" from the left column onto the right column.'],
    expected: [
      {
        type: 'drag',
        dragFrom: { selectors: ['#task-2'], fingerprint: { attrs: { 'aria-label': 'Build prototype' } } },
        dragTo: { selectors: ['#dst'], fingerprint: { attrs: { 'aria-label': 'In progress' } } },
        dataTransferTypes: ['text/plain'],
      },
    ],
  },
  {
    slug: 'D2-file-upload',
    category: 'D',
    title: 'D2 · File upload',
    tagline: 'Pick a file. Recorder captures filename + size + mime — never the bytes.',
    whyHard:
      'Storing file bytes in a recording is a privacy disaster. Skill Recorder captures only metadata. At replay time, the lack of bytes surfaces as a structured `requiresFileInput` failure so the host (sidepanel) can ask the user for a path.',
    tryThis: ['Pick any small file from your computer.'],
    expected: [
      {
        type: 'change',
        inputType: 'file',
        fileMeta: [{ name: '<your-file>.txt', size: 1234, type: 'text/plain' }],
      },
    ],
  },
  {
    slug: 'D3-modifier-keys',
    category: 'D',
    title: 'D3 · Modifier-key chords',
    tagline: 'Cmd/Ctrl + K opens a palette; Ctrl + Enter submits.',
    whyHard:
      'A keydown for `k` alone is text-input noise (ignored). With `metaKey: true` it\'s a shortcut. The recorder keeps shortcuts and drops naked text keys, capturing the modifier state for replay.',
    tryThis: ['Click "Focus me first", then press Cmd-K (or Ctrl-K) — palette opens.'],
    expected: [
      { type: 'click', selectors: ['[data-testid="focus"]'] },
      { type: 'keyDown', key: 'k', modifiers: { meta: true } },
    ],
  },
  {
    slug: 'D4-contenteditable',
    category: 'D',
    title: 'D4 · contenteditable richtext',
    tagline: 'A div with `contenteditable="true"` — like a Notion/Slack composer.',
    whyHard:
      '`change` events never fire on contenteditable. The recorder hooks `input` + `compositionend`, debounces 300ms, and emits a single `change` step with the final `innerText` — same shape as a text input, just with `inputType: "contenteditable"`.',
    tryThis: ['Click the editor box and type some text. Click outside to blur.'],
    expected: [
      {
        type: 'change',
        inputType: 'contenteditable',
        selectors: ['[data-testid="notes-editor"]'],
        value: '<your text>',
      },
    ],
  },
  {
    slug: 'D5-clipboard',
    category: 'D',
    title: 'D5 · Clipboard (copy + paste)',
    tagline: 'Copy a value from one place, paste it into another.',
    whyHard:
      'Copy/paste are clipboard events with their own payload, not change events. Recorder captures the text/plain content. Replay can write to `navigator.clipboard` or dispatch a synthetic `ClipboardEvent` with a populated `DataTransfer`.',
    tryThis: ['Focus the source block (it auto-selects the text), Cmd-C. Click the target, Cmd-V.'],
    expected: [
      { type: 'copy', value: 'hello from D5 clipboard fixture' },
      { type: 'paste', selectors: ['[data-testid="dst"]'], value: 'hello from D5 clipboard fixture' },
    ],
  },
  {
    slug: 'D6-combobox',
    category: 'D',
    title: 'D6 · ARIA combobox',
    tagline: 'Type to filter, click an option.',
    whyHard:
      'Re-resolving the option element across replay is fragile — the filtered list may have a different number of items. Recorder enriches the click step with `comboboxContext` (combobox + optionText) so replay can fall back to "type the option text, ArrowDown until `aria-activedescendant` matches, Enter" if the direct click fails.',
    tryThis: ['Click the input, type "Den", click "Denmark".'],
    expected: [
      { type: 'click', selectors: ['#country-cb'] },
      { type: 'change', selectors: ['#country-cb'], value: 'Den' },
      { type: 'click', comboboxContext: { optionText: 'Denmark', combobox: { selectors: ['#country-cb'] } } },
    ],
  },

  // ── E ────────────────────────────────────────────────────────────────
  // E is exercised at the data layer (skill-build.ts) — no DOM playground page
  // is needed. The "What's hard" pitch lives in the index header instead.
];

export function scenarioBySlug(slug: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.slug === slug);
}
