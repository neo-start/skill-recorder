import type { eventWithTime } from '@rrweb/types';

export type RecordingStatus = 'recording' | 'completed' | 'failed';

export interface RecordingMeta {
  id: string;
  title: string;
  url: string;
  startTime: number;
  endTime: number | null;
  eventCount: number;
  actionCount: number;
  byteSize: number;
  status: RecordingStatus;
  viewport: { width: number; height: number };
}

export interface RecordingChunk {
  id?: number;
  recordingId: string;
  seq: number;
  events: eventWithTime[];
}

// ─── Action log (Chrome DevTools Recorder–compatible + extensions) ───

export type ActionStepType =
  | 'navigate'
  | 'click'
  | 'change'
  | 'keyDown'
  | 'keyUp'
  | 'scroll'
  | 'submit'
  | 'drag'
  | 'copy'
  | 'paste'
  | 'switchTab';

export type SelectorKind = 'testid' | 'id' | 'aria' | 'text' | 'css' | 'xpath' | 'shadow';

export interface SelectorEntry {
  kind: SelectorKind;
  value: string;
  /** 0-100, higher = more stable. Used to pick best selector at replay. */
  score: number;
}

export interface ElementFingerprint {
  tag: string;
  role: string | null;
  text: string;
  attrs: Record<string, string>;
  /**
   * Index among siblings sharing this exact fingerprint at record time.
   * Used as a tiebreaker when multiple visually-identical candidates exist
   * (e.g. n-th row of a table). Undefined when there was a unique match.
   */
  fingerprintIndex?: number;
  /**
   * Stable identifier extracted from `data-i18n-key` / `aria-label-key`
   * attributes (or an ancestor with same), preferred over visible text
   * when matching across locales. Undefined for sites without such hooks.
   */
  i18nKey?: string;
}

export interface ActionStep {
  id?: number;
  recordingId: string;
  seq: number;
  type: ActionStepType;
  /** ms epoch; aligns with rrweb timestamps. */
  timestamp: number;
  /** URL at the moment the action fired. */
  url: string;
  /**
   * Frame the action originated in (Chrome webNavigation frameId). 0 / absent
   * means the main document. Subframes carry their numeric frameId so replay
   * can route EXECUTE_STEP back to the same frame.
   */
  frameId?: number;

  // navigate
  navigateUrl?: string;

  // pointer / form / keyboard targets
  selectors?: SelectorEntry[];
  fingerprint?: ElementFingerprint;
  offsetX?: number;
  offsetY?: number;

  // change
  value?: string;
  inputType?: string;
  masked?: boolean;
  /**
   * For `change` steps on `<input type="file">`. Recorder captures metadata
   * only — never the file contents. Replay cannot synthesize a File without
   * a user gesture, so it surfaces a structured "requiresFileInput" failure
   * that the sidepanel/host resolves.
   */
  fileMeta?: Array<{ name: string; size: number; type: string; lastModified?: number }>;

  // keyDown / keyUp
  key?: string;
  code?: string;
  /** Modifier-key state captured at the moment of the keydown. */
  modifiers?: {
    meta?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  };

  // scroll
  scrollX?: number;
  scrollY?: number;

  // switchTab (C4) — logical tab index in the order tabs were tracked by the
  // recording session, NOT a chrome tab id. Replay maps logical → live tabId.
  targetTabIndex?: number;
  targetTabUrl?: string;

  // drag (D1)
  /** Source element of the drag. `selectors`/`fingerprint` describe the same thing. */
  dragFrom?: {
    selectors: SelectorEntry[];
    fingerprint: ElementFingerprint;
    offsetX?: number;
    offsetY?: number;
  };
  /** Drop target. */
  dragTo?: {
    selectors: SelectorEntry[];
    fingerprint: ElementFingerprint;
    offsetX?: number;
    offsetY?: number;
  };
  /** DataTransfer.types observed during the drag (`text/plain`, `text/html`, …). */
  dataTransferTypes?: string[];

  // ARIA combobox enrichment (D6) — present on `click` steps that land on a
  // role=option inside a role=listbox controlled by an aria-combobox input.
  // Replay can then fall back to "focus combobox, type, ArrowDown, Enter" if
  // the recorded option element no longer exists at the same position.
  comboboxContext?: {
    combobox: {
      selectors: SelectorEntry[];
      fingerprint: ElementFingerprint;
    };
    optionText: string;
    optionValue?: string;
  };

  /**
   * Captured when the click/fill/select target was inside a <tr> or
   * [role="row"]. Lets the renderer output row-text-matched XPath instead
   * of relying on the target's per-render id (Knockout/Magento generate
   * fresh ids every page load; recorded ids won't resolve at replay).
   */
  rowContext?: {
    rowSelectors: SelectorEntry[];     // for the <tr> / [role="row"] ancestor
    rowFingerprint: ElementFingerprint;
    rowText: string;                   // first ~120 chars of outerText (normalised whitespace)
    cellLocator: string;               // relative CSS inside the row, e.g. 'input[type="checkbox"]'
  };
}

// ─── Replay session ───

export type ReplayStatus =
  | 'idle'
  | 'starting'
  | 'navigating'
  | 'waitingForContent'
  | 'executing'
  | 'verifying'
  | 'retrying'
  | 'success'
  | 'failed'
  | 'cancelled';

