import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  plantKeys,
  postPlant,
  upsertPlantInList,
  type CreatePlant,
  type Plant,
} from '../plants';

export function useCreatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePlant) => postPlant(body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: plantKeys.byGarden(body.gardenId) });
    },
    onSuccess: (plant) => {
      queryClient.setQueryData<Plant[]>(plantKeys.byGarden(plant.gardenId), (current) =>
        upsertPlantInList(current, plant),
      );
    },
  });
}
