import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  plantKeys,
  putPlant,
  upsertPlantInList,
  type Plant,
  type UpdatePlant,
} from '../plants';

type UpdatePlantVariables = {
  plantId: number;
  body: UpdatePlant;
};

export function useUpdatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, body }: UpdatePlantVariables) => putPlant(plantId, body),
    onMutate: async ({ body }) => {
      if (body.gardenId == null) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: plantKeys.byGarden(body.gardenId) });
    },
    onSuccess: (plant) => {
      queryClient.setQueryData<Plant[]>(plantKeys.byGarden(plant.gardenId), (current) =>
        upsertPlantInList(current, plant),
      );
    },
  });
}
