import { Paper, Skeleton, Stack } from '@mantine/core';

export function GardenDetailSkeleton() {
  return (
    <Stack gap="md" aria-busy="true" aria-label="Loading garden">
      <Skeleton height={28} width="40%" />
      <Paper radius="md" p="md" withBorder bg="var(--mantine-color-white)">
        <Skeleton height={64} />
      </Paper>
    </Stack>
  );
}