export type ExpectationKind =
  | 'urlChange'
  | 'elementVisible'
  | 'valueMatch'
  | 'scrollMatch'
  | 'noop'
  // ── Phase 3 (B class) async/timing kinds ───────────────────────────────
  /** Wait until no `resource` PerformanceEntry has been observed for N ms. */
  | 'networkIdle'
  /** Wait until a specific element's attribute reaches an expected value. */
  | 'attributeChange'
  /** Wait until the DOM has been stable (no mutations on body) for N ms. */
  | 'domStable';

export interface Expectation {
  kind: ExpectationKind;
  /** for urlChange */
  targetUrl?: string;
  /** for elementVisible — the NEXT step's selectors (we expect it to appear after this step) */
  selectors?: SelectorEntry[];
  fingerprint?: ElementFingerprint;
  /** human-readable description for UI */
  description?: string;
  /** for `networkIdle` — defaults to 500ms in verifier when omitted. */
  networkIdleMs?: number;
  /** for `domStable` — defaults to 400ms when omitted. */
  domStableMs?: number;
  /** for `attributeChange` */
  attribute?: {
    selectors: SelectorEntry[];
    fingerprint?: ElementFingerprint;
    attr: string;
    expectedValue?: string;
  };
}

export interface ReplayState {
  recordingId: string | null;
  tabId: number | null;
  totalSteps: number;
  stepIndex: number;
  status: ReplayStatus;
  currentStep: ActionStep | null;
  currentAttempt: number; // 0 = first try; 1+ = retries
  maxAttempts: number;
  expectation: Expectation | null;
  failure: { stepIndex: number; reason: string } | null;
}

// ─── Skill (distilled, reusable) ───

export type SkillActionType =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'select'
  | 'press_key'
  | 'scroll'
  | 'submit'
  | 'drag'
  | 'copy'
  | 'paste'
  | 'switchTab'
  | 'guidance';

export interface SkillParameter {
  name: string;
  type: 'string';
  description: string;
  example?: string;
}

export interface SkillStep {
  id: string;
  intent: string;
  action: SkillActionType;

  selectors?: SelectorEntry[];
  fingerprint?: ElementFingerprint;

  url?: string;
  valueTemplate?: string;
  /**
   * Only meaningful for action='fill'. true → renderer emits the CLI's
   * default Enter-pressing behaviour (used for search boxes / single-input
   * forms where Enter == submit). Missing or false → renderer emits
   * `browse fill --no-press-enter ...`, which is the safe default for
   * multi-field forms — pressing Enter mid-fill prematurely submits.
   */
  pressEnter?: boolean;
  /**
   * Optional human-authored note explaining *why* this step is necessary or
   * how it should be interpreted. Surfaced into the rendered SKILL.md as a
   * `> **Note from recorder**: …` blockquote between the step intent and
   * the bash block. Used to override agent over-judgment on steps whose
   * meaning isn't obvious from the action alone (e.g. "approve this row
   * even if the text looks neutral").
   */
  note?: string;
  key?: string;
  modifiers?: { meta?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean };
  scrollX?: number;
  scrollY?: number;

  /** Drag-and-drop: source/target descriptors carried through to the renderer. */
  dragFrom?: {
    selectors: SelectorEntry[];
    fingerprint: ElementFingerprint;
  };
  dragTo?: {
    selectors: SelectorEntry[];
    fingerprint: ElementFingerprint;
  };

  /**
   * Captured when the click/fill/select target was inside a <tr> or
   * [role="row"]. Lets the renderer output row-text-matched XPath instead
   * of relying on the target's per-render id (Knockout/Magento generate
   * fresh ids every page load; recorded ids won't resolve at replay).
   */
  rowContext?: {
    rowSelectors: SelectorEntry[];     // for the <tr> / [role="row"] ancestor
    rowFingerprint: ElementFingerprint;
    rowText: string;                   // first ~120 chars of outerText (normalised whitespace)
    cellLocator: string;               // relative CSS inside the row, e.g. 'input[type="checkbox"]'
  };

  // ── guidance-only fields ──
  /**
   * For `guidance` steps: a checklist of judgment criteria — good signals,
   * red flags, or things to verify on the current page. No selector / url.
   */
  criteria?: string[];
  /**
   * For `guidance` steps: free-text explanation (e.g. "filter by Top Rated
   * Seller, sort by review count desc"). Rendered above the criteria list.
   */
  notes?: string;

  expectation?: {
    description: string;
    urlMatch?: string;
    elementVisible?: SelectorEntry[];
  };
}

/**
 * Provenance for a Skill distilled from a YouTube video. Mutually exclusive
 * with `sourceRecordingId` on `Skill` — a skill is either recorded or
 * distilled, never both.
 */
export interface SkillVideoSource {
  url: string;
  videoId: string;
  title: string;
  channel?: string;
  durationSec?: number;
  /** ISO 8601 timestamp when the transcript was fetched. */
  fetchedAt: string;
}

export interface SkillAuthHint {
  required: boolean;
  reason?: string;
  authDomains?: string[];
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  domain: string;
  /**
   * Optional: video-distilled skills may have no fixed starting URL (the
   * guidance applies wherever the user happens to be). The recording path
   * still always sets it.
   */
  startUrl?: string;
  parameters: SkillParameter[];
  steps: SkillStep[];
  auth?: SkillAuthHint;
  /** Set when the Skill was distilled from an rrweb recording. */
  sourceRecordingId?: string;
  /** Set when the Skill was distilled from a YouTube video. */
  sourceVideo?: SkillVideoSource;
  createdAt: number;
  updatedAt: number;
}

export type { eventWithTime };
