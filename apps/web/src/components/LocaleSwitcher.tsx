'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { locales } from '@/i18n';

const Wrap = styled.div`
  display: inline-flex;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 2px;
  font-size: 12px;
`;

const Pill = styled.button<{ $active?: boolean }>`
  background: ${(p) => (p.$active ? p.theme.colors.bg : 'transparent')};
  color: ${(p) => (p.$active ? p.theme.colors.text : p.theme.colors.textMuted)};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 4px 10px;
  cursor: pointer;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const LABELS: Record<string, string> = { en: 'EN', zh: '中' };

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: string) {
    if (next === locale) return;
    // Strip the current locale prefix and prepend the next one.
    const stripped = pathname.replace(new RegExp(`^/(${locales.join('|')})(?=/|$)`), '') || '/';
    const target = next === 'en' ? stripped : `/${next}${stripped}`;
    router.push(target);
  }

  return (
    <Wrap>
      {locales.map((l) => (
        <Pill key={l} $active={l === locale} onClick={() => switchTo(l)}>
          {LABELS[l] ?? l}
        </Pill>
      ))}
    </Wrap>
  );
}
