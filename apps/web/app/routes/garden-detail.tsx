import { Button, Group, Notification, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, type MetaFunction } from 'react-router';
import { AddGardenModal } from '../components/molecules/AddGardenModal/AddGardenModal';
import { AddPlantModal } from '../components/molecules/AddPlantModal/AddPlantModal';
import { BackLink } from '../components/molecules/BackLink/BackLink';
import { DeleteGardenModal } from '../components/molecules/DeleteGardenModal/DeleteGardenModal';
import { DeletePlantModal } from '../components/molecules/DeletePlantModal/DeletePlantModal';
import { ErrorAlert } from '../components/molecules/ErrorAlert/ErrorAlert';
import { GardenRemovedModal } from '../components/molecules/GardenRemovedModal/GardenRemovedModal';
import { PlantDetailModal } from '../components/molecules/PlantDetailModal/PlantDetailModal';
import { PlantList } from '../components/organisms/PlantList/PlantList';
import { PlantListSkeleton } from '../components/organisms/PlantList/PlantListSkeleton';
import { GardenDetail } from '../components/templates/GardenDetail/GardenDetail';
import { GardenDetailSkeleton } from '../components/templates/GardenDetail/GardenDetailSkeleton';
import { gardensLoadCopy, gardensUpdateCopy } from '../lib/garden-copy';
import { formatHumidityLevel } from '../lib/garden-humidity';
import { parseGardenId } from '../lib/garden-id';
import { plantsCreateCopy, plantsLoadCopy, plantsUpdateCopy } from '../lib/plant-copy';
import { type Garden, type UpdateGarden } from '../queries/gardens';
import { useCreatePlant } from '../queries/hooks/useCreatePlant';
import { useDeleteGarden } from '../queries/hooks/useDeleteGarden';
import { useGardens } from '../queries/hooks/useGardens';
import { usePlantsByGarden } from '../queries/hooks/usePlantsByGarden';
import { useUpdateGarden } from '../queries/hooks/useUpdateGarden';
import { useUpdatePlant } from '../queries/hooks/useUpdatePlant';
import { type CreatePlant, type Plant } from '../queries/plants';

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

type PendingPlantUpdate = {
  clientId: string;
  plantId: number;
  body: CreatePlant;
};

type FailedPlantUpdate = {
  plantId: number;
  body: CreatePlant;
  error: unknown;
};

function dropPendingPlant(pendingAdditions: PendingPlantAddition[], clientId: string) {
  return pendingAdditions.filter((item) => item.clientId !== clientId);
}

