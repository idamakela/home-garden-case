import { notifications } from '@mantine/notifications';
import { createRoutesStub } from 'react-router';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import type { CreateGarden, Garden } from '../../app/queries/gardens';
import GardensPage from '../../app/routes/gardens';
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

function expectGardensHeader() {
  expect(screen.getByRole('heading', { name: 'Gardens', level: 1 })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Add garden' })).toBeTruthy();
}

async function openAddGardenModal() {
  fireEvent.click(screen.getByRole('button', { name: 'Add garden' }));
  return screen.findByRole('dialog');
}

function fieldLabel(dialog: HTMLElement, name: string) {
  const input = within(dialog).getByLabelText(new RegExp(name));
  return dialog.querySelector(`label[for="${input.id}"]`);
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

function gardenRow(name: string) {
  return screen.getByRole('row', { name: new RegExp(name) });
}

afterEach(() => {
  notifications.clean();
  vi.unstubAllGlobals();
});

test('shows a skeleton while gardens are loading', () => {
  stubGardensApi({ list: () => new Promise<Response>(() => undefined) });

  renderGardensPage();

  expectGardensHeader();
  const loading = screen.getByLabelText('Loading gardens');
  expect(loading.getAttribute('aria-busy')).toBe('true');
  expect(screen.queryByRole('columnheader', { name: 'Garden name' })).toBeNull();
});

test('shows an alert and retries a failed gardens request', async () => {
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

  expectGardensHeader();
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.getByText("Couldn't load gardens")).toBeTruthy();
  expect(screen.getByText('The service is temporarily unavailable. Try again.')).toBeTruthy();
  expect(screen.queryByText(/Internal error/)).toBeNull();
  expect(screen.queryByText(/boom/)).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

  await waitFor(() => screen.findByRole('columnheader', { name: 'Garden name' }));
  expect(screen.getByRole('cell', { name: 'Front yard' })).toBeTruthy();
});

test('shows an empty message when there are no gardens', async () => {
  stubGardensApi({ list: () => jsonResponse([]) });

  renderGardensPage();

  expect(await screen.findByText('No gardens yet. Add one to get started.')).toBeTruthy();
  expectGardensHeader();
  expect(screen.queryByRole('columnheader', { name: 'Garden name' })).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();
});

test('renders gardens from the API', async () => {
  stubGardensApi({ list: () => jsonResponse([garden]) });

  renderGardensPage();

  await waitFor(() => screen.findByRole('columnheader', { name: 'Garden name' }));
  expectGardensHeader();

  expect(screen.getByRole('columnheader', { name: 'Total surface area' })).toBeTruthy();
  expect(screen.getByRole('columnheader', { name: 'Latitude' })).toBeTruthy();
  expect(screen.getByRole('columnheader', { name: 'Longitude' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: 'Front yard' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: '12' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: '52.37' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: '4.89' })).toBeTruthy();
});

test('opens the add garden modal with a disabled submit button', async () => {
  stubGardensApi({ list: () => jsonResponse([garden]) });

  renderGardensPage();
  await screen.findByRole('columnheader', { name: 'Garden name' });

  const dialog = await openAddGardenModal();
  const submit = within(dialog).getByRole('button', { name: 'Add garden' });

  expect(within(dialog).getByRole('heading', { name: 'Add garden' })).toBeTruthy();
  expect(submit).toHaveProperty('disabled', true);
});

test('enables add garden only when the request body is valid', async () => {
  stubGardensApi({ list: () => jsonResponse([garden]) });

  renderGardensPage();
  await screen.findByRole('columnheader', { name: 'Garden name' });

  const dialog = await openAddGardenModal();
  const submit = () => within(dialog).getByRole('button', { name: 'Add garden' });

  expect(fieldLabel(dialog, 'Latitude')?.getAttribute('data-required')).toBeNull();
  expect(fieldLabel(dialog, 'Longitude')?.getAttribute('data-required')).toBeNull();

  fireEvent.change(within(dialog).getByLabelText(/Garden name/), {
    target: { value: 'Backyard' },
  });
  expect(submit()).toHaveProperty('disabled', true);

  fireEvent.change(within(dialog).getByLabelText(/Total surface area/), {
    target: { value: '20' },
  });
  expect(submit()).toHaveProperty('disabled', false);

  fireEvent.change(within(dialog).getByLabelText(/Latitude/), {
    target: { value: '52' },
  });
  expect(submit()).toHaveProperty('disabled', true);
  expect(fieldLabel(dialog, 'Latitude')?.getAttribute('data-required')).toBeNull();
  expect(fieldLabel(dialog, 'Longitude')?.getAttribute('data-required')).toBe('true');

  fireEvent.change(within(dialog).getByLabelText(/Longitude/), {
    target: { value: '4' },
  });
  expect(submit()).toHaveProperty('disabled', false);
  expect(fieldLabel(dialog, 'Latitude')?.getAttribute('data-required')).toBe('true');
  expect(fieldLabel(dialog, 'Longitude')?.getAttribute('data-required')).toBe('true');
});

test('closes the add garden modal without creating a garden', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    create: () => {
      throw new Error('POST /gardens should not be called');
    },
  });

  renderGardensPage();
  await screen.findByRole('columnheader', { name: 'Garden name' });

  const dialog = await openAddGardenModal();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

