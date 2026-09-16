import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  gardenKeys,
  putGarden,
  upsertGardenInList,
  type Garden,
  type UpdateGarden,
} from '../gardens';

type UpdateGardenVariables = {
  gardenId: number;
  body: UpdateGarden;
};

export function useUpdateGarden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gardenId, body }: UpdateGardenVariables) => putGarden(gardenId, body),
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
