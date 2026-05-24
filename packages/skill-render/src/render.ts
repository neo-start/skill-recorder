import type { SelectorEntry, Skill, SkillStep } from '@skill-recorder/types';

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
  const startUrl = skill.startUrl;
  // A pure-guidance skill has no concrete UI actions — none of `navigate`,
  // `click`, `fill`, `submit`, etc. Everything is judgment / checklists. For
  // these we drop the `browse`-CLI scaffolding from the frontmatter, the
  // domain badge, and the failure section, since none of it applies.
  const hasProcedural = skill.steps.some((s) => s.action !== 'guidance');
  const hasGuidance = skill.steps.some((s) => s.action === 'guidance');
  const domainBadge = skill.domain || hostnameOf(startUrl ?? '');

  lines.push('---');
  lines.push(`name: ${slug}`);
  lines.push(`description: ${oneLine(skill.description || skill.title)}`);
  if (hasProcedural) lines.push('allowed-tools: Bash');
  lines.push('---');
  lines.push('');

  lines.push(`# ${skill.title}`);
  lines.push('');
  if (skill.sourceVideo) {
    const sv = skill.sourceVideo;
    const channel = sv.channel ? ` by ${sv.channel}` : '';
    lines.push(`Source: video — [${sv.title}](${sv.url})${channel}`);
    lines.push('');
    lines.push('> Distilled by AI from a public video transcript. Not human-verified.');
    lines.push('');
  }
  if (skill.description && skill.description !== skill.title) {
    lines.push(skill.description);
    lines.push('');
  }
  if (domainBadge) {
    lines.push(`Domain: \`${domainBadge}\``);
    lines.push('');
  }

  if (skill.auth?.required && startUrl) {
    lines.push(...renderAuthPrecondition(skill, startUrl));
  }

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

  lines.push('## On failure');
  lines.push('');
  if (hasProcedural) {
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
    if (hasGuidance) {
      lines.push(
        '- For steps without a concrete UI action, treat the checklist as criteria to apply against the current page — not as commands to execute.',
      );
    }
  } else {
    // Pure-guidance skill: no UI commands, so the browse / selector advice
    // doesn't apply. One line is enough.
    lines.push(
      "- These criteria are heuristics, not strict rules — if one doesn't cleanly apply to the situation, note what made it ambiguous rather than forcing a verdict.",
    );
  }
  lines.push('');

  return lines.join('\n');
}

function renderAuthPrecondition(skill: Skill, startUrl: string): string[] {
  const domain = skill.domain || hostnameOf(startUrl) || 'site';
  const envVar = domainToEnvVar(domain);
  const out: string[] = [];
  out.push('## Precondition');
  out.push('');
  out.push(
    `This skill requires an authenticated \`${domain}\` session. ` +
      `It cannot log in for you — load a pre-authed Browserbase context first.`,
  );
  if (skill.auth?.reason) {
    out.push('');
    out.push(`> Detected at record time: ${skill.auth.reason}.`);
  }
  if (skill.auth?.authDomains?.length) {
    out.push(
      '> Auth providers touched: ' +
        skill.auth.authDomains.map((d) => `\`${d}\``).join(', ') +
        '.',
    );
  }
  out.push('');
  out.push(
    `Set \`${envVar}\` to a Browserbase context id that has \`${domain}\` already signed in, then:`,
  );
  out.push('');
  out.push(
    bashBlock(
      [
        `browse env remote`,
        `browse open ${startUrl} --context-id "$${envVar}"`,
        `# do NOT pass --persist here; replay should not mutate your saved auth state`,
      ].join('\n'),
    ),
  );
  out.push('');
  out.push('### First-time setup (one-off)');
  out.push('');
  out.push("If you don't have a context yet, create one and sign in interactively:");
  out.push('');
  out.push(
    bashBlock(
      [
        `# 1. Create an empty context on Browserbase`,
        `curl -sX POST https://api.browserbase.com/v1/contexts \\`,
        `  -H "X-BB-API-Key: $BROWSERBASE_API_KEY" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -d "{\\"projectId\\":\\"$BROWSERBASE_PROJECT_ID\\"}"`,
        `# → returns {"id": "ctx_xxx", ...}`,
        ``,
        `# 2. Open with --persist, sign in via the Browserbase live-view, then stop`,
        `export ${envVar}=ctx_xxx`,
        `browse env remote`,
        `browse open ${startUrl} --context-id "$${envVar}" --persist`,
        `# (manually sign in in the live-view tab)`,
        `browse stop  # persists cookies + storage back to the context`,
      ].join('\n'),
    ),
  );
  out.push('');
  out.push(
    'After that, every subsequent run with the same `--context-id` arrives already logged in (no `--persist`).',
  );
  out.push('');
  return out;
}

