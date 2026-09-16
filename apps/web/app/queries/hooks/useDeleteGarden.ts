import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorStatus } from '../../lib/api';
import { gardensDeleteCopy } from '../../lib/garden-copy';
import { ignoreIncomingGarden, ignoreOutgoingGarden } from '../../lib/garden-list-highlights';
import { deleteGarden, gardenKeys, removeGardenFromList, type Garden } from '../gardens';

export function useDeleteGarden() {
  const queryClient = useQueryClient();

  return useMutation({
    gcTime: 60_000,
    mutationFn: (gardenId: number) => deleteGarden(gardenId),
    onMutate: async (gardenId) => {
      await queryClient.cancelQueries({ queryKey: gardenKeys.list() });
      const previous = queryClient.getQueryData<Garden[]>(gardenKeys.list());
      ignoreOutgoingGarden(gardenId);
      queryClient.setQueryData<Garden[]>(gardenKeys.list(), (current) =>
        removeGardenFromList(current, gardenId),
      );

      return { previous };
    },
    onError: (error, gardenId, context) => {
      if (getErrorStatus(error) === 404) {
        return;
      }

      ignoreIncomingGarden(gardenId);
      queryClient.setQueryData<Garden[]>(gardenKeys.list(), context?.previous);

      const gardenName = context?.previous?.find((garden) => garden.gardenId === gardenId)
        ?.gardenName;
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
