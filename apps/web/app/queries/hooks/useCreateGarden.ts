import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postGarden, upsertGardenInList, type CreateGarden, type Garden } from '../gardens';
import { gardenMutationKeys, gardenQueryKeys } from '../gardens.const';

export function useCreateGarden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: gardenMutationKeys.create(),
    mutationFn: (body: CreateGarden) => postGarden(body),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: gardenQueryKeys.list() });
    },
    onSuccess: (garden) => {
      queryClient.setQueryData<Garden[]>(gardenQueryKeys.list(), (current) =>
        upsertGardenInList(current, garden),
      );
    },
  });
}
