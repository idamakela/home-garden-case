import { notifications } from '@mantine/notifications';
import { createRoutesStub } from 'react-router';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import {
  gardenKeys,
  INCOMING_GARDEN_HIGHLIGHT_MS,
  type CreateGarden,
  type Garden,
  type UpdateGarden,
} from '../../app/queries/gardens';
import type { Plant } from '../../app/queries/plants';
import GardenDetailPage from '../../app/routes/garden-detail';
import GardensLayout, {
  loader as gardensLoader,
  shouldRevalidate,
} from '../../app/routes/gardens';
import GardensIndexPage from '../../app/routes/gardens-index';
import { renderWithQuery } from '../render-with-query';

const garden: Garden = {
  gardenId: 1,
  gardenName: 'Front yard',
  totalSurfaceArea: 12,
  locationDescription: null,
  latitude: 52.37,
  longitude: 4.89,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const plant: Plant = {
  plantId: 1,
  plantName: 'Tomato',
  species: 'Solanum lycopersicum',
  plantType: 'vegetable',
  plantationDate: '2026-03-15T00:00:00.000Z',
  surfaceAreaRequired: 2,
  idealHumidityLevel: 70,
  gardenId: 1,
  createdAt: '2026-03-15T00:00:00.000Z',
  updatedAt: '2026-03-15T00:00:00.000Z',
};

function stubGardensApi(handlers: {
  list: () => Promise<Response> | Response;
  create?: (body: CreateGarden) => Promise<Response> | Response;
  update?: (gardenId: number, body: UpdateGarden) => Promise<Response> | Response;
  plantsByGarden?: (gardenId: number) => Promise<Response> | Response;
}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();
      const plantsMatch = url.match(/\/plants\/garden\/(\d+)$/);
      const gardenMatch = url.match(/\/gardens\/(\d+)$/);

      if (plantsMatch && method === 'GET') {
        return (
          handlers.plantsByGarden?.(Number(plantsMatch[1])) ??
          new Response('Not found', { status: 404 })
        );
      }

      if (url.endsWith('/gardens') && method === 'POST') {
        const body = init?.body ? (JSON.parse(String(init.body)) as CreateGarden) : undefined;
        return (
          handlers.create?.(body as CreateGarden) ?? new Response('Not found', { status: 404 })
        );
      }

      if (gardenMatch && method === 'PUT') {
        const body = init?.body ? (JSON.parse(String(init.body)) as UpdateGarden) : undefined;
        return (
          handlers.update?.(Number(gardenMatch[1]), body as UpdateGarden) ??
          new Response('Not found', { status: 404 })
        );
      }

      if (url.endsWith('/gardens')) {
        return handlers.list();
      }

      return new Response('Not found', { status: 404 });
    }),
  );
}

function gardensRoute(options?: { loader?: typeof gardensLoader }) {
  return {
    path: '/gardens',
    Component: GardensLayout,
    loader: options?.loader,
    shouldRevalidate,
    children: [
      { index: true, Component: GardensIndexPage },
      { path: ':gardenId', Component: GardenDetailPage },
    ],
  };
}

function renderGardensPage(initialEntry = '/gardens') {
  const ReactRouterStub = createRoutesStub([gardensRoute()]);

  return renderWithQuery(<ReactRouterStub initialEntries={[initialEntry]} />);
}

function renderGardensPageWithLoader(initialEntry = '/gardens') {
  const ReactRouterStub = createRoutesStub([gardensRoute({ loader: gardensLoader })]);

  return renderWithQuery(<ReactRouterStub initialEntries={[initialEntry]} />);
}

