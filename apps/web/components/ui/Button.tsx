'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const variantStyles = {
  primary: css`
    background-color: var(--color-primary-500);
    color: #fff;
    border-color: var(--color-primary-500);
    &:hover {
      background-color: var(--color-primary-600);
      border-color: var(--color-primary-600);
    }
    &:active {
      transform: translateY(0);
      background-color: var(--color-primary-700);
      box-shadow: none;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--color-text);
    border-color: transparent;
    &:hover {
      background-color: var(--color-bg-subtle);
      border-color: var(--color-border);
    }
  `,
  outline: css`
    background-color: transparent;
    color: var(--color-text);
    border-color: var(--color-border);
    &:hover {
      border-color: var(--color-border-hover);
      background-color: var(--color-bg-subtle);
    }
  `,
};

const sizeStyles = {
  sm: css`
    height: 32px;
    padding: 0 var(--space-3);
    font-size: var(--text-sm);
    border-radius: var(--radius-sm);
  `,
  md: css`
    height: 40px;
    padding: 0 var(--space-5);
    font-size: var(--text-sm);
  `,
  lg: css`
    height: 48px;
    padding: 0 var(--space-8);
    font-size: var(--text-base);
    border-radius: var(--radius-lg);
  `,
};

const buttonBase = css<{ $variant: Variant; $size: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: 500;
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-fast);
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  line-height: 1;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
`;

const StyledLink = styled(Link)<{ $variant: Variant; $size: Size }>`
  ${buttonBase}
`;

const StyledButton = styled.button<{ $variant: Variant; $size: Size }>`
  ${buttonBase}
`;

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className,
  type = 'button',
  disabled,
}: ButtonProps) {
  if (href) {
    return (
      <StyledLink href={href} className={className} $variant={variant} $size={size}>
        {children}
      </StyledLink>
    );
  }
  return (
    <StyledButton
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      $variant={variant}
      $size={size}
    >
      {children}
    </StyledButton>
  );
}