function domainToEnvVar(domain: string): string {
  const ascii = domain.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const head = ascii.split('_')[0] || 'site';
  return `${head.toUpperCase()}_CTX`;
}

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
      const isFile = step.fingerprint?.attrs?.['type'] === 'file';
      if (isFile) {
        if (top) {
          out.push(bashBlock(`browse upload ${quote(top.value)} ${quote(value)}`));
        } else {
          out.push(bashBlock(`browse snapshot\nbrowse upload <ref-of-file-input> ${quote(value)}`));
        }
      } else if (top) {
        out.push(bashBlock(`browse fill ${quote(top.value)} ${quote(value)}`));
      } else {
        out.push(bashBlock(`browse snapshot\nbrowse fill <selector-of-target> ${quote(value)}`));
      }
      if (hints.length) out.push(`Selector hints: ${hints.map((h) => `\`${h}\``).join(', ')}`);
      out.push('');
      return out;
    }

    case 'press_key': {
      const chord = formatChord(step.key ?? 'Enter', step.modifiers);
      return [bashBlock(`browse press ${quote(chord)}`), ''];
    }

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

    case 'copy': {
      const value = step.valueTemplate ?? '';
      return [
        bashBlock(
          [
            `# Place this text on the system clipboard for the next paste step.`,
            `browse clipboard write ${quote(renderValue(value))}`,
          ].join('\n'),
        ),
        '',
      ];
    }

    case 'paste': {
      const top = topSelector(step.selectors, /* cssOnly */ true);
      const value = renderValue(step.valueTemplate ?? '');
      const out: string[] = [];
      if (top) {
        out.push(
          bashBlock(
            [
              `# Paste into the resolved field. Most apps accept a plain fill;`,
              `# fall back to OS clipboard + Cmd+V if the page intercepts paste.`,
              `browse fill ${quote(top.value)} ${quote(value)}`,
            ].join('\n'),
          ),
        );
      } else {
        out.push(bashBlock(`browse snapshot\nbrowse fill <ref-of-target> ${quote(value)}`));
      }
      out.push('');
      return out;
    }

    case 'switchTab': {
      return [
        `> A new tab opens here. Switch to it before continuing — the next step expects to find the freshly-opened tab as the active surface.`,
        '',
      ];
    }

    case 'guidance': {
      const out: string[] = [];
      if (step.notes) {
        out.push(step.notes);
        out.push('');
      }
      if (step.criteria?.length) {
        out.push('**Checklist:**');
        out.push('');
        for (const c of step.criteria) out.push(`- ${c}`);
        out.push('');
      }
      return out;
    }

    case 'drag': {
      const out: string[] = [];
      const fromTop = topSelector(step.dragFrom?.selectors);
      const toTop = topSelector(step.dragTo?.selectors);
      const fromLabel =
        step.dragFrom?.fingerprint?.attrs?.['aria-label'] ||
        step.dragFrom?.fingerprint?.text ||
        fromTop?.value ||
        'source';
      const toLabel =
        step.dragTo?.fingerprint?.attrs?.['aria-label'] ||
        step.dragTo?.fingerprint?.text ||
        toTop?.value ||
        'target';
      out.push(`Drag from **${fromLabel}** onto **${toLabel}**.`);
      out.push(
        bashBlock(
          [
            '# `browse drag` is not yet a first-class verb; orchestrate with snapshot + drag.',
            'browse snapshot',
            `# Source ref matches: ${fromTop?.value ?? '(none)'}`,
            `# Target ref matches: ${toTop?.value ?? '(none)'}`,
            'browse drag <source-ref> <target-ref>',
          ].join('\n'),
        ),
      );
      out.push('');
      return out;
    }
  }
}

function defaultIntent(step: SkillStep): string {
  switch (step.action) {
    case 'navigate':
      return `Navigate to ${step.url ?? ''}`;
    case 'click':
      return `Click ${step.fingerprint?.text || topSelector(step.selectors)?.value || 'element'}`;
    case 'fill':
      return `Fill ${step.fingerprint?.text || step.fingerprint?.tag || 'field'} with ${step.valueTemplate}`;
    case 'press_key':
      return `Press ${formatChord(step.key ?? '', step.modifiers)}`;
    case 'scroll':
      return `Scroll to (${step.scrollX ?? 0}, ${step.scrollY ?? 0})`;
    case 'submit':
      return 'Submit the form';
    case 'drag': {
      const from = step.dragFrom?.fingerprint?.text || step.dragFrom?.fingerprint?.tag || 'source';
      const to = step.dragTo?.fingerprint?.text || step.dragTo?.fingerprint?.tag || 'target';
      return `Drag ${from} onto ${to}`;
    }
    case 'copy':
      return `Copy "${(step.valueTemplate ?? '').slice(0, 32)}" to clipboard`;
    case 'paste': {
      const label = step.fingerprint?.attrs?.['aria-label'] || step.fingerprint?.text || step.fingerprint?.tag || 'target';
      return `Paste into ${label}`;
    }
    case 'switchTab':
      return 'Switch to newly-opened tab';
    case 'guidance':
      return step.notes
        ? truncateOneLine(step.notes, 64)
        : 'Apply the checklist below';
  }
}

function truncateOneLine(s: string, n: number): string {
  const flat = s.replace(/\s+/g, ' ').trim();
  return flat.length <= n ? flat : flat.slice(0, n - 1) + '…';
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
  // Normalise both `${name}` (legacy) and `{{name}}` (canonical) into `{{name}}`.
  return template.replace(/\$\{(\w+)\}/g, '{{$1}}');
}

function formatChord(key: string, modifiers?: SkillStep['modifiers']): string {
  if (!modifiers) return key;
  const parts: string[] = [];
  if (modifiers.meta) parts.push('Meta');
  if (modifiers.ctrl) parts.push('Control');
  if (modifiers.alt) parts.push('Alt');
  if (modifiers.shift) parts.push('Shift');
  parts.push(key);
  return parts.join('+');
}

function bashBlock(body: string): string {
  return '```bash\n' + body + '\n```';
}

function quote(s: string): string {
  if (/^[\w./:?&=#%@-]+$/.test(s)) return s;
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
