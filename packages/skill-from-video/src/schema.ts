import { z } from 'zod';

// What we ask the LLM to emit. The wrapping Skill (id, createdAt, sourceVideo,
// …) is filled in by the orchestrator, not the model. Selectors are also not
// part of the model's responsibility — at run time the browse agent resolves
// them against a live snapshot. Keeping the schema tight pays for itself in
// fewer hallucinated fields and faster validation.

const SelectorEntry = z.object({
  kind: z.enum(['testid', 'id', 'aria', 'text', 'css', 'xpath', 'shadow']),
  value: z.string(),
  score: z.number(),
});

const Parameter = z.object({
  name: z.string().min(1),
  type: z.literal('string'),
  description: z.string(),
  example: z.string().optional(),
});

const NavigateStep = z.object({
  id: z.string(),
  intent: z.string(),
  action: z.literal('navigate'),
  url: z.string(),
});

const ClickStep = z.object({
  id: z.string(),
  intent: z.string(),
  action: z.literal('click'),
  selectors: z.array(SelectorEntry).default([]),
});

const FillStep = z.object({
  id: z.string(),
  intent: z.string(),
  action: z.literal('fill'),
  selectors: z.array(SelectorEntry).default([]),
  valueTemplate: z.string().optional(),
});

const PressKeyStep = z.object({
  id: z.string(),
  intent: z.string(),
  action: z.literal('press_key'),
  key: z.string(),
});

const SubmitStep = z.object({
  id: z.string(),
  intent: z.string(),
  action: z.literal('submit'),
  selectors: z.array(SelectorEntry).default([]),
});

const GuidanceStep = z.object({
  id: z.string(),
  intent: z.string(),
  action: z.literal('guidance'),
  notes: z.string().optional(),
  criteria: z.array(z.string()).default([]),
});

// Plain union (not discriminated) — `.refine()` would have wrapped GuidanceStep
// in ZodEffects, which kills discriminated-union inference. The cross-field
// invariant ("guidance needs notes or criteria") is enforced after parse.
const Step = z.union([NavigateStep, ClickStep, FillStep, PressKeyStep, SubmitStep, GuidanceStep]);

export const LlmSkillSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    domain: z.string(),
    startUrl: z.string().optional(),
    parameters: z.array(Parameter).default([]),
    steps: z.array(Step).min(1).max(20),
  })
  .superRefine((skill, ctx) => {
    skill.steps.forEach((s, i) => {
      if (s.action === 'guidance' && !s.notes && s.criteria.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['steps', i],
          message: 'guidance step needs either `notes` or at least one `criteria`',
        });
      }
    });
  });

export type LlmSkill = z.infer<typeof LlmSkillSchema>;

export const LlmErrorSchema = z.object({
  error: z.literal('insufficient_content'),
  reason: z.string(),
});
export type LlmError = z.infer<typeof LlmErrorSchema>;
