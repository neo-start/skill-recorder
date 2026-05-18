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
  | 'paste';

export type SelectorKind = 'testid' | 'id' | 'aria' | 'text' | 'css' | 'xpath';

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

export type ExpectationKind = 'urlChange' | 'elementVisible' | 'valueMatch' | 'scrollMatch' | 'noop';

export interface Expectation {
  kind: ExpectationKind;
  /** for urlChange */
  targetUrl?: string;
  /** for elementVisible — the NEXT step's selectors (we expect it to appear after this step) */
  selectors?: SelectorEntry[];
  fingerprint?: ElementFingerprint;
  /** human-readable description for UI */
  description?: string;
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

export type SkillActionType = 'navigate' | 'click' | 'fill' | 'press_key' | 'scroll' | 'submit' | 'drag' | 'copy' | 'paste';

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

  expectation?: {
    description: string;
    urlMatch?: string;
    elementVisible?: SelectorEntry[];
  };
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
  startUrl: string;
  parameters: SkillParameter[];
  steps: SkillStep[];
  auth?: SkillAuthHint;
  sourceRecordingId: string;
  createdAt: number;
  updatedAt: number;
}

export type { eventWithTime };
