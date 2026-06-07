'use client';

import { useState } from 'react';
import styled from 'styled-components';

/* Delphi-style UseCasesSection. Keeps the interactive 6-pill tab
 * pattern + skill card content; repaints everything monochrome.
 *
 * Stripped: royal-blue active pill, royal-blue gradient highlight
 * accents, dark navy code-pane preview card with cyan/yellow syntax
 * coloring.
 *
 * Adopted: Inter throughout, near-black active pill (Delphi's tab
 * treatment), warm cream skill-card surface, hairline dividers,
 * neutral check / arrow icons. */

const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const INK = '#0a0a0a';
const SUB = '#6b6b6b';
const HAIRLINE = '#e8e6e1';
const CARD = '#faf8f4';
const FAINT = '#999999';
const PAGE = '#fafaf7';

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

  @media (max-width: 768px) {
    padding-inline: 22px;
  }
`;

const Header = styled.div`
  max-width: 680px;
  margin: 0 auto 56px;
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

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
`;

const Pill = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 18px;
  border-radius: 100px;
  border: 1px solid ${({ $active }) => ($active ? INK : HAIRLINE)};
  background: ${({ $active }) => ($active ? INK : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : INK)};
  font-family: ${SANS};
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;

  &:hover {
    border-color: ${INK};
  }
`;

const Card = styled.article`
  background: #ffffff;
  border: 1px solid ${HAIRLINE};
  border-radius: 24px;
  padding: 40px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 48px;
  align-items: stretch;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 32px;
  }
`;

const CardLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
`;

const Badge = styled.div`
  display: inline-flex;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 100px;
  background: #ffffff;
  border: 1px solid ${HAIRLINE};
  color: ${SUB};
  font-family: ${SANS};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const SkillTitle = styled.h3`
  font-family: ${SANS};
  font-size: clamp(1.4rem, 2.4vw, 1.875rem);
  font-weight: 600;
  color: ${INK};
  letter-spacing: -0.025em;
  line-height: 1.15;
  margin: 0;
`;

const ForWhom = styled.p`
  font-family: ${SANS};
  font-size: 1rem;
  color: ${SUB};
  line-height: 1.55;
  margin: 0;
`;

const Meta = styled.dl`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 8px 18px;
  margin: 0;
  padding-top: 18px;
  border-top: 1px solid ${HAIRLINE};

  dt {
    font-family: ${SANS};
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${FAINT};
    padding-top: 2px;
  }

  dd {
    font-family: ${SANS};
    font-size: 0.9375rem;
    color: ${INK};
    line-height: 1.5;
    margin: 0;
  }
`;

const CardRight = styled.div`
  background: ${CARD};
  border: 1px solid ${HAIRLINE};
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: ${SANS};
  font-size: 14px;
  color: ${INK};
  line-height: 1.6;
`;

const PaneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid ${HAIRLINE};
  margin-bottom: 6px;
  font-family: ${SANS};
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${FAINT};
  font-weight: 500;
`;

const StepRow = styled.div`
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 12px;
  align-items: baseline;
`;

const StepNum = styled.span`
  color: ${FAINT};
  font-weight: 600;
  text-align: right;
  font-size: 13px;
`;

const StepText = styled.span`
  color: ${INK};
`;

const Highlight = styled.span`
  font-style: italic;
  color: ${INK};
  font-weight: 600;
`;

const OutcomeBlock = styled.div`
  margin-top: 10px;
  padding-top: 14px;
  border-top: 1px solid ${HAIRLINE};
  color: ${INK};
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 12px;
  font-style: italic;

  span:first-child {
    text-align: right;
    color: ${INK};
    font-style: normal;
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
    badge: 'Skill · Creators',
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
    badge: 'Skill · Operators',
    title: 'Run 10 client accounts before you finish your coffee.',
    forWhom: 'For the social manager juggling brands, calendars, and voices.',
    trigger: 'Mon–Fri at 9:00am',
    surface: 'X · Instagram · TikTok · LinkedIn',
    steps: [
      { text: "Read today's industry news per niche" },
      { text: 'Generate one post per account', highlight: "in each brand's voice" },
      { text: "Queue via each account's scheduler · attach AI images" },
    ],
    outcome: '10 posts scheduled, change log written to Notion.',
  },
  {
    id: 'sales',
    pill: 'Sales & Growth',
    badge: 'Skill · Sales',
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
    badge: 'Skill · Freelancers',
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
    badge: 'Skill · Coaches',
    title: "Onboard every new 1:1 client like it's your first.",
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
    badge: 'Skill · Founders',
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
            <Badge>{role.badge}</Badge>
            <SkillTitle>{role.title}</SkillTitle>
            <ForWhom>{role.forWhom}</ForWhom>

            <Meta>
              <dt>Trigger</dt>
              <dd>{role.trigger}</dd>
              <dt>Surface</dt>
              <dd>{role.surface}</dd>
            </Meta>
          </CardLeft>

          <CardRight>
            <PaneHeader>
              <span>Skill.run()</span>
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
