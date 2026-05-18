// Headless skill distillation. Calls the pure `skill-build` module directly
// — no DOM, no extension APIs, no React — so tests can assert on the same
// transformation users see in SaveAsSkillDialog.

import type { ActionStep, RecordingMeta, Skill, SkillAuthHint } from '@skill-recorder/types';
import {
  buildDrafts,
  buildSkill as buildSkillPure,
  detectAuthSignals,
} from '../../src/common/skill-build';

export interface DistillResult {
  skill: Skill;
  authHint: SkillAuthHint;
  rawActionCount: number;
  keptStepCount: number;
}

export interface DistillOptions {
  title?: string;
  description?: string;
  /** Override authHint.required (e.g., for tests of auth-detection independence). */
  forceAuth?: boolean;
}

export function distill(
  recording: RecordingMeta,
  actions: ActionStep[],
  opts: DistillOptions = {},
): DistillResult {
  const drafts = buildDrafts(actions);
  const authHint = detectAuthSignals(actions, recording.url);
  if (opts.forceAuth !== undefined) authHint.required = opts.forceAuth;
  const skill = buildSkillPure({
    title: opts.title ?? recording.title ?? 'Untitled',
    description: opts.description ?? '',
    drafts,
    recording,
    authHint,
  });
  return {
    skill,
    authHint,
    rawActionCount: actions.length,
    keptStepCount: skill.steps.length,
  };
}
