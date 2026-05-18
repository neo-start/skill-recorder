'use client';

import { useTranslations } from 'next-intl';
import styled from 'styled-components';

/* ────────────────────────────────────────────────────────────────────
 * Anatomy — a labeled pipeline diagram (capture → distill → replay).
 * Replaces the old HowItWorks 3-card grid with a single editorial
 * banner that names the actual components doing the work.
 * ──────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  background: var(--color-bg);
  padding-block: var(--section-padding-y);
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
`;

const Container = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--space-8);

  @media (max-width: 768px) {
    padding-inline: var(--space-6);
  }
`;

const Head = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: var(--space-12);
  align-items: end;
  margin-bottom: var(--space-12);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
`;

const Tag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary-600);
  margin-bottom: var(--space-3);

  &::before {
    content: '§';
    font-family: 'Iowan Old Style', Georgia, serif;
    font-size: 1.3em;
    color: var(--color-primary-300);
  }
`;

const Title = styled.h2`
  font-size: clamp(1.75rem, 3.4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--color-gray-900);
  margin: 0;

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', Georgia, serif;
    font-weight: 500;
    color: var(--color-primary-600);
  }
`;

const Lead = styled.p`
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--color-gray-700);
  margin: 0;
  max-width: 48ch;

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.9em;
    background: var(--color-bg-subtle);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 1px 5px;
    color: var(--color-primary-600);
  }
`;

/* ── Pipeline ────────────────────────────────────────────────────── */

const Pipeline = styled.div`
  display: grid;
  grid-template-columns: 1fr 60px 1fr 60px 1fr;
  align-items: stretch;
  gap: 0;
  position: relative;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
`;

const Stage = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-bg);
  overflow: hidden;
  min-width: 0;
`;

const StageHead = styled.div`
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border);

  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  justify-content: space-between;
`;

const StageNum = styled.span`
  font-family: 'Iowan Old Style', Georgia, serif;
  font-size: var(--text-2xl);
  font-weight: 500;
  color: var(--color-primary-300);
  font-style: italic;
  line-height: 1;
`;

const StageName = styled.h3`
  margin: 0;
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-gray-900);
  letter-spacing: -0.01em;
  flex: 1;
`;

const StageMeta = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  color: var(--color-text-faint);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
`;

const StageBody = styled.div`
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  flex: 1;
`;

const StageDesc = styled.p`
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-gray-700);

  strong {
    color: var(--color-gray-900);
    font-weight: 600;
  }
`;

const Bullets = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--color-text-muted);

  li {
    display: grid;
    grid-template-columns: 14px 1fr;
    gap: 6px;
    align-items: baseline;
  }

  li::before {
    content: '·';
    color: var(--color-primary-300);
    font-size: 1.4em;
    line-height: 1;
  }
`;

const Connector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 var(--space-2);

  @media (max-width: 1024px) {
    transform: rotate(90deg);
    padding: var(--space-2) 0;
  }
`;

const Wire = styled.span`
  flex: 1;
  width: 1px;
  min-height: 24px;
  background: repeating-linear-gradient(
    to bottom,
    var(--color-border-hover) 0 4px,
    transparent 4px 8px
  );

  /* For horizontal layout, swap dimensions */
  @media (min-width: 1025px) {
    width: 100%;
    height: 1px;
    background: repeating-linear-gradient(
      to right,
      var(--color-border-hover) 0 4px,
      transparent 4px 8px
    );
  }
`;

const WireLabel = styled.span`
  font-family: var(--font-hand);
  font-size: 1rem;
  color: var(--color-primary-500);
  white-space: nowrap;
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg);

  @media (max-width: 1024px) {
    transform: rotate(-90deg);
    transform-origin: center;
  }
`;

/* ── Stage-specific visuals ──────────────────────────────────────── */

const SidePanelMock = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  line-height: 1.55;
  background: var(--color-primary-800);
  color: var(--color-primary-100);
  border-radius: 8px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-primary-700);
`;

const SideHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(122, 158, 245, 0.7);
  margin-bottom: var(--space-2);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid rgba(122, 158, 245, 0.18);
`;

const RecDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #f87171;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ef4444;
  }
`;

const Evt = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 8px;
  padding: 1px 0;
  color: rgba(214, 224, 251, 0.9);

  span:first-child {
    color: #7a9ef5;
    font-weight: 600;
  }
`;

const DistillFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  line-height: 1.5;
`;

const FlowRow = styled.div`
  display: grid;
  grid-template-columns: 14px 1fr auto;
  gap: 10px;
  align-items: baseline;
  padding: 6px 10px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);

  span:first-child {
    color: var(--color-success);
    font-weight: 700;
  }

  span:last-child {
    color: var(--color-text-faint);
    font-size: 10.5px;
    font-variant-numeric: tabular-nums;
  }
`;

const Terminal = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  line-height: 1.55;
  background: var(--color-gray-900);
  color: #d4d4d4;
  border-radius: 8px;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-700);
`;

const Prompt = styled.div`
  color: #a3a3a3;
  margin-bottom: 4px;

  span {
    color: var(--color-primary-300);
  }
`;

const Cmd = styled.div`
  color: #fbbf24;
  margin-bottom: 6px;
`;

const Out = styled.div`
  color: #d4d4d4;
  white-space: pre-wrap;
`;

const Ok = styled.span`
  color: #10b981;
  font-weight: 600;
`;

