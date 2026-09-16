import { Text } from '@mantine/core';
import type { ReactNode } from 'react';
import { GardenFields } from '../../molecules/GardenFields/GardenFields';
import { SectionHeader } from '../../molecules/SectionHeader/SectionHeader';

type GardenDetailProps = {
  gardenName: string;
  totalSurfaceArea: string;
  humidityLevel: string;
  locationDescription: string;
  latitude: string;
  longitude: string;
  created: string;
  updated: string;
  pending?: boolean;
  actions?: ReactNode;
  plantsActions?: ReactNode;
  plantsSubtitle?: string;
  plants: ReactNode;
};

export function GardenDetail({
  gardenName,
  totalSurfaceArea,
  humidityLevel,
  locationDescription,
  latitude,
  longitude,
  created,
  updated,
  pending = false,
  actions,
  plantsActions,
  plantsSubtitle,
  plants,
}: GardenDetailProps) {
  return (
    <>
      <SectionHeader title={gardenName}>{actions}</SectionHeader>
      <GardenFields
        totalSurfaceArea={totalSurfaceArea}
        humidityLevel={humidityLevel}
        locationDescription={locationDescription}
        latitude={latitude}
        longitude={longitude}
        created={created}
        updated={updated}
        pending={pending}
      />
      <SectionHeader title="Plants" order={2}>
        {plantsActions}
      </SectionHeader>
      {plantsSubtitle ? (
        <Text size="xs" c="dimmed">
          {plantsSubtitle}
        </Text>
      ) : null}
      {plants}
    </>
  );
}
