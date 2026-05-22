// Backend that shells out to the local `claude` CLI (Claude Code). Uses the
// user's subscription rather than an API key, so it's the right pick for
// local prompt iteration but cannot run in a Cloudflare Worker (no shell).
//
// We rely on `claude -p --output-format json --json-schema ...` for
// structured output. The CLI enforces the schema at the model boundary, so
// our Zod re-validation in distill.ts mostly catches cross-field invariants
// it can't express (e.g. "guidance step needs notes or criteria").

import { spawn } from 'node:child_process';
import type { Backend, RawBackendOptions, RawBackendResult } from './backend';

interface ClaudePrintResult {
  type: string;
  subtype?: string;
  is_error?: boolean;
  result?: string;
  /** Present when --json-schema is used: the parsed object (already validated). */
  structured_output?: unknown;
  api_error_status?: number | null;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

export interface ClaudeCliBackendOptions {
  /** Override the binary; defaults to `claude` on PATH. */
  bin?: string;
  /** Extra CLI args. Mainly for testing. */
  extraArgs?: string[];
  /** Attempts to make on transient API errors (429/5xx). Default 3. */
  maxTransientRetries?: number;
}

const TRANSIENT_API_STATUSES = new Set([429, 500, 502, 503, 504, 529]);

export function createClaudeCliBackend(cfg: ClaudeCliBackendOptions = {}): Backend {
  const bin = cfg.bin ?? 'claude';
  const maxRetries = cfg.maxTransientRetries ?? 3;

  return {
    async call(opts: RawBackendOptions, retryNote?: string): Promise<RawBackendResult> {
      let lastErr: unknown;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await callOnce(bin, cfg, opts, retryNote);
        } catch (e) {
          lastErr = e;
          if (!isTransient(e) || attempt === maxRetries - 1) throw e;
          const waitMs = Math.min(60_000, 5_000 * Math.pow(2, attempt));
          process.stderr.write(
            `[claude-cli backend] attempt ${attempt + 1}/${maxRetries} hit transient error; waiting ${waitMs}ms\n`,
          );
          await sleep(waitMs);
        }
      }
      throw lastErr;
    },
  };
}

function isTransient(e: unknown): boolean {
  const msg = (e as Error)?.message ?? '';
  if (/api_status=(\d+)/.test(msg)) {
    const m = msg.match(/api_status=(\d+)/);
    if (m && TRANSIENT_API_STATUSES.has(Number(m[1]))) return true;
  }
  if (/Overloaded|529|503|504|ETIMEDOUT|ECONNRESET/i.test(msg)) return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function callOnce(
  bin: string,
  cfg: ClaudeCliBackendOptions,
  opts: RawBackendOptions,
  retryNote?: string,
): Promise<RawBackendResult> {
  const userPrompt = retryNote
    ? `${opts.userPrompt}\n\n[Previous attempt failed schema validation: ${retryNote}. Re-emit with corrections.]`
    : opts.userPrompt;

  const args = [
    '-p',
    '--output-format',
    'json',
    '--json-schema',
    JSON.stringify(opts.jsonSchema),
    '--system-prompt',
    opts.systemPrompt,
    // We want pure inference; block the agent from invoking tools.
    '--disable-slash-commands',
    ...(opts.model ? ['--model', opts.model] : []),
    ...(cfg.extraArgs ?? []),
  ];

  if (process.env.SKILL_FROM_VIDEO_DEBUG) {
    process.stderr.write(`[debug] spawn ${bin} ${args.map((a) => JSON.stringify(a)).join(' ')}\n`);
  }
  const proc = spawn(bin, args, { stdio: ['pipe', 'pipe', 'pipe'] });

  if (opts.signal) {
    opts.signal.addEventListener('abort', () => proc.kill('SIGTERM'), { once: true });
  }

  proc.stdin.write(userPrompt);
  proc.stdin.end();

  let stdout = '';
  let stderr = '';
  proc.stdout.on('data', (c: Buffer) => {
    stdout += c.toString('utf-8');
  });
  proc.stderr.on('data', (c: Buffer) => {
    stderr += c.toString('utf-8');
  });

  const exitCode: number = await new Promise((resolve, reject) => {
    proc.on('error', reject);
    proc.on('close', (code) => resolve(code ?? -1));
  });

  // claude CLI returns exit 1 on API error but still emits a parseable JSON
  // result in stdout. Parse that first so we can distinguish transient API
  // errors from genuine spawn/parse failures.
  let parsed: ClaudePrintResult | null = null;
  if (stdout.trim()) {
    try {
      parsed = JSON.parse(stdout) as ClaudePrintResult;
    } catch {
      // fall through to raw-output error below
    }
  }

  if (parsed?.is_error) {
    throw new Error(
      `claude CLI reported error (api_status=${parsed.api_error_status}): ${parsed.result ?? '(no result)'}`,
    );
  }

  if (exitCode !== 0) {
    throw new Error(
      `claude CLI exited ${exitCode}\n--- stderr ---\n${stderr.slice(0, 1000)}\n--- stdout ---\n${stdout.slice(0, 1000)}`,
    );
  }

  if (!parsed) {
    throw new Error(`claude CLI did not return JSON: ${stdout.slice(0, 200)}`);
  }

  let rawInput: unknown;
  if (parsed.structured_output !== undefined && parsed.structured_output !== null) {
    rawInput = parsed.structured_output;
  } else {
    if (typeof parsed.result !== 'string') {
      throw new Error(`claude CLI returned neither structured_output nor result string`);
    }
    const inner = stripFences(parsed.result);
    try {
      rawInput = JSON.parse(inner);
    } catch {
      throw new Error(`claude CLI .result was not JSON: ${inner.slice(0, 200)}`);
    }
  }

  return {
    rawInput,
    usage: {
      inputTokens: parsed.usage?.input_tokens ?? 0,
      outputTokens: parsed.usage?.output_tokens ?? 0,
      cacheHitTokens: parsed.usage?.cache_read_input_tokens ?? 0,
    },
  };
}

function stripFences(s: string): string {
  const m = s.match(/^```(?:json)?\s*\n([\s\S]*?)\n```\s*$/);
  return m ? m[1]! : s.trim();
}
