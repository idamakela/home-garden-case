import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorStatus } from '../../lib/api';
import { plantsDeleteCopy } from '../../lib/plant-copy';
import { deletePlant, plantKeys, removePlantFromList, type Plant } from '../plants';

type DeletePlantVariables = {
  plantId: number;
  gardenId: number;
  plantName: string;
};

export function useDeletePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    gcTime: 60_000,
    mutationFn: ({ plantId }: DeletePlantVariables) => deletePlant(plantId),
    onMutate: async ({ plantId, gardenId }) => {
      await queryClient.cancelQueries({ queryKey: plantKeys.byGarden(gardenId) });
      const previous = queryClient.getQueryData<Plant[]>(plantKeys.byGarden(gardenId));
      queryClient.setQueryData<Plant[]>(plantKeys.byGarden(gardenId), (current) =>
        removePlantFromList(current, plantId),
      );

      return { previous };
    },
    onError: (error, { gardenId, plantName }, context) => {
      if (getErrorStatus(error) === 404) {
        return;
      }

      queryClient.setQueryData<Plant[]>(plantKeys.byGarden(gardenId), context?.previous);

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
