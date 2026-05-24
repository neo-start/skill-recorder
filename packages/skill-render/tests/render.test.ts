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

describe('renderSkillAsMarkdown — pure-guidance branch', () => {
  const pureGuidance: Skill = {
    id: 'skill_pure_guidance_test',
    title: 'Do the meta thing',
    description: 'A skill with only guidance steps — no UI to drive.',
    domain: '',
    parameters: [],
    steps: [
      {
        id: 's1',
        intent: 'Apply judgment',
        action: 'guidance',
        notes: 'Decide carefully.',
        criteria: ['ask about past behavior', 'avoid hypotheticals'],
      },
      {
        id: 's2',
        intent: 'Score the result',
        action: 'guidance',
        criteria: ['cost', 'frequency', 'authority'],
      },
    ],
    sourceVideo: {
      url: 'https://www.youtube.com/watch?v=AAAAAAAAAAA',
      videoId: 'AAAAAAAAAAA',
      title: 'A talk',
      fetchedAt: '2026-05-24T00:00:00.000Z',
    },
    createdAt: 0,
    updatedAt: 0,
  };

  it('omits the allowed-tools frontmatter line', () => {
    const md = renderSkillAsMarkdown(pureGuidance);
    // The Bash tool only makes sense when there are `browse` commands to run.
    expect(md).not.toContain('allowed-tools');
  });

  it('omits the Domain badge when neither domain nor a usable startUrl is set', () => {
    const md = renderSkillAsMarkdown(pureGuidance);
    expect(md).not.toMatch(/^Domain:/m);
    expect(md).not.toContain('`unknown`');
  });

  it('keeps the Domain badge when a domain is set even without startUrl', () => {
    const md = renderSkillAsMarkdown({ ...pureGuidance, domain: 'example.com' });
    expect(md).toContain('Domain: `example.com`');
  });

  it('replaces the browse/selector "On failure" boilerplate with a single heuristics line', () => {
    const md = renderSkillAsMarkdown(pureGuidance);
    // None of the procedural failure-mode hints should leak in
    expect(md).not.toContain('`browse` command');
    expect(md).not.toContain('selector hints');
    expect(md).not.toContain('⚠️');
    expect(md).not.toContain('`Expected` line');
    // But there's still a section pointing out heuristic application
    expect(md).toContain('## On failure');
    expect(md).toContain('heuristics, not strict rules');
  });

  it('keeps procedural boilerplate when at least one step is procedural', () => {
    const mixed: Skill = {
      ...pureGuidance,
      steps: [
        { id: 'n', intent: 'open', action: 'navigate', url: 'https://x.com' },
        ...pureGuidance.steps,
      ],
    };
    const md = renderSkillAsMarkdown(mixed);
    expect(md).toContain('allowed-tools: Bash');
    expect(md).toContain('`browse` command');
    // The guidance-aware footer still shows up because there are guidance steps too
    expect(md).toContain('treat the checklist as criteria');
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
