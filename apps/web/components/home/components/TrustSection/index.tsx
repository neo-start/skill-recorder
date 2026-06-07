'use client';

import styled from 'styled-components';

/* Delphi-style TrustSection. 4 pillars; copy preserved. Stripped
 * royal-blue icon tints and the cream-blue tinted section background.
 * Adopted Delphi's pale cream surface + monochrome pillar cards. */

const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const INK = '#0a0a0a';
const SUB = '#6b6b6b';
const HAIRLINE = '#e8e6e1';
const PAGE = '#fafaf7';
const FAINT = '#999999';

const Section = styled.section`
  padding-block: 120px;
  background: ${PAGE};
  border-bottom: 1px solid ${HAIRLINE};
  font-family: ${SANS};
  color: ${INK};

  @media (max-width: 768px) {
    padding-block: 80px;
  }
`;

const Inner = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding-inline: 32px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 64px;
  align-items: center;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: 48px;
    padding-inline: 22px;
  }
`;

const Left = styled.div``;

const Label = styled.div`
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
  font-size: clamp(2rem, 4.2vw, 3rem);
  font-weight: 700;
  color: ${INK};
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin: 0;

  em {
    font-style: italic;
    font-weight: 700;
    color: ${INK};
  }
`;

const Lead = styled.p`
  font-family: ${SANS};
  font-size: 1.0625rem;
  color: ${SUB};
  line-height: 1.6;
  margin: 24px 0 0;
  max-width: 460px;
`;

const Pillars = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Pillar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 26px;
  background: #ffffff;
  border: 1px solid ${HAIRLINE};
  border-radius: 16px;
`;

const PillarTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: ${SANS};
  font-size: 1rem;
  font-weight: 600;
  color: ${INK};
  margin: 0;
  letter-spacing: -0.01em;

  svg {
    color: ${INK};
    flex-shrink: 0;
  }
`;

const PillarBody = styled.p`
  font-family: ${SANS};
  font-size: 0.9375rem;
  color: ${SUB};
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
    body: "Every skill is a portable file. Take it with you, share it with a client, sell it on a marketplace — it's yours.",
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
            Cadeno is the layer between you and your agent. We don't sit between you and your accounts, your customers, or your data.
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
