import { Button as MantineButton } from '@mantine/core';
import type { ReactNode } from 'react';
import styles from './Button.module.css';

const variantMap = {
  primary: 'filled',
  secondary: 'default',
} as const;

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function Button({ variant = 'secondary', disabled, onClick, children }: ButtonProps) {
  return (
    <MantineButton
      type="button"
      className={styles.root}
      variant={variantMap[variant]}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </MantineButton>
  );
}
