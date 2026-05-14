import type { Metadata, Viewport } from 'next';
import { Lexend, Caveat, JetBrains_Mono } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/registry';
import { GlobalStyle } from '@/styles/GlobalStyle';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Skill Recorder',
    template: '%s — Skill Recorder',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/logo-transparent.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[lexend.variable, caveat.variable, jetbrainsMono.variable].join(' ')}
    >
      <body>
        <StyledComponentsRegistry>
          <GlobalStyle />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
