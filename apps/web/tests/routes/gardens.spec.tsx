import { createRoutesStub } from 'react-router';
import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import type { Garden } from '../../app/queries/gardens';
import GardensPage from '../../app/routes/gardens';
import { renderWithQuery } from '../render-with-query';

const garden: Garden = {
  gardenId: 1,
  gardenName: 'Front yard',
  totalSurfaceArea: 12,
  locationDescription: null,
  latitude: null,
  longitude: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL) => {
      const url = String(input);

      if (url.endsWith('/gardens')) {
        return new Response(JSON.stringify([garden]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not found', { status: 404 });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('renders gardens from the API', async () => {
  const ReactRouterStub = createRoutesStub([
    {
      path: '/gardens',
      Component: GardensPage,
    },
  ]);

  renderWithQuery(<ReactRouterStub initialEntries={['/gardens']} />);

  await waitFor(() => screen.findByText('Front yard'));
});