async function openAddGardenModal() {
  fireEvent.click(screen.getByRole('button', { name: 'Add garden' }));
  return screen.findByRole('dialog');
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function fillGardenForm(
  dialog: HTMLElement,
  values: {
    gardenName: string;
    totalSurfaceArea: string;
    locationDescription?: string;
    latitude?: string;
    longitude?: string;
  },
) {
  fireEvent.change(within(dialog).getByLabelText(/Garden name/), {
    target: { value: values.gardenName },
  });
  fireEvent.change(within(dialog).getByLabelText(/Total surface area/), {
    target: { value: values.totalSurfaceArea },
  });

  if (values.locationDescription != null) {
    fireEvent.change(within(dialog).getByLabelText(/Location description/), {
      target: { value: values.locationDescription },
    });
  }

  if (values.latitude != null) {
    fireEvent.change(within(dialog).getByLabelText(/Latitude/), {
      target: { value: values.latitude },
    });
  }

  if (values.longitude != null) {
    fireEvent.change(within(dialog).getByLabelText(/Longitude/), {
      target: { value: values.longitude },
    });
  }
}

afterEach(() => {
  notifications.clean();
  vi.unstubAllGlobals();
});

test('user can see gardens', async () => {
  stubGardensApi({ list: () => jsonResponse([garden]) });

  renderGardensPage();

  expect(await screen.findByText('Front yard')).toBeTruthy();
  expect(screen.getByText('12')).toBeTruthy();
});

test('user sees an empty gardens list', async () => {
  stubGardensApi({ list: () => jsonResponse([]) });

  renderGardensPage();

  expect(await screen.findByText('No gardens yet. Add one to get started.')).toBeTruthy();
  expect(screen.queryByText('Front yard')).toBeNull();
});

test('user is told why gardens are missing and can retry', async () => {
  let shouldFail = true;

  stubGardensApi({
    list: () => {
      if (shouldFail) {
        shouldFail = false;
        return new Response('Internal error JSON {"message":"boom"}', { status: 500 });
      }

      return jsonResponse([garden]);
    },
  });

  renderGardensPage();

  expect(await screen.findByText("Couldn't load gardens")).toBeTruthy();
  expect(screen.getByText('The service is temporarily unavailable. Try again.')).toBeTruthy();
  expect(screen.queryByText(/boom/)).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

  expect(await screen.findByText('Front yard')).toBeTruthy();
});

test('user can add a garden', async () => {
  const created: Garden = {
    gardenId: 2,
    gardenName: 'Backyard',
    totalSurfaceArea: 20,
    locationDescription: 'Near the shed',
    latitude: 52,
    longitude: 4,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };
  const createRequest = deferred<Response>();

  stubGardensApi({
    list: () => jsonResponse([garden]),
    create: (body) => {
      expect(body).toEqual({
        gardenName: 'Backyard',
        totalSurfaceArea: 20,
        locationDescription: 'Near the shed',
        latitude: 52,
        longitude: 4,
      });
      return createRequest.promise;
    },
  });

  renderGardensPage();
  await screen.findByText('Front yard');

  const dialog = await openAddGardenModal();
  fillGardenForm(dialog, {
    gardenName: 'Backyard',
    totalSurfaceArea: '20',
    locationDescription: 'Near the shed',
    latitude: '52',
    longitude: '4',
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Add garden' }));

  expect(await screen.findByText('Backyard')).toBeTruthy();

  createRequest.resolve(jsonResponse(created, 201));

  await waitFor(() => {
    expect(screen.getAllByText('Backyard')).toHaveLength(1);
  });
});

test('user cannot add a garden with incomplete details', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    create: () => {
      throw new Error('POST /gardens should not be called');
    },
  });

  renderGardensPage();
  await screen.findByText('Front yard');

  const dialog = await openAddGardenModal();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Add garden' }));

  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.queryByText('Backyard')).toBeNull();
});

test('user can cancel adding a garden', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    create: () => {
      throw new Error('POST /gardens should not be called');
    },
  });

  renderGardensPage();
  await screen.findByText('Front yard');

  const dialog = await openAddGardenModal();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

