import { Table, Text } from '@mantine/core';
import styles from './PlantList.module.css';

export type PlantListItem = {
  id: string;
  plantName: string;
  surfaceAreaRequired: number;
  idealHumidityLevel: number;
  species: string;
  plantType: string;
  plantationDate: string;
  pending?: boolean;
};

type PlantListProps = {
  plants: PlantListItem[];
};

export function PlantList({ plants }: PlantListProps) {
  return (
    <section className={styles.root}>
      {plants.length === 0 ? (
        <Text className={styles.empty}>No plants in this garden yet.</Text>
      ) : (
        <Table withTableBorder highlightOnHover tabularNums>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Plant name</Table.Th>
              <Table.Th>Surface area required</Table.Th>
              <Table.Th>Ideal humidity level</Table.Th>
              <Table.Th className={styles.desktopOnly}>Species</Table.Th>
              <Table.Th className={styles.desktopOnly}>Plant type</Table.Th>
              <Table.Th className={styles.desktopOnly}>Plantation date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {plants.map((plant) => (
              <Table.Tr
                key={plant.id}
                className={plant.pending ? styles.pending : undefined}
                aria-busy={plant.pending || undefined}
              >
                <Table.Td className={styles.capitalized}>{plant.plantName}</Table.Td>
                <Table.Td>{plant.surfaceAreaRequired}</Table.Td>
                <Table.Td>{plant.idealHumidityLevel}</Table.Td>
                <Table.Td className={`${styles.desktopOnly} ${styles.capitalized}`}>
                  {plant.species}
                </Table.Td>
                <Table.Td className={`${styles.desktopOnly} ${styles.capitalized}`}>
                  {plant.plantType}
                </Table.Td>
                <Table.Td className={styles.desktopOnly}>{plant.plantationDate}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </section>
  );
}
