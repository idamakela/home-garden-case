import { Button, Notification, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect, useRef, useState } from 'react';
import { AddGardenModal } from '../components/molecules/AddGardenModal/AddGardenModal';
import { ErrorAlert } from '../components/molecules/ErrorAlert/ErrorAlert';
import { SectionHeader } from '../components/molecules/SectionHeader/SectionHeader';
import { GardenList } from '../components/organisms/GardenList/GardenList';
import { GardenListSkeleton } from '../components/organisms/GardenList/GardenListSkeleton';
import { gardensCreateCopy, gardensLoadCopy } from '../lib/garden-copy';
import { INCOMING_GARDEN_HIGHLIGHT_MS, type CreateGarden, type Garden } from '../queries/gardens';
import { useCreateGarden } from '../queries/hooks/useCreateGarden';
import { useGardens } from '../queries/hooks/useGardens';

type PendingAddition = {
  clientId: string;
  body: CreateGarden;
};

function dropPending(pendingAdditions: PendingAddition[], clientId: string) {
  return pendingAdditions.filter((item) => item.clientId !== clientId);
}

function useIncomingGardenIds(gardens: Garden[] | undefined) {
  const acknowledgedIds = useRef(new Set<number>());
  const hasSeenList = useRef(false);
  const [incomingIds, setIncomingIds] = useState(() => new Set<number>());

  useEffect(() => {
    if (!gardens) {
      return;
    }

    if (!hasSeenList.current) {
      gardens.forEach((garden) => acknowledgedIds.current.add(garden.gardenId));
      hasSeenList.current = true;
      return;
    }

    const newIds = gardens
      .filter((garden) => !acknowledgedIds.current.has(garden.gardenId))
      .map((garden) => garden.gardenId);

    if (newIds.length === 0) {
      return;
    }

    setIncomingIds((current) => {
      const next = new Set(current);
      newIds.forEach((id) => next.add(id));
      return next;
    });

    const timeout = window.setTimeout(() => {
      newIds.forEach((id) => acknowledgedIds.current.add(id));
      setIncomingIds((current) => {
        const next = new Set(current);
        newIds.forEach((id) => next.delete(id));
        return next;
      });
    }, INCOMING_GARDEN_HIGHLIGHT_MS);

    return () => window.clearTimeout(timeout);
  }, [gardens]);

  function acknowledge(gardenId: number) {
    acknowledgedIds.current.add(gardenId);
  }

  return { incomingIds, acknowledge };
}

export default function GardensIndexPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [pendingAdditions, setPendingAdditions] = useState<PendingAddition[]>([]);
  const [restoreValues, setRestoreValues] = useState<CreateGarden | null>(null);
  const { data, isPending, isError, error, refetch } = useGardens();
  const { incomingIds, acknowledge } = useIncomingGardenIds(data);
  const createGarden = useCreateGarden();

  function openAddGarden() {
    setRestoreValues(null);
    open();
  }

  function closeModal() {
    close();
    setRestoreValues(null);
  }

  function submitGarden(body: CreateGarden) {
    const clientId = crypto.randomUUID();
    setPendingAdditions((current) => [...current, { clientId, body }]);
    setRestoreValues(null);
    close();
    createGarden.mutate(body, {
      onSuccess: (garden) => {
        acknowledge(garden.gardenId);
        setPendingAdditions((current) => dropPending(current, clientId));
      },
      onError: (mutationError) => {
        setPendingAdditions((current) => dropPending(current, clientId));
        const copy = gardensCreateCopy(mutationError);
        const notificationId = crypto.randomUUID();

        notifications.show({
          id: notificationId,
          autoClose: false,
          color: 'red',
          title: copy.title,
          message: copy.message,
          renderNotification: () => (
            <UnstyledButton
              type="button"
              display="block"
              w="100%"
              onClick={() => {
                notifications.hide(notificationId);
                setRestoreValues(body);
                open();
              }}
            >
              <Notification color="red" title={copy.title} withCloseButton={false} withBorder>
                {copy.message}
              </Notification>
            </UnstyledButton>
          ),
        });
      },
    });
  }

  const gardenRows = [
    ...(data ?? []).map((garden) => ({
      id: String(garden.gardenId),
      gardenName: garden.gardenName,
      totalSurfaceArea: garden.totalSurfaceArea,
      latitude: garden.latitude,
      longitude: garden.longitude,
      pending: incomingIds.has(garden.gardenId),
      to: `/gardens/${garden.gardenId}`,
    })),
    ...pendingAdditions.map((pending) => ({
      id: `pending-${pending.clientId}`,
      gardenName: pending.body.gardenName,
      totalSurfaceArea: pending.body.totalSurfaceArea,
      latitude: pending.body.latitude,
      longitude: pending.body.longitude,
      pending: true,
    })),
  ];

  let content;

  if (isPending) {
    content = <GardenListSkeleton />;
  } else if (isError && !data) {
    const copy = gardensLoadCopy(error);
    content = <ErrorAlert error={copy.title} details={copy.message} onRetry={() => refetch()} />;
  } else {
    content = <GardenList gardens={gardenRows} />;
  }

  return (
    <>
      <SectionHeader title="Gardens">
        <Button type="button" onClick={openAddGarden}>
          Add garden
        </Button>
      </SectionHeader>
      {content}
      <AddGardenModal
        opened={opened}
        onClose={closeModal}
        onSubmit={submitGarden}
        initialValues={restoreValues}
      />
    </>
  );
}
