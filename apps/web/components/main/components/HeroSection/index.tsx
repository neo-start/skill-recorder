'use client';

import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import Button from '@/components/ui/Button';
import { CTA_URL, withUTM } from '@/lib/utm';

/* ────────────────────────────────────────────────────────────────────
 * Hero — asymmetric 60/40, editorial. Left column: a real headline +
 * prose paragraph + CTA row + technical readout strip. Right column:
 * an evidence card that shows the actual before/after of a recording.
 * No radial-gradient blobs, no centered laptop SVG.
 * ──────────────────────────────────────────────────────────────────── */

const Section = styled.section`
  position: relative;
  padding-block: calc(var(--navbar-height) + var(--space-16)) var(--space-20);
  background:
    radial-gradient(circle at 1px 1px, rgba(15, 30, 74, 0.06) 1px, transparent 0) 0 0 / 24px 24px,
    linear-gradient(180deg, #fbfcff 0%, #ffffff 80%);
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 960px) {
    padding-block: calc(var(--navbar-height) + var(--space-10)) var(--space-12);
  }
`;

const Grid = styled.div`
  max-width: var(--container-max);
  margin: 0 auto;
  padding-inline: var(--space-8);
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
  gap: var(--space-16);
  align-items: center;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: var(--space-12);
    padding-inline: var(--space-6);
  }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  min-width: 0;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary-600);
`;

const Pulse = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18);
`;

const Headline = styled.h1`
  font-size: clamp(2.1rem, 4.8vw, 3.4rem);
  font-weight: 700;
  color: var(--color-gray-900);
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 0;

  em {
    font-style: italic;
    font-family: 'Iowan Old Style', 'Georgia', 'Times New Roman', serif;
    font-weight: 500;
    color: var(--color-primary-600);
    letter-spacing: -0.02em;
  }
`;

const Lead = styled.p`
  font-size: var(--text-lg);
  color: var(--color-gray-700);
  line-height: 1.55;
  margin: 0;
  max-width: 54ch;

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.92em;
    background: var(--color-bg-subtle);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 1px 6px;
    color: var(--color-primary-600);
  }
`;

const HandNote = styled.span`
  font-family: var(--font-hand);
  font-size: 1.5em;
  color: var(--color-primary-500);
  line-height: 1;
  margin: 0 4px;
  position: relative;
  top: 1px;
`;

const Ctas = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex-wrap: wrap;
  margin-top: var(--space-2);
`;

const Primary = styled(Button)`
  height: 52px;
  padding: 0 var(--space-7);
  border-radius: 10px;
  font-size: var(--text-base);
  font-weight: 600;
  gap: var(--space-2);
  box-shadow: 0 8px 22px rgba(48, 92, 222, 0.26);
`;

const Secondary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 1px solid var(--color-border-hover);
  padding-bottom: 2px;
  transition: color var(--transition-fast), border-color var(--transition-fast);

  &:hover {
    color: var(--color-primary-500);
    border-bottom-color: var(--color-primary-500);
  }
`;

const SpecStrip = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  margin-top: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px dashed var(--color-border);

  & > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  & > span:not(:last-child)::after {
    content: '·';
    margin-left: var(--space-3);
    color: var(--color-border-hover);
  }
`;

const Dot = styled.i`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-primary-300);
  display: inline-block;
`;

/* ── Right: evidence card ─────────────────────────────────────────── */

const Panel = styled.figure`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  @media (max-width: 960px) {
    margin-top: var(--space-2);
  }
`;

const Card = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--color-bg);
  box-shadow:
    0 1px 2px rgba(7, 14, 36, 0.04),
    0 22px 60px -24px rgba(7, 14, 36, 0.22);
`;

const Chrome = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px var(--space-4);
  background: var(--color-bg-subtle);
  border-bottom: 1px solid var(--color-border);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: var(--color-text-muted);
`;

