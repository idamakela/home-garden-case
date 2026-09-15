import { Group } from '@mantine/core';
import type { ReactNode } from 'react';

type ModalActionsProps = {
  children: ReactNode;
};

export function ModalActions({ children }: ModalActionsProps) {
  return (
    <Group justify="flex-end" gap="sm">
      {children}
    </Group>
  );
}
