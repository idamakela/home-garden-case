import { createRoutesStub } from 'react-router';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import type { Garden } from '../../app/queries/gardens';
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

function stubGardensFetch(impl: (url: string) => Promise<Response> | Response) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL) => {
      const url = String(input);

      if (url.endsWith('/gardens')) {
        return impl(url);
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

afterEach(() => {
  vi.unstubAllGlobals();
});

test('shows a skeleton while gardens are loading', () => {
  stubGardensFetch(() => new Promise(() => {}));

  renderGardensPage();

  const loading = screen.getByLabelText('Loading gardens');
  expect(loading.getAttribute('aria-busy')).toBe('true');
  expect(screen.queryByRole('columnheader', { name: 'Garden name' })).toBeNull();
});

test('shows an alert and retries a failed gardens request', async () => {
  let shouldFail = true;

  stubGardensFetch(() => {
    if (shouldFail) {
      shouldFail = false;
      return new Response('Internal error JSON {"message":"boom"}', { status: 500 });
    }

    return jsonResponse([garden]);
  });

  renderGardensPage();

  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.getByText('Could not load gardens')).toBeTruthy();
  expect(screen.getByText('The service is unavailable. Try again.')).toBeTruthy();
  expect(screen.queryByText(/Internal error/)).toBeNull();
  expect(screen.queryByText(/boom/)).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

  await waitFor(() => screen.findByRole('columnheader', { name: 'Garden name' }));
  expect(screen.getByRole('cell', { name: 'Front yard' })).toBeTruthy();
});

test('shows an empty message when there are no gardens', async () => {
  stubGardensFetch(() => jsonResponse([]));

  renderGardensPage();

  expect(await screen.findByText('No gardens yet.')).toBeTruthy();
  expect(screen.queryByRole('columnheader', { name: 'Garden name' })).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();
});

test('renders gardens from the API', async () => {
  stubGardensFetch(() => jsonResponse([garden]));

  renderGardensPage();

  await waitFor(() => screen.findByRole('columnheader', { name: 'Garden name' }));

  expect(screen.getByRole('columnheader', { name: 'Total surface area' })).toBeTruthy();
  expect(screen.getByRole('columnheader', { name: 'Latitude' })).toBeTruthy();
  expect(screen.getByRole('columnheader', { name: 'Longitude' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: 'Front yard' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: '12' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: '52.37' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: '4.89' })).toBeTruthy();
});