const Dots = styled.span`
  display: inline-flex;
  gap: 6px;
  align-items: center;

  & > i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }
  & > i:nth-child(1) { background: #ff5f57; }
  & > i:nth-child(2) { background: #febc2e; }
  & > i:nth-child(3) { background: #28c840; }
`;

const Path = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
`;

const LiveDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #b91c1c;
  font-weight: 600;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #b91c1c;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
`;

const PaneLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px var(--space-4);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);

  span:last-child {
    color: var(--color-text-faint);
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
  }
`;

const Lines = styled.div`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.7;
  padding: var(--space-3) 0;
  background: var(--color-bg);
  overflow-x: auto;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr;
  padding: 0 var(--space-4) 0 0;
  white-space: pre;
  color: var(--color-text);

  &:hover {
    background: rgba(48, 92, 222, 0.04);
  }
`;

const Gutter = styled.span`
  text-align: right;
  padding-right: var(--space-3);
  color: var(--color-text-faint);
  user-select: none;
  font-variant-numeric: tabular-nums;
`;

const Cmt = styled.span`
  color: var(--color-text-faint);
`;
const Kw = styled.span`
  color: var(--color-primary-500);
  font-weight: 600;
`;
const Str = styled.span`
  color: #b91c1c;
`;
const Fn = styled.span`
  color: var(--color-primary-600);
  font-weight: 600;
`;
const Param = styled.span`
  color: var(--color-primary-600);
  font-weight: 600;
  background: rgba(48, 92, 222, 0.09);
  border: 1px solid rgba(48, 92, 222, 0.2);
  border-radius: 3px;
  padding: 0 4px;
`;
const Warn = styled.span`
  color: #c2410c;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-subtle);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border-hover);
  }
`;

const DividerText = styled.span`
  font-family: var(--font-hand);
  font-size: 1.05rem;
  color: var(--color-primary-500);
  white-space: nowrap;
`;

const Caption = styled.figcaption`
  font-family: var(--font-hand);
  font-size: 1.05rem;
  color: var(--color-text-muted);
  line-height: 1.4;
  text-align: right;
  padding: 0 var(--space-2);

  strong {
    color: var(--color-primary-500);
    font-weight: 400;
  }
