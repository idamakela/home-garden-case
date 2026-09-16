import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query';
import {
  Outlet,
  type LoaderFunctionArgs,
  type MetaFunction,
  type ShouldRevalidateFunctionArgs,
} from 'react-router';
import { AppShell } from '../components/templates/AppShell/AppShell';
import { parseGardenId } from '../lib/garden-id';
import { dehydrateQueryState, makeQueryClient } from '../lib/query-client';
import { gardensQuery } from '../queries/gardens';
import { plantsByGardenQuery } from '../queries/plants';

type GardensLoaderData = {
  dehydratedState: DehydratedState;
};

export const meta: MetaFunction = () => [{ title: 'Gardens · Home Garden' }];

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod && formMethod !== 'GET') {
    return defaultShouldRevalidate;
  }

  const currentInGardens = currentUrl.pathname.startsWith('/gardens');
  const nextInGardens = nextUrl.pathname.startsWith('/gardens');

  if (currentInGardens && nextInGardens) {
    return false;
  }

  return defaultShouldRevalidate;
}

export async function loader({ params }: LoaderFunctionArgs): Promise<GardensLoaderData> {
  const queryClient = makeQueryClient({ retry: false });
  const gardenId = parseGardenId(params.gardenId);

  await Promise.all([
    queryClient.query(gardensQuery()).catch((error: unknown) => {
      if (!(error instanceof Error)) {
        throw error;
      }
    }),
    gardenId != null
      ? queryClient.query(plantsByGardenQuery(gardenId)).catch((error: unknown) => {
          if (!(error instanceof Error)) {
            throw error;
          }
        })
      : Promise.resolve(),
  ]);

  return { dehydratedState: dehydrateQueryState(queryClient) };
}

export default function GardensLayout({ loaderData }: { loaderData?: GardensLoaderData }) {
  return (
    <HydrationBoundary state={loaderData?.dehydratedState}>
      <AppShell>
        <Outlet />
      </AppShell>
    </HydrationBoundary>
  );
}
