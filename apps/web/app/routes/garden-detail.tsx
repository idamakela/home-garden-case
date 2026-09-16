import { Button, Group, Notification, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useParams, type MetaFunction } from 'react-router';
import { AddGardenModal } from '../components/molecules/AddGardenModal/AddGardenModal';
import { BackLink } from '../components/molecules/BackLink/BackLink';
import { ErrorAlert } from '../components/molecules/ErrorAlert/ErrorAlert';
import { PlantList } from '../components/organisms/PlantList/PlantList';
import { PlantListSkeleton } from '../components/organisms/PlantList/PlantListSkeleton';
import { GardenDetail } from '../components/templates/GardenDetail/GardenDetail';
import { GardenDetailSkeleton } from '../components/templates/GardenDetail/GardenDetailSkeleton';
import { gardensLoadCopy, gardensUpdateCopy } from '../lib/garden-copy';
import { parseGardenId } from '../lib/garden-id';
import { plantsLoadCopy } from '../lib/plant-copy';
import { type Garden, type UpdateGarden } from '../queries/gardens';
import { useGardens } from '../queries/hooks/useGardens';
import { usePlantsByGarden } from '../queries/hooks/usePlantsByGarden';
import { useUpdateGarden } from '../queries/hooks/useUpdateGarden';

export const meta: MetaFunction = () => [{ title: 'Garden · Home Garden' }];

type PendingUpdate = {
  clientId: string;
  gardenId: number;
  body: UpdateGarden;
};

function formatOptional(value: string | number | null | undefined) {
  if (value == null || value === '') {
    return '—';
  }

  return String(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function gardenFields(garden: Garden) {
  return {
    gardenId: String(garden.gardenId),
    totalSurfaceArea: String(garden.totalSurfaceArea),
    locationDescription: formatOptional(garden.locationDescription),
    latitude: formatOptional(garden.latitude),
    longitude: formatOptional(garden.longitude),
    created: formatDateTime(garden.createdAt),
    updated: formatDateTime(garden.updatedAt),
  };
}

function toUpdateGarden(garden: Garden): UpdateGarden {
  return {
    gardenName: garden.gardenName,
    totalSurfaceArea: garden.totalSurfaceArea,
    locationDescription: garden.locationDescription ?? null,
    latitude: garden.latitude ?? null,
    longitude: garden.longitude ?? null,
  };
}

export default function GardenDetailPage() {
  const { gardenId: gardenIdParam } = useParams();
  const gardenId = parseGardenId(gardenIdParam);
  const [opened, { open, close }] = useDisclosure(false);
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null);
  const [restoreValues, setRestoreValues] = useState<UpdateGarden | null>(null);
  const gardens = useGardens({ refetchInterval: false });
  const cachedGarden =
    gardenId == null ? undefined : gardens.data?.find((item) => item.gardenId === gardenId);
  const garden = cachedGarden
    ? pendingUpdate
      ? { ...cachedGarden, ...pendingUpdate.body }
      : cachedGarden
    : undefined;
  const plants = usePlantsByGarden(gardenId ?? null);
  const updateGarden = useUpdateGarden();

  function openUpdate() {
    setRestoreValues(null);
    open();
  }

  function closeModal() {
    close();
    setRestoreValues(null);
  }

  function submitUpdate(body: UpdateGarden) {
    if (gardenId == null) {
      return;
    }

    const clientId = crypto.randomUUID();
    setPendingUpdate({ clientId, gardenId, body });
    setRestoreValues(null);
    close();
    updateGarden.mutate(
      { gardenId, body },
      {
        onSuccess: () => {
          setPendingUpdate((current) => (current?.clientId === clientId ? null : current));
        },
        onError: (mutationError) => {
          let shouldNotify = false;
          setPendingUpdate((current) => {
            if (current?.clientId !== clientId) {
              return current;
            }

            shouldNotify = true;
            return null;
          });

          if (!shouldNotify) {
            return;
          }

          const copy = gardensUpdateCopy(mutationError);
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
      },
    );
  }

  let content;

  if (gardenId == null) {
    content = (
      <>
        <Title order={1}>We couldn't find this garden</Title>
        <Text>It may have been moved or deleted.</Text>
      </>
    );
  } else if (gardens.isPending) {
    content = <GardenDetailSkeleton />;
  } else if (gardens.isError && !gardens.data) {
    const copy = gardensLoadCopy(gardens.error);
    content = (
      <ErrorAlert error={copy.title} details={copy.message} onRetry={() => gardens.refetch()} />
    );
  } else if (!garden) {
    content = (
      <>
        <Title order={1}>We couldn't find this garden</Title>
        <Text>It may have been moved or deleted.</Text>
      </>
    );
  } else {
    let plantsContent;

    if (plants.isPending) {
      plantsContent = <PlantListSkeleton />;
    } else if (plants.isError && !plants.data) {
      const copy = plantsLoadCopy(plants.error);
      plantsContent = (
        <ErrorAlert error={copy.title} details={copy.message} onRetry={() => plants.refetch()} />
      );
    } else {
      plantsContent = (
        <PlantList
          plants={(plants.data ?? []).map((plant) => ({
            id: String(plant.plantId),
            plantName: plant.plantName,
            surfaceAreaRequired: plant.surfaceAreaRequired,
            idealHumidityLevel: plant.idealHumidityLevel,
            species: plant.species,
            plantType: plant.plantType,
            plantationDate: formatDateTime(plant.plantationDate),
          }))}
        />
      );
    }

    content = (
      <>
        <GardenDetail
          gardenName={garden.gardenName}
          plants={plantsContent}
          pending={pendingUpdate != null}
          actions={
            <Group gap="sm">
              <Button type="button" onClick={openUpdate}>
                Update garden
              </Button>
              <Button type="button" variant="default">
                Delete garden
              </Button>
            </Group>
          }
          {...gardenFields(garden)}
        />
        <AddGardenModal
          opened={opened}
          onClose={closeModal}
          onSubmit={submitUpdate}
          initialValues={restoreValues ?? toUpdateGarden(garden)}
          title="Update garden"
          submitLabel="Update garden"
        />
      </>
    );
  }

  return (
    <Stack gap="md" align="stretch">
      <BackLink to="/gardens" />
      {content}
    </Stack>
  );
}
