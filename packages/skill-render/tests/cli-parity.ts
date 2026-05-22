// Verify that the built CLI emits byte-identical Markdown to the in-process
// renderer. If this drifts, the eval pipeline's "oracle vs human" comparison
// stops being clean — any format diff becomes signal.
//
// Run via `pnpm --filter @skill-recorder/render parity` (after `build`).

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSkillAsMarkdown } from '../src/index';
import type { Skill } from '@skill-recorder/types';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(here, 'fixtures');
const cliPath = resolve(here, '../dist/cli.js');

const fixtures = readdirSync(fixturesDir)
  .filter((f) => f.endsWith('.skill.json'))
  .sort();

if (!fixtures.length) {
  console.error('no *.skill.json fixtures found');
  process.exit(1);
}

let failed = 0;
for (const name of fixtures) {
  const fixturePath = resolve(fixturesDir, name);
  const skill = JSON.parse(readFileSync(fixturePath, 'utf-8')) as Skill;

  let inProc = renderSkillAsMarkdown(skill);
  if (!inProc.endsWith('\n')) inProc += '\n';

  const result = spawnSync('node', [cliPath, 'render'], {
    input: JSON.stringify(skill),
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    console.error(`✗ ${name}: CLI exited with ${result.status}`);
    console.error(result.stderr);
    failed++;
    continue;
  }

  const viaCli = result.stdout;
  if (viaCli === inProc) {
    console.log(`✓ ${name} parity OK (${viaCli.length} bytes)`);
    continue;
  }

  console.error(`✗ ${name} parity mismatch`);
  console.error(`  in-process: ${inProc.length} bytes`);
  console.error(`  via CLI:    ${viaCli.length} bytes`);
  const minLen = Math.min(viaCli.length, inProc.length);
  for (let i = 0; i < minLen; i++) {
    if (viaCli[i] !== inProc[i]) {
      console.error(`  first diff at byte ${i}:`);
      console.error(`    in-process: ${JSON.stringify(inProc.slice(Math.max(0, i - 20), i + 20))}`);
      console.error(`    via CLI:    ${JSON.stringify(viaCli.slice(Math.max(0, i - 20), i + 20))}`);
      break;
    }
  }
  failed++;
}

process.exit(failed ? 1 : 0);
