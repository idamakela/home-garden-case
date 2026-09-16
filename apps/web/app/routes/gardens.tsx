import { Button, Notification, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  HydrationBoundary,
  useMutation,
  useQuery,
  useQueryClient,
  type DehydratedState,
} from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { AddGardenModal } from '../components/molecules/AddGardenModal/AddGardenModal';
import { ErrorAlert } from '../components/molecules/ErrorAlert/ErrorAlert';
import { SectionHeader } from '../components/molecules/SectionHeader/SectionHeader';
import { GardenList } from '../components/organisms/GardenList/GardenList';
import { GardenListSkeleton } from '../components/organisms/GardenList/GardenListSkeleton';
import { AppShell } from '../components/templates/AppShell/AppShell';
import { getErrorStatus } from '../lib/api';
import { dehydrateQueryState, makeQueryClient } from '../lib/query-client';
import {
  gardenKeys,
  gardensQuery,
  INCOMING_GARDEN_HIGHLIGHT_MS,
  postGarden,
  type CreateGarden,
  type Garden,
} from '../queries/gardens';

type GardensLoaderData = {
  dehydratedState: DehydratedState;
};

type PendingAddition = {
  clientId: string;
  body: CreateGarden;
};

function gardensLoadCopy(error: unknown): { title: string; message: string } {
  const status = getErrorStatus(error);

  if (status === 404) {
    return {
      title: "We couldn't find gardens",
      message: 'They may have been moved or deleted.',
    };
  }

  if (status === 409) {
    return {
      title: "Couldn't load gardens",
      message: 'The list changed. Try again.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title: "Couldn't load gardens",
      message: 'The service is temporarily unavailable. Try again.',
    };
  }

  return {
    title: "Couldn't load gardens",
    message: 'Please try again.',
  };
}

function gardensCreateCopy(error: unknown): { title: string; message: string } {
  const status = getErrorStatus(error);

  if (status === 400) {
    return {
      title: "Couldn't add this garden",
      message: 'Check the details and try again.',
    };
  }

  if (status === 409) {
    return {
      title: "Couldn't add this garden",
      message: 'This conflicts with current data. Try again.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title: "Couldn't add this garden",
      message: 'The service is temporarily unavailable. Try again.',
    };
  }

  return {
    title: "Couldn't add this garden",
    message: 'Please try again.',
  };
}

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

export async function loader(): Promise<GardensLoaderData> {
  const queryClient = makeQueryClient({ retry: false });
  try {
    await queryClient.fetchQuery(gardensQuery());
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
  }

  return { dehydratedState: dehydrateQueryState(queryClient) };
}

export default function GardensPage({ loaderData }: { loaderData?: GardensLoaderData }) {
  return (
    <HydrationBoundary state={loaderData?.dehydratedState}>
      <AppShell>
        <GardensPanel />
      </AppShell>
    </HydrationBoundary>
  );
}

function GardensPanel() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [pendingAdditions, setPendingAdditions] = useState<PendingAddition[]>([]);
  const [restoreValues, setRestoreValues] = useState<CreateGarden | null>(null);
  const { data, isPending, isError, error, refetch } = useQuery(gardensQuery());
  const { incomingIds, acknowledge } = useIncomingGardenIds(data);
  const createGarden = useMutation({
    mutationFn: ({ body }: PendingAddition) => postGarden(body),
    onSuccess: (garden, { clientId }) => {
      acknowledge(garden.gardenId);
      setPendingAdditions((current) => dropPending(current, clientId));
      queryClient.setQueryData<Garden[]>(gardenKeys.list(), (current) =>
        current ? [...current, garden] : [garden],
      );
    },
    onError: (mutationError, { clientId, body }) => {
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
    createGarden.mutate({ clientId, body });
  }

  const gardenRows = [
    ...(data ?? []).map((garden) => ({
      id: String(garden.gardenId),
      gardenName: garden.gardenName,
      totalSurfaceArea: garden.totalSurfaceArea,
      latitude: garden.latitude,
      longitude: garden.longitude,
      pending: incomingIds.has(garden.gardenId),
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
