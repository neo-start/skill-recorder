import { zodToJsonSchema } from 'zod-to-json-schema';
import { LlmSkillSchema, type LlmSkill } from './schema';
import { SYSTEM_PROMPT } from './prompt';
import { DistillError } from './errors';
import type { Backend, RawBackendUsage } from './backend';

export interface DistillCallResult {
  parsed: LlmSkill;
  usage: RawBackendUsage;
}

export interface DistillCallOptions {
  backend: Backend;
  model?: string;
  signal?: AbortSignal;
  videoTitle: string;
  videoChannel: string;
  videoUrl: string;
  videoId: string;
  durationSec: number;
  transcript: string;
}

/**
 * The model-facing schema. Both Anthropic's tool input_schema and Claude
 * CLI's --json-schema consume this. The Anthropic API rejects top-level
 * `oneOf`/`anyOf`/`allOf`, so we keep this as a single Skill object and
 * surface "insufficient transcript" as a Zod validation failure (via
 * empty steps or missing title), not as a separate error envelope.
 */
export function buildLlmJsonSchema(): Record<string, unknown> {
  return zodToJsonSchema(LlmSkillSchema, { target: 'jsonSchema7', $refStrategy: 'none' }) as Record<
    string,
    unknown
  >;
}

export async function callDistill(opts: DistillCallOptions): Promise<DistillCallResult> {
  const jsonSchema = buildLlmJsonSchema();
  const userPrompt = renderUserPrompt(opts);
  const baseOpts = {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    jsonSchema,
    model: opts.model,
    signal: opts.signal,
  };

  let attempt = 0;
  let raw = await opts.backend.call(baseOpts);
  let validation = validate(raw.rawInput);
  while (!validation.ok && attempt < 1) {
    attempt++;
    raw = await opts.backend.call(baseOpts, validation.error);
    validation = validate(raw.rawInput);
  }

  if (!validation.ok) {
    throw new DistillError(
      'distill_failed',
      `LLM output failed schema validation: ${validation.error}`,
      validation.raw,
    );
  }

  return { parsed: validation.value, usage: raw.usage };
}

function renderUserPrompt(opts: DistillCallOptions): string {
  return [
    `Video: ${opts.videoTitle}${opts.videoChannel ? ` by ${opts.videoChannel}` : ''} (${Math.round(
      opts.durationSec,
    )}s, ${opts.videoId})`,
    `URL: ${opts.videoUrl}`,
    '',
    'Transcript (timestamps stripped, lightly cleaned):',
    '"""',
    opts.transcript,
    '"""',
    '',
    'Emit the Skill via the emit_skill tool.',
  ].join('\n');
}

type Validation =
  | { ok: true; value: LlmSkill }
  | { ok: false; error: string; raw: unknown };

function validate(input: unknown): Validation {
  const parsed = LlmSkillSchema.safeParse(input);
  if (parsed.success) return { ok: true, value: parsed.data };
  return {
    ok: false,
    error: parsed.error.issues
      .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('; '),
    raw: input,
  };
}
