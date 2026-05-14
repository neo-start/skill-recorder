'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { useLocale, useTranslations } from 'next-intl';
import { Container } from './Container';

const Wrap = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 80px;
  padding: 48px 0 64px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: 40px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Col = styled.div`
  h4 {
    color: ${({ theme }) => theme.colors.text};
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 14px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  a:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Brand = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const Bottom = styled.div`
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
`;

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const github = process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/neo-start/skill-recorder';

  return (
    <Wrap>
      <Container>
        <Cols>
          <Col>
            <Brand>Skill Recorder</Brand>
            <p style={{ margin: 0, maxWidth: 280 }}>{t('tagline')}</p>
          </Col>
          <Col>
            <h4>{t('product')}</h4>
            <ul>
              <li>
                <Link href={`${prefix}/docs/getting-started`}>{t('docs')}</Link>
              </li>
              <li>
                <Link href={`${prefix}/pricing`}>{t('pricing')}</Link>
              </li>
              <li>
                <Link href={`${prefix}/changelog`}>{t('changelog')}</Link>
              </li>
            </ul>
          </Col>
          <Col>
            <h4>{t('developers')}</h4>
            <ul>
              <li>
                <Link href={github} target="_blank" rel="noopener">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/docs/using-with-claude-code`}>{t('claudeCode')}</Link>
              </li>
              <li>
                <Link href={`${github}/issues`} target="_blank" rel="noopener">
                  {t('issues')}
                </Link>
              </li>
            </ul>
          </Col>
          <Col>
            <h4>{t('company')}</h4>
            <ul>
              <li>
                <Link href={`${prefix}/privacy`}>{t('privacy')}</Link>
              </li>
              <li>
                <Link href={`${prefix}/terms`}>{t('terms')}</Link>
              </li>
            </ul>
          </Col>
        </Cols>
        <Bottom>
          <span>© {new Date().getFullYear()} Skill Recorder. MIT licensed.</span>
          <span>{t('builtWith')}</span>
        </Bottom>
      </Container>
    </Wrap>
  );
}
