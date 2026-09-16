export const plantQueryKeys = {
  all: ['plants'] as const,
  details: () => [...plantQueryKeys.all, 'detail'] as const,
  detail: (plantId: number) => [...plantQueryKeys.details(), plantId] as const,
  byGarden: (gardenId: number) => [...plantQueryKeys.all, 'garden', gardenId] as const,
};

export const plantMutationKeys = {
  all: ['plants'] as const,
  creates: () => [...plantMutationKeys.all, 'create'] as const,
  create: () => [...plantMutationKeys.creates()] as const,
  updates: () => [...plantMutationKeys.all, 'update'] as const,
  update: (plantId: number) => [...plantMutationKeys.updates(), plantId] as const,
  deletes: () => [...plantMutationKeys.all, 'delete'] as const,
  delete: (plantId: number) => [...plantMutationKeys.deletes(), plantId] as const,
};
