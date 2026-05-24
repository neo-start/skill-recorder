// Generic transient-retry wrapper, split out of backend-claude-cli so it can
// be unit-tested in isolation. Anthropic gets capacity-throttled often
// enough that any backend doing real API calls wants this.

const TRANSIENT_API_STATUSES = new Set([429, 500, 502, 503, 504, 529]);

export function isTransientError(e: unknown): boolean {
  const msg = (e as Error)?.message ?? '';
  const m = msg.match(/api_status=(\d+)/);
  if (m && TRANSIENT_API_STATUSES.has(Number(m[1]))) return true;
  if (/Overloaded|529|503|504|ETIMEDOUT|ECONNRESET/i.test(msg)) return true;
  return false;
}

export interface RetryOptions {
  maxAttempts?: number;
  /** Override for tests; receives attempt index (0-based). */
  delayMs?: (attempt: number) => number;
  /** Hook to actually sleep — tests can stub. */
  sleep?: (ms: number) => Promise<void>;
  /** Hook to log/notify each retry. */
  onRetry?: (attempt: number, totalAttempts: number, error: unknown, waitMs: number) => void;
}

const DEFAULT_DELAY = (attempt: number): number => Math.min(60_000, 5_000 * Math.pow(2, attempt));
const DEFAULT_SLEEP = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export async function retryOnTransient<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const delayMs = options.delayMs ?? DEFAULT_DELAY;
  const sleep = options.sleep ?? DEFAULT_SLEEP;

  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isTransientError(e) || attempt === maxAttempts - 1) throw e;
      const waitMs = delayMs(attempt);
      options.onRetry?.(attempt, maxAttempts, e, waitMs);
      await sleep(waitMs);
    }
  }
  throw lastErr;
}
