import { useQuery } from '@tanstack/react-query';
import { plantsByGardenQuery } from '../plants';

export function usePlantsByGarden(gardenId: number | null | undefined) {
  return useQuery({
    ...plantsByGardenQuery(gardenId ?? 0),
    enabled: gardenId != null,
  });
}
