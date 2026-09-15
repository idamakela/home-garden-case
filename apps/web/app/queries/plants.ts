import { queryOptions } from '@tanstack/react-query';
import { api } from '../lib/api';

export type PlantType = 'vegetable' | 'fruit' | 'flower';

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

export type CreatePlant = {
  plantName: string;
  species: string;
  plantType: PlantType;
  plantationDate: string;
  surfaceAreaRequired: number;
  idealHumidityLevel: number;
  gardenId: number;
};

export type UpdatePlant = Omit<CreatePlant, 'gardenId'> & {
  gardenId?: number;
};

export const plantKeys = {
  all: ['plants'] as const,
  details: () => [...plantKeys.all, 'detail'] as const,
  detail: (plantId: number) => [...plantKeys.details(), plantId] as const,
  byGarden: (gardenId: number) => [...plantKeys.all, 'garden', gardenId] as const,
};

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
