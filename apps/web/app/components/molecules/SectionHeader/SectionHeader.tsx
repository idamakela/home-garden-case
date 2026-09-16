import { Group, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import styles from './SectionHeader.module.css';

type SectionHeaderProps = {
  title: string;
  children?: ReactNode;
};

export function SectionHeader({ title, children }: SectionHeaderProps) {
  return (
    <Group justify="space-between" align="center" preventGrowOverflow={false}>
      <Title order={1} className={styles.title}>
        {title}
      </Title>
      {children}
    </Group>
  );
}
