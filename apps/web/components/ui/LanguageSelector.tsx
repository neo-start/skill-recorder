'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import styled, { css } from 'styled-components';
import { useRouter, usePathname } from '@/i18n/navigation';

const LANGUAGES = [
  { key: 'en', displayName: 'English' },
  { key: 'es', displayName: 'Español' },
  { key: 'fr', displayName: 'Français' },
  { key: 'pt', displayName: 'Português' },
  { key: 'nl', displayName: 'Nederlands' },
  { key: 'de', displayName: 'Deutsch' },
  { key: 'it', displayName: 'Italiano' },
  { key: 'ja', displayName: '日本語' },
  { key: 'zh-Hans', displayName: '简体中文' },
  { key: 'zh-Hant', displayName: '繁體中文' },
  { key: 'ko', displayName: '한국어' },
  { key: 'ru', displayName: 'Русский' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'inverse';
  className?: string;
}

const inverseStyles = css`
  & > button {
    color: rgba(255, 255, 255, 0.9);
  }
  & > button:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Container = styled.div<{ $inverse: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  ${({ $inverse }) => $inverse && inverseStyles}
`;

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 14px;
  color: #000000;
  cursor: pointer;
  font-weight: 500;
  opacity: 0.72;
  transition:
    opacity var(--transition-fast),
    background-color var(--transition-fast);

  &:hover {
    opacity: 1;
    background: var(--overlay-hover);
  }
`;

const ArrowContainer = styled.span<{ $open: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: #000000;
  transition: transform var(--transition-fast);
  ${({ $open }) => $open && 'transform: rotate(180deg);'}
`;

const Dropdown = styled.ul`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 180px;
  padding: 6px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  list-style: none;
  margin: 0;
  z-index: 50;
`;

const Option = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  text-align: left;
  font-size: 14px;
  color: var(--color-text);
  cursor: pointer;
  border-radius: 6px;

  &:hover {
    background: #f3f4f6;
  }

  ${({ $active }) =>
    $active &&
    css`
      background: var(--color-bg-subtle);
      color: var(--color-primary-500);
      font-weight: 600;
    `}
`;

export function LanguageSelector({
  variant = 'default',
  className,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLang = LANGUAGES.find(l => l.key === locale) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <Container $inverse={variant === 'inverse'} className={className} ref={dropdownRef}>
      <Trigger onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-haspopup="listbox">
        {currentLang.displayName}
        <ArrowContainer $open={isOpen}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </ArrowContainer>
      </Trigger>

      {isOpen && (
        <Dropdown role="listbox">
          {LANGUAGES.map(lang => (
            <li key={lang.key}>
              <Option
                $active={lang.key === locale}
                onClick={() => handleLanguageChange(lang.key)}
                role="option"
                aria-selected={lang.key === locale}
              >
                {lang.displayName}
              </Option>
            </li>
          ))}
        </Dropdown>
      )}
    </Container>
  );
}
