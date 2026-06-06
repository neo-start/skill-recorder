'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

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
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
`;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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
          <Wordmark>Cadeno</Wordmark>
        </Logo>

        <Spacer />

        <Actions>
          <LanguageSelector variant="default" />
        </Actions>
      </Inner>
    </Header>
  );
}
