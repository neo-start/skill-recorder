'use client';

import { useTranslations } from 'next-intl';
import styled from 'styled-components';

type StepKey = 'install' | 'scrape' | 'export';
const STEPS: StepKey[] = ['install', 'scrape', 'export'];

const Section = styled.section`
  background: var(--color-bg);
  padding-block: var(--section-padding-y);
  border-top: 1px solid color-mix(in srgb, var(--color-border) 40%, transparent);
`;

const Head = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-16);
`;

const Accent = styled.span`
  color: var(--color-primary-600);
`;

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
  position: relative;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
`;

const Step = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const Connector = styled.div`
  position: absolute;
  top: calc(172px / 2 - 9px);
  right: -25px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-border);

  @media (max-width: 480px) {
    top: auto;
    bottom: -20px;
    right: 50%;
    transform: translateX(50%) rotate(90deg);
  }
`;

const Card = styled.div<{ $variant: 0 | 1 | 2 }>`
  display: flex;
  flex-direction: column;
  border: 1px solid transparent;
  border-radius: var(--radius-xl);
  overflow: hidden;
  height: 100%;
  transition: border var(--transition-fast);
  background: ${({ $variant }) =>
    $variant === 1 ? 'var(--color-primary-300)' : 'var(--color-primary-50)'};

  &:hover {
    border: 1px solid var(--color-primary-500);
  }
`;

const CardText = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  min-height: 172px;
  flex-shrink: 0;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary-600);
`;

const StepNumber = styled.span<{ $variant: 0 | 1 | 2 }>`
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: monospace;
  letter-spacing: 0.12em;
  line-height: 1;
  color: ${({ $variant }) =>
    $variant === 0 ? '#305cde'
    : $variant === 1 ? 'rgba(255, 255, 255, 0.72)'
    : '#0891b2'};
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const StepTitle = styled.h3<{ $variant: 0 | 1 | 2 }>`
  font-size: var(--text-lg);
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: ${({ $variant }) =>
    $variant === 1 ? '#ffffff' : 'var(--color-gray-900)'};
`;

const StepDesc = styled.p<{ $variant: 0 | 1 | 2 }>`
  font-size: var(--text-sm);
  line-height: 1.65;
  margin: 0;
  color: ${({ $variant }) =>
    $variant === 1 ? 'rgba(255, 255, 255, 0.78)' : 'var(--color-gray-700)'};
`;

const ScreenshotWrap = styled.div`
  width: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4) 0;
`;

const Mockup = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(15, 30, 74, 0.4);
`;

// Inline step icons & mockup illustrations — avoid needing external CDN assets.

function InstallIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3M7 11l5 5 5-5M12 16V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RecordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M14 3h7v7M21 3l-9 9M5 5h6M5 12h4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STEP_ICONS: Record<StepKey, () => JSX.Element> = {
  install: InstallIcon,
  scrape: RecordIcon,
  export: ExportIcon,
};

function StepMockup({ stepKey }: { stepKey: StepKey }) {
  if (stepKey === 'install') {
    return (
      <svg viewBox="0 0 200 120" width="100%" preserveAspectRatio="xMidYMid meet">
        <rect x="6" y="14" width="188" height="92" rx="10" fill="#ffffff" stroke="currentColor" strokeWidth="1.2" />
        <rect x="22" y="34" width="80" height="14" rx="4" fill="currentColor" opacity="0.18" />
        <rect x="22" y="56" width="120" height="8" rx="3" fill="currentColor" opacity="0.12" />
        <rect x="22" y="74" width="60" height="20" rx="6" fill="#305cde" />
      </svg>
    );
  }
  if (stepKey === 'scrape') {
    return (
      <svg viewBox="0 0 200 120" width="100%" preserveAspectRatio="xMidYMid meet">
        <rect x="6" y="14" width="188" height="92" rx="10" fill="#ffffff" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="36" cy="60" r="14" fill="#ef4444" />
        <rect x="58" y="55" width="120" height="10" rx="3" fill="#ffffff" opacity="0" />
        <rect x="58" y="50" width="100" height="6" rx="2" fill="currentColor" opacity="0.2" />
        <rect x="58" y="64" width="70" height="6" rx="2" fill="currentColor" opacity="0.12" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 120" width="100%" preserveAspectRatio="xMidYMid meet">
      <rect x="6" y="14" width="188" height="92" rx="10" fill="#ffffff" stroke="currentColor" strokeWidth="1.2" />
      <rect x="22" y="30" width="156" height="10" rx="3" fill="currentColor" opacity="0.18" />
      <rect x="22" y="48" width="100" height="6" rx="2" fill="currentColor" opacity="0.12" />
      <rect x="22" y="62" width="120" height="6" rx="2" fill="currentColor" opacity="0.12" />
      <rect x="22" y="82" width="68" height="14" rx="5" fill="#0891b2" />
    </svg>
  );
}

export default function HowItWorksSection() {
  const t = useTranslations('main.howItWorks');

  return (
    <Section id="how-it-works">
      <div className="container">
        <Head>
          <h2 className="section-title">
            {t.rich('title', {
              accent: chunks => <Accent>{chunks}</Accent>,
            })}
          </h2>
        </Head>

        <Steps>
          {STEPS.map((key, idx) => {
            const Icon = STEP_ICONS[key];
            const variant = idx as 0 | 1 | 2;
            return (
              <Step key={key}>
                {idx < STEPS.length - 1 && (
                  <Connector aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M6.5 4L12 9L6.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Connector>
                )}

                <Card $variant={variant}>
                  <CardText>
                    <CardTop>
                      <IconWrap>
                        <Icon />
                      </IconWrap>
                      <StepNumber $variant={variant}>{t(`steps.${key}.number`)}</StepNumber>
                    </CardTop>
                    <CardBody>
                      <StepTitle $variant={variant}>{t(`steps.${key}.title`)}</StepTitle>
                      <StepDesc $variant={variant}>{t(`steps.${key}.desc`)}</StepDesc>
                    </CardBody>
                  </CardText>

                  <ScreenshotWrap>
                    <Mockup>
                      <StepMockup stepKey={key} />
                    </Mockup>
                  </ScreenshotWrap>
                </Card>
              </Step>
            );
          })}
        </Steps>
      </div>
    </Section>
  );
}
