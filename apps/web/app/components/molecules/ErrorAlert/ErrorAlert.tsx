import { Alert, Button, Stack } from '@mantine/core';

type ErrorAlertProps = {
  error: string;
  details: string;
  onRetry: () => void;
};

export function ErrorAlert({ error, details, onRetry }: ErrorAlertProps) {
  return (
    <Alert color="red" title={error}>
      <Stack gap="sm" align="flex-start">
        {details}
        <Button variant="outline" size="xs" type="button" onClick={onRetry}>
          Try again
        </Button>
      </Stack>
    </Alert>
  );
}
