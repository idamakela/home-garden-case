import { DataList, Paper } from '@mantine/core';
import styles from './GardenFields.module.css';

type GardenFieldsProps = {
  gardenId: string;
  totalSurfaceArea: string;
  locationDescription: string;
  latitude: string;
  longitude: string;
  created: string;
  updated: string;
};

export function GardenFields({
  gardenId,
  totalSurfaceArea,
  locationDescription,
  latitude,
  longitude,
  created,
  updated,
}: GardenFieldsProps) {
  return (
    <Paper
      component="section"
      radius="md"
      p="md"
      withBorder
      bg="var(--mantine-color-white)"
      className={styles.root}
    >
      <DataList orientation="vertical" size="sm" gap="md" className={styles.list}>
        <DataList.Item>
          <DataList.ItemLabel>Garden ID</DataList.ItemLabel>
          <DataList.ItemValue>{gardenId}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Total surface area</DataList.ItemLabel>
          <DataList.ItemValue>{totalSurfaceArea}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item className={styles.full}>
          <DataList.ItemLabel>Location description</DataList.ItemLabel>
          <DataList.ItemValue>{locationDescription}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Latitude</DataList.ItemLabel>
          <DataList.ItemValue>{latitude}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Longitude</DataList.ItemLabel>
          <DataList.ItemValue>{longitude}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Created</DataList.ItemLabel>
          <DataList.ItemValue>{created}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Updated</DataList.ItemLabel>
          <DataList.ItemValue>{updated}</DataList.ItemValue>
        </DataList.Item>
      </DataList>
    </Paper>
  );
}
