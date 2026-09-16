import { Text, Title } from '@mantine/core';
import type { MetaFunction } from 'react-router';
import { AppShell } from '../components/templates/AppShell/AppShell';

export const meta: MetaFunction = () => [{ title: 'My Garden · Home Garden' }];

export default function MyGardenPage() {
  return (
    <AppShell>
      <Title order={1}>My Garden</Title>
      <Text>This page is not implemented yet.</Text>
    </AppShell>
  );
}
