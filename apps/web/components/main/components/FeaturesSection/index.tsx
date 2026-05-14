'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled, { css } from 'styled-components';
import { CTA_URL, withUTM } from '@/lib/utm';

const FEATURE_KEYS = ['f1', 'f2', 'f3', 'f4'] as const;

const Root = styled.section`
  padding-block: var(--section-padding-y);
  background: var(--color-bg);
`;

const SectionHead = styled.div`
  margin-bottom: var(--space-14);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
`;

const Accent = styled.span`
  color: var(--color-primary-600);
`;

const Highlight = styled.span`
  color: var(--color-primary-500);
  font-weight: 600;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
`;

const cardBgByIdx = (idx: number) => {
  if (idx === 0) return 'var(--color-primary-100)';
  if (idx === 1) return '#f5f5f5';
  if (idx === 2) return 'var(--color-primary-300)';
  return '#f5f5f5';
};

const iconBgByIdx = (idx: number) =>
  idx === 2 ? 'var(--color-primary-200)' : 'var(--color-primary-50)';

const Card = styled.div<{ $idx: number }>`
  position: relative;
  border-radius: var(--radius-2xl);
  background: ${({ $idx }) => cardBgByIdx($idx)};
  border: none;
  overflow: hidden;
  padding: var(--space-8) var(--space-8) var(--space-8) var(--space-10);
  transition: box-shadow 0.25s ease;

  @media (max-width: 900px) {
    padding: var(--space-6) var(--space-5);
  }
`;

const CardContent = styled.div<{ $reverse: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--space-10);

  ${({ $reverse }) =>
    $reverse &&
    css`
      flex-direction: row-reverse;
    `}

  @media (max-width: 900px) {
    flex-direction: column !important;
    gap: var(--space-6);
  }
`;

const TextBlock = styled.div<{ $wide?: boolean }>`
  flex: ${({ $wide }) => ($wide ? '1' : '0 0 38%')};
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  @media (max-width: 900px) {
    flex: none;
    max-width: 100%;
  }
