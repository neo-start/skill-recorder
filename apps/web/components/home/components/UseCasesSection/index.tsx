'use client';

import { useState } from 'react';
import styled from 'styled-components';

/* ────────────────────────────────────────────────────────────────────
 * Use Cases — six role pills, each revealing a concrete example skill.
 * Mirrors Delphi's role chips (Experts / Coaches / ...) but goes one
 * step further: every role gets a real skill card with trigger, steps,
 * and outcome — so the visitor sees what they would actually build.
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

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Header = styled.div`
  max-width: 720px;
  margin: 0 auto var(--space-12);
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

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-10);
`;

const Pill = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-full);
  border: 1.5px solid ${({ $active }) => ($active ? 'var(--color-primary-500)' : 'var(--color-border)')};
  background: ${({ $active }) => ($active ? 'var(--color-primary-500)' : 'var(--color-bg)')};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--color-text)')};
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);

  &:hover {
    border-color: ${({ $active }) => ($active ? 'var(--color-primary-500)' : 'var(--color-border-hover)')};
    transform: translateY(-1px);
  }
`;

const Card = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: var(--space-12);
  align-items: stretch;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-10);
  box-shadow:
    0 1px 2px rgba(7, 14, 36, 0.04),
    0 28px 70px -36px rgba(7, 14, 36, 0.18);

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: var(--space-8);
    padding: var(--space-8);
  }
`;

const CardLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
`;

const SkillBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(48, 92, 222, 0.08);
  color: var(--color-primary-600);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const SkillTitle = styled.h3`
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  font-weight: 700;
  color: var(--color-gray-900);
  letter-spacing: -0.025em;
  line-height: 1.15;
  margin: 0;
`;

const SkillForWhom = styled.p`
  font-size: var(--text-base);
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: 0;
`;

const Meta = styled.dl`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--space-2) var(--space-4);
  margin: 0;
  padding-top: var(--space-5);
  border-top: 1px dashed var(--color-border);

  dt {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    padding-top: 2px;
  }

  dd {
    font-size: 0.9375rem;
    color: var(--color-text);
    line-height: 1.5;
    margin: 0;
  }
`;

const CardRight = styled.div`
  background: #0a1535;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  color: #cdd5f4;
  line-height: 1.65;
`;

const PaneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: var(--space-3);

  span:first-child {
    color: #7a9ef5;
    font-weight: 600;
    letter-spacing: 0.1em;
    font-size: 10.5px;
    text-transform: uppercase;
  }

  span:last-child {
    color: #adc1f7;
    font-size: 10.5px;
  }
`;

const StepRow = styled.div`
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: var(--space-3);
  align-items: baseline;
`;

const StepNum = styled.span`
  color: #7a9ef5;
  font-weight: 700;
  text-align: right;
`;

const StepText = styled.span`
  color: #eaeeff;
`;

const Highlight = styled.span`
  color: #fbbf24;
  font-weight: 600;
`;

const OutcomeBlock = styled.div`
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #10b981;
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: var(--space-3);

  span:first-child {
    text-align: right;
    color: #34d399;
  }
`;

type Role = {
  id: string;
  pill: string;
  badge: string;
  title: string;
  forWhom: string;
  trigger: string;
  surface: string;
  steps: Array<{ text: string; highlight?: string }>;
  outcome: string;
};

const roles: Role[] = [
  {
    id: 'creators',
    pill: 'Creators',
    badge: 'SKILL · CREATORS',
    title: 'Turn one YouTube video into a week of LinkedIn.',
    forWhom: 'For the creator who films once and ships everywhere.',
    trigger: 'When I publish a new YouTube video',
    surface: 'YouTube · LinkedIn · Notion',
    steps: [
      { text: 'Pull transcript and chapter timestamps' },
      { text: 'Extract', highlight: '5 high-signal talking points' },
      { text: 'Draft 5 LinkedIn posts in my voice, with hooks' },
    ],
    outcome: '5 drafts in your Notion queue, ready to schedule.',
  },
  {
    id: 'operators',
    pill: 'Social Operators',
    badge: 'SKILL · OPERATORS',
    title: 'Run 10 client accounts before you finish your coffee.',
    forWhom: 'For the social manager juggling brands, calendars, and voices.',
    trigger: 'Mon–Fri at 9:00am',
    surface: 'X · Instagram · TikTok · LinkedIn',
    steps: [
      { text: 'Read today\'s industry news per niche' },
      { text: 'Generate one post per account', highlight: 'in each brand\'s voice' },
      { text: 'Queue via each account\'s scheduler · attach AI images' },
    ],
    outcome: '10 posts scheduled, change log written to Notion.',
  },
  {
    id: 'sales',
    pill: 'Sales & Growth',
    badge: 'SKILL · SALES',
    title: 'Scrape 500 KOLs from a hashtag — with contact methods.',
    forWhom: 'For the operator who needs leads, not another scraper subscription.',
    trigger: 'When I add a new niche to my CRM',
    surface: 'X · LinkedIn · Apollo · Airtable',
    steps: [
      { text: 'Find top posters in #AIagents over 30 days' },
      { text: 'Visit each profile, extract', highlight: 'handle · followers · site · email' },
      { text: 'Push enriched rows to Airtable, dedupe against CRM' },
    ],
    outcome: '500-row prospect table, ready for your first send.',
  },
  {
    id: 'freelancers',
    pill: 'Freelancers',
    badge: 'SKILL · FREELANCERS',
    title: 'Deliver an AI workflow to an SMB client by EOD.',
    forWhom: 'For the freelancer selling AI transformation — without writing code from scratch.',
    trigger: 'After client kickoff form is submitted',
    surface: 'Notion · Slack · Google Sheets',
    steps: [
      { text: 'Read the intake form, infer the workflow shape' },
      { text: 'Spin up a', highlight: 'form → Slack → Sheet pipeline' },
      { text: 'Hand client a Loom + login + 1-page runbook' },
    ],
    outcome: 'Client onboarded in an afternoon — billable as a week.',
  },
  {
    id: 'coaches',
    pill: 'Coaches & Consultants',
    badge: 'SKILL · COACHES',
    title: 'Onboard every new 1:1 client like it\'s your first.',
    forWhom: 'For the coach whose playbook is in their head — and now in their agent.',
    trigger: 'When a Calendly intake completes',
    surface: 'Calendly · Gmail · Notion',
    steps: [
      { text: 'Send assessment built from', highlight: 'your own framework' },
      { text: 'Generate a 12-week plan from intake answers' },
      { text: 'Schedule next 3 calls, draft welcome email' },
    ],
    outcome: 'Client gets a welcome packet that feels personally crafted.',
  },
  {
    id: 'founders',
    pill: 'Founders',
    badge: 'SKILL · FOUNDERS',
    title: 'Submit to 1,000 AI directories overnight.',
    forWhom: 'For the solopreneur launching — or the job seeker shipping résumés.',
    trigger: 'Manual run on launch day',
    surface: 'ProductHunt · AlternativeTo · FutureTools · 997 more',
    steps: [
      { text: 'Pull product copy and screenshots from your site' },
      { text: 'Fill each listing form per directory schema', highlight: 'with retries' },
      { text: 'Log submission status to a Notion launch board' },
    ],
    outcome: '1,000 listings submitted by morning. Same skill works for résumés.',
  },
];

export default function UseCasesSection() {
  const [active, setActive] = useState(roles[0].id);
  const role = roles.find(r => r.id === active) ?? roles[0];

  return (
    <Section id="use-cases">
      <Inner>
        <Header>
          <Label>What you can build</Label>
          <Title>
            One skill. <em>Many places to ship.</em>
          </Title>
          <Lead>
            Pick a role to see a real skill — what triggers it, what it does, and what you get back.
          </Lead>
        </Header>

        <Pills role="tablist" aria-label="Use cases">
          {roles.map(r => (
            <Pill
              key={r.id}
              role="tab"
              aria-selected={active === r.id}
              $active={active === r.id}
              onClick={() => setActive(r.id)}
            >
              {r.pill}
            </Pill>
          ))}
        </Pills>

        <Card key={role.id}>
          <CardLeft>
            <SkillBadge>{role.badge}</SkillBadge>
            <SkillTitle>{role.title}</SkillTitle>
            <SkillForWhom>{role.forWhom}</SkillForWhom>

            <Meta>
              <dt>Trigger</dt>
              <dd>{role.trigger}</dd>
              <dt>Surface</dt>
              <dd>{role.surface}</dd>
            </Meta>
          </CardLeft>

          <CardRight>
            <PaneHeader>
              <span>SKILL.run()</span>
              <span>{role.steps.length} steps</span>
            </PaneHeader>

            {role.steps.map((s, i) => (
              <StepRow key={i}>
                <StepNum>{(i + 1).toString().padStart(2, '0')}</StepNum>
                <StepText>
                  {s.text}
                  {s.highlight && (
                    <>
                      {' '}
                      <Highlight>{s.highlight}</Highlight>
                    </>
                  )}
                </StepText>
              </StepRow>
            ))}

            <OutcomeBlock>
              <span>→</span>
              <span>{role.outcome}</span>
            </OutcomeBlock>
          </CardRight>
        </Card>
      </Inner>
    </Section>
  );
}
