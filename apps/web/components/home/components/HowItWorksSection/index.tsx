'use client';

import styled from 'styled-components';

/* ────────────────────────────────────────────────────────────────────
 * How it works — three steps. Mirrors Delphi's "Create your Digital
 * Mind in just 15 minutes" section: big 01 / 02 / 03 numerals,
 * verb-led step titles, short prose per step. No screenshots — keep
 * the visual quiet so the storyline carries it.
 * ──────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  padding-block: var(--space-24);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 768px) {
    padding-block: var(--space-16);
  }
`;

const Inner = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Header = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-16);
  text-align: center;
`;

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
  line-height: 1.55;
  margin: var(--space-6) auto 0;
  max-width: 580px;
`;

const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-10);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 36px;
    left: 8%;
    right: 8%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--color-border) 12%,
      var(--color-border) 88%,
      transparent 100%
    );
    z-index: 0;
  }

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: var(--space-10);

    &::before {
      display: none;
    }
  }
`;

const Step = styled.li`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
`;

const StepNum = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
  font-style: italic;
  font-weight: 500;
  font-size: 2rem;
  color: var(--color-primary-600);
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  letter-spacing: -0.02em;
`;

const StepKicker = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-muted);
`;

const StepTitle = styled.h3`
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;
`;

const StepBody = styled.p`
  font-size: var(--text-base);
  color: var(--color-gray-700);
  line-height: 1.6;
  margin: 0;
`;

const StepFootnote = styled.div`
  font-family: var(--font-hand);
  font-size: 1.0625rem;
  color: var(--color-primary-500);
  line-height: 1.3;
  margin-top: var(--space-1);
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
      'Skill Recorder cleans the noise, names the inputs, and writes a skill your agent can actually run. You review and tweak — or trust the defaults.',
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
              <StepFootnote>↳ {s.foot}</StepFootnote>
            </Step>
          ))}
        </Steps>
      </Inner>
    </Section>
  );
}
