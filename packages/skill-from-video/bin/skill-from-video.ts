// CLI entrypoint for offline / iteration use. Mirrors the M2 Worker contract
// but skips network plumbing — calls the package directly.
//
//   ANTHROPIC_API_KEY=sk-... skill-from-video <youtube-url> \
//     --out ./skills/my-skill.SKILL.md
//
// Writes both the SKILL.md (rendered) and the raw skill JSON next to it,
// so prompt iteration can diff the JSON without re-running distill.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { distillVideoToSkill, DistillError } from '../src/index';
import { createAnthropicBackend } from '../src/backend-anthropic';
import { createClaudeCliBackend } from '../src/backend-claude-cli';
import { renderSkillAsMarkdown } from '@skill-recorder/render';

interface Args {
  url: string;
  out: string | null;
  model: string | null;
  backend: 'claude-cli' | 'anthropic-sdk';
}

function parseArgs(argv: string[]): Args {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') usage();
  let url: string | null = null;
  let out: string | null = null;
  let model: string | null = null;
  let backend: Args['backend'] = 'claude-cli';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') out = argv[++i] ?? usage('--out needs a path');
    else if (a === '--model') model = argv[++i] ?? usage('--model needs a value');
    else if (a === '--backend') {
      const v = argv[++i] ?? usage('--backend needs a value');
      if (v !== 'claude-cli' && v !== 'anthropic-sdk') usage(`unknown backend: ${v}`);
      backend = v;
    } else if (!a.startsWith('-')) {
      if (url) usage(`unexpected positional arg: ${a}`);
      url = a;
    } else usage(`unknown argument: ${a}`);
  }
  if (!url) usage('missing video URL');
  return { url, out, model, backend };
}

function usage(extra?: string): never {
  if (extra) process.stderr.write(`error: ${extra}\n\n`);
  process.stderr.write(
    [
      'skill-from-video <youtube-url> [--out <path>] [--model <name>] [--backend <name>]',
      '',
      'Distills a YouTube tutorial into a reusable SKILL.md.',
      '',
      'Backends:',
      '  claude-cli      (default) shells out to `claude -p`; uses your Claude subscription.',
      '  anthropic-sdk   calls the Anthropic API directly; reads ANTHROPIC_API_KEY.',
      '',
      'Outputs:',
      "  <out>.SKILL.md       rendered Markdown (defaults to './skill.SKILL.md')",
      '  <out>.skill.json     raw Skill JSON (for diffing during prompt iteration)',
      '',
    ].join('\n'),
  );
  process.exit(64);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (args.backend === 'anthropic-sdk' && !apiKey) {
    process.stderr.write('error: --backend anthropic-sdk requires ANTHROPIC_API_KEY env var\n');
    process.exit(64);
  }

  const outBase = stripExtension(args.out ?? './skill.SKILL.md');

  const backend =
    args.backend === 'anthropic-sdk' ? createAnthropicBackend(apiKey!) : createClaudeCliBackend();

  let result;
  try {
    result = await distillVideoToSkill({
      videoUrl: args.url,
      backend,
      model: args.model ?? undefined,
    });
  } catch (e) {
    if (e instanceof DistillError) {
      process.stderr.write(JSON.stringify({ error: e.code, message: e.message }) + '\n');
      process.exit(2);
    }
    throw e;
  }

  const md = renderSkillAsMarkdown(result.skill);
  const jsonPath = `${outBase}.skill.json`;
  const mdPath = `${outBase}.SKILL.md`;
  mkdirSync(dirname(resolve(mdPath)), { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(result.skill, null, 2) + '\n', 'utf-8');
  writeFileSync(mdPath, md.endsWith('\n') ? md : md + '\n', 'utf-8');

  process.stdout.write(
    JSON.stringify(
      {
        ok: true,
        outputs: { md: mdPath, json: jsonPath },
        videoMeta: result.videoMeta,
        usage: {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          cacheHitTokens: result.cacheHitTokens,
        },
        transcriptCharCount: result.transcriptCharCount,
      },
      null,
      2,
    ) + '\n',
  );
}

function stripExtension(p: string): string {
  return p
    .replace(/\.SKILL\.md$/, '')
    .replace(/\.skill\.json$/, '')
    .replace(/\.md$/, '');
}

main().catch((e) => {
  process.stderr.write(`fatal: ${(e as Error).stack ?? (e as Error).message ?? e}\n`);
  process.exit(1);
});