const InlineCode = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1px 5px;
  color: var(--color-primary-600);
`;

export default function AnatomySection() {
  const t = useTranslations('main.anatomy');
  const captureBullets = t.raw('capture.bullets') as string[];
  const distillBullets = t.raw('distill.bullets') as string[];
  const replayBullets = t.raw('replay.bullets') as string[];

  return (
    <Section id="anatomy">
      <Container>
        <Head>
          <div>
            <Tag>{t('tag')}</Tag>
            <Title>
              {t.rich('title', { em: (chunks) => <em>{chunks}</em> })}
            </Title>
          </div>
          <Lead>
            {t.rich('lead', { code: (chunks) => <code>{chunks}</code> })}
          </Lead>
        </Head>

        <Pipeline>
          {/* ── Stage 1 ── */}
          <Stage>
            <StageHead>
              <StageNum>i.</StageNum>
              <StageName>{t('capture.name')}</StageName>
              <StageMeta>{t('capture.meta')}</StageMeta>
            </StageHead>
            <StageBody>
              <SidePanelMock>
                <SideHeader>
                  <span>Skill Recorder</span>
                  <RecDot>REC</RecDot>
                </SideHeader>
                <Evt><span>00:01</span><span>click <em style={{color:'#fde68a',fontStyle:'normal'}}>nav.Orders</em></span></Evt>
                <Evt><span>00:02</span><span>click <em style={{color:'#fde68a',fontStyle:'normal'}}>btn.New</em></span></Evt>
                <Evt><span>00:04</span><span>focus <em style={{color:'#fde68a',fontStyle:'normal'}}>#sku</em></span></Evt>
                <Evt><span>00:05</span><span>type "SKU-1029"</span></Evt>
                <Evt><span>00:06</span><span>blur <em style={{color:'#fde68a',fontStyle:'normal'}}>#sku</em></span></Evt>
                <Evt><span>00:08</span><span>type "50" → #qty</span></Evt>
                <Evt><span>00:09</span><span>click <em style={{color:'#fde68a',fontStyle:'normal'}}>btn.Submit</em></span></Evt>
              </SidePanelMock>
              <StageDesc>
                {t.rich('capture.desc', { strong: (chunks) => <strong>{chunks}</strong> })}
              </StageDesc>
              <Bullets>
                {captureBullets.map((b) => (
                  <li key={b}><span>{b}</span></li>
                ))}
              </Bullets>
            </StageBody>
          </Stage>

          <Connector>
            <Wire />
            <WireLabel>{t('wireToDistill')}</WireLabel>
            <Wire />
          </Connector>

          {/* ── Stage 2 ── */}
          <Stage>
            <StageHead>
              <StageNum>ii.</StageNum>
              <StageName>{t('distill.name')}</StageName>
              <StageMeta>{t('distill.meta')}</StageMeta>
            </StageHead>
            <StageBody>
              <DistillFlow>
                <FlowRow><span>✓</span><span>dedupe consecutive clicks</span><span>23 → 16</span></FlowRow>
                <FlowRow><span>✓</span><span>fold keystrokes into <em>type()</em></span><span>16 → 11</span></FlowRow>
                <FlowRow><span>✓</span><span>detect inputs as <em>{`{{params}}`}</em></span><span>conf 0.94</span></FlowRow>
                <FlowRow><span>✓</span><span>mark auth boundary</span><span>+1 precondition</span></FlowRow>
                <FlowRow><span>✓</span><span>parameterize URL segments</span><span>2 swapped</span></FlowRow>
                <FlowRow><span>✓</span><span>flag dynamic-list clicks</span><span>1 ⚠ note</span></FlowRow>
              </DistillFlow>
              <StageDesc>
                {t.rich('distill.desc', { strong: (chunks) => <strong>{chunks}</strong> })}
              </StageDesc>
              <Bullets>
                {distillBullets.map((b) => (
                  <li key={b}><span>{b}</span></li>
                ))}
              </Bullets>
            </StageBody>
          </Stage>

          <Connector>
            <Wire />
            <WireLabel>{t('wireToReplay')}</WireLabel>
            <Wire />
          </Connector>

          {/* ── Stage 3 ── */}
          <Stage>
            <StageHead>
              <StageNum>iii.</StageNum>
              <StageName>{t('replay.name')}</StageName>
              <StageMeta>{t('replay.meta')}</StageMeta>
            </StageHead>
            <StageBody>
              <Terminal>
                <Prompt><span>~/work</span> $ claude</Prompt>
                <Cmd>&gt; create POs for these 50 rows</Cmd>
                <Out>
{`Reading ~/.claude/skills/create-purchase-order/SKILL.md
Loaded 4 steps · 2 params · 1 precondition

▸ resolving precondition: signed in to supplier portal
  `}<Ok>✓</Ok>{` cookie present, expires 2026-08-04

▸ running batch [50 rows]
  `}<Ok>✓</Ok>{` 50/50 in 3m 11s
  `}<Ok>✓</Ok>{` 0 retries, 0 manual rescues`}
                </Out>
              </Terminal>
              <StageDesc>
                {t.rich('replay.desc', {
                  code: (chunks) => <InlineCode>{chunks}</InlineCode>,
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </StageDesc>
              <Bullets>
                {replayBullets.map((b) => (
                  <li key={b}><span>{b}</span></li>
                ))}
              </Bullets>
            </StageBody>
          </Stage>
        </Pipeline>
      </Container>
    </Section>
  );
}
