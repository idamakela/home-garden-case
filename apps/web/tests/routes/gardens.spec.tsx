import { notifications } from '@mantine/notifications';
import { createRoutesStub } from 'react-router';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import {
  gardenKeys,
  INCOMING_GARDEN_HIGHLIGHT_MS,
  type CreateGarden,
  type Garden,
} from '../../app/queries/gardens';
import GardensPage, { loader as gardensLoader } from '../../app/routes/gardens';
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

function stubGardensApi(handlers: {
  list: () => Promise<Response> | Response;
  create?: (body: CreateGarden) => Promise<Response> | Response;
}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();

      if (url.endsWith('/gardens') && method === 'POST') {
        const body = init?.body ? (JSON.parse(String(init.body)) as CreateGarden) : undefined;
        return (
          handlers.create?.(body as CreateGarden) ?? new Response('Not found', { status: 404 })
        );
      }

      if (url.endsWith('/gardens')) {
        return handlers.list();
      }

      return new Response('Not found', { status: 404 });
    }),
  );
}

function renderGardensPage() {
  const ReactRouterStub = createRoutesStub([
    {
      path: '/gardens',
      Component: GardensPage,
    },
  ]);

  return renderWithQuery(<ReactRouterStub initialEntries={['/gardens']} />);
}

function renderGardensPageWithLoader() {
  const ReactRouterStub = createRoutesStub([
    {
      path: '/gardens',
      Component: GardensPage,
      loader: gardensLoader,
    },
  ]);

  return renderWithQuery(<ReactRouterStub initialEntries={['/gardens']} />);
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
