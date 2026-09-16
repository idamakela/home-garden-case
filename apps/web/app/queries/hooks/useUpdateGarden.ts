import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putGarden, upsertGardenInList, type Garden, type UpdateGarden } from '../gardens';
import { gardenMutationKeys, gardenQueryKeys } from '../gardens.const';

type UpdateGardenVariables = {
  gardenId: number;
  body: UpdateGarden;
};

export function useUpdateGarden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: gardenMutationKeys.updates(),
    mutationFn: ({ gardenId, body }: UpdateGardenVariables) => putGarden(gardenId, body),
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
