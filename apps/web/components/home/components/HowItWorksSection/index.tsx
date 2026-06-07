'use client';

import styled from 'styled-components';

/* Delphi-style HowItWorksSection. 3 steps; copy preserved. Stripped
 * italic-serif numerals, Caveat hand kickers/footnotes, royal-blue
 * accents and dashed connecting rail. Adopted Delphi's minimal sans
 * numerals + grey divider rules. */

const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const INK = '#0a0a0a';
const SUB = '#6b6b6b';
const HAIRLINE = '#e8e6e1';
const FAINT = '#999999';

const Section = styled.section`
  padding-block: 120px;
  background: #ffffff;
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

  @media (max-width: 768px) {
    padding-inline: 22px;
  }
`;

const Header = styled.div`
  max-width: 680px;
  margin: 0 auto 72px;
  text-align: center;
`;

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
  line-height: 1.55;
  margin: 24px auto 0;
  max-width: 560px;
`;

const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: 28px;
  }
`;

const Step = styled.li`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 28px;
  border-top: 1px solid ${INK};
`;

const StepNum = styled.div`
  font-family: ${SANS};
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: ${FAINT};
`;

const StepKicker = styled.div`
  font-family: ${SANS};
  font-style: italic;
  font-size: 14px;
  color: ${SUB};
  margin-top: -8px;
`;

const StepTitle = styled.h3`
  font-family: ${SANS};
  font-size: 1.375rem;
  font-weight: 600;
  color: ${INK};
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;
`;

const StepBody = styled.p`
  font-family: ${SANS};
  font-size: 0.9375rem;
  color: ${SUB};
  line-height: 1.6;
  margin: 0;
`;

const StepFootnote = styled.div`
  font-family: ${SANS};
  font-style: italic;
  font-size: 0.875rem;
  color: ${FAINT};
  margin-top: 4px;
`;

const steps = [
  {
    num: '01',
    kicker: 'Show it once',
    title: 'Record. Or paste. Or drop.',
    body:
      'Click record and do the task in your browser. Or paste a tutorial URL. Or drop a doc, video, or screenshot. Anything that captures the know-how works.',
    foot: 'humans do it once',
  },
  {
    num: '02',
    kicker: 'We distill it',
    title: 'Your know-how becomes a skill.',
    body:
      'Cadeno cleans the noise, names the inputs, and writes a skill your agent can actually run. You review and tweak — or trust the defaults.',
    foot: 'no scripting required',
  },
  {
    num: '03',
    kicker: 'Your agent ships it',
    title: 'On demand. On schedule. On autopilot.',
    body:
      'Trigger from a button, a webhook, a calendar, or an inbox. Run on your accounts, your machine, your data. Get the outcome — not a transcript of clicks.',
    foot: 'agents take it over forever',
  },
];

export default function HowItWorksSection() {
  return (
    <Section id="how">
      <Inner>
        <Header>
          <Label>How it works</Label>
          <Title>
            Three steps. <em>From action to skill.</em>
          </Title>
          <Lead>
            Most skills go from idea to running in under fifteen minutes. The agent handles the rest forever.
          </Lead>
        </Header>

        <Steps>
          {steps.map(s => (
            <Step key={s.num}>
              <StepNum>{s.num}</StepNum>
              <StepKicker>{s.kicker}</StepKicker>
              <StepTitle>{s.title}</StepTitle>
              <StepBody>{s.body}</StepBody>
              <StepFootnote>{s.foot}</StepFootnote>
            </Step>
          ))}
        </Steps>
      </Inner>
    </Section>
  );
}
