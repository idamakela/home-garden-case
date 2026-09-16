import { Table, Text, UnstyledButton } from '@mantine/core';
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
  onOpenPlant?: (id: string) => void;
};

function rowClassName(plant: PlantListItem, clickable: boolean) {
  const classNames = [];

  if (clickable) {
    classNames.push(styles.clickable);
  }

  if (plant.pending) {
    classNames.push(styles.pending);
  }

  return classNames.length > 0 ? classNames.join(' ') : undefined;
}

function openPlantFromRow(event: { currentTarget: HTMLElement; target: EventTarget }) {
  const target = event.target;
  if (!(target instanceof Element) || target.closest('button')) {
    return;
  }

  const button = event.currentTarget.querySelector('button');
  if (button instanceof HTMLElement) {
    button.click();
  }
}

export function PlantList({ plants, onOpenPlant }: PlantListProps) {
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
            {plants.map((plant) => {
              const clickable = onOpenPlant != null && !plant.pending;

              return (
                <Table.Tr
                  key={plant.id}
                  className={rowClassName(plant, clickable)}
                  aria-busy={plant.pending || undefined}
                  onClick={clickable ? openPlantFromRow : undefined}
                >
                  <Table.Td className={styles.capitalized}>
                    {clickable ? (
                      <UnstyledButton
                        type="button"
                        className={styles.link}
                        onClick={() => onOpenPlant(plant.id)}
                      >
                        {plant.plantName}
                      </UnstyledButton>
                    ) : (
                      plant.plantName
                    )}
                  </Table.Td>
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
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </section>
  );
}
