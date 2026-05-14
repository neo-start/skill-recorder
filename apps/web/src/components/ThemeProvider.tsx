'use client';

import type { ReactNode } from 'react';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { theme } from '@/styles/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <SCThemeProvider theme={theme}>{children}</SCThemeProvider>;
}
