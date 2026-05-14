'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  padding: 0 24px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 720px;
  padding: 0 24px;
`;

const Message = styled.p`
  font-size: 18px;
  color: #6b7280;
  margin: 0 0 24px 0;
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

  &:hover { background-color: #f9fafb; }
`;

export default function RootNotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <Container id="page-404">
      <Content>
        <Message>Redirecting…</Message>
        <PrimaryButton href="/en" id="back-home">
          Back to Home
        </PrimaryButton>
      </Content>
    </Container>
  );
}
