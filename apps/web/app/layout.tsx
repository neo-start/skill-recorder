import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Cadeno',
    template: '%s — Cadeno',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/logo-transparent.svg',
  },
};

// Pass-through root. <html>/<body> live in app/[locale]/layout.tsx so the
// `lang` attribute can reflect the active locale; app/not-found.tsx renders
// its own <html>/<body> for unmatched, locale-less paths.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
