import { Button, Modal, Stack, Text } from '@mantine/core';
import { ModalActions } from '../ModalActions/ModalActions';

type DeleteGardenModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteGardenModal({ opened, onClose, onConfirm }: DeleteGardenModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Are you sure you want to delete this garden?">
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
