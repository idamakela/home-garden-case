export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: () => [...userQueryKeys.lists()] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (userId: number) => [...userQueryKeys.details(), userId] as const,
  email: (emailAddress: string) => [...userQueryKeys.all, 'email', emailAddress] as const,
};

export const userMutationKeys = {
  all: ['users'] as const,
  creates: () => [...userMutationKeys.all, 'create'] as const,
  create: () => [...userMutationKeys.creates()] as const,
  updates: () => [...userMutationKeys.all, 'update'] as const,
  update: (userId: number) => [...userMutationKeys.updates(), userId] as const,
  deletes: () => [...userMutationKeys.all, 'delete'] as const,
  delete: (userId: number) => [...userMutationKeys.deletes(), userId] as const,
};
