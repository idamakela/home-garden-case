import { Skeleton, Table } from '@mantine/core';
import styles from './PlantList.module.css';

const PLACEHOLDER_ROWS = [0, 1, 2, 3, 4] as const;
const PLACEHOLDER_COLUMNS = [0, 1, 2, 3, 4, 5] as const;

export function PlantListSkeleton() {
  return (
    <section className={styles.root} aria-busy="true" aria-label="Loading plants">
      <Table withTableBorder tabularNums>
        <Table.Thead>
          <Table.Tr>
            {PLACEHOLDER_COLUMNS.map((column) => (
              <Table.Th key={column} className={column >= 3 ? styles.desktopOnly : undefined}>
                <Skeleton height={8} />
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {PLACEHOLDER_ROWS.map((row) => (
            <Table.Tr key={row}>
              {PLACEHOLDER_COLUMNS.map((column) => (
                <Table.Td key={column} className={column >= 3 ? styles.desktopOnly : undefined}>
                  <Skeleton height={8} />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </section>
  );
}
