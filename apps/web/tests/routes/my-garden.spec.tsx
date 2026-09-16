import { createRoutesStub } from 'react-router';
import { screen } from '@testing-library/react';
import MyGardenPage from '../../app/routes/my-garden';
import { renderWithProviders } from '../render-with-query';

test('user can open my garden', () => {
  const ReactRouterStub = createRoutesStub([
    {
      path: '/my-garden',
      Component: MyGardenPage,
    },
  ]);

  renderWithProviders(<ReactRouterStub initialEntries={['/my-garden']} />);

  expect(screen.getByRole('heading', { name: 'My Garden', level: 1 })).toBeTruthy();
});
