import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorStatus } from '../../lib/api';
import { gardensDeleteCopy } from '../../lib/garden-copy';
import { ignoreIncomingGarden, ignoreOutgoingGarden } from '../../lib/garden-list-highlights';
import { deleteGarden, removeGardenFromList, type Garden } from '../gardens';
import { gardenMutationKeys, gardenQueryKeys } from '../gardens.const';

export function useDeleteGarden() {
  const queryClient = useQueryClient();

  return useMutation({
    gcTime: 60_000,
    mutationKey: gardenMutationKeys.deletes(),
    mutationFn: (gardenId: number) => deleteGarden(gardenId),
    onMutate: async (gardenId) => {
      await queryClient.cancelQueries({ queryKey: gardenQueryKeys.list() });
      const previous = queryClient.getQueryData<Garden[]>(gardenQueryKeys.list());
      ignoreOutgoingGarden(gardenId);
      queryClient.setQueryData<Garden[]>(gardenQueryKeys.list(), (current) =>
        removeGardenFromList(current, gardenId),
      );

      return { previous };
    },
    onError: (error, gardenId, context) => {
      if (getErrorStatus(error) === 404) {
        return;
      }

      ignoreIncomingGarden(gardenId);
      queryClient.setQueryData<Garden[]>(gardenQueryKeys.list(), context?.previous);

      const gardenName = context?.previous?.find(
        (garden) => garden.gardenId === gardenId,
      )?.gardenName;
      const copy = gardensDeleteCopy(error, gardenName);
      notifications.show({
        autoClose: false,
        color: 'red',
        title: copy.title,
        message: copy.message,
      });
    },
  });
}
