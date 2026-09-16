import { getErrorStatus } from './api';

export function gardensLoadCopy(error: unknown): { title: string; message: string } {
  const status = getErrorStatus(error);

  if (status === 404) {
    return {
      title: "We couldn't find gardens",
      message: 'They may have been moved or deleted.',
    };
  }

  if (status === 409) {
    return {
      title: "Couldn't load gardens",
      message: 'The list changed. Try again.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title: "Couldn't load gardens",
      message: 'The service is temporarily unavailable. Try again.',
    };
  }

  return {
    title: "Couldn't load gardens",
    message: 'Please try again.',
  };
}

export function gardensCreateCopy(error: unknown): { title: string; message: string } {
  const status = getErrorStatus(error);

  if (status === 400) {
    return {
      title: "Couldn't add this garden",
      message: 'Check the details and try again.',
    };
  }

  if (status === 409) {
    return {
      title: "Couldn't add this garden",
      message: 'This conflicts with current data. Try again.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title: "Couldn't add this garden",
      message: 'The service is temporarily unavailable. Try again.',
    };
  }

  return {
    title: "Couldn't add this garden",
    message: 'Please try again.',
  };
}

export function gardensUpdateCopy(error: unknown): { title: string; message: string } {
  const status = getErrorStatus(error);

  if (status === 400) {
    return {
      title: "Couldn't update this garden",
      message: 'Check the details and try again.',
    };
  }

  if (status === 409) {
    return {
      title: "Couldn't update this garden",
      message: 'This conflicts with current data. Try again.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title: "Couldn't update this garden",
      message: 'The service is temporarily unavailable. Try again.',
    };
  }

  return {
    title: "Couldn't update this garden",
    message: 'Please try again.',
  };
}
