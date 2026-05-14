'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';

type Variant = 'primary' | 'ghost';
type Size = 'md' | 'lg';

interface CtaButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: Variant;
  size?: Size;
}

const variantStyles = {
  primary: css`
    background-color: var(--color-primary-500);
    color: #fff;
    border-color: var(--color-bg);
    &:hover {
      background-color: var(--color-primary-600);
      border-color: var(--color-bg);
    }
    &:active {
      background-color: var(--color-primary-700);
      border-color: var(--color-bg);
      box-shadow: none;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--color-primary-500);
    border-color: var(--color-primary-500);
    &:hover {
      background-color: var(--color-primary-50);
      border-color: var(--color-primary-600);
      color: var(--color-primary-600);
    }
    &:active {
      background-color: var(--color-primary-100);
    }
  `,
};

const sizeStyles = {
  md: css`
    height: 40px;
    padding: 0 var(--space-5);
    font-size: var(--text-sm);
  `,
  lg: css`
    height: 48px;
    padding: 0 var(--space-8);
    font-size: var(--text-base);
  `,
};

const ctaBase = css<{ $variant: Variant; $size: Size }>`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: 500;
  border-radius: var(--radius-lg);
  border: 1.5px solid transparent;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  width: fit-content;
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base);

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}

  & .arrow {
    display: inline-flex;
    align-items: center;
    transition: transform var(--transition-fast);
  }
  &:hover .arrow {
    transform: translateX(3px);
  }
`;

const StyledLink = styled(Link)<{ $variant: Variant; $size: Size }>`${ctaBase}`;
const StyledButton = styled.button<{ $variant: Variant; $size: Size }>`${ctaBase}`;

const ChromeIcon = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`;

function Content({ label }: { label: string }) {
  return (
    <>
      <ChromeIcon aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2 A10 10 0 0 1 20.66 17 L16.76 14.75 A5.5 5.5 0 0 0 12 6.5 Z" fill="#EA4335" />
          <path d="M20.66 17 A10 10 0 0 1 3.34 17 L7.24 14.75 A5.5 5.5 0 0 0 16.76 14.75 Z" fill="#FBBC04" />
          <path d="M3.34 17 A10 10 0 0 1 12 2 L12 6.5 A5.5 5.5 0 0 0 7.24 14.75 Z" fill="#34A853" />
          <circle cx="12" cy="12" r="5.5" fill="white" />
          <circle cx="12" cy="12" r="4" fill="#4285F4" />
        </svg>
      </ChromeIcon>
      {label}
      <span className="arrow" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </>
  );
}

export default function CtaButton({
  label,
  href = 'https://github.com/neo-start/skill-recorder/releases',
  onClick,
  className,
  variant = 'primary',
  size = 'lg',
}: CtaButtonProps) {
  if (onClick) {
    return (
      <StyledButton type="button" className={className} onClick={onClick} $variant={variant} $size={size}>
        <Content label={label} />
      </StyledButton>
    );
  }
  return (
    <StyledLink href={href} className={className} $variant={variant} $size={size}>
      <Content label={label} />
    </StyledLink>
  );
}