test('user is told why a garden was not added and can restore the form', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    create: () => new Response('Internal error JSON {"message":"boom"}', { status: 500 }),
  });

  renderGardensPage();
  await screen.findByText('Front yard');

  const dialog = await openAddGardenModal();
  fillGardenForm(dialog, {
    gardenName: 'Backyard',
    totalSurfaceArea: '20',
    locationDescription: 'Near the shed',
    latitude: '52',
    longitude: '4',
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Add garden' }));

  expect(await screen.findByText("Couldn't add this garden")).toBeTruthy();
  expect(screen.getByText('The service is temporarily unavailable. Try again.')).toBeTruthy();
  expect(screen.queryByText(/boom/)).toBeNull();
  expect(screen.queryByText('Backyard')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: /Couldn't add this garden/ }));

  const restored = await screen.findByRole('dialog');
  expect(within(restored).getByLabelText(/Garden name/)).toHaveProperty('value', 'Backyard');
  expect(within(restored).getByLabelText(/Total surface area/)).toHaveProperty('value', '20');
  expect(within(restored).getByLabelText(/Location description/)).toHaveProperty(
    'value',
    'Near the shed',
  );
  expect(within(restored).getByLabelText(/Latitude/)).toHaveProperty('value', '52');
  expect(within(restored).getByLabelText(/Longitude/)).toHaveProperty('value', '4');
});

test('user can add more than one garden at a time', async () => {
  const backyard: Garden = {
    gardenId: 2,
    gardenName: 'Backyard',
    totalSurfaceArea: 20,
    locationDescription: null,
    latitude: null,
    longitude: null,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };
  const creates = new Map<string, ReturnType<typeof deferred<Response>>>();

  stubGardensApi({
    list: () => jsonResponse([garden]),
    create: (body) => {
      const request = deferred<Response>();
      creates.set(body.gardenName, request);
      return request.promise;
    },
  });

  renderGardensPage();
  await screen.findByText('Front yard');

  const firstDialog = await openAddGardenModal();
  fillGardenForm(firstDialog, { gardenName: 'Backyard', totalSurfaceArea: '20' });
  fireEvent.click(within(firstDialog).getByRole('button', { name: 'Add garden' }));
  expect(await screen.findByText('Backyard')).toBeTruthy();

  const secondDialog = await openAddGardenModal();
  fillGardenForm(secondDialog, { gardenName: 'Patio', totalSurfaceArea: '8' });
  fireEvent.click(within(secondDialog).getByRole('button', { name: 'Add garden' }));
  expect(await screen.findByText('Patio')).toBeTruthy();

  creates.get('Backyard')?.resolve(jsonResponse(backyard, 201));

  await waitFor(() => {
    expect(screen.getByText('Backyard')).toBeTruthy();
    expect(screen.getByText('Patio')).toBeTruthy();
  });
});

test('user can see gardens from the first HTML', async () => {
  stubGardensApi({ list: () => jsonResponse([garden]) });

  renderGardensPageWithLoader();

  expect(await screen.findByText('Front yard')).toBeTruthy();
});

test('user sees an empty gardens list from the first HTML', async () => {
  stubGardensApi({ list: () => jsonResponse([]) });

  renderGardensPageWithLoader();

  expect(await screen.findByText('No gardens yet. Add one to get started.')).toBeTruthy();
});

test('user is told why gardens are missing in the first HTML and can retry', async () => {
  let failList = true;

  stubGardensApi({
    list: () => {
      if (failList) {
        return new Response('Internal error JSON {"message":"boom"}', { status: 500 });
      }

      return jsonResponse([garden]);
    },
  });

  renderGardensPageWithLoader();

  expect(await screen.findByText("Couldn't load gardens")).toBeTruthy();
  expect(screen.getByText('The service is temporarily unavailable. Try again.')).toBeTruthy();
  expect(screen.queryByText(/boom/)).toBeNull();

  failList = false;
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

  expect(await screen.findByText('Front yard')).toBeTruthy();
});

test('user still sees gardens when a refresh fails', async () => {
  let failList = false;

  stubGardensApi({
    list: () => {
      if (failList) {
        return new Response('Internal error JSON {"message":"boom"}', { status: 500 });
      }

      return jsonResponse([garden]);
    },
  });

  const { queryClient } = renderGardensPage();

  await screen.findByText('Front yard');

  failList = true;
  await act(async () => {
    await queryClient.refetchQueries({ queryKey: gardenKeys.list() });
  });

  expect(screen.getByText('Front yard')).toBeTruthy();
  expect(screen.queryByText("Couldn't load gardens")).toBeNull();
  expect(screen.queryByText(/boom/)).toBeNull();
});

test('user can see a garden added in another session', async () => {
  const patio: Garden = {
    gardenId: 2,
    gardenName: 'Patio',
    totalSurfaceArea: 8,
    locationDescription: null,
    latitude: null,
    longitude: null,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };
  let gardens: Garden[] = [garden];

  stubGardensApi({ list: () => jsonResponse(gardens) });

  const { queryClient } = renderGardensPage();

  await screen.findByText('Front yard');

  gardens = [garden, patio];
  await act(async () => {
    await queryClient.refetchQueries({ queryKey: gardenKeys.list() });
  });

  expect(await screen.findByText('Patio')).toBeTruthy();
  expect(screen.getByText('Front yard')).toBeTruthy();

  await waitFor(
    () => {
      expect(screen.getByText('Patio')).toBeTruthy();
    },
    { timeout: INCOMING_GARDEN_HIGHLIGHT_MS + 500 },
  );
});

test('user can open a garden and see its details and plants', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    plantsByGarden: (gardenId) => {
      expect(gardenId).toBe(1);
      return jsonResponse([plant]);
    },
  });

  renderGardensPage();
  await screen.findByRole('link', { name: 'Front yard' });
  fireEvent.click(screen.getByText('12'));

  expect(await screen.findByRole('heading', { name: 'Front yard', level: 1 })).toBeTruthy();
  expect(screen.getByText('1')).toBeTruthy();
  expect(screen.getByText('12')).toBeTruthy();
  expect(screen.getByText('52.37')).toBeTruthy();
  expect(screen.getByText('4.89')).toBeTruthy();
  expect(await screen.findByText('Tomato')).toBeTruthy();
  expect(screen.getByText('2')).toBeTruthy();
  expect(screen.getByText('70')).toBeTruthy();
  expect(screen.getByText('Solanum lycopersicum')).toBeTruthy();
  expect(screen.getByText('vegetable')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Add garden' })).toBeNull();
});

