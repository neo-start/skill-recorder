'use client';

import { useState, type FormEvent } from 'react';
import styled, { keyframes } from 'styled-components';

/* Delphi-style CTASection — waitlist form on flat white instead of
 * dark royal-blue gradient. Form lives inside a hairline cream card.
 * Submit / status / success / error states preserved unchanged.
 *
 * In `pnpm dev`, submit fakes success. In production the form posts the
 * email to Formspree (form `mkogzzvj`), which delivers sign-ups straight to
 * hi@linxin.me — no backend needed, so this works on static hosting. */

const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const INK = '#0a0a0a';
const SUB = '#6b6b6b';
const HAIRLINE = '#e8e6e1';
const CARD = '#faf8f4';
const FAINT = '#999999';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IS_DEV = process.env.NODE_ENV === 'development';

// Formspree endpoint (delivers sign-ups to hi@linxin.me). Shared with the
// linxin.me personal contact form; submissions land in the same inbox.
const WAITLIST_ENDPOINT = 'https://formspree.io/f/mkogzzvj';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const Section = styled.section`
  padding-block: 120px;
  background: #ffffff;
  font-family: ${SANS};
  color: ${INK};

  @media (max-width: 768px) {
    padding-block: 80px;
  }
`;

const Inner = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding-inline: 32px;
  text-align: center;

  @media (max-width: 768px) {
    padding-inline: 22px;
  }
`;

const Eyebrow = styled.div`
  font-family: ${SANS};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${FAINT};
  margin-bottom: 22px;
`;

const Title = styled.h2`
  font-family: ${SANS};
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 700;
  color: ${INK};
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 0;

  em {
    font-style: italic;
    font-weight: 700;
    color: ${INK};
  }
`;

const Lead = styled.p`
  font-family: ${SANS};
  font-size: clamp(1.0625rem, 1.4vw, 1.25rem);
  color: ${SUB};
  line-height: 1.55;
  margin: 28px auto 0;
  max-width: 540px;
`;

const Form = styled.form`
  display: flex;
  align-items: stretch;
  gap: 8px;
  margin: 40px auto 0;
  max-width: 460px;
  background: ${CARD};
  border: 1px solid ${HAIRLINE};
  border-radius: 100px;
  padding: 6px;
  transition: border-color 160ms ease, background 160ms ease;

  &:focus-within {
    border-color: ${INK};
    background: #ffffff;
  }

  @media (max-width: 560px) {
    flex-direction: column;
    gap: 8px;
    border-radius: 22px;
    padding: 8px;
  }
`;

const Email = styled.input`
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 18px;
  border: none;
  background: transparent;
  color: ${INK};
  font-family: ${SANS};
  font-size: 15px;
  letter-spacing: -0.005em;

  &::placeholder {
    color: ${FAINT};
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
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  border-radius: 100px;
  background: ${INK};
  color: #ffffff;
  border: none;
  font-family: ${SANS};
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: background 160ms ease, transform 120ms ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #2a2a2a;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  & > .spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    animation: ${spin} 600ms linear infinite;
  }
`;

const Status = styled.p<{ $tone: 'error' | 'info' }>`
  font-family: ${SANS};
  font-size: 13px;
  color: ${({ $tone }) => ($tone === 'error' ? '#a52424' : SUB)};
  margin: 14px auto 0;
  max-width: 460px;
  line-height: 1.5;
  min-height: 1.5em;
`;

const SuccessBlock = styled.div`
  margin: 40px auto 0;
  max-width: 460px;
  padding: 28px;
  background: ${CARD};
  border: 1px solid ${HAIRLINE};
  border-radius: 20px;
  text-align: left;

  & > .heading {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: ${SANS};
    font-size: 1rem;
    font-weight: 600;
    color: ${INK};
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  & > .heading svg {
    color: ${INK};
    flex-shrink: 0;
  }

  & > .body {
    font-family: ${SANS};
    font-size: 0.9375rem;
    color: ${SUB};
    line-height: 1.55;
    margin: 0;
  }
`;

const FinePrint = styled.p`
  font-family: ${SANS};
  font-size: 12px;
  color: ${FAINT};
  margin: 16px auto 0;
  max-width: 460px;
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
        await new Promise(r => setTimeout(r, 700));
        setStatus('success');
        return;
      }

      const res = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          email: trimmed,
          source: 'homepage_cta',
          _subject: 'Cadeno waitlist sign-up',
        }),
      });

      if (res.ok) {
        setStatus('success');
        return;
      }

      const data: { errors?: { message?: string }[] } = await res
        .json()
        .catch(() => ({}));
      setStatus('error');
      setMessage(
        data.errors?.[0]?.message
          ? "That doesn't look like an email — try again?"
          : 'Something went wrong on our end. Try again in a moment?',
      );
    } catch {
      setStatus('error');
      setMessage('Network hiccup — try again in a moment?');
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
