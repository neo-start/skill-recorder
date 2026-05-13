// Root layout — the [locale] subtree provides the real <html> wrapper. We need
// this only so Next.js doesn't complain about a missing root layout. The HTML
// element MUST live in this file as well for Next, but [locale]/layout.tsx
// supplies its own; only one will render at runtime thanks to App Router.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
