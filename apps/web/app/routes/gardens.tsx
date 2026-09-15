import { useQuery } from '@tanstack/react-query';
import { ErrorAlert } from '../components/molecules/ErrorAlert/ErrorAlert';
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
      message: 'Nothing is here.',
    };
  }

  if (status === 409) {
    return {
      title: 'Could not load gardens',
      message: 'This change conflicts with current data.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title: 'Could not load gardens',
      message: 'The service is unavailable.',
    };
  }

  return {
    title: 'Could not load gardens',
    message: 'Something went wrong.',
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
      <ErrorAlert error={copy.title} details={copy.message} onRetry={() => refetch()} />
    );
  }

  return <GardenList gardens={data} />;
}
