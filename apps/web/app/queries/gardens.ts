import { queryOptions } from '@tanstack/react-query';
import { api } from '../lib/api';

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

export type CreateGarden = {
  gardenName: string;
  totalSurfaceArea: number;
  locationDescription?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type UpdateGarden = CreateGarden;

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
