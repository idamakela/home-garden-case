import type { ReactNode } from 'react';
import { GardenFields } from '../../molecules/GardenFields/GardenFields';
import { SectionHeader } from '../../molecules/SectionHeader/SectionHeader';

type GardenDetailProps = {
  gardenName: string;
  gardenId: string;
  totalSurfaceArea: string;
  locationDescription: string;
  latitude: string;
  longitude: string;
  created: string;
  updated: string;
  pending?: boolean;
  actions?: ReactNode;
  plants: ReactNode;
};

export function GardenDetail({
  gardenName,
  gardenId,
  totalSurfaceArea,
  locationDescription,
  latitude,
  longitude,
  created,
  updated,
  pending = false,
  actions,
  plants,
}: GardenDetailProps) {
  return (
    <>
      <SectionHeader title={gardenName}>{actions}</SectionHeader>
      <GardenFields
        gardenId={gardenId}
        totalSurfaceArea={totalSurfaceArea}
        locationDescription={locationDescription}
        latitude={latitude}
        longitude={longitude}
        created={created}
        updated={updated}
        pending={pending}
      />
      {plants}
    </>
  );
}
