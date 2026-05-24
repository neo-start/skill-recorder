import { describe, expect, it, vi } from 'vitest';
import { isTransientError, retryOnTransient } from './retry';

describe('isTransientError', () => {
  it.each([
    'claude CLI reported error (api_status=429): rate limited',
    'claude CLI reported error (api_status=500): server',
    'claude CLI reported error (api_status=502): gateway',
    'claude CLI reported error (api_status=503): unavailable',
    'claude CLI reported error (api_status=504): timeout',
    'claude CLI reported error (api_status=529): Overloaded',
    'fetch failed: ETIMEDOUT',
    'fetch failed: ECONNRESET',
    'API Error: 529 Overloaded',
  ])('classifies %s as transient', (msg) => {
    expect(isTransientError(new Error(msg))).toBe(true);
  });

  it.each([
    'api_status=400: bad request',
    'api_status=401: unauthorized',
    'api_status=403: forbidden',
    'api_status=404: not found',
    'random error message',
    '',
  ])('classifies %s as non-transient', (msg) => {
    expect(isTransientError(new Error(msg))).toBe(false);
  });

  it('handles non-Error inputs without crashing', () => {
    expect(isTransientError(null)).toBe(false);
    expect(isTransientError(undefined)).toBe(false);
    expect(isTransientError('string error')).toBe(false);
  });
});

describe('retryOnTransient', () => {
  const fastSleep = vi.fn(async () => {});
  const noDelay = (): number => 0;

  it('returns first-attempt result with no retries', async () => {
    const fn = vi.fn(async () => 'ok');
    const result = await retryOnTransient(fn, { sleep: fastSleep, delayMs: noDelay });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries a transient failure then succeeds', async () => {
    let n = 0;
    const fn = vi.fn(async () => {
      n++;
      if (n === 1) throw new Error('api_status=529 Overloaded');
      return 'ok';
    });
    const result = await retryOnTransient(fn, { sleep: fastSleep, delayMs: noDelay });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('exhausts retries and throws the last transient error', async () => {
    const fn = vi.fn(async () => {
      throw new Error('api_status=529 Overloaded');
    });
    await expect(
      retryOnTransient(fn, { maxAttempts: 3, sleep: fastSleep, delayMs: noDelay }),
    ).rejects.toThrow(/529/);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('rethrows a non-transient error immediately, no retries', async () => {
    const fn = vi.fn(async () => {
      throw new Error('api_status=400 bad request');
    });
    await expect(
      retryOnTransient(fn, { maxAttempts: 5, sleep: fastSleep, delayMs: noDelay }),
    ).rejects.toThrow(/400/);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reports retry events via onRetry hook', async () => {
    const onRetry = vi.fn();
    let n = 0;
    const fn = vi.fn(async () => {
      n++;
      if (n < 3) throw new Error('Overloaded');
      return 'ok';
    });
    await retryOnTransient(fn, {
      maxAttempts: 3,
      sleep: fastSleep,
      delayMs: noDelay,
      onRetry,
    });
    expect(onRetry).toHaveBeenCalledTimes(2);
    // First call: attempt index 0, total 3
    expect(onRetry).toHaveBeenNthCalledWith(1, 0, 3, expect.any(Error), 0);
    expect(onRetry).toHaveBeenNthCalledWith(2, 1, 3, expect.any(Error), 0);
  });

  it('waits between attempts using sleep', async () => {
    let n = 0;
    const fn = vi.fn(async () => {
      n++;
      if (n < 2) throw new Error('Overloaded');
      return 'ok';
    });
    const sleep = vi.fn(async () => {});
    await retryOnTransient(fn, {
      maxAttempts: 3,
      sleep,
      delayMs: (attempt) => 100 * (attempt + 1),
    });
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(100); // attempt 0 → delay 100
  });
});
