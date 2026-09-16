import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod/v4';
import { api } from '../lib/api';

export const createPlantSchema = z.object({
  plantName: z.string().min(1, 'Plant name is required').trim(),
  species: z.string().min(1, 'Species is required').trim(),
  plantType: z.enum(['vegetable', 'fruit', 'flower'], {
    message: 'Plant type must be vegetable, fruit, or flower',
  }),
  plantationDate: z.iso.datetime({ message: 'Plantation date is required' }),
  surfaceAreaRequired: z.number().nonnegative('Surface area required must be a non-negative number'),
  idealHumidityLevel: z
    .number()
    .min(0, 'Ideal humidity level must be between 0 and 100')
    .max(100, 'Ideal humidity level must be between 0 and 100'),
  gardenId: z.number().int().positive('Garden ID must be a positive integer'),
});

export type CreatePlant = z.infer<typeof createPlantSchema>;
export type PlantType = CreatePlant['plantType'];

export type UpdatePlant = Omit<CreatePlant, 'gardenId'> & {
  gardenId?: number;
};

export type Plant = {
  plantId: number;
  plantName: string;
  species: string;
  plantType: PlantType;
  plantationDate: string;
  surfaceAreaRequired: number;
  idealHumidityLevel: number;
  gardenId: number;
  createdAt: string;
  updatedAt: string;
};

export const plantKeys = {
  all: ['plants'] as const,
  details: () => [...plantKeys.all, 'detail'] as const,
  detail: (plantId: number) => [...plantKeys.details(), plantId] as const,
  byGarden: (gardenId: number) => [...plantKeys.all, 'garden', gardenId] as const,
};

export function upsertPlantInList(current: Plant[] | undefined, plant: Plant): Plant[] {
  if (!current || current.length === 0) {
    return [plant];
  }

  const exists = current.some((item) => item.plantId === plant.plantId);

  if (!exists) {
    return [...current, plant];
  }

  return current.map((item) => (item.plantId === plant.plantId ? plant : item));
}

export function getPlantById(plantId: number) {
  return api<Plant>(`/plants/${plantId}`);
}

export function getPlantsByGardenId(gardenId: number) {
  return api<Plant[]>(`/plants/garden/${gardenId}`);
}

export function postPlant(body: CreatePlant) {
  return api<Plant>('/plants', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function putPlant(plantId: number, body: UpdatePlant) {
  return api<Plant>(`/plants/${plantId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deletePlant(plantId: number) {
  return api<void>(`/plants/${plantId}`, { method: 'DELETE' });
}

export const plantQuery = (plantId: number) =>
  queryOptions({
    queryKey: plantKeys.detail(plantId),
    queryFn: () => getPlantById(plantId),
  });

export const plantsByGardenQuery = (gardenId: number) =>
  queryOptions({
    queryKey: plantKeys.byGarden(gardenId),
    queryFn: () => getPlantsByGardenId(gardenId),
  });
