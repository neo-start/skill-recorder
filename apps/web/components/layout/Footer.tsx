'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';

const FooterEl = styled.footer`
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-16);
  padding-bottom: var(--space-8);
`;

const Inner = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-12);

  @media (min-width: 768px) {
    grid-template-columns: 2fr 3fr;
    gap: var(--space-8);
  }
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-gray-900);
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
  color: var(--color-gray-900);
`;

const Tagline = styled.p`
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  max-width: 260px;
  line-height: 1.5;
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

const ColTitle = styled.p`
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-gray-900);
  margin-bottom: var(--space-1);
`;

const FooterLink = styled(Link)`
  font-size: var(--text-sm);
  color: var(--color-gray-700);
  transition: color var(--transition-fast);

  &:hover { color: var(--color-gray-900); }
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-12);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
`;

const Copyright = styled.p`
  font-size: var(--text-xs);
  color: var(--color-gray-700);
`;

export default function Footer() {
  const t = useTranslations('layout.footer');
  const tScenes = useTranslations('main.playground.scenes');

  const playgroundLinks = [
    { label: tScenes('ecommerce'),   href: '/playground?scene=ecommerce' },
    { label: tScenes('leads'),       href: '/playground?scene=leads' },
    { label: tScenes('realestate'),  href: '/playground?scene=realestate' },
    { label: tScenes('social'),      href: '/playground?scene=social' },
    { label: tScenes('hospitality'), href: '/playground?scene=hospitality' },
  ];
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
            <Wordmark>Skill Recorder</Wordmark>
          </Logo>
          <Tagline>{t('tagline')}</Tagline>
        </Brand>

        <Cols>
          <Col>
            <ColTitle>{t('playground')}</ColTitle>
            {playgroundLinks.map(l => (
              <FooterLink key={l.label} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </Col>

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
