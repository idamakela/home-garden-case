import { Table, Text } from '@mantine/core';
import styles from './GardenList.module.css';

export type GardenListItem = {
  id: string;
  gardenName: string;
  totalSurfaceArea: number;
  latitude?: number | null;
  longitude?: number | null;
  pending?: boolean;
};

type GardenListProps = {
  gardens: GardenListItem[];
};

function formatOptionalNumber(value: number | null | undefined) {
  return value == null ? '—' : String(value);
}

export function GardenList({ gardens }: GardenListProps) {
  return (
    <section className={styles.root}>
      {gardens.length === 0 ? (
        <Text className={styles.empty}>No gardens yet. Add one to get started.</Text>
      ) : (
        <Table withTableBorder highlightOnHover tabularNums>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Garden name</Table.Th>
              <Table.Th>Total surface area</Table.Th>
              <Table.Th className={styles.desktopOnly}>Latitude</Table.Th>
              <Table.Th className={styles.desktopOnly}>Longitude</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {gardens.map((garden) => (
              <Table.Tr
                key={garden.id}
                className={garden.pending ? styles.pending : undefined}
                aria-busy={garden.pending || undefined}
              >
                <Table.Td>{garden.gardenName}</Table.Td>
                <Table.Td>{garden.totalSurfaceArea}</Table.Td>
                <Table.Td className={styles.desktopOnly}>
                  {formatOptionalNumber(garden.latitude)}
                </Table.Td>
                <Table.Td className={styles.desktopOnly}>
                  {formatOptionalNumber(garden.longitude)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </section>
  );
}