test('user can go back to the gardens list', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    plantsByGarden: () => jsonResponse([plant]),
  });

  renderGardensPage();
  await screen.findByRole('link', { name: 'Front yard' });
  fireEvent.click(screen.getByRole('link', { name: 'Front yard' }));
  expect(await screen.findByText('Tomato')).toBeTruthy();

  fireEvent.click(screen.getByRole('link', { name: 'back' }));

  expect(await screen.findByRole('button', { name: 'Add garden' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Front yard' })).toBeTruthy();
  expect(screen.queryByText('Tomato')).toBeNull();
});

test('user is told why plants are missing and can retry', async () => {
  let shouldFail = true;

  stubGardensApi({
    list: () => jsonResponse([garden]),
    plantsByGarden: () => {
      if (shouldFail) {
        shouldFail = false;
        return new Response('Internal error JSON {"message":"boom"}', { status: 500 });
      }

      return jsonResponse([plant]);
    },
  });

  renderGardensPage();
  await screen.findByRole('link', { name: 'Front yard' });
  fireEvent.click(screen.getByRole('link', { name: 'Front yard' }));

  expect(await screen.findByText("Couldn't load plants")).toBeTruthy();
  expect(screen.getByText('The service is temporarily unavailable. Try again.')).toBeTruthy();
  expect(screen.queryByText(/boom/)).toBeNull();
  expect(screen.queryByText('Tomato')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

  expect(await screen.findByText('Tomato')).toBeTruthy();
});

test('user sees an empty plants list, not an error', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    plantsByGarden: () => jsonResponse([]),
  });

  renderGardensPage();
  await screen.findByRole('link', { name: 'Front yard' });
  fireEvent.click(screen.getByRole('link', { name: 'Front yard' }));

  expect(await screen.findByText('No plants in this garden yet.')).toBeTruthy();
  expect(screen.queryByText("Couldn't load plants")).toBeNull();
});

test('shouldRevalidate skips GET navigations within gardens', () => {
  const base = {
    currentParams: {},
    nextParams: {},
    defaultShouldRevalidate: true,
  };

  expect(
    shouldRevalidate({
      ...base,
      currentUrl: new URL('http://localhost/gardens'),
      nextUrl: new URL('http://localhost/gardens/1'),
      formMethod: 'GET',
    }),
  ).toBe(false);

  expect(
    shouldRevalidate({
      ...base,
      currentUrl: new URL('http://localhost/gardens/1'),
      nextUrl: new URL('http://localhost/gardens'),
      formMethod: 'GET',
    }),
  ).toBe(false);

  expect(
    shouldRevalidate({
      ...base,
      currentUrl: new URL('http://localhost/gardens'),
      nextUrl: new URL('http://localhost/my-garden'),
      formMethod: 'GET',
    }),
  ).toBe(true);
});

test('user can open a garden without waiting for the gardens loader', async () => {
  const laterList = deferred<Response>();
  let listCalls = 0;

  stubGardensApi({
    list: () => {
      listCalls += 1;
      if (listCalls === 1) {
        return jsonResponse([garden]);
      }

      return laterList.promise;
    },
    plantsByGarden: () => jsonResponse([plant]),
  });

  renderGardensPageWithLoader();
  await screen.findByRole('link', { name: 'Front yard' });
  fireEvent.click(screen.getByRole('link', { name: 'Front yard' }));

  expect(await screen.findByRole('heading', { name: 'Front yard', level: 1 })).toBeTruthy();
  expect(await screen.findByText('Tomato')).toBeTruthy();
});

