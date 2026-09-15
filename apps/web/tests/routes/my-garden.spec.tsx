import { createRoutesStub } from 'react-router';
import { screen } from '@testing-library/react';
import MyGardenPage from '../../app/routes/my-garden';
import { renderWithProviders } from '../render-with-query';

test('renders the unimplemented placeholder', () => {
  const ReactRouterStub = createRoutesStub([
    {
      path: '/my-garden',
      Component: MyGardenPage,
    },
  ]);

  renderWithProviders(<ReactRouterStub initialEntries={['/my-garden']} />);

  expect(screen.getByText('this has yet to be implemented :(')).toBeTruthy();
});
