// Thin CLI around renderSkillAsMarkdown. Reads a Skill JSON object from stdin
// (or --in) and writes Markdown to stdout (or --out).
//
// Contract is documented in docs/design-followups.md §1 — the eval pipeline
// depends on byte-for-byte parity between this CLI and the in-process renderer
// that the Chrome extension uses, so we never duplicate the rendering logic.

import { readFileSync, writeFileSync } from 'node:fs';
import { renderSkillAsMarkdown } from '../src/index';
import type { Skill } from '@skill-recorder/types';

const VERSION = '0.1.3';

type SchemaIssue = { path: string; message: string };

function fail(code: number, payload: Record<string, unknown>): never {
  process.stderr.write(JSON.stringify(payload) + '\n');
  process.exit(code);
}

function usage(extra?: string): never {
  if (extra) process.stderr.write(`error: ${extra}\n\n`);
  process.stderr.write(
    [
      'skill-render <command> [options]',
      '',
      'Commands:',
      '  render   Read a Skill JSON object and emit Markdown.',
      '',
      'render options:',
      '  --in <path>   Read JSON from <path> instead of stdin.',
      '  --out <path>  Write Markdown to <path> instead of stdout.',
      '',
      'Global:',
      '  --version, -v   Print version and exit.',
      '  --help, -h      Show this help.',
      '',
    ].join('\n'),
  );
  process.exit(64);
}

function validateSkill(obj: unknown): Skill {
  const issues: SchemaIssue[] = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    fail(2, { error: 'schema', issues: [{ path: '', message: 'expected JSON object' }] });
  }
  const o = obj as Record<string, unknown>;
  for (const k of ['id', 'title', 'description', 'domain']) {
    if (typeof o[k] !== 'string') issues.push({ path: k, message: 'expected string' });
  }
  if (o.startUrl !== undefined && typeof o.startUrl !== 'string') {
    issues.push({ path: 'startUrl', message: 'expected string' });
  }
  if (o.sourceRecordingId !== undefined && typeof o.sourceRecordingId !== 'string') {
    issues.push({ path: 'sourceRecordingId', message: 'expected string' });
  }
  if (o.sourceVideo !== undefined && (o.sourceVideo === null || typeof o.sourceVideo !== 'object')) {
    issues.push({ path: 'sourceVideo', message: 'expected object' });
  }
  if (o.sourceRecordingId === undefined && o.sourceVideo === undefined) {
    issues.push({ path: '', message: 'expected one of sourceRecordingId or sourceVideo' });
  }
  if (!Array.isArray(o.parameters)) issues.push({ path: 'parameters', message: 'expected array' });
  if (!Array.isArray(o.steps)) issues.push({ path: 'steps', message: 'expected array' });
  if (typeof o.createdAt !== 'number') issues.push({ path: 'createdAt', message: 'expected number' });
  if (typeof o.updatedAt !== 'number') issues.push({ path: 'updatedAt', message: 'expected number' });
  if (issues.length) fail(2, { error: 'schema', issues });
  return o as unknown as Skill;
}

function main(argv: string[]): void {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') usage();
  if (argv[0] === '--version' || argv[0] === '-v') {
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  const [cmd, ...rest] = argv;
  if (cmd !== 'render') usage(`unknown command: ${cmd}`);

  let inputPath: string | null = null;
  let outputPath: string | null = null;
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--in') inputPath = rest[++i] ?? usage('--in needs a path');
    else if (a === '--out') outputPath = rest[++i] ?? usage('--out needs a path');
    else usage(`unknown argument: ${a}`);
  }

  let raw: string;
  try {
    raw = inputPath ? readFileSync(inputPath, 'utf-8') : readFileSync(0, 'utf-8');
  } catch (e) {
    fail(64, { error: 'io', message: (e as Error).message });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    fail(2, { error: 'json-parse', message: (e as Error).message });
  }

  const skill = validateSkill(parsed);

  let md: string;
  try {
    md = renderSkillAsMarkdown(skill);
  } catch (e) {
    fail(3, { error: 'render', message: (e as Error).message });
  }
  if (!md.endsWith('\n')) md += '\n';

  if (outputPath) writeFileSync(outputPath, md, 'utf-8');
  else process.stdout.write(md);
}

main(process.argv.slice(2));
