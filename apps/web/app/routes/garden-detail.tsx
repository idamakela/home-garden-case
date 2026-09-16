import { Stack, Text, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useParams, type MetaFunction } from 'react-router';
import { BackLink } from '../components/molecules/BackLink/BackLink';
import { ErrorAlert } from '../components/molecules/ErrorAlert/ErrorAlert';
import { PlantList } from '../components/organisms/PlantList/PlantList';
import { PlantListSkeleton } from '../components/organisms/PlantList/PlantListSkeleton';
import { GardenDetail } from '../components/templates/GardenDetail/GardenDetail';
import { GardenDetailSkeleton } from '../components/templates/GardenDetail/GardenDetailSkeleton';
import { gardensLoadCopy } from '../lib/garden-copy';
import { parseGardenId } from '../lib/garden-id';
import { plantsLoadCopy } from '../lib/plant-copy';
import { gardensQuery, type Garden } from '../queries/gardens';
import { plantsByGardenQuery } from '../queries/plants';

export const meta: MetaFunction = () => [{ title: 'Garden · Home Garden' }];

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

export default function GardenDetailPage() {
  const { gardenId: gardenIdParam } = useParams();
  const gardenId = parseGardenId(gardenIdParam);
  const gardens = useQuery({
    ...gardensQuery(),
    refetchInterval: false,
  });
  const garden =
    gardenId == null ? undefined : gardens.data?.find((item) => item.gardenId === gardenId);
  const plants = useQuery({
    ...plantsByGardenQuery(gardenId ?? 0),
    enabled: gardenId != null,
  });

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
      <GardenDetail
        gardenName={garden.gardenName}
        plants={plantsContent}
        {...gardenFields(garden)}
      />
    );
  }

  return (
    <Stack gap="md" align="stretch">
      <BackLink to="/gardens" />
      {content}
    </Stack>
  );
}
