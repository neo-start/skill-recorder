import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { renderSkillAsMarkdown } from '../src/index';
import type { Skill } from '@skill-recorder/types';

const here = dirname(fileURLToPath(import.meta.url));
const fiverr = JSON.parse(
  readFileSync(resolve(here, 'fixtures/fiverr.skill.json'), 'utf-8'),
) as Skill;
const example = JSON.parse(
  readFileSync(resolve(here, 'fixtures/example.skill.json'), 'utf-8'),
) as Skill;

describe('renderSkillAsMarkdown — sourceVideo branch', () => {
  it('renders the AI-distilled disclaimer and source line for video skills', () => {
    const md = renderSkillAsMarkdown(fiverr);
    expect(md).toContain('Source: video — [How to find best freelancers on Fiverr]');
    expect(md).toContain('by Example Channel');
    expect(md).toContain('Distilled by AI from a public video transcript. Not human-verified.');
  });

  it('omits the source block when sourceVideo is absent', () => {
    const md = renderSkillAsMarkdown(example);
    expect(md).not.toContain('Source: video');
    expect(md).not.toContain('Distilled by AI');
  });

  it('omits the Precondition (auth) block when no startUrl', () => {
    const md = renderSkillAsMarkdown(fiverr);
    expect(md).not.toContain('## Precondition');
  });
});

describe('renderSkillAsMarkdown — guidance branch', () => {
  it('renders notes followed by a Checklist of criteria', () => {
    const md = renderSkillAsMarkdown(fiverr);
    expect(md).toContain('### 2. Apply trust filters before scanning results');
    expect(md).toContain('Tighten the candidate pool first');
    expect(md).toContain('**Checklist:**');
    expect(md).toContain("- Filter by 'Top Rated Seller' or 'Pro' badge");
  });

  it("includes the guidance-aware footer line when guidance steps are present", () => {
    const md = renderSkillAsMarkdown(fiverr);
    expect(md).toContain(
      'For steps without a concrete UI action, treat the checklist as criteria',
    );
  });

  it('omits the guidance footer line for procedural-only skills', () => {
    const md = renderSkillAsMarkdown(example);
    expect(md).not.toContain('treat the checklist as criteria');
  });
});

describe('renderSkillAsMarkdown — determinism', () => {
  it('produces byte-identical output across two calls on the same input', () => {
    const a = renderSkillAsMarkdown(fiverr);
    const b = renderSkillAsMarkdown(fiverr);
    expect(a).toBe(b);
  });

  it('matches a stable snapshot for the Fiverr fixture', () => {
    expect(renderSkillAsMarkdown(fiverr)).toMatchSnapshot();
  });
});
