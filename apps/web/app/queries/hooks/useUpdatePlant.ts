import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putPlant, upsertPlantInList, type Plant, type UpdatePlant } from '../plants';
import { plantMutationKeys, plantQueryKeys } from '../plants.const';

type UpdatePlantVariables = {
  plantId: number;
  body: UpdatePlant;
};

export function useUpdatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: plantMutationKeys.updates(),
    mutationFn: ({ plantId, body }: UpdatePlantVariables) => putPlant(plantId, body),
    onMutate: async ({ body }) => {
      if (body.gardenId == null) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: plantQueryKeys.byGarden(body.gardenId) });
    },
    onSuccess: (plant) => {
      queryClient.setQueryData<Plant[]>(plantQueryKeys.byGarden(plant.gardenId), (current) =>
        upsertPlantInList(current, plant),
      );
    },
  });
}
