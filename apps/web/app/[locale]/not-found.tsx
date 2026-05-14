'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styled from 'styled-components';
import { Link, usePathname, useRouter } from '@/i18n/navigation';

const SECTION_INDEX_PATHS = new Set<string>([]);

function resolveRedirectTarget(pathname: string): string {
  const cleanPath = pathname.split('?')[0].split('#')[0];
  const firstSegment = cleanPath.split('/').filter(Boolean)[0];
  if (firstSegment && SECTION_INDEX_PATHS.has(firstSegment)) {
    return `/${firstSegment}`;
  }
  return '/';
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  padding: 0 24px;
  position: relative;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 720px;
  padding: 0 24px;
`;

const Message = styled.p`
  display: block;
  font-size: 18px;
  line-height: 28px;
  color: #6b7280;
  margin: 0 0 24px 0;
`;

const ActionBox = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
`;

const PrimaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  background-color: #ffffff;
  color: #111827;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }
`;

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('notFound');

  useEffect(() => {
    const target = resolveRedirectTarget(pathname);
    router.replace(target);
  }, [pathname, router]);

  return (
    <Container id="page-404">
      <Content>
        <Message>{t('message')}</Message>
        <ActionBox>
          <PrimaryButton href="/" id="back-home">
            {t('backHome')}
          </PrimaryButton>
        </ActionBox>
      </Content>
    </Container>
  );
}
