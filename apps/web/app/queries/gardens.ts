import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod/v4';
import { api } from '../lib/api';

export const createGardenSchema = z
  .object({
    gardenName: z.string().min(1, 'Garden name is required').trim(),
    totalSurfaceArea: z.number().nonnegative('Total surface area must be a non-negative number'),
    locationDescription: z.string().nullable().optional(),
    latitude: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90')
      .nullable()
      .optional(),
    longitude: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      const hasLat = data.latitude !== null && data.latitude !== undefined;
      const hasLng = data.longitude !== null && data.longitude !== undefined;
      return hasLat === hasLng;
    },
    {
      message: 'Both latitude and longitude must be provided together',
    },
  );

export type CreateGarden = z.infer<typeof createGardenSchema>;
export type UpdateGarden = CreateGarden;

export type Garden = {
  gardenId: number;
  gardenName: string;
  totalSurfaceArea: number;
  locationDescription?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
};

export const gardenKeys = {
  all: ['gardens'] as const,
  lists: () => [...gardenKeys.all, 'list'] as const,
  list: () => [...gardenKeys.lists()] as const,
  details: () => [...gardenKeys.all, 'detail'] as const,
  detail: (gardenId: number) => [...gardenKeys.details(), gardenId] as const,
};

export function getGardens() {
  return api<Garden[]>('/gardens');
}

export function getGardenById(gardenId: number) {
  return api<Garden>(`/gardens/${gardenId}`);
}

export function postGarden(body: CreateGarden) {
  return api<Garden>('/gardens', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function putGarden(gardenId: number, body: UpdateGarden) {
  return api<Garden>(`/gardens/${gardenId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteGarden(gardenId: number) {
  return api<void>(`/gardens/${gardenId}`, { method: 'DELETE' });
}

export const gardensQuery = () =>
  queryOptions({
    queryKey: gardenKeys.list(),
    queryFn: getGardens,
  });

export const gardenQuery = (gardenId: number) =>
  queryOptions({
    queryKey: gardenKeys.detail(gardenId),
    queryFn: () => getGardenById(gardenId),
  });
