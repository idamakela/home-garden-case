import { createTheme, MantineProvider, mergeThemeOverrides, Modal } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { theme } from '../app/theme';

const testTheme = mergeThemeOverrides(
  theme,
  createTheme({
    components: {
      Modal: Modal.extend({
        defaultProps: {
          transitionProps: { duration: 0 },
        },
      }),
    },
  }),
);

function MantineTestProvider({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={testTheme} env="test">
      <Notifications transitionDuration={0} />
      {children}
    </MantineProvider>
  );
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, {
    wrapper: MantineTestProvider,
  });
}

export function renderWithQuery(ui: ReactElement) {
  const queryClient = createTestQueryClient();

  return {
    ...render(ui, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MantineTestProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </MantineTestProvider>
      ),
    }),
    queryClient,
  };
}
