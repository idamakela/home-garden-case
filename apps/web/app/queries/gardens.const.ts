export const gardenQueryKeys = {
  all: ['gardens'] as const,
  lists: () => [...gardenQueryKeys.all, 'list'] as const,
  list: () => [...gardenQueryKeys.lists()] as const,
  details: () => [...gardenQueryKeys.all, 'detail'] as const,
  detail: (gardenId: number) => [...gardenQueryKeys.details(), gardenId] as const,
};

export const gardenMutationKeys = {
  all: ['gardens'] as const,
  creates: () => [...gardenMutationKeys.all, 'create'] as const,
  create: () => [...gardenMutationKeys.creates()] as const,
  updates: () => [...gardenMutationKeys.all, 'update'] as const,
  update: (gardenId: number) => [...gardenMutationKeys.updates(), gardenId] as const,
  deletes: () => [...gardenMutationKeys.all, 'delete'] as const,
  delete: (gardenId: number) => [...gardenMutationKeys.deletes(), gardenId] as const,
};
