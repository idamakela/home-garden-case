import { Table, Text, Title } from '@mantine/core';
import type { Garden } from '../../../queries/gardens';
import styles from './GardenList.module.css';

type GardenListProps = {
  gardens: Garden[];
};

function formatOptionalNumber(value: number | null | undefined) {
  return value == null ? '—' : String(value);
}

export function GardenList({ gardens }: GardenListProps) {
  return (
    <section className={styles.root}>
      <Title order={1} className={styles.title}>
        Gardens
      </Title>
      {gardens.length === 0 ? (
        <Text className={styles.empty}>No gardens yet.</Text>
      ) : (
        <Table.ScrollContainer minWidth={500}>
          <Table withTableBorder highlightOnHover tabularNums>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Garden name</Table.Th>
                <Table.Th>Total surface area</Table.Th>
                <Table.Th>Latitude</Table.Th>
                <Table.Th>Longitude</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {gardens.map((garden) => (
                <Table.Tr key={garden.gardenId}>
                  <Table.Td>{garden.gardenName}</Table.Td>
                  <Table.Td>{garden.totalSurfaceArea}</Table.Td>
                  <Table.Td>{formatOptionalNumber(garden.latitude)}</Table.Td>
                  <Table.Td>{formatOptionalNumber(garden.longitude)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </section>
  );
}
