import {
  QueryClient,
  defaultShouldDehydrateQuery,
  dehydrate,
  type DehydratedState,
} from '@tanstack/react-query';
import { getErrorStatus } from './api';

type MakeQueryClientOptions = {
  retry?: boolean | number;
};

export function makeQueryClient(options?: MakeQueryClientOptions) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: options?.retry ?? 2,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }

  browserClient ??= makeQueryClient();
  return browserClient;
}

export function dehydrateQueryState(queryClient: QueryClient): DehydratedState {
  const state = dehydrate(queryClient, {
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) || query.state.status === 'error',
    shouldRedactErrors: () => false,
  });

  return {
    ...state,
    queries: state.queries.map((query) => ({
      ...query,
      state: {
        ...query.state,
        error: serializeQueryError(query.state.error),
        fetchFailureReason: serializeQueryError(query.state.fetchFailureReason),
      },
    })),
  };
}

function serializeQueryError(error: unknown) {
  if (error == null) {
    return null;
  }

  const message = error instanceof Error ? error.message : 'Something went wrong.';
  const name = error instanceof Error ? error.name : 'Error';

  return {
    name,
    message,
    status: getErrorStatus(error),
  };
}
