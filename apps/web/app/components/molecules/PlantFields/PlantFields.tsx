import { DataList, Paper } from '@mantine/core';
import styles from './PlantFields.module.css';

export type PlantFieldsProps = {
  surfaceAreaRequired: string;
  idealHumidityLevel: string;
  species: string;
  plantType: string;
  plantationDate: string;
  created: string;
  updated: string;
  pending?: boolean;
};

export function PlantFields({
  surfaceAreaRequired,
  idealHumidityLevel,
  species,
  plantType,
  plantationDate,
  created,
  updated,
  pending = false,
}: PlantFieldsProps) {
  return (
    <Paper
      component="section"
      radius="md"
      p="md"
      withBorder
      bg="var(--mantine-color-white)"
      className={pending ? `${styles.root} ${styles.pending}` : styles.root}
      aria-busy={pending || undefined}
    >
      <DataList orientation="vertical" size="sm" gap="md" className={styles.list}>
        <DataList.Item>
          <DataList.ItemLabel>Surface area required</DataList.ItemLabel>
          <DataList.ItemValue>{surfaceAreaRequired}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Ideal humidity level</DataList.ItemLabel>
          <DataList.ItemValue>{idealHumidityLevel}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Species</DataList.ItemLabel>
          <DataList.ItemValue className={styles.capitalized}>{species}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Plant type</DataList.ItemLabel>
          <DataList.ItemValue className={styles.capitalized}>{plantType}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item className={styles.spanAll}>
          <DataList.ItemLabel>Plantation date</DataList.ItemLabel>
          <DataList.ItemValue>{plantationDate}</DataList.ItemValue>
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
