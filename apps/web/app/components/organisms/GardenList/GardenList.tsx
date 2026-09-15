import type { Garden } from '../../../queries/gardens';
import styles from './GardenList.module.css';

type GardenListProps = {
  gardens: Garden[];
};

export function GardenList({ gardens }: GardenListProps) {
  return (
    <section className={styles.root}>
      <h1 className={styles.title}>Gardens</h1>
      {gardens.length === 0 ? (
        <p className={styles.empty}>No gardens yet.</p>
      ) : (
        <ul className={styles.list}>
          {gardens.map((garden) => (
            <li key={garden.gardenId} className={styles.item}>
              {garden.gardenName}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
