import type { SelectorEntry, Skill, SkillStep } from './types';

/**
 * Render a Skill as a Claude Code Skill markdown document.
 * Drop the result into `.claude/skills/<name>/SKILL.md` or `~/.claude/skills/...`
 * The body is written for agents that have a `browse` CLI available
 * (https://github.com/browserbase/skills) but the natural-language intents +
 * selector hints work for any browser-driving agent.
 */
export function renderSkillAsMarkdown(skill: Skill): string {
  const lines: string[] = [];
  const slug = slugify(skill.title);

  // ─── frontmatter ───
  lines.push('---');
  lines.push(`name: ${slug}`);
  lines.push(`description: ${oneLine(skill.description || skill.title)}`);
  lines.push('allowed-tools: Bash');
  lines.push('---');
  lines.push('');

  // ─── title + intro ───
  lines.push(`# ${skill.title}`);
  lines.push('');
  if (skill.description && skill.description !== skill.title) {
    lines.push(skill.description);
    lines.push('');
  }
  lines.push(`Domain: \`${skill.domain || hostnameOf(skill.startUrl) || 'unknown'}\``);
  lines.push('');

  // ─── parameters ───
  if (skill.parameters.length) {
    lines.push('## Parameters');
    lines.push('');
    lines.push('Ask the user for any of these not already provided:');
    lines.push('');
    for (const p of skill.parameters) {
      const example = p.example ? ` (example: \`${p.example}\`)` : '';
      lines.push(`- \`${p.name}\` — ${p.description}${example}`);
    }
    lines.push('');
  }

  // ─── steps ───
  lines.push('## Steps');
  lines.push('');
  skill.steps.forEach((step, idx) => {
    lines.push(`### ${idx + 1}. ${step.intent || defaultIntent(step)}`);
    lines.push('');
    lines.push(...renderStepBody(step));
    if (step.expectation?.description) {
      lines.push(`**Expected:** ${step.expectation.description}`);
      lines.push('');
    }
  });

  // ─── tips ───
  lines.push('## On failure');
  lines.push('');
  lines.push(
    '- If a `browse` command misses (selector resolves to nothing), run `browse snapshot` and re-locate the target by aria-label, role, or visible text.',
  );
  lines.push(
    '- Each step lists multiple selector hints; try them in order. If none match, fall back to the **element fingerprint** in the step description and search the snapshot text.',
  );
  lines.push(
    '- If the page state diverges from the `Expected` line, do not blindly continue — re-snapshot, understand the new state, and adapt.',
  );
  lines.push(
    '- Steps marked with ⚠️ (dynamic list items) were recorded against a specific result. Choose an equivalent item from the current page rather than reproducing the recorded selector verbatim.',
  );
  lines.push('');

  return lines.join('\n');
}

/**
 * Heuristic: a click whose top selector chain implies an item inside a
 * search-results / product grid / generic list container. When that's true,
 * the recorded selector is parameter-sensitive and almost never reusable
 * across different inputs, so we surface a warning in the rendered skill.
 */
