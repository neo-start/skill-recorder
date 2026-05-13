'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Container } from '@/components/Container';

export default function NotFound() {
  const t = useTranslations('notFound');
  const locale = useLocale();
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return (
    <Container>
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'ui-monospace, monospace',
            color: '#fbbf24',
            fontSize: 14,
            margin: 0,
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: 36, letterSpacing: '-0.02em', margin: '8px 0 12px' }}>
          {t('heading')}
        </h1>
        <p style={{ color: '#8a93a3', maxWidth: 480, margin: '0 auto 28px' }}>{t('lede')}</p>
        <Link
          href={`${prefix}/`}
          style={{
            display: 'inline-block',
            background: '#fbbf24',
            color: '#1a1408',
            padding: '11px 18px',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {t('cta')}
        </Link>
      </div>
    </Container>
  );
}
