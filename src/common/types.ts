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
  | 'submit';

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

  // keyDown / keyUp
  key?: string;
  code?: string;

  // scroll
  scrollX?: number;
  scrollY?: number;
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

export type SkillActionType = 'navigate' | 'click' | 'fill' | 'press_key' | 'scroll' | 'submit';

export interface SkillParameter {
  name: string;             // identifier, used as ${name}
  type: 'string';
  description: string;
  example?: string;
}

export interface SkillStep {
  id: string;
  intent: string;           // human / agent-readable instruction
  action: SkillActionType;

  // Element targeting (carried from the recording)
  selectors?: SelectorEntry[];
  fingerprint?: ElementFingerprint;

  // navigate
  url?: string;

  // fill — literal value or "${paramName}" template
  valueTemplate?: string;

  // press_key
  key?: string;

  // scroll
  scrollX?: number;
  scrollY?: number;

  // Optional verification hint (derived at distill time from the next step)
  expectation?: {
    description: string;
    urlMatch?: string;
    elementVisible?: SelectorEntry[];
  };
}

export interface SkillAuthHint {
  /** Whether the skill needs a pre-authenticated session to run. */
  required: boolean;
  /** Human-readable reason why we think auth is needed (password input seen,
   * redirect to known auth provider, etc.). */
  reason?: string;
  /** Auth-provider hostnames touched during recording (logto.app, auth0.com…). */
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
  /** If present and `required`, the renderer emits a `## Precondition` block. */
  auth?: SkillAuthHint;
  sourceRecordingId: string;
  createdAt: number;
  updatedAt: number;
}

export type { eventWithTime };
