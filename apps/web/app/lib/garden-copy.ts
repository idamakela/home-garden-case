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

export function gardensDeleteCopy(
  error: unknown,
  gardenName?: string,
): { title: string; message: string } {
  const status = getErrorStatus(error);
  const title = gardenName ? `Couldn't delete ${gardenName}` : "Couldn't delete this garden";

  if (status === 400) {
    return {
      title,
      message: 'Check the details and try again.',
    };
  }

  if (status === 409) {
    return {
      title,
      message: 'This conflicts with current data. Try again.',
    };
  }

  if (status != null && status >= 500) {
    return {
      title,
      message: 'The service is temporarily unavailable. Try again.',
    };
  }

  return {
    title,
    message: 'Please try again.',
  };
}

export function gardensOvercrowdedCopy(
  used: number,
  total: number,
): { title: string; message: string } {
  return {
    title: 'Plants are overcrowded',
    message: `These plants need ${used}m² but this garden is only ${total}m². Remove plants or increase the garden surface area.`,
  };
}
