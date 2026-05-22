// Typed error model — caller (CLI, Worker) inspects `.code` to map to exit
// codes / HTTP status. Each code mirrors the API contract in
// docs/video-skills-design.md §错误与边缘情况.

export type DistillErrorCode =
  | 'unsupported_source'
  | 'inaccessible'
  | 'no_transcript'
  | 'too_long'
  | 'insufficient_content'
  | 'distill_failed'
  | 'config';

export class DistillError extends Error {
  code: DistillErrorCode;
  detail?: unknown;
  constructor(code: DistillErrorCode, message: string, detail?: unknown) {
    super(message);
    this.name = 'DistillError';
    this.code = code;
    this.detail = detail;
  }
}
