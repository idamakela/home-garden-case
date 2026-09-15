import type { ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function Button({ variant = 'secondary', disabled, onClick, children }: ButtonProps) {
  return (
    <button
      type="button"
      className={styles.root}
      data-variant={variant}
      data-state={disabled ? 'disabled' : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
