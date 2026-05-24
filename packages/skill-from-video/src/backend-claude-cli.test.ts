import { describe, expect, it } from 'vitest';
import { stripFences } from './backend-claude-cli';

describe('stripFences', () => {
  it('strips ```json fences', () => {
    expect(stripFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('strips bare ``` fences', () => {
    expect(stripFences('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('trims plain JSON without fences', () => {
    expect(stripFences('  {"a":1}  ')).toBe('{"a":1}');
  });

  it('handles multi-line fenced content', () => {
    const input = '```json\n{\n  "title": "x",\n  "n": 5\n}\n```';
    const out = stripFences(input);
    expect(JSON.parse(out)).toEqual({ title: 'x', n: 5 });
  });

  it('returns trimmed input when fences are malformed (no trailing newline before closing)', () => {
    // The regex requires a newline before the closing ```; without it, we
    // fall back to trim(). The caller's JSON.parse will catch this.
    const input = '```json\n{"a":1}```';
    expect(stripFences(input)).toBe(input.trim());
  });
});
