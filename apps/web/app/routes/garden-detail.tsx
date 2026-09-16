import { Button, Group, Notification, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, type MetaFunction } from 'react-router';
import { AddGardenModal } from '../components/molecules/AddGardenModal/AddGardenModal';
import { AddPlantModal } from '../components/molecules/AddPlantModal/AddPlantModal';
import { BackLink } from '../components/molecules/BackLink/BackLink';
import { DeleteGardenModal } from '../components/molecules/DeleteGardenModal/DeleteGardenModal';
import { ErrorAlert } from '../components/molecules/ErrorAlert/ErrorAlert';
import { GardenRemovedModal } from '../components/molecules/GardenRemovedModal/GardenRemovedModal';
import { PlantList } from '../components/organisms/PlantList/PlantList';
import { PlantListSkeleton } from '../components/organisms/PlantList/PlantListSkeleton';
import { GardenDetail } from '../components/templates/GardenDetail/GardenDetail';
import { GardenDetailSkeleton } from '../components/templates/GardenDetail/GardenDetailSkeleton';
import { gardensLoadCopy, gardensUpdateCopy } from '../lib/garden-copy';
import { formatHumidityLevel } from '../lib/garden-humidity';
import { parseGardenId } from '../lib/garden-id';
import { plantsCreateCopy, plantsLoadCopy } from '../lib/plant-copy';
import { type Garden, type UpdateGarden } from '../queries/gardens';
import { useCreatePlant } from '../queries/hooks/useCreatePlant';
import { useDeleteGarden } from '../queries/hooks/useDeleteGarden';
import { useGardens } from '../queries/hooks/useGardens';
import { usePlantsByGarden } from '../queries/hooks/usePlantsByGarden';
import { useUpdateGarden } from '../queries/hooks/useUpdateGarden';
import { type CreatePlant } from '../queries/plants';

export const meta: MetaFunction = () => [{ title: 'Garden · Home Garden' }];

type PendingUpdate = {
  clientId: string;
  gardenId: number;
  body: UpdateGarden;
};

type PendingPlantAddition = {
  clientId: string;
  body: CreatePlant;
};

function dropPendingPlant(pendingAdditions: PendingPlantAddition[], clientId: string) {
  return pendingAdditions.filter((item) => item.clientId !== clientId);
}

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
    totalSurfaceArea: String(garden.totalSurfaceArea),
    humidityLevel: formatHumidityLevel(garden.minHumidity, garden.maxHumidity),
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
    minHumidity: garden.minHumidity ?? null,
    maxHumidity: garden.maxHumidity ?? null,
  };
}

