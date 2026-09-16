import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  gardenKeys,
  postGarden,
  upsertGardenInList,
  type CreateGarden,
  type Garden,
} from '../gardens';

export function useCreateGarden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateGarden) => postGarden(body),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: gardenKeys.list() });
    },
    onSuccess: (garden) => {
      queryClient.setQueryData<Garden[]>(gardenKeys.list(), (current) =>
        upsertGardenInList(current, garden),
      );
    },
  });
}