`;

function ChromeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2 A10 10 0 0 1 20.66 17 L16.76 14.75 A5.5 5.5 0 0 0 12 6.5 Z" fill="#EA4335" />
      <path d="M20.66 17 A10 10 0 0 1 3.34 17 L7.24 14.75 A5.5 5.5 0 0 0 16.76 14.75 Z" fill="#FBBC04" />
      <path d="M3.34 17 A10 10 0 0 1 12 2 L12 6.5 A5.5 5.5 0 0 0 7.24 14.75 Z" fill="#34A853" />
      <circle cx="12" cy="12" r="5.5" fill="white" />
      <circle cx="12" cy="12" r="4" fill="#4285F4" />
    </svg>
  );
}

export default function HeroSection() {
  const t = useTranslations('main.hero');

  return (
    <Section id="hero">
      <Grid>
        <Left>
          <Eyebrow>
            <Pulse aria-hidden="true" />
            {t('eyebrow')}
          </Eyebrow>

          <Headline>
            {t('titleLine1')}<br />
            <em>{t('titleLine2Em')}</em>
          </Headline>

          <Lead>
            {t.rich('lead', {
              em: (chunks) => <em>{chunks}</em>,
              hand: (chunks) => <HandNote>{chunks}</HandNote>,
              code: (chunks) => <code>{chunks}</code>,
            })}
          </Lead>

          <Ctas>
            <Primary size="lg" href={withUTM(CTA_URL, 'hero_cta')}>
              <ChromeIcon /> {t('ctaPrimary')}
            </Primary>
            <Secondary href="/playground">{t('ctaSecondary')}</Secondary>
          </Ctas>

          <SpecStrip aria-label="Technical readout">
            <span><Dot /> v0.4.1</span>
            <span>4.5 MB bundle</span>
            <span>MV3 service worker</span>
            <span>21 fixtures</span>
            <span>12 locales</span>
          </SpecStrip>
        </Left>

        <Panel>
          <Card>
            <Chrome>
              <Dots aria-hidden="true"><i /><i /><i /></Dots>
              <Path>~/Downloads/recordings/2026-03-create-po.json</Path>
              <LiveDot>recording</LiveDot>
            </Chrome>

            <PaneLabel>
              <span>RAW EVENTS</span>
              <span>23 captured · 4.6s elapsed</span>
            </PaneLabel>
            <Lines>
              <Row><Gutter>01</Gutter><span><Kw>navigate</Kw>  <Str>"/orders/new"</Str>  <Cmt>// 304 → 200</Cmt></span></Row>
              <Row><Gutter>02</Gutter><span><Kw>click</Kw>     <Str>"button.tabs__new"</Str>  <Cmt>// data-tab=create</Cmt></span></Row>
              <Row><Gutter>03</Gutter><span><Kw>focus</Kw>     <Str>"#sku"</Str></span></Row>
              <Row><Gutter>04</Gutter><span><Kw>type</Kw>      <Str>"SKU-1029"</Str>  <Cmt>// 8 keystrokes, 1.2s</Cmt></span></Row>
              <Row><Gutter>05</Gutter><span><Kw>blur</Kw>      <Str>"#sku"</Str></span></Row>
              <Row><Gutter>06</Gutter><span><Kw>type</Kw>      <Str>"50"</Str>  <Cmt>// into #qty</Cmt></span></Row>
              <Row><Gutter>07</Gutter><span><Kw>click</Kw>     <Str>"button.submit"</Str>  <Warn>⚠ inside dynamic list</Warn></span></Row>
              <Row><Gutter>{'  '}</Gutter><span><Cmt>… 16 more (scroll · focus · mousemove · blur · resize)</Cmt></span></Row>
            </Lines>

            <Divider>
              <DividerText>distilled in 30s ↓</DividerText>
            </Divider>

            <PaneLabel>
              <span>SKILL.md</span>
              <span>4 steps · 2 inputs · 1 precondition</span>
            </PaneLabel>
            <Lines>
              <Row><Gutter>01</Gutter><span><Kw>#</Kw> <Fn>create-purchase-order</Fn></span></Row>
              <Row><Gutter>02</Gutter><span></span></Row>
              <Row><Gutter>03</Gutter><span><Cmt>// precondition: signed in to supplier portal</Cmt></span></Row>
              <Row><Gutter>04</Gutter><span></span></Row>
              <Row><Gutter>05</Gutter><span><Kw>## inputs</Kw></span></Row>
              <Row><Gutter>06</Gutter><span>- <Param>{`{{sku}}`}</Param>       <Cmt>// auto-detected · 8 chars · alphanumeric</Cmt></span></Row>
              <Row><Gutter>07</Gutter><span>- <Param>{`{{quantity}}`}</Param>  <Cmt>// auto-detected · int · 1–999</Cmt></span></Row>
              <Row><Gutter>08</Gutter><span></span></Row>
              <Row><Gutter>09</Gutter><span><Kw>## steps</Kw></span></Row>
              <Row><Gutter>10</Gutter><span>1. navigate <Str>"/orders/new"</Str></span></Row>
              <Row><Gutter>11</Gutter><span>2. fill <Str>"#sku"</Str> with <Param>{`{{sku}}`}</Param></span></Row>
              <Row><Gutter>12</Gutter><span>3. fill <Str>"#qty"</Str> with <Param>{`{{quantity}}`}</Param></span></Row>
              <Row><Gutter>13</Gutter><span>4. click submit row matching <Param>{`{{sku}}`}</Param></span></Row>
            </Lines>
          </Card>

          <Caption>
            {t('captionLine1')}<br />
            {t.rich('captionLine2', { strong: (chunks) => <strong>{chunks}</strong> })}
          </Caption>
        </Panel>
      </Grid>
    </Section>
  );
}