test('shows a garden in the list before the create request resolves', async () => {
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
  await screen.findByRole('columnheader', { name: 'Garden name' });

  const dialog = await openAddGardenModal();
  fillGardenForm(dialog, {
    gardenName: 'Backyard',
    totalSurfaceArea: '20',
    locationDescription: 'Near the shed',
    latitude: '52',
    longitude: '4',
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Add garden' }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  expect(screen.getByRole('cell', { name: 'Backyard' })).toBeTruthy();
  expect(gardenRow('Backyard').getAttribute('aria-busy')).toBe('true');

  createRequest.resolve(jsonResponse(created, 201));

  await waitFor(() => {
    expect(gardenRow('Backyard').getAttribute('aria-busy')).toBeNull();
  });
  expect(screen.getAllByRole('cell', { name: 'Backyard' })).toHaveLength(1);
});

test('shows a clickable error toast when creating a garden fails', async () => {
  stubGardensApi({
    list: () => jsonResponse([garden]),
    create: () => new Response('Internal error JSON {"message":"boom"}', { status: 500 }),
  });

  renderGardensPage();
  await screen.findByRole('columnheader', { name: 'Garden name' });

  const dialog = await openAddGardenModal();
  fillGardenForm(dialog, {
    gardenName: 'Backyard',
    totalSurfaceArea: '20',
    locationDescription: 'Near the shed',
    latitude: '52',
    longitude: '4',
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Add garden' }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  expect(await screen.findByText("Couldn't add this garden")).toBeTruthy();
  expect(screen.getByText('The service is temporarily unavailable. Try again.')).toBeTruthy();
  expect(screen.queryByText(/boom/)).toBeNull();
  expect(screen.queryByRole('cell', { name: 'Backyard' })).toBeNull();

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

test('clears only the pending garden that succeeded', async () => {
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
  await screen.findByRole('columnheader', { name: 'Garden name' });

  const firstDialog = await openAddGardenModal();
  fillGardenForm(firstDialog, { gardenName: 'Backyard', totalSurfaceArea: '20' });
  fireEvent.click(within(firstDialog).getByRole('button', { name: 'Add garden' }));
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  const secondDialog = await openAddGardenModal();
  fillGardenForm(secondDialog, { gardenName: 'Patio', totalSurfaceArea: '8' });
  fireEvent.click(within(secondDialog).getByRole('button', { name: 'Add garden' }));
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  expect(gardenRow('Backyard').getAttribute('aria-busy')).toBe('true');
  expect(gardenRow('Patio').getAttribute('aria-busy')).toBe('true');

  creates.get('Backyard')?.resolve(jsonResponse(backyard, 201));

  await waitFor(() => {
    expect(gardenRow('Backyard').getAttribute('aria-busy')).toBeNull();
  });
  expect(gardenRow('Patio').getAttribute('aria-busy')).toBe('true');
  expect(screen.getAllByRole('cell', { name: 'Backyard' })).toHaveLength(1);
});
