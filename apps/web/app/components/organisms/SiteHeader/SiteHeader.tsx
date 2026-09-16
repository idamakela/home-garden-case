import { Anchor } from '@mantine/core';
import { Link } from 'react-router';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={styles.root}>
      <p className={styles.name}>Home Garden</p>
      <nav className={styles.nav} aria-label="Main">
        <Anchor
          component={Link}
          to="/gardens"
          reloadDocument
          className={styles.link}
          c="inherit"
          underline="never"
        >
          Gardens
        </Anchor>
        <Anchor
          component={Link}
          to="/my-garden"
          reloadDocument
          className={styles.link}
          c="inherit"
          underline="never"
        >
          My Garden
        </Anchor>
      </nav>
    </header>
  );
}
