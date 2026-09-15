import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { theme } from '../app/theme';

function MantineTestProvider({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme} env="test">
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

  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MantineTestProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MantineTestProvider>
    ),
  });
}
