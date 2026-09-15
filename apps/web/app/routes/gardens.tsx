import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/atoms/Button/Button';
import { GardenList } from '../components/organisms/GardenList/GardenList';
import { AppShell } from '../components/templates/AppShell/AppShell';
import { gardensQuery } from '../queries/gardens';

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
    return <p>Loading gardens…</p>;
  }

  if (isError) {
    return (
      <>
        <p>Failed to load gardens. {error.message}</p>
        <Button variant="primary" onClick={() => refetch()}>
          Retry
        </Button>
      </>
    );
  }

  return <GardenList gardens={data} />;
}