test('plants request starts before the garden list resolves', async () => {
  const list = deferred<Response>();
  let plantsRequested = false;

  stubGardensApi({
    list: () => list.promise,
    plantsByGarden: () => {
      plantsRequested = true;
      return jsonResponse([plant]);
    },
  });

  renderGardensPage('/gardens/1');

  await waitFor(() => {
    expect(plantsRequested).toBe(true);
  });

  list.resolve(jsonResponse([garden]));

  expect(await screen.findByRole('heading', { name: 'Front yard', level: 1 })).toBeTruthy();
  expect(await screen.findByText('Tomato')).toBeTruthy();
});

test('user can see garden details and plants from the first HTML', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    plantsByGarden: () => jsonResponse([plant]),
  });

  renderGardensPageWithLoader('/gardens/1');

  expect(await screen.findByRole('heading', { name: 'Front yard', level: 1 })).toBeTruthy();
  expect(await screen.findByText('Tomato')).toBeTruthy();
});

test('user can update a garden', async () => {
  const updated: Garden = {
    ...garden,
    gardenName: 'Backyard',
    updatedAt: '2026-01-03T00:00:00.000Z',
  };
  const updateRequest = deferred<Response>();

  stubGardensApi({
    list: () => jsonResponse([garden]),
    plantsByGarden: () => jsonResponse([plant]),
    update: (gardenId, body) => {
      expect(gardenId).toBe(1);
      expect(body).toEqual({
        gardenName: 'Backyard',
        totalSurfaceArea: 12,
        locationDescription: null,
        latitude: 52.37,
        longitude: 4.89,
      });
      return updateRequest.promise;
    },
  });

  renderGardensPage('/gardens/1');
  await screen.findByRole('heading', { name: 'Front yard', level: 1 });

  fireEvent.click(screen.getByRole('button', { name: 'Update garden' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText(/Garden name/), {
    target: { value: 'Backyard' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Update garden' }));

  expect(await screen.findByRole('heading', { name: 'Backyard', level: 1 })).toBeTruthy();
  expect(screen.queryByRole('dialog')).toBeNull();

  updateRequest.resolve(jsonResponse(updated));

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Backyard', level: 1 })).toBeTruthy();
  });

  fireEvent.click(screen.getByRole('link', { name: 'back' }));
  expect(await screen.findByRole('link', { name: 'Backyard' })).toBeTruthy();
});

test('user cannot update a garden with incomplete details', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    plantsByGarden: () => jsonResponse([plant]),
    update: () => {
      throw new Error('PUT /gardens/:gardenId should not be called');
    },
  });

  renderGardensPage('/gardens/1');
  await screen.findByRole('heading', { name: 'Front yard', level: 1 });

  fireEvent.click(screen.getByRole('button', { name: 'Update garden' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText(/Garden name/), {
    target: { value: '' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Update garden' }));

  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Front yard', level: 1 })).toBeTruthy();
});

test('user is told why a garden was not updated and can restore the form', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    plantsByGarden: () => jsonResponse([plant]),
    update: () => new Response('Internal error JSON {"message":"boom"}', { status: 500 }),
  });

  renderGardensPage('/gardens/1');
  await screen.findByRole('heading', { name: 'Front yard', level: 1 });

  fireEvent.click(screen.getByRole('button', { name: 'Update garden' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText(/Garden name/), {
    target: { value: 'Backyard' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Update garden' }));

  expect(await screen.findByText("Couldn't update this garden")).toBeTruthy();
  expect(screen.getByText('The service is temporarily unavailable. Try again.')).toBeTruthy();
  expect(screen.queryByText(/boom/)).toBeNull();
  expect(screen.getByRole('heading', { name: 'Front yard', level: 1 })).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: /Couldn't update this garden/ }));

  const restored = await screen.findByRole('dialog');
  expect(within(restored).getByLabelText(/Garden name/)).toHaveProperty('value', 'Backyard');
  expect(within(restored).getByLabelText(/Total surface area/)).toHaveProperty('value', '12');
  expect(within(restored).getByLabelText(/Location description/)).toHaveProperty('value', '');
  expect(within(restored).getByLabelText(/Latitude/)).toHaveProperty('value', '52.37');
  expect(within(restored).getByLabelText(/Longitude/)).toHaveProperty('value', '4.89');
});
