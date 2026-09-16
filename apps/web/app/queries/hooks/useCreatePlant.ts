import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postPlant, upsertPlantInList, type CreatePlant, type Plant } from '../plants';
import { plantMutationKeys, plantQueryKeys } from '../plants.const';

export function useCreatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: plantMutationKeys.create(),
    mutationFn: (body: CreatePlant) => postPlant(body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: plantQueryKeys.byGarden(body.gardenId) });
    },
    onSuccess: (plant) => {
      queryClient.setQueryData<Plant[]>(plantQueryKeys.byGarden(plant.gardenId), (current) =>
        upsertPlantInList(current, plant),
      );
    },
  });
}