function looksLikeDynamicListItem(step: SkillStep): boolean {
  const top = topSelector(step.selectors)?.value || '';
  const hintBag = (step.selectors || []).map((s) => s.value).join(' ');
  if (/:nth-of-type\(|:nth-child\(/i.test(top)) return true;
  if (
    /\b(s-product-image|s-card-container|puis-card|s-result-item|search-result|result-item|gridcell|list-item|product-card|product-tile|tile-content|productCard|card-container)\b/i.test(
      hintBag,
    )
  ) {
    return true;
  }
  // xpath with deep positional indexing into the body — likely a list item position
  const xpath = (step.selectors || []).find((s) => s.kind === 'xpath')?.value || '';
  if (xpath) {
    const positional = (xpath.match(/\[\d+\]/g) || []).length;
    if (positional >= 6) return true;
  }
  return false;
}

function renderStepBody(step: SkillStep): string[] {
  switch (step.action) {
    case 'navigate':
      return [bashBlock(`browse open ${quote(step.url ?? '')}`), ''];

    case 'click': {
      const top = topSelector(step.selectors);
      const hints = otherSelectorHints(step.selectors);
      const desc = describeTarget(step);
      const dynamic = looksLikeDynamicListItem(step);
      const out: string[] = [];
      if (desc) out.push(`Target: ${desc}`);
      if (dynamic) {
        out.push(
          `> ⚠️ This appears to click a specific item from a dynamic list (e.g. a search result). ` +
            `The exact element will likely be missing when replayed with different parameters — ` +
            `re-snapshot the page and pick an appropriate item by relevance instead of trusting the recorded selector.`,
        );
        out.push('');
      }
      if (top) {
        out.push(
          bashBlock(
            [
              `# Locate the element in the page.`,
              `browse snapshot`,
              `# Click using the ref from the snapshot output (look for the element matching:`,
              `#   selector: ${top.value}`,
              `# )`,
              `browse click <ref-from-snapshot>`,
            ].join('\n'),
          ),
        );
      } else {
        out.push(bashBlock(`browse snapshot\nbrowse click <ref-from-snapshot>`));
      }
      if (hints.length) out.push(`Selector hints: ${hints.map((h) => `\`${h}\``).join(', ')}`);
      out.push('');
      return out;
    }

    case 'fill': {
      const top = topSelector(step.selectors, /* cssOnly */ true);
      const hints = otherSelectorHints(step.selectors);
      const desc = describeTarget(step);
      const out: string[] = [];
      if (desc) out.push(`Target: ${desc}`);
      const value = renderValue(step.valueTemplate ?? '');
      if (top) {
        out.push(bashBlock(`browse fill ${quote(top.value)} ${quote(value)}`));
      } else {
        out.push(bashBlock(`browse snapshot\nbrowse fill <selector-of-target> ${quote(value)}`));
      }
      if (hints.length) out.push(`Selector hints: ${hints.map((h) => `\`${h}\``).join(', ')}`);
      out.push('');
      return out;
    }

    case 'press_key':
      return [bashBlock(`browse press ${quote(step.key ?? 'Enter')}`), ''];

    case 'scroll':
      return [
        bashBlock(`browse scroll 0 0 0 ${step.scrollY ?? 0}  # scroll Y to ${step.scrollY ?? 0}`),
        '',
      ];

    case 'submit': {
      const top = topSelector(step.selectors);
      return [
        top
          ? `Submit the form. Selector hint: \`${top.value}\`.`
          : 'Submit the form (find the submit button via snapshot).',
        bashBlock(`browse snapshot\nbrowse click <ref-of-submit-button>`),
        '',
      ];
    }
  }
}

// ─── helpers ───

function defaultIntent(step: SkillStep): string {
  switch (step.action) {
    case 'navigate':
      return `Navigate to ${step.url ?? ''}`;
    case 'click':
      return `Click ${step.fingerprint?.text || topSelector(step.selectors)?.value || 'element'}`;
    case 'fill':
      return `Fill ${step.fingerprint?.text || step.fingerprint?.tag || 'field'} with ${step.valueTemplate}`;
    case 'press_key':
      return `Press ${step.key}`;
    case 'scroll':
      return `Scroll to (${step.scrollX ?? 0}, ${step.scrollY ?? 0})`;
    case 'submit':
      return 'Submit the form';
  }
}

function topSelector(
  selectors: SelectorEntry[] | undefined,
  cssOnly = false,
): SelectorEntry | null {
  if (!selectors?.length) return null;
  const sorted = [...selectors].sort((a, b) => b.score - a.score);
  if (cssOnly) {
    const css = sorted.find((s) => s.kind === 'css' || s.kind === 'id' || s.kind === 'testid');
    if (css) return css;
  }
  return sorted[0];
}

function otherSelectorHints(selectors: SelectorEntry[] | undefined): string[] {
  if (!selectors?.length) return [];
  const sorted = [...selectors].sort((a, b) => b.score - a.score);
  return sorted.slice(1, 4).map((s) => `${s.kind}: ${s.value}`);
}

function describeTarget(step: SkillStep): string {
  const fp = step.fingerprint;
  if (!fp) return '';
  const parts: string[] = [];
  if (fp.text) parts.push(`text "${fp.text}"`);
  if (fp.role) parts.push(`role ${fp.role}`);
  if (fp.attrs && fp.attrs['aria-label']) parts.push(`aria-label "${fp.attrs['aria-label']}"`);
  parts.push(`tag <${fp.tag}>`);
  return parts.join(', ');
}

function renderValue(template: string): string {
  // ${param} → {{param}} (Claude-Code-friendlier templating)
  return template.replace(/\$\{(\w+)\}/g, '{{$1}}');
}

function bashBlock(body: string): string {
  return '```bash\n' + body + '\n```';
}

function quote(s: string): string {
  if (/^[\w./:?&=#%@-]+$/.test(s)) return s;
  // shell-safe single-quote escape
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'untitled-skill'
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

function oneLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}
