'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { useLocale, useTranslations } from 'next-intl';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Container } from './Container';

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11, 13, 16, 0.78);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  gap: 18px;
`;

const Brand = styled(Link)`
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 22px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};

  a:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: 14px;
    font-size: 13px;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const InstallBtn = styled(Link)`
  background: ${({ theme }) => theme.colors.accent};
  color: #1a1408;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.md};

  &:hover {
    filter: brightness(1.08);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const installUrl =
    process.env.NEXT_PUBLIC_CHROME_WEBSTORE_URL ||
    'https://chrome.google.com/webstore/detail/skill-recorder';

  return (
    <Bar>
      <Container>
        <Row>
          <Brand href={`${prefix}/`}>Skill Recorder</Brand>
          <Nav>
            <Link href={`${prefix}/docs/getting-started`}>{t('docs')}</Link>
            <Link href={`${prefix}/pricing`}>{t('pricing')}</Link>
            <Link href={`${prefix}/changelog`}>{t('changelog')}</Link>
          </Nav>
          <Right>
            <LocaleSwitcher />
            <InstallBtn href={installUrl} target="_blank" rel="noopener">
              {t('install')}
            </InstallBtn>
          </Right>
        </Row>
      </Container>
    </Bar>
  );
}
