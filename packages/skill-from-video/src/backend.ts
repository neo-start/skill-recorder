// Shared backend interface. Two implementations:
//   • backend-anthropic.ts — calls @anthropic-ai/sdk directly (M2 Worker path)
//   • backend-claude-cli.ts — shells out to the `claude` CLI, which uses the
//     user's Claude Code subscription instead of burning API credits. Suited
//     to local prompt iteration; can't run in a Cloudflare Worker.
//
// Both backends accept the same RawBackendOptions, return the same
// RawBackendResult, and are wired up by distill.ts (which also owns
// Zod validation and one-shot retry-on-schema-failure).

export interface RawBackendOptions {
  systemPrompt: string;
  userPrompt: string;
  /** JSON Schema (a union of the Skill body and the insufficient_content envelope). */
  jsonSchema: Record<string, unknown>;
  model?: string;
  signal?: AbortSignal;
}

export interface RawBackendUsage {
  inputTokens: number;
  outputTokens: number;
  cacheHitTokens: number;
}

export interface RawBackendResult {
  /** The raw JSON the model emitted, pre-Zod. */
  rawInput: unknown;
  usage: RawBackendUsage;
}

export interface Backend {
  /**
   * Call the model once. `retryNote`, if present, is a follow-up message
   * explaining why the previous attempt failed Zod validation. The backend
   * decides whether to thread it as conversation history (SDK) or just
   * append it to the user prompt (CLI).
   */
  call(opts: RawBackendOptions, retryNote?: string): Promise<RawBackendResult>;
}
