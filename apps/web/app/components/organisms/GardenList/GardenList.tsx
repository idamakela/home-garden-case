import { Anchor, Table, Text } from '@mantine/core';
import { Link } from 'react-router';
import { formatHumidityLevel } from '../../../lib/garden-humidity';
import styles from './GardenList.module.css';

export type GardenListItem = {
  id: string;
  gardenName: string;
  totalSurfaceArea: number;
  minHumidity?: number | null;
  maxHumidity?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  pending?: boolean;
  to?: string;
};

type GardenListProps = {
  gardens: GardenListItem[];
};

function formatOptionalNumber(value: number | null | undefined) {
  return value == null ? '—' : String(value);
}

function rowClassName(garden: GardenListItem) {
  const classNames = [];

  if (garden.to) {
    classNames.push(styles.clickable);
  }

  if (garden.pending) {
    classNames.push(styles.pending);
  }

  return classNames.length > 0 ? classNames.join(' ') : undefined;
}

function openGardenFromRow(event: { currentTarget: HTMLElement; target: EventTarget }) {
  const target = event.target;
  if (!(target instanceof Element) || target.closest('a')) {
    return;
  }

  const link = event.currentTarget.querySelector('a');
  if (link instanceof HTMLElement) {
    link.click();
  }
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
              <Table.Th>Humidity level</Table.Th>
              <Table.Th className={styles.desktopOnly}>Latitude</Table.Th>
              <Table.Th className={styles.desktopOnly}>Longitude</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {gardens.map((garden) => (
              <Table.Tr
                key={garden.id}
                className={rowClassName(garden)}
                aria-busy={garden.pending || undefined}
                onClick={garden.to ? openGardenFromRow : undefined}
              >
                <Table.Td>
                  {garden.to ? (
                    <Anchor
                      component={Link}
                      to={garden.to}
                      underline="hover"
                      className={styles.link}
                    >
                      {garden.gardenName}
                    </Anchor>
                  ) : (
                    garden.gardenName
                  )}
                </Table.Td>
                <Table.Td>{garden.totalSurfaceArea}</Table.Td>
                <Table.Td>{formatHumidityLevel(garden.minHumidity, garden.maxHumidity)}</Table.Td>
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
