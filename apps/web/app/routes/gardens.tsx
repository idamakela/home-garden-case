import { Alert } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/atoms/Button/Button';
import { GardenList } from '../components/organisms/GardenList/GardenList';
import { GardenListSkeleton } from '../components/organisms/GardenList/GardenListSkeleton';
import { AppShell } from '../components/templates/AppShell/AppShell';
import { ApiError } from '../lib/api';
import { gardensQuery } from '../queries/gardens';

function gardensLoadCopy(error: unknown): { title: string; message: string } {
  const status = error instanceof ApiError ? error.status : undefined;

  if (status === 404) {
    return {
      title: 'Gardens not found',
      message: 'Nothing is here. Try again.',
    };
  }

  if (status === 409) {
    return {
      title: 'Could not load gardens',
      message: 'This change conflicts with current data. Try again.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title: 'Could not load gardens',
      message: 'The service is unavailable. Try again.',
    };
  }

  return {
    title: 'Could not load gardens',
    message: 'Something went wrong. Try again.',
  };
}

export default function GardensPage() {
  return (
    <AppShell>
      <GardensPanel />
    </AppShell>
  );
}

function GardensPanel() {
  const { data, isPending, isError, error, refetch } = useQuery(gardensQuery());

  if (isPending) {
    return <GardenListSkeleton />;
  }

  if (isError) {
    const copy = gardensLoadCopy(error);

    return (
      <Alert title={copy.title} color="red">
        {copy.message}
        <Button variant="primary" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return <GardenList gardens={data} />;
}
