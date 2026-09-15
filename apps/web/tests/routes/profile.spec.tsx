import { createRoutesStub } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import type { User } from '../../app/queries/users';
import ProfilePage, { loader } from '../../app/routes/profile';

const user: User = {
  userId: 1,
  firstName: 'Ada',
  lastName: 'Lovelace',
  age: null,
  emailAddress: 'ada@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL) => {
      const url = String(input);

      if (url.endsWith('/users')) {
        return new Response(JSON.stringify([user]), {
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

test('renders users from the API loader', async () => {
  const ReactRouterStub = createRoutesStub([
    {
      path: '/profile',
      Component: ProfilePage,
      loader,
    },
  ]);

  render(<ReactRouterStub initialEntries={['/profile']} />);

  await waitFor(() => screen.findByText('Ada Lovelace'));
});
