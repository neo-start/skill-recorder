'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/Container';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container>
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'ui-monospace, monospace',
            color: '#ef4444',
            fontSize: 14,
            margin: 0,
          }}
        >
          500
        </p>
        <h1 style={{ fontSize: 32, margin: '8px 0 12px' }}>{t('heading')}</h1>
        <p style={{ color: '#8a93a3', maxWidth: 480, margin: '0 auto 24px' }}>{t('lede')}</p>
        <button
          onClick={reset}
          style={{
            background: '#7c9cff',
            color: '#0b0d10',
            padding: '11px 18px',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('retry')}
        </button>
      </div>
    </Container>
  );
}
