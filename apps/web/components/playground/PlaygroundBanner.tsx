'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled, { css, keyframes } from 'styled-components';
import { SCENES, type SceneKey } from '@/lib/playgroundData';
import { CTA_URL, withUTM } from '@/lib/utm';

const BRIDGE_ID = 'skill-recorder-side-panel-button';

interface PlaygroundBannerProps {
  activeScene: SceneKey;
  onSceneChange: (scene: SceneKey) => void;
}

function SidePanelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="10" y1="1.7" x2="10" y2="14.3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 5.5l2 2.5-2 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Root = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: #13131a;
`;

const TopRow = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  @media (max-width: 640px) {
    padding: 12px 16px;
  }
`;

const HeadGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  min-width: 0;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: color 0.15s ease;
  flex-shrink: 0;

  &:hover { color: rgba(255, 255, 255, 0.8); }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.01em;
  flex-shrink: 0;
`;

const Desc = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;

  @media (max-width: 640px) {
    display: none;
  }
`;

const CtaWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const CtaBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 8px;
  border: none;
  background: #305cde;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 12px rgba(48, 92, 222, 0.45);

  &:hover { background: #2449b8; }
`;

const ping = keyframes`
  0%   { transform: scale(1);   opacity: 0.8; }
  70%  { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(2.2); opacity: 0; }
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BadgePing = styled.span`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f87171;
  animation: ${ping} 1.4s ease-out infinite;
`;

const BadgeDot = styled.span`
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
`;

const TabRow = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding: 10px 24px;
`;

const TabRowInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const SceneLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  flex-shrink: 0;
`;

const Tabs = styled.nav`
  display: flex;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }

  @media (max-width: 640px) {
    padding: 0 12px;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, background 0.15s;
  font-family: inherit;

  &:hover {
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.08);
  }

  ${({ $active }) =>
    $active &&
    css`
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      font-weight: 700;
    `}
`;

export default function PlaygroundBanner({
  activeScene,
  onSceneChange,
}: PlaygroundBannerProps) {
  const [badgeDismissed, setBadgeDismissed] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const t = useTranslations('main.playground');

  useEffect(() => {
    const check = () => {
      setExtensionInstalled(!!document.getElementById(BRIDGE_ID));
    };
    check();
    const id = window.setInterval(check, 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleOpenSidePanel = () => {
    setBadgeDismissed(true);
    const bridge = document.getElementById(BRIDGE_ID);
    if (bridge) {
      bridge.click();
      return;
    }
    const fallback = withUTM(CTA_URL, 'playground_open_panel');
    if (fallback && fallback !== '#') {
      window.open(fallback, '_blank', 'noopener');
    }
  };

  return (
    <Root>
      <TopRow>
        <HeadGroup>
          <BackLink href="/">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('back')}
          </BackLink>
          <Title>{t('title')}</Title>
          <Desc>{t('desc')}</Desc>
        </HeadGroup>

        <CtaWrap>
          <CtaBtn onClick={handleOpenSidePanel}>
            <SidePanelIcon />
            {extensionInstalled ? t('openPanel') : t('installExtension')}
          </CtaBtn>
          {!badgeDismissed && (
            <Badge aria-hidden="true">
              <BadgePing />
              <BadgeDot />
            </Badge>
          )}
        </CtaWrap>
      </TopRow>

      <TabRow>
        <TabRowInner>
          <SceneLabel>{t('sceneLabel')}</SceneLabel>
          <Tabs aria-label="Demo scenes">
            {SCENES.map(scene => (
              <Tab
                key={scene}
                $active={scene === activeScene}
                onClick={() => onSceneChange(scene)}
              >
                {t(`scenes.${scene}` as any)}
              </Tab>
            ))}
          </Tabs>
        </TabRowInner>
      </TabRow>
    </Root>
  );
}
