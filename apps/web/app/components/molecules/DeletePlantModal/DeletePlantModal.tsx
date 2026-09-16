import { Button, Modal, Stack, Text } from '@mantine/core';
import { ModalActions } from '../ModalActions/ModalActions';

type DeletePlantModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  zIndex?: number;
};

export function DeletePlantModal({ opened, onClose, onConfirm, zIndex }: DeletePlantModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Are you sure you want to delete this plant?"
      zIndex={zIndex}
    >
      <Stack>
        <Text>This action is irreversible.</Text>
        <ModalActions>
          <Button type="button" variant="default" onClick={onClose}>
            No, cancel
          </Button>
          <Button type="button" color="red" onClick={onConfirm}>
            Yes, delete
          </Button>
        </ModalActions>
      </Stack>
    </Modal>
  );
}
