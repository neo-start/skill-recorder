'use client';

import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 18px;
  }
`;

export const Section = styled.section`
  padding: 96px 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 56px 0;
  }
`;
