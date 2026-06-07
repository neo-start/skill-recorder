'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';

const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const INK = '#0a0a0a';
const SUB = '#6b6b6b';
const HAIRLINE = '#e8e6e1';

const FooterEl = styled.footer`
  background-color: #ffffff;
  border-top: 1px solid ${HAIRLINE};
  padding-top: 72px;
  padding-bottom: 36px;
  font-family: ${SANS};
  color: ${INK};
`;

const Inner = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;

  @media (min-width: 768px) {
    grid-template-columns: 2fr 3fr;
    gap: 32px;
  }
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: ${SANS};
  font-size: 16px;
  font-weight: 600;
  color: ${INK};
  letter-spacing: -0.02em;
  text-decoration: none;
`;

const LogoImg = styled.img`
  width: auto;
  height: 28px;
  display: block;
  flex-shrink: 0;
`;

const Wordmark = styled.span`
  font-family: ${SANS};
  color: ${INK};
`;

const Tagline = styled.p`
  font-family: ${SANS};
  font-size: 14px;
  color: ${SUB};
  max-width: 280px;
  line-height: 1.55;
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ColTitle = styled.p`
  font-family: ${SANS};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #999999;
  margin-bottom: 4px;
`;

const FooterLink = styled(Link)`
  font-family: ${SANS};
  font-size: 14px;
  color: ${SUB};
  transition: color 160ms ease;
  text-decoration: none;

  &:hover { color: ${INK}; }
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid ${HAIRLINE};
`;

const Copyright = styled.p`
  font-family: ${SANS};
  font-size: 12px;
  color: #999999;
`;

export default function Footer() {
  const t = useTranslations('layout.footer');

  const legalLinks = [
    { label: t('privacy'), href: '/policy/privacy' },
    { label: t('terms'),   href: '/policy/terms' },
  ];

  return (
    <FooterEl>
      <Inner className="container">
        <Brand>
          <Logo href="/">
            <LogoImg src="/images/logo-transparent.svg" alt="" height={28} />
            <Wordmark>Cadeno</Wordmark>
          </Logo>
          <Tagline>{t('tagline')}</Tagline>
        </Brand>

        <Cols>
          <Col>
            <ColTitle>{t('legal')}</ColTitle>
            {legalLinks.map(l => (
              <FooterLink key={l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </Col>
        </Cols>
      </Inner>

      <Bottom className="container">
        <Copyright>{t('copyright')}</Copyright>
      </Bottom>
    </FooterEl>
  );
}