export default function GardenDetailPage() {
  const navigate = useNavigate();
  const { gardenId: gardenIdParam } = useParams();
  const gardenId = parseGardenId(gardenIdParam);
  const [updateOpened, updateModal] = useDisclosure(false);
  const [deleteOpened, deleteModal] = useDisclosure(false);
  const [addPlantOpened, addPlantModal] = useDisclosure(false);
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null);
  const [restoreValues, setRestoreValues] = useState<UpdateGarden | null>(null);
  const [pendingPlantAdditions, setPendingPlantAdditions] = useState<PendingPlantAddition[]>([]);
  const [restorePlantValues, setRestorePlantValues] = useState<CreatePlant | null>(null);
  const [heldGarden, setHeldGarden] = useState<Garden | undefined>();
  const [removedDialog, setRemovedDialog] = useState({ opened: false, canStay: true });
  const ownDeleteRef = useRef(false);
  const gardens = useGardens();
  const cachedGarden =
    gardenId == null ? undefined : gardens.data?.find((item) => item.gardenId === gardenId);
  const displayedGarden =
    cachedGarden ?? (heldGarden?.gardenId === gardenId ? heldGarden : undefined);
  const garden = displayedGarden
    ? pendingUpdate
      ? { ...displayedGarden, ...pendingUpdate.body }
      : displayedGarden
    : undefined;
  const plants = usePlantsByGarden(gardenId ?? null);
  const updateGarden = useUpdateGarden();
  const deleteGarden = useDeleteGarden();
  const createPlant = useCreatePlant();
  const remotelyRemoved =
    !ownDeleteRef.current &&
    gardenId != null &&
    gardens.data != null &&
    cachedGarden == null &&
    heldGarden?.gardenId === gardenId;

  useEffect(() => {
    if (cachedGarden) {
      setHeldGarden(cachedGarden);
    }
  }, [cachedGarden]);

  useEffect(() => {
    if (!remotelyRemoved) {
      if (cachedGarden) {
        setRemovedDialog({ opened: false, canStay: true });
      }

      return;
    }

    setRemovedDialog((current) =>
      current.opened ? current : { opened: true, canStay: current.canStay },
    );
  }, [remotelyRemoved, gardens.dataUpdatedAt, cachedGarden]);

  function openUpdate() {
    setRestoreValues(null);
    updateModal.open();
  }

  function closeUpdateModal() {
    updateModal.close();
    setRestoreValues(null);
  }

  function openAddPlant() {
    setRestorePlantValues(null);
    addPlantModal.open();
  }

  function closeAddPlantModal() {
    addPlantModal.close();
    setRestorePlantValues(null);
  }

  function submitUpdate(body: UpdateGarden) {
    if (gardenId == null) {
      return;
    }

    const clientId = crypto.randomUUID();
    setPendingUpdate({ clientId, gardenId, body });
    setRestoreValues(null);
    updateModal.close();
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
                  updateModal.open();
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

  function submitPlant(body: CreatePlant) {
    const clientId = crypto.randomUUID();
    setPendingPlantAdditions((current) => [...current, { clientId, body }]);
    setRestorePlantValues(null);
    addPlantModal.close();
    createPlant.mutate(body, {
      onSuccess: () => {
        setPendingPlantAdditions((current) => dropPendingPlant(current, clientId));
      },
      onError: (mutationError) => {
        setPendingPlantAdditions((current) => dropPendingPlant(current, clientId));
        const copy = plantsCreateCopy(mutationError);
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
                setRestorePlantValues(body);
                addPlantModal.open();
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

  function confirmDelete() {
    if (gardenId == null) {
      return;
    }

    ownDeleteRef.current = true;
    deleteModal.close();
    deleteGarden.mutate(gardenId);
    navigate('/gardens');
  }

  function stayOnRemovedGarden() {
    setRemovedDialog({ opened: false, canStay: false });
  }

  function goBackToGardens() {
    navigate('/gardens');
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
      const plantRows = [
        ...(plants.data ?? []).map((plant) => ({
          id: String(plant.plantId),
          plantName: plant.plantName,
          surfaceAreaRequired: plant.surfaceAreaRequired,
          idealHumidityLevel: plant.idealHumidityLevel,
          species: plant.species,
          plantType: plant.plantType,
          plantationDate: formatDateTime(plant.plantationDate),
        })),
        ...pendingPlantAdditions.map((pending) => ({
          id: `pending-${pending.clientId}`,
          plantName: pending.body.plantName,
          surfaceAreaRequired: pending.body.surfaceAreaRequired,
          idealHumidityLevel: pending.body.idealHumidityLevel,
          species: pending.body.species,
          plantType: pending.body.plantType,
          plantationDate: formatDateTime(pending.body.plantationDate),
          pending: true,
        })),
      ];

      plantsContent = <PlantList plants={plantRows} />;
    }

    content = (
      <>
        <GardenDetail
          gardenName={garden.gardenName}
          plants={plantsContent}
          pending={pendingUpdate != null}
          actions={
            <Group gap="sm">
              <Button type="button" onClick={openUpdate} disabled={pendingUpdate != null}>
                Update garden
              </Button>
              <Button type="button" variant="default" onClick={deleteModal.open}>
                Delete garden
              </Button>
            </Group>
          }
          plantsActions={
            <Button type="button" onClick={openAddPlant}>
              Add plant
            </Button>
          }
          {...gardenFields(garden)}
        />
        <AddGardenModal
          opened={updateOpened}
          onClose={closeUpdateModal}
          onSubmit={submitUpdate}
          initialValues={restoreValues ?? toUpdateGarden(garden)}
          title="Update garden"
          submitLabel="Update garden"
        />
        <AddPlantModal
          opened={addPlantOpened}
          onClose={closeAddPlantModal}
          onSubmit={submitPlant}
          gardenId={garden.gardenId}
          gardenName={garden.gardenName}
          initialValues={restorePlantValues}
        />
        <DeleteGardenModal
          opened={deleteOpened}
          onClose={deleteModal.close}
          onConfirm={confirmDelete}
        />
        <GardenRemovedModal
          opened={removedDialog.opened}
          canStay={removedDialog.canStay}
          onStay={stayOnRemovedGarden}
          onGoBack={goBackToGardens}
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