function dropPendingPlantUpdate(pendingUpdates: PendingPlantUpdate[], clientId: string) {
  return pendingUpdates.filter((item) => item.clientId !== clientId);
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

function plantFields(plant: Plant) {
  return {
    surfaceAreaRequired: String(plant.surfaceAreaRequired),
    idealHumidityLevel: String(plant.idealHumidityLevel),
    species: plant.species,
    plantType: plant.plantType,
    plantationDate: formatDateTime(plant.plantationDate),
    created: formatDateTime(plant.createdAt),
    updated: formatDateTime(plant.updatedAt),
  };
}

function toCreatePlant(plant: Plant): CreatePlant {
  return {
    plantName: plant.plantName,
    species: plant.species,
    plantType: plant.plantType,
    plantationDate: plant.plantationDate,
    surfaceAreaRequired: plant.surfaceAreaRequired,
    idealHumidityLevel: plant.idealHumidityLevel,
    gardenId: plant.gardenId,
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
  const [updatePlantOpened, updatePlantModal] = useDisclosure(false);
  const [deletePlantOpened, deletePlantModal] = useDisclosure(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(null);
  const [restoreValues, setRestoreValues] = useState<UpdateGarden | null>(null);
  const [pendingPlantAdditions, setPendingPlantAdditions] = useState<PendingPlantAddition[]>([]);
  const [pendingPlantUpdates, setPendingPlantUpdates] = useState<PendingPlantUpdate[]>([]);
  const [restorePlantValues, setRestorePlantValues] = useState<CreatePlant | null>(null);
  const [restoreUpdatePlantValues, setRestoreUpdatePlantValues] = useState<CreatePlant | null>(null);
  const [failedPlantUpdate, setFailedPlantUpdate] = useState<FailedPlantUpdate | null>(null);
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
  const updatePlant = useUpdatePlant();
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

  function openUpdatePlant() {
    updatePlantModal.open();
  }

  function closeUpdatePlantModal() {
    updatePlantModal.close();
  }

  function openPlant(id: string) {
    const plant = plants.data?.find((item) => String(item.plantId) === id);

    if (!plant) {
      return;
    }

    setSelectedPlant(plant);
    closeUpdatePlantModal();
    deletePlantModal.close();
  }

  function closePlantDetail() {
    setSelectedPlant(null);
    setFailedPlantUpdate(null);
    setRestoreUpdatePlantValues(null);
    closeUpdatePlantModal();
    deletePlantModal.close();
  }

  function confirmDeletePlant() {
    deletePlantModal.close();
    setSelectedPlant(null);
    setFailedPlantUpdate(null);
    setRestoreUpdatePlantValues(null);
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

  function submitUpdatePlant(body: CreatePlant) {
    if (selectedPlant == null) {
      return;
    }

    const plantId = selectedPlant.plantId;
    const clientId = crypto.randomUUID();
    setPendingPlantUpdates((current) => [...current, { clientId, plantId, body }]);
    setFailedPlantUpdate(null);
    setRestoreUpdatePlantValues(null);
    updatePlantModal.close();
    updatePlant.mutate(
      { plantId, body },
      {
        onSuccess: (plant) => {
          setPendingPlantUpdates((current) => dropPendingPlantUpdate(current, clientId));
          setSelectedPlant((current) => (current?.plantId === plant.plantId ? plant : current));
          setFailedPlantUpdate(null);
          setRestoreUpdatePlantValues(null);
        },
        onError: (mutationError) => {
          setPendingPlantUpdates((current) => dropPendingPlantUpdate(current, clientId));
          setFailedPlantUpdate({ plantId, body, error: mutationError });
          setRestoreUpdatePlantValues(body);
        },
      },
    );
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
        ...(plants.data ?? []).map((plant) => {
          const pending = pendingPlantUpdates.find((item) => item.plantId === plant.plantId);
          const source = pending ? { ...plant, ...pending.body } : plant;

          return {
            id: String(plant.plantId),
            plantName: source.plantName,
            surfaceAreaRequired: source.surfaceAreaRequired,
            idealHumidityLevel: source.idealHumidityLevel,
            species: source.species,
            plantType: source.plantType,
            plantationDate: formatDateTime(source.plantationDate),
            pending: pending != null,
          };
        }),
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

      plantsContent = <PlantList plants={plantRows} onOpenPlant={openPlant} />;
    }

    const pendingSelectedUpdate = selectedPlant
      ? pendingPlantUpdates.find((item) => item.plantId === selectedPlant.plantId)
      : undefined;
    const displayedSelectedPlant = selectedPlant
      ? pendingSelectedUpdate
        ? { ...selectedPlant, ...pendingSelectedUpdate.body }
        : selectedPlant
      : null;
    const plantUpdateError =
      failedPlantUpdate != null &&
      selectedPlant != null &&
      failedPlantUpdate.plantId === selectedPlant.plantId &&
      pendingSelectedUpdate == null
        ? plantsUpdateCopy(failedPlantUpdate.error)
        : null;

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
        <AddPlantModal
          opened={updatePlantOpened}
          onClose={closeUpdatePlantModal}
          onSubmit={submitUpdatePlant}
          gardenId={garden.gardenId}
          gardenName={garden.gardenName}
          initialValues={
            restoreUpdatePlantValues ?? (selectedPlant ? toCreatePlant(selectedPlant) : null)
          }
          title="Update plant"
          submitLabel="Update plant"
          zIndex={400}
        />
        {displayedSelectedPlant ? (
          <PlantDetailModal
            opened
            onClose={closePlantDetail}
            plantName={displayedSelectedPlant.plantName}
            closeOnEscape={!updatePlantOpened && !deletePlantOpened}
            closeOnClickOutside={!updatePlantOpened && !deletePlantOpened}
            actions={
              <Group gap="sm">
                <Button
                  type="button"
                  onClick={openUpdatePlant}
                  disabled={pendingSelectedUpdate != null}
                >
                  Update plant
                </Button>
                <Button type="button" variant="default" onClick={deletePlantModal.open}>
                  Delete plant
                </Button>
              </Group>
            }
            {...plantFields(displayedSelectedPlant)}
            pending={pendingSelectedUpdate != null}
            error={
              plantUpdateError ? (
                <ErrorAlert
                  error={plantUpdateError.title}
                  details={plantUpdateError.message}
                  onRetry={() => {
                    if (failedPlantUpdate) {
                      submitUpdatePlant(failedPlantUpdate.body);
                    }
                  }}
                />
              ) : undefined
            }
          />
        ) : null}
        <DeleteGardenModal
          opened={deleteOpened}
          onClose={deleteModal.close}
          onConfirm={confirmDelete}
        />
        <DeletePlantModal
          opened={deletePlantOpened}
          onClose={deletePlantModal.close}
          onConfirm={confirmDeletePlant}
          zIndex={400}
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
