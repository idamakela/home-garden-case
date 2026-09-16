import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router';
import styles from './BackLink.module.css';

type BackLinkProps = {
  to: string;
};

export function BackLink({ to }: BackLinkProps) {
  return (
    <Button
      component={Link}
      to={to}
      variant="subtle"
      leftSection={<IconArrowLeft size={16} aria-hidden />}
      className={styles.root}
    >
      back
    </Button>
  );
}
