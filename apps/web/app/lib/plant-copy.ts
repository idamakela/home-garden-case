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

export function plantsCreateCopy(error: unknown): { title: string; message: string } {
  const status = getErrorStatus(error);

  if (status === 400) {
    return {
      title: "Couldn't add this plant",
      message: 'Check the details and try again.',
    };
  }

  if (status === 409) {
    return {
      title: "Couldn't add this plant",
      message: 'This conflicts with current data. Try again.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title: "Couldn't add this plant",
      message: 'The service is temporarily unavailable. Try again.',
    };
  }

  return {
    title: "Couldn't add this plant",
    message: 'Please try again.',
  };
}
