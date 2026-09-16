import { Modal, Stack } from '@mantine/core';
import type { ReactNode } from 'react';
import { PlantFields, type PlantFieldsProps } from '../PlantFields/PlantFields';
import styles from './PlantDetailModal.module.css';

type PlantDetailModalProps = PlantFieldsProps & {
  opened: boolean;
  onClose: () => void;
  plantName: string;
  actions?: ReactNode;
  error?: ReactNode;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
};

export function PlantDetailModal({
  opened,
  onClose,
  plantName,
  actions,
  error,
  closeOnEscape = true,
  closeOnClickOutside = true,
  ...fields
}: PlantDetailModalProps) {
  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      size="lg"
      zIndex={200}
      closeOnEscape={closeOnEscape}
      closeOnClickOutside={closeOnClickOutside}
    >
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header className={styles.header}>
          <Stack gap="sm" className={styles.heading}>
            <Modal.Title className={styles.title}>{plantName}</Modal.Title>
            {actions}
          </Stack>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <Stack gap="md">
            {error}
            <PlantFields {...fields} />
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
