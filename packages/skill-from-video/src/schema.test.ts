import { describe, expect, it } from 'vitest';
import { LlmSkillSchema } from './schema';

const baseSkill = {
  title: 'Find a high-quality freelancer on Fiverr',
  description: 'Pick a freelancer based on signals not price.',
  domain: 'fiverr.com',
  steps: [
    { id: 's1', intent: 'open Fiverr', action: 'navigate', url: 'https://fiverr.com' },
  ],
};

describe('LlmSkillSchema', () => {
  it('accepts a minimal procedural skill', () => {
    const result = LlmSkillSchema.safeParse(baseSkill);
    expect(result.success).toBe(true);
  });

  it('defaults parameters to []', () => {
    const result = LlmSkillSchema.parse(baseSkill);
    expect(result.parameters).toEqual([]);
  });

  it('accepts a guidance step with notes', () => {
    const result = LlmSkillSchema.safeParse({
      ...baseSkill,
      steps: [
        { id: 's1', intent: 'check signals', action: 'guidance', notes: 'look for X' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a guidance step with criteria but no notes', () => {
    const result = LlmSkillSchema.safeParse({
      ...baseSkill,
      steps: [
        {
          id: 's1',
          intent: 'check signals',
          action: 'guidance',
          criteria: ['has 100+ reviews', 'response time < 1h'],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a guidance step with neither notes nor criteria', () => {
    const result = LlmSkillSchema.safeParse({
      ...baseSkill,
      steps: [{ id: 's1', intent: 'empty', action: 'guidance' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map((i) => i.message).join(' ');
      expect(msgs).toMatch(/notes.*criteria/i);
    }
  });

  it('rejects a guidance step with empty criteria array and no notes', () => {
    const result = LlmSkillSchema.safeParse({
      ...baseSkill,
      steps: [{ id: 's1', intent: 'empty', action: 'guidance', criteria: [] }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a navigate step missing url', () => {
    const result = LlmSkillSchema.safeParse({
      ...baseSkill,
      steps: [{ id: 's1', intent: 'go', action: 'navigate' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty steps array', () => {
    const result = LlmSkillSchema.safeParse({ ...baseSkill, steps: [] });
    expect(result.success).toBe(false);
  });

  it('accepts mixed procedural + guidance steps', () => {
    const result = LlmSkillSchema.safeParse({
      ...baseSkill,
      steps: [
        { id: 's1', intent: 'open', action: 'navigate', url: 'https://x.com' },
        { id: 's2', intent: 'judge', action: 'guidance', notes: 'pick well', criteria: ['a', 'b'] },
        { id: 's3', intent: 'click', action: 'click' },
      ],
    });
    expect(result.success).toBe(true);
  });
});
