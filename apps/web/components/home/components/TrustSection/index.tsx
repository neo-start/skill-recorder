'use client';

import styled from 'styled-components';

/* ────────────────────────────────────────────────────────────────────
 * Trust — mirrors Delphi's "Your mind is Yours." section. Italicized
 * possessive headline + four short trust pillars. No security badges
 * or compliance logos — the visitor we're talking to (prosumer / OPC)
 * cares about control, not SOC 2.
 * ──────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  padding-block: var(--space-24);
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 768px) {
    padding-block: var(--space-16);
  }
`;

const Inner = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--space-8);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: var(--space-16);
  align-items: center;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: var(--space-10);
    padding-inline: var(--space-6);
  }
`;

const Left = styled.div``;

const Label = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-primary-600);
  margin-bottom: var(--space-4);
`;

const Title = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0;

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    color: var(--color-primary-600);
  }
`;

const Lead = styled.p`
  font-size: var(--text-lg);
  color: var(--color-gray-700);
  line-height: 1.6;
  margin: var(--space-6) 0 0;
  max-width: 460px;
`;

const Pillars = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Pillar = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
`;

const PillarTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
  letter-spacing: -0.01em;

  svg {
    color: var(--color-primary-500);
    flex-shrink: 0;
  }
`;

const PillarBody = styled.p`
  font-size: 0.9375rem;
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: 0;
`;

const pillars = [
  {
    title: 'Runs on your accounts.',
    body: 'Skills act through your logins, your APIs, your tools. We never proxy you through a shared identity.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: 'Your data, your house.',
    body: 'Recordings stay local until you choose to share. Skills run where you want them — your laptop, a server you own, or our cloud.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9 12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: 'Export anytime.',
    body: 'Every skill is a portable file. Take it with you, share it with a client, sell it on a marketplace — it\'s yours.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    title: 'You approve every send.',
    body: 'Set guardrails per skill — preview before post, dry-run by default, hard caps on writes. The agent never goes rogue.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

export default function TrustSection() {
  return (
    <Section id="trust">
      <Inner>
        <Left>
          <Label>How we treat your work</Label>
          <Title>
            Your skills are <em>Yours.</em>
          </Title>
          <Lead>
            Skill Recorder is the layer between you and your agent. We don't sit between you and your accounts, your customers, or your data.
          </Lead>
        </Left>

        <Pillars>
          {pillars.map(p => (
            <Pillar key={p.title}>
              <PillarTitle>
                {p.icon}
                {p.title}
              </PillarTitle>
              <PillarBody>{p.body}</PillarBody>
            </Pillar>
          ))}
        </Pillars>
      </Inner>
    </Section>
  );
}
