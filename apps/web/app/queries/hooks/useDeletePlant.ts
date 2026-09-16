import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorStatus } from '../../lib/api';
import { plantsDeleteCopy } from '../../lib/plant-copy';
import { deletePlant, removePlantFromList, type Plant } from '../plants';
import { plantMutationKeys, plantQueryKeys } from '../plants.const';

type DeletePlantVariables = {
  plantId: number;
  gardenId: number;
  plantName: string;
};

export function useDeletePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    gcTime: 60_000,
    mutationKey: plantMutationKeys.deletes(),
    mutationFn: ({ plantId }: DeletePlantVariables) => deletePlant(plantId),
    onMutate: async ({ plantId, gardenId }) => {
      await queryClient.cancelQueries({ queryKey: plantQueryKeys.byGarden(gardenId) });
      const previous = queryClient.getQueryData<Plant[]>(plantQueryKeys.byGarden(gardenId));
      queryClient.setQueryData<Plant[]>(plantQueryKeys.byGarden(gardenId), (current) =>
        removePlantFromList(current, plantId),
      );

      return { previous };
    },
    onError: (error, { gardenId, plantName }, context) => {
      if (getErrorStatus(error) === 404) {
        return;
      }

      queryClient.setQueryData<Plant[]>(plantQueryKeys.byGarden(gardenId), context?.previous);

      const copy = plantsDeleteCopy(error, plantName);
      notifications.show({
        autoClose: false,
        color: 'red',
        title: copy.title,
        message: copy.message,
      });
    },
  });
}
