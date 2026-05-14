'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled, { css } from 'styled-components';
import Button from '@/components/ui/Button';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { CTA_URL, withUTM } from '@/lib/utm';

function ChromeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 2 A10 10 0 0 1 20.66 17 L16.76 14.75 A5.5 5.5 0 0 0 12 6.5 Z" fill="#EA4335" />
      <path d="M20.66 17 A10 10 0 0 1 3.34 17 L7.24 14.75 A5.5 5.5 0 0 0 16.76 14.75 Z" fill="#FBBC04" />
      <path d="M3.34 17 A10 10 0 0 1 12 2 L12 6.5 A5.5 5.5 0 0 0 7.24 14.75 Z" fill="#34A853" />
      <circle cx="12" cy="12" r="5.5" fill="white" />
      <circle cx="12" cy="12" r="4" fill="#4285F4" />
    </svg>
  );
}

const Header = styled.header<{ $scrolled: boolean }>`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  width: 100%;
  background: transparent;
  transition:
    background var(--transition-slow),
    border-color var(--transition-slow),
    box-shadow var(--transition-slow);

  ${({ $scrolled }) =>
    $scrolled &&
    css`
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: saturate(180%) blur(20px);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      border-bottom: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
    `}
`;

const Inner = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: 0 var(--space-8);
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 767px) {
    padding: 0 var(--space-6);
    gap: var(--space-4);
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
`;

const LogoImg = styled.img`
  height: 32px;
  width: auto;
  display: block;
`;

const Wordmark = styled.span`
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #000000;
`;

const Spacer = styled.div`
  flex: 1;
`;

const Actions = styled.div`
  display: none;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const MenuBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: auto;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: rgba(7, 14, 36, 0.06);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const Hamburger = styled.span<{ $open: boolean }>`
  display: block;
  width: 18px;
  height: 1.5px;
  background-color: var(--color-primary-900);
  border-radius: 2px;
  transition:
    transform var(--transition-base),
    opacity var(--transition-base);
  position: relative;

  &::before,
  &::after {
    content: '';
    display: block;
    width: 18px;
    height: 1.5px;
    background-color: var(--color-primary-900);
    border-radius: 2px;
    position: absolute;
    left: 0;
    transition: transform var(--transition-base);
  }
  &::before { top: -5px; }
  &::after  { top: 5px;  }

  ${({ $open }) =>
    $open &&
    css`
      background-color: transparent;
      &::before { transform: translateY(5px) rotate(45deg); }
      &::after  { transform: translateY(-5px) rotate(-45deg); }
    `}
`;

const MobileMenu = styled.div`
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: var(--space-4) var(--space-6) var(--space-6);

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCta = styled.div`
  & > a { width: 100%; }
`;

const NavCta = styled(Button)`
  height: 40px;
  padding-inline: 18px;
  border-radius: 10px;
`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('layout.nav');

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <Header $scrolled={scrolled}>
      <Inner>
        <Logo href="/">
          <LogoImg src="/images/logo-transparent.svg" alt="" height={32} />
          <Wordmark>Skill Recorder</Wordmark>
        </Logo>

        <Spacer />

        <Actions>
          <LanguageSelector variant="default" />
          <NavCta variant="primary" size="md" href={withUTM(CTA_URL, 'navbar_cta')}>
            <ChromeIcon />
            {t('cta')}
          </NavCta>
        </Actions>

        <MenuBtn
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={menuOpen}
        >
          <Hamburger $open={menuOpen} />
        </MenuBtn>
      </Inner>

      {menuOpen && (
        <MobileMenu>
          <MobileCta>
            <NavCta variant="primary" size="md" href={withUTM(CTA_URL, 'navbar_cta_mobile')}>
              <ChromeIcon />
              {t('ctaMobile')}
            </NavCta>
          </MobileCta>
        </MobileMenu>
      )}
    </Header>
  );
}
