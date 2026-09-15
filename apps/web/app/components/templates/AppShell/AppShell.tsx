import type { ReactNode } from 'react';
import { SiteHeader } from '../../organisms/SiteHeader/SiteHeader';
import styles from './AppShell.module.css';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.root}>
      <SiteHeader />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
