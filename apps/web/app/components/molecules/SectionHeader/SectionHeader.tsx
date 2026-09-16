import { Group, Title, type TitleOrder } from '@mantine/core';
import type { ReactNode } from 'react';
import styles from './SectionHeader.module.css';

type SectionHeaderProps = {
  title: string;
  order?: TitleOrder;
  children?: ReactNode;
};

export function SectionHeader({ title, order = 1, children }: SectionHeaderProps) {
  return (
    <Group justify="space-between" align="center" preventGrowOverflow={false}>
      <Title order={order} className={styles.title}>
        {title}
      </Title>
      {children}
    </Group>
  );
}
