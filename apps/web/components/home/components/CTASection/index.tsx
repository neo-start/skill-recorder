'use client';

import { useState, type FormEvent } from 'react';
import styled, { keyframes } from 'styled-components';

/* ────────────────────────────────────────────────────────────────────
 * Final CTA — waitlist signup. While Cadeno is in private beta this is
 * the only conversion point on the page. Submits to /api/waitlist (a
 * Cloudflare Pages Function that logs to the dashboard). In `pnpm dev`
 * the function isn't wired so we simulate success — to test the real
 * endpoint, build and run `pnpm pages:dev`.
 * ──────────────────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IS_DEV = process.env.NODE_ENV === 'development';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const Section = styled.section`
  position: relative;
  padding-block: var(--space-24);
  background: var(--gradient-brand-deep);
  overflow: hidden;

  @media (max-width: 768px) {
    padding-block: var(--space-16);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08), transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(122, 158, 245, 0.18), transparent 55%);
    pointer-events: none;
  }
`;

const Inner = styled.div`
  position: relative;
  max-width: 880px;
  margin: 0 auto;
  padding-inline: var(--space-6);
  text-align: center;
`;

const Eyebrow = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(173, 193, 247, 0.85);
  margin-bottom: var(--space-6);
`;

const Title = styled.h2`
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 0;

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    color: #eaeeff;
  }
`;

const Lead = styled.p`
  font-size: clamp(1.0625rem, 1.4vw, 1.25rem);
  color: rgba(234, 238, 255, 0.85);
  line-height: 1.55;
  margin: var(--space-6) auto 0;
  max-width: 560px;
`;

const Form = styled.form`
  display: flex;
  align-items: stretch;
  gap: var(--space-3);
  margin: var(--space-10) auto 0;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  padding: 6px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: border-color var(--transition-fast), background var(--transition-fast);

  &:focus-within {
    border-color: rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 560px) {
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-2);
  }
`;

const Email = styled.input`
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 var(--space-4);
  border: none;
  background: transparent;
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  letter-spacing: -0.005em;

  &::placeholder {
    color: rgba(234, 238, 255, 0.55);
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Submit = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: 48px;
  padding: 0 var(--space-7);
  border-radius: 10px;
  background: #ffffff;
  color: var(--color-primary-700);
  border: none;
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #f5f7ff;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  & > .spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(48, 92, 222, 0.25);
    border-top-color: var(--color-primary-600);
    animation: ${spin} 600ms linear infinite;
  }
`;

const Status = styled.p<{ $tone: 'error' | 'info' }>`
  font-size: var(--text-sm);
  color: ${({ $tone }) =>
    $tone === 'error' ? '#ffd6d6' : 'rgba(234, 238, 255, 0.75)'};
  margin: var(--space-3) auto 0;
  max-width: 480px;
  line-height: 1.5;
  min-height: 1.5em;
`;

const SuccessBlock = styled.div`
  margin: var(--space-10) auto 0;
  max-width: 480px;
  padding: var(--space-6) var(--space-8);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  text-align: left;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  & > .heading {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-lg);
    font-weight: 600;
    color: #ffffff;
    margin-bottom: var(--space-2);
    letter-spacing: -0.01em;
  }

  & > .heading svg {
    color: #a3ff5e;
    flex-shrink: 0;
  }

  & > .body {
    font-size: var(--text-sm);
    color: rgba(234, 238, 255, 0.78);
    line-height: 1.55;
    margin: 0;
  }
`;

const FinePrint = styled.p`
  font-size: 12px;
  color: rgba(234, 238, 255, 0.55);
  margin: var(--space-4) auto 0;
  max-width: 480px;
  line-height: 1.5;
`;

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      setMessage("That doesn't look like an email — try again?");
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      if (IS_DEV) {
        // Function only runs under `pnpm pages:dev`, not `pnpm dev`. Simulate
        // success so the form is testable in dev. Remove this branch once a
        // real backend is wired and devs run pages:dev for full-stack testing.
        await new Promise(r => setTimeout(r, 700));
        setStatus('success');
        return;
      }

      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'homepage_cta' }),
      });

      if (res.ok) {
        setStatus('success');
        return;
      }

      const data: { error?: string } = await res.json().catch(() => ({}));
      setStatus('error');
      setMessage(
        data.error === 'invalid_email'
          ? "That doesn't look like an email — try again?"
          : "Something went wrong on our end. Try again in a moment?",
      );
    } catch {
      setStatus('error');
      setMessage("Network hiccup — try again in a moment?");
    }
  }

  return (
    <Section id="waitlist">
      <Inner>
        <Eyebrow>Cadeno is in private beta</Eyebrow>

        <Title>
          Hire your <em>Personal FDE</em>.
        </Title>

        <Lead>
          The next time you do something worth doing, do it once — and ship it forever. Drop your email and we'll let you in as soon as a spot opens.
        </Lead>

        {status === 'success' ? (
          <SuccessBlock role="status" aria-live="polite">
            <div className="heading">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              You're on the list.
            </div>
            <p className="body">
              We'll email you the moment your seat opens. In the meantime, keep building — the agent will be ready when you are.
            </p>
          </SuccessBlock>
        ) : (
          <>
            <Form onSubmit={onSubmit} noValidate>
              <label htmlFor="waitlist-email" style={{ position: 'absolute', left: -9999 }}>
                Email
              </label>
              <Email
                id="waitlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@where-you-build.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (status === 'error') {
                    setStatus('idle');
                    setMessage('');
                  }
                }}
                disabled={status === 'submitting'}
                aria-invalid={status === 'error'}
                aria-describedby="waitlist-status"
                required
              />
              <Submit type="submit" disabled={status === 'submitting' || !email}>
                {status === 'submitting' ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  <>Join →</>
                )}
              </Submit>
            </Form>

            <Status id="waitlist-status" $tone={status === 'error' ? 'error' : 'info'} aria-live="polite">
              {message}
            </Status>

            <FinePrint>
              One email when your seat opens. No spam, no newsletter, no resale.
            </FinePrint>
          </>
        )}
      </Inner>
    </Section>
  );
}
