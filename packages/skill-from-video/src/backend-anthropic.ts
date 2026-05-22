import Anthropic from '@anthropic-ai/sdk';
import type { Backend, RawBackendOptions, RawBackendResult } from './backend';

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const TOOL_NAME = 'emit_skill';

export function createAnthropicBackend(apiKey: string): Backend {
  const client = new Anthropic({ apiKey });

  return {
    async call(opts: RawBackendOptions, retryNote?: string): Promise<RawBackendResult> {
      const tool: Anthropic.Messages.Tool = {
        name: TOOL_NAME,
        description:
          'Emit the distilled Skill object, or `{error: "insufficient_content", reason: "..."}` if the transcript is too thin.',
        input_schema: opts.jsonSchema as unknown as Anthropic.Messages.Tool['input_schema'],
        cache_control: { type: 'ephemeral' },
      };

      const userContent = retryNote
        ? `${opts.userPrompt}\n\n[Previous attempt failed schema validation: ${retryNote}. Re-emit with corrections.]`
        : opts.userPrompt;

      const response = await client.messages.create(
        {
          model: opts.model || DEFAULT_MODEL,
          max_tokens: 4096,
          system: [{ type: 'text', text: opts.systemPrompt, cache_control: { type: 'ephemeral' } }],
          tools: [tool],
          tool_choice: { type: 'tool', name: TOOL_NAME },
          messages: [{ role: 'user', content: userContent }],
        },
        { signal: opts.signal },
      );

      const toolUse = response.content.find(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use' && b.name === TOOL_NAME,
      );
      if (!toolUse) {
        throw new Error(`model did not call ${TOOL_NAME}`);
      }

      return {
        rawInput: toolUse.input,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          cacheHitTokens: response.usage.cache_read_input_tokens ?? 0,
        },
      };
    },
  };
}
