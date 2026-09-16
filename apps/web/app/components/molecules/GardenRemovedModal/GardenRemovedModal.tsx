import { Button, Modal, Stack } from '@mantine/core';
import { ModalActions } from '../ModalActions/ModalActions';

type GardenRemovedModalProps = {
  opened: boolean;
  canStay: boolean;
  onStay: () => void;
  onGoBack: () => void;
};

export function GardenRemovedModal({ opened, canStay, onStay, onGoBack }: GardenRemovedModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={canStay ? onStay : () => undefined}
      title="Someone has deleted this garden"
      closeOnClickOutside={canStay}
      closeOnEscape={canStay}
      withCloseButton={canStay}
    >
      <Stack>
        <ModalActions>
          {canStay ? (
            <Button type="button" variant="default" onClick={onStay}>
              Stay here
            </Button>
          ) : null}
          <Button type="button" onClick={onGoBack}>
            Go back to gardens
          </Button>
        </ModalActions>
      </Stack>
    </Modal>
  );
}
