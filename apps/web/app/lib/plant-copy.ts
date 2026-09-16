import { getErrorStatus } from './api';

export function plantsLoadCopy(error: unknown): { title: string; message: string } {
  const status = getErrorStatus(error);

  if (status === 404) {
    return {
      title: "We couldn't find plants",
      message: 'They may have been moved or deleted.',
    };
  }

  if (status === 409) {
    return {
      title: "Couldn't load plants",
      message: 'The list changed. Try again.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title: "Couldn't load plants",
      message: 'The service is temporarily unavailable. Try again.',
    };
  }

  return {
    title: "Couldn't load plants",
    message: 'Please try again.',
  };
}
