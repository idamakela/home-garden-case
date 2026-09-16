import { Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { GardenFields } from '../../molecules/GardenFields/GardenFields';
import styles from './GardenDetail.module.css';

type GardenDetailProps = {
  gardenName: string;
  gardenId: string;
  totalSurfaceArea: string;
  locationDescription: string;
  latitude: string;
  longitude: string;
  created: string;
  updated: string;
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
  plants,
}: GardenDetailProps) {
  return (
    <>
      <Title order={1} className={styles.title}>
        {gardenName}
      </Title>
      <GardenFields
        gardenId={gardenId}
        totalSurfaceArea={totalSurfaceArea}
        locationDescription={locationDescription}
        latitude={latitude}
        longitude={longitude}
        created={created}
        updated={updated}
      />
      {plants}
    </>
  );
}