`;

const IconWrap = styled.div<{ $idx: number }>`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: ${({ $idx }) => iconBgByIdx($idx)};
  color: var(--color-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardTitle = styled.h3`
  font-size: clamp(1.25rem, 2.5vw, 1.625rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--color-gray-900);
  margin: 0;
`;

const CardDesc = styled.p<{ $wide?: boolean }>`
  font-size: var(--text-base);
  line-height: 1.72;
  color: var(--color-gray-700);
  margin: 0;
  max-width: ${({ $wide }) => ($wide ? 'none' : '36ch')};

  @media (max-width: 900px) {
    max-width: 100%;
  }
`;

const CardCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: 0 var(--space-5);
  height: 40px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  color: #ffffff;
  background: var(--color-primary-500);
  text-decoration: none;
  width: fit-content;
  transition:
    background var(--transition-fast),
    gap var(--transition-fast);

  &:hover {
    background: var(--color-primary-600);
    gap: var(--space-3);
  }
`;

const VisualBlock = styled.div<{ $narrow?: boolean }>`
  flex: ${({ $narrow }) => ($narrow ? '0 0 40%' : '1')};
  min-width: 0;

  @media (max-width: 900px) {
    width: 100%;
    flex: none;
  }
`;

const ImgWrap = styled.div`
  width: 100%;
  border-radius: var(--radius-xl);
  overflow: hidden;
  line-height: 0;
  background: rgba(255, 255, 255, 0.6);
`;

const VisualSvg = styled.svg`
  width: 100%;
  height: auto;
  display: block;
`;

function FeatureIcon({ idx }: { idx: number }) {
  if (idx === 0) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (idx === 1) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l4 4-8 8H4v-4l8-8zM14 4l2 2M18 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (idx === 2) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h4l3-9 4 18 3-9h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeatureVisual({ idx }: { idx: number }) {
  if (idx === 0) {
    // F1: record button + capture timeline
    return (
      <ImgWrap>
        <VisualSvg viewBox="0 0 520 320" preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width="520" height="320" rx="20" fill="#ffffff" />
          <rect x="32" y="32" width="200" height="36" rx="10" fill="#305cde" />
          <circle cx="56" cy="50" r="8" fill="#ffffff" />
          <text x="78" y="54" fontFamily="var(--font-sans)" fontSize="14" fontWeight="600" fill="#ffffff">Start recording</text>
          <rect x="32" y="100" width="456" height="6" rx="3" fill="#d6e0fb" />
          <rect x="32" y="100" width="220" height="6" rx="3" fill="#305cde" />
          <g transform="translate(32,140)">
            <rect width="456" height="44" rx="10" fill="#f0f4fe" />
            <text x="20" y="28" fontFamily="monospace" fontSize="13" fill="#1a2f6e">▶ click  &lt;button.submit&gt;</text>
          </g>
          <g transform="translate(32,196)">
            <rect width="456" height="44" rx="10" fill="#f0f4fe" />
            <text x="20" y="28" fontFamily="monospace" fontSize="13" fill="#1a2f6e">⌨ type   "SKU-1029" → #sku</text>
          </g>
          <g transform="translate(32,252)">
            <rect width="456" height="44" rx="10" fill="#f0f4fe" />
            <text x="20" y="28" fontFamily="monospace" fontSize="13" fill="#1a2f6e">↗ navigate /orders/new</text>
          </g>
        </VisualSvg>
      </ImgWrap>
    );
  }
  if (idx === 1) {
    // F2: distillation — raw → clean
    return (
      <ImgWrap>
        <VisualSvg viewBox="0 0 520 320" preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width="520" height="320" rx="20" fill="#ffffff" />
          <text x="40" y="44" fontFamily="var(--font-sans)" fontSize="13" fontWeight="700" fill="#1a2f6e">RAW RECORDING</text>
          <g transform="translate(40,58)" fontFamily="monospace" fontSize="11" fill="#3d5299">
            <text y="0">23 click events</text>
            <text y="18">12 keystroke groups</text>
            <text y="36">4 scroll events</text>
            <text y="54">⚠ duplicate submit clicks</text>
          </g>
          <text x="280" y="44" fontFamily="var(--font-sans)" fontSize="13" fontWeight="700" fill="#305cde">DISTILLED SKILL.md</text>
          <g transform="translate(280,58)" fontFamily="monospace" fontSize="11" fill="#1a2f6e">
            <text y="0">4 atomic steps</text>
            <text y="18">{`{sku}`} → parameter</text>
            <text y="36">{`{quantity}`} → parameter</text>
            <text y="54">precondition: signed in</text>
          </g>
          <path d="M232 100 L288 100" stroke="#305cde" strokeWidth="2" markerEnd="url(#arrow1)" />
          <defs>
            <marker id="arrow1" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#305cde" />
            </marker>
          </defs>
          <rect x="40" y="170" width="440" height="120" rx="12" fill="#0f1e4a" />
          <text x="60" y="200" fontFamily="monospace" fontSize="13" fill="#eaeeff">## inputs</text>
          <text x="60" y="222" fontFamily="monospace" fontSize="12" fill="#7a9ef5">- sku: string</text>
          <text x="60" y="242" fontFamily="monospace" fontSize="12" fill="#7a9ef5">- quantity: number</text>
          <text x="60" y="270" fontFamily="monospace" fontSize="12" fill="#7a9ef5">## precondition: signed in to portal</text>
        </VisualSvg>
      </ImgWrap>
    );
  }
  if (idx === 2) {
    // F3: claude code agent replays
    return (
      <ImgWrap>
        <VisualSvg viewBox="0 0 520 320" preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width="520" height="320" rx="20" fill="#ffffff" />
          <rect x="32" y="32" width="200" height="120" rx="14" fill="#f0f4fe" />
          <text x="48" y="60" fontFamily="monospace" fontSize="12" fontWeight="700" fill="#1a2f6e">~/.claude/skills/</text>
          <text x="48" y="84" fontFamily="monospace" fontSize="11" fill="#3d5299">create-purchase-order/</text>
          <text x="64" y="104" fontFamily="monospace" fontSize="11" fill="#305cde">SKILL.md</text>
          <text x="64" y="120" fontFamily="monospace" fontSize="11" fill="#3d5299">reference.png</text>
          <path d="M236 92 L288 92" stroke="#305cde" strokeWidth="2" markerEnd="url(#arrow2)" />
          <defs>
            <marker id="arrow2" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#305cde" />
            </marker>
          </defs>
          <rect x="288" y="32" width="200" height="120" rx="14" fill="#0f1e4a" />
          <text x="304" y="60" fontFamily="monospace" fontSize="12" fontWeight="700" fill="#eaeeff">$ claude</text>
          <text x="304" y="84" fontFamily="monospace" fontSize="11" fill="#7a9ef5">&gt; create POs for these</text>
          <text x="304" y="100" fontFamily="monospace" fontSize="11" fill="#7a9ef5">  10 rows...</text>
          <text x="304" y="124" fontFamily="monospace" fontSize="11" fill="#10b981">✓ skill: create-purchase</text>
          <text x="304" y="140" fontFamily="monospace" fontSize="11" fill="#10b981">  ✓ 10/10 done</text>
          <rect x="32" y="172" width="456" height="118" rx="12" fill="#eaeeff" />
          <text x="56" y="200" fontFamily="monospace" fontSize="13" fontWeight="600" fill="#1a2f6e">$ browse skill create-purchase-order \</text>
          <text x="56" y="220" fontFamily="monospace" fontSize="13" fontWeight="600" fill="#1a2f6e">    --sku SKU-1029 --quantity 50</text>
          <text x="56" y="260" fontFamily="monospace" fontSize="13" fill="#10b981">→ replayed in 4.2s, no human touch</text>
        </VisualSvg>
      </ImgWrap>
    );
  }
  // F4: privacy
  return (
    <ImgWrap>
      <VisualSvg viewBox="0 0 520 320" preserveAspectRatio="xMidYMid meet">
        <rect x="0" y="0" width="520" height="320" rx="20" fill="#ffffff" />
        <rect x="40" y="48" width="200" height="220" rx="16" fill="#f0f4fe" />
        <circle cx="140" cy="120" r="36" fill="#305cde" opacity="0.12" />
        <path d="M120 122 l14 14 l26 -28" stroke="#305cde" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="140" y="190" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="13" fontWeight="700" fill="#1a2f6e">Local-only</text>
        <text x="140" y="208" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="11" fill="#3d5299">recording stays in browser</text>
        <rect x="280" y="48" width="200" height="220" rx="16" fill="#f0f4fe" />
        <g transform="translate(304,80)">
          <rect width="16" height="20" rx="2" fill="#305cde" />
          <rect x="0" y="0" width="16" height="6" rx="2" fill="#1a2f6e" />
        </g>
        <text x="332" y="98" fontFamily="monospace" fontSize="11" fontWeight="600" fill="#1a2f6e">precondition:</text>
        <text x="332" y="116" fontFamily="monospace" fontSize="11" fill="#3d5299">signed in to portal</text>
        <rect x="304" y="140" width="152" height="40" rx="8" fill="#ffffff" stroke="#d6e0fb" strokeWidth="1.5" />
        <text x="320" y="166" fontFamily="monospace" fontSize="11" fill="#3d5299">⏸ agent paused</text>
        <text x="304" y="210" fontFamily="var(--font-sans)" fontSize="11" fontWeight="600" fill="#1a2f6e">No tokens leak.</text>
        <text x="304" y="226" fontFamily="var(--font-sans)" fontSize="11" fill="#3d5299">Auth always stays with you.</text>
      </VisualSvg>
    </ImgWrap>
  );
}

export default function FeaturesSection() {
  const t = useTranslations('main.features');

  return (
    <Root id="features">
      <div className="container">
        <SectionHead>
          <h2 className="section-title">
            {t.rich('title', {
              accent: chunks => <Accent>{chunks}</Accent>,
            })}
          </h2>
        </SectionHead>

        <Stack>
          {FEATURE_KEYS.map((key, idx) => {
            const isReversed = idx % 2 === 0;
            const wide = idx >= 2;
            return (
              <Card key={key} $idx={idx}>
                <CardContent $reverse={isReversed}>
                  <TextBlock $wide={wide}>
                    <IconWrap $idx={idx}>
                      <FeatureIcon idx={idx} />
                    </IconWrap>
                    <CardTitle>
                      {t.rich(`${key}.title`, {
                        highlight: chunks => <Highlight>{chunks}</Highlight>,
                      })}
                    </CardTitle>
                    <CardDesc $wide={wide}>
                      {t.rich(`${key}.desc`, {
                        highlight: chunks => <Highlight>{chunks}</Highlight>,
                      })}
                    </CardDesc>
                    <CardCta href={withUTM(CTA_URL, `feature_${key}`)}>
                      {t(`ctas.${key}`)}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M2.917 7h8.166M7.583 4.083L10.5 7l-2.917 2.917"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </CardCta>
                  </TextBlock>

                  <VisualBlock $narrow={wide}>
                    <FeatureVisual idx={idx} />
                  </VisualBlock>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </div>
    </Root>
  );
}
