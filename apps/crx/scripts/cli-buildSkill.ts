#!/usr/bin/env node
// Headless CLI wrapper around buildDrafts + buildSkill. Reads JSON from
// stdin, writes a Skill JSON to stdout.
//
// Stdin shape:
//   {
//     "actions": ActionStep[],         // raw, ordered by seq
//     "recording": RecordingMeta,      // for sourceRecordingId + startUrl/domain
//     "title": string,                 // user-curated title
//     "description": string,           // user-curated description
//     "authHint"?: SkillAuthHint       // optional; defaults to { required: false }
//   }
import { buildDrafts, buildSkill } from '../src/common/skill-build';
import type { ActionStep, RecordingMeta, SkillAuthHint } from '@skill-recorder/types';

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

interface CliInput {
  actions: ActionStep[];
  recording: RecordingMeta;
  title: string;
  description: string;
  authHint?: SkillAuthHint;
}

async function main() {
  const raw = await readStdin();
  const input = JSON.parse(raw) as CliInput;
  const drafts = buildDrafts(input.actions);
  const skill = buildSkill({
    title: input.title,
    description: input.description,
    drafts,
    recording: input.recording,
    authHint: input.authHint ?? { required: false },
  });
  process.stdout.write(JSON.stringify(skill, null, 2));
}

main().catch((err) => {
  process.stderr.write(`cli-buildSkill failed: ${err?.stack ?? err}\n`);
  process.exit(1);
});
