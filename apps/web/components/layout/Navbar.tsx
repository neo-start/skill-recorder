'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled, { css, keyframes } from 'styled-components';
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transition: 'transform 180ms ease',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        flexShrink: 0,
      }}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface DropdownItem {
  icon: React.ReactNode;
  title: string;
  href: string;
}

const PLAYGROUND_ICONS = [
  <svg key="1" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 2H18a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  <svg key="2" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" /></svg>,
  <svg key="3" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="4" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 11l19-9-9 19-2-8-8-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  <svg key="5" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 20h20M4 20V10l8-6 8 6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

const PLAYGROUND_SCENES = [
  { key: 'ecommerce',   href: '/playground?scene=ecommerce' },
  { key: 'leads',       href: '/playground?scene=leads' },
  { key: 'realestate',  href: '/playground?scene=realestate' },
  { key: 'social',      href: '/playground?scene=social' },
  { key: 'hospitality', href: '/playground?scene=hospitality' },
];

// ── styled bits ──

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

const Nav = styled.nav`
  display: none;
  align-items: center;
  gap: var(--space-1);

  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavLink = styled(Link)`
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: #000000;
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
  white-space: nowrap;
  opacity: 0.72;
  display: flex;
  align-items: center;
  gap: var(--space-1);

  &:hover {
    opacity: 1;
    background: rgba(7, 14, 36, 0.06);
  }
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
  padding: var(--space-2) var(--space-6) var(--space-6);

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileAccordionTrigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-4) var(--space-2);
  font-size: var(--text-base);
  font-family: inherit;
  font-weight: 500;
  color: #000000;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  opacity: 0.72;
  text-align: left;
  transition: opacity var(--transition-fast);

  &:hover { opacity: 1; }
`;

const MobileAccordionBody = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--color-neutral-50);
  border-bottom: 1px solid var(--color-border);
`;

const MobileSubLink = styled(Link)`
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  text-decoration: none;
  border-bottom: 1px solid var(--color-neutral-100);
  transition: color var(--transition-fast);
  line-height: 1.4;

  &:last-of-type { border-bottom: none; }
  &:hover { color: var(--color-gray-900); }
`;

const MobileAccordionFooter = styled(Link)`
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-accent);
  text-decoration: none;
  border-top: 1px solid var(--color-neutral-200);
  transition: color var(--transition-fast);

  &:hover { color: var(--color-accent-dark); }
`;

const MobileCta = styled.div`
  margin-top: var(--space-4);
  & > a { width: 100%; }
`;

const dropdownIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const DropdownWrap = styled.div`
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 8px;
  z-index: 200;
`;

const DropdownInner = styled.div<{ $minWidth?: number }>`
  background: var(--color-bg);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-3);
  min-width: ${({ $minWidth }) => ($minWidth ? `${$minWidth}px` : '420px')};
  animation: ${dropdownIn} 160ms ease;
`;

const DropdownGrid = styled.div<{ $tripleCol?: boolean; $singleCol?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $tripleCol, $singleCol }) =>
    $singleCol ? '1fr' : $tripleCol ? '1fr 1fr 1fr' : '1fr 1fr'};
  gap: var(--space-2);
`;

const DropdownCard = styled(Link)<{ $vertical?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: background var(--transition-fast);
  min-width: 0;

  &:hover { background: var(--color-neutral-50); }

  ${({ $vertical }) =>
    $vertical &&
    css`
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-3) var(--space-2);
      gap: var(--space-2);
    `}
`;

const DropdownCardIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--color-accent);
  flex-shrink: 0;
`;

const DropdownCardTitle = styled.span`
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-gray-900);
  line-height: 1.3;
  white-space: normal;
`;

const DropdownFooter = styled.div`
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-neutral-100);
`;

const DropdownFooterLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-accent);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);

  &:hover { background: var(--color-primary-50); }
`;

const NavCta = styled(Button)`
  height: 40px;
  padding-inline: 18px;
  border-radius: 10px;
`;

// ── Component ──

interface NavDropdownProps {
  label: string;
  href: string;
  items: DropdownItem[];
  footerLabel: string;
  footerHref: string;
  minWidth?: number;
  tripleCol?: boolean;
  verticalCards?: boolean;
  singleCol?: boolean;
}

function NavDropdown({
  label,
  href,
  items,
  footerLabel,
  footerHref,
  minWidth,
  tripleCol,
  verticalCards,
  singleCol,
}: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <DropdownWrap ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <NavLink href={href} onClick={() => setOpen(false)}>
        {label}
        <ChevronIcon open={open} />
      </NavLink>

      {open && (
        <Dropdown>
          <DropdownInner $minWidth={minWidth}>
            <DropdownGrid $tripleCol={tripleCol} $singleCol={singleCol}>
              {items.map(item => (
                <DropdownCard
                  key={item.title}
                  href={item.href}
                  $vertical={verticalCards}
                  onClick={() => setOpen(false)}
                >
                  <DropdownCardIcon>{item.icon}</DropdownCardIcon>
                  <DropdownCardTitle>{item.title}</DropdownCardTitle>
                </DropdownCard>
              ))}
            </DropdownGrid>
            <DropdownFooter>
              <DropdownFooterLink href={footerHref} onClick={() => setOpen(false)}>
                {footerLabel}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </DropdownFooterLink>
            </DropdownFooter>
          </DropdownInner>
        </Dropdown>
      )}
    </DropdownWrap>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('layout.nav');
  const tScenes = useTranslations('main.playground.scenes');

  const playgroundItems: DropdownItem[] = PLAYGROUND_SCENES.map((s, i) => ({
    icon: PLAYGROUND_ICONS[i],
    title: tScenes(s.key as any),
    href: s.href,
  }));

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

        <Nav aria-label="Main navigation">
          <NavDropdown
            label={t('playground')}
            href="/playground"
            items={playgroundItems}
            footerLabel={t('openPlayground')}
            footerHref="/playground"
            tripleCol
            verticalCards
            minWidth={420}
          />
        </Nav>

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
          <MobileAccordionTrigger
            onClick={() => setMobileExpanded(o => (o === 'playground' ? null : 'playground'))}
            aria-expanded={mobileExpanded === 'playground'}
          >
            {t('playground')}
            <ChevronIcon open={mobileExpanded === 'playground'} />
          </MobileAccordionTrigger>
          {mobileExpanded === 'playground' && (
            <MobileAccordionBody>
              {playgroundItems.map(item => (
                <MobileSubLink key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.title}
                </MobileSubLink>
              ))}
              <MobileAccordionFooter href="/playground" onClick={() => setMenuOpen(false)}>
                {t('openPlayground')} →
              </MobileAccordionFooter>
            </MobileAccordionBody>
          )}

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
