import { Link } from 'react-router';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={styles.root}>
      <p className={styles.name}>Home Garden</p>
      <nav className={styles.nav} aria-label="Main">
        <Link to="/gardens" reloadDocument className={styles.link}>
          Gardens
        </Link>
        <Link to="/my-garden" reloadDocument className={styles.link}>
          My Garden
        </Link>
      </nav>
    </header>
  );
}
