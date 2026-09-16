import {
  createPlantSchema,
  removePlantFromList,
  upsertPlantInList,
  type Plant,
} from '../../app/queries/plants';
import { plantQueryKeys } from '../../app/queries/plants.const';

const validCreatePlant = {
  plantName: 'Basil',
  species: 'Ocimum basilicum',
  plantType: 'vegetable' as const,
  plantationDate: '2026-03-15T10:00:00.000Z',
  surfaceAreaRequired: 1,
  idealHumidityLevel: 60,
  gardenId: 1,
};

test('plantQueryKeys.byGarden is scoped by gardenId', () => {
  expect(plantQueryKeys.byGarden(1)).toEqual(['plants', 'garden', 1]);
  expect(plantQueryKeys.byGarden(1)).not.toEqual(plantQueryKeys.byGarden(2));
});

test('createPlantSchema requires a plant name', () => {
  const result = createPlantSchema.safeParse({
    ...validCreatePlant,
    plantName: '',
  });
  expect(result.success).toBe(false);
});

test('createPlantSchema requires a species', () => {
  const result = createPlantSchema.safeParse({
    ...validCreatePlant,
    species: '',
  });
  expect(result.success).toBe(false);
});

test('createPlantSchema requires a valid plant type', () => {
  expect(createPlantSchema.safeParse(validCreatePlant).success).toBe(true);
  expect(
    createPlantSchema.safeParse({
      ...validCreatePlant,
      plantType: 'herb',
    }).success,
  ).toBe(false);
});

test('createPlantSchema requires a plantation date', () => {
  const result = createPlantSchema.safeParse({
    plantName: 'Basil',
    species: 'Ocimum basilicum',
    plantType: 'vegetable',
    surfaceAreaRequired: 1,
    idealHumidityLevel: 60,
    gardenId: 1,
  });
  expect(result.success).toBe(false);
});

test('createPlantSchema rejects a negative surface area', () => {
  const result = createPlantSchema.safeParse({
    ...validCreatePlant,
    surfaceAreaRequired: -1,
  });
  expect(result.success).toBe(false);
});

test('createPlantSchema rejects humidity outside 0–100', () => {
  expect(
    createPlantSchema.safeParse({
      ...validCreatePlant,
      idealHumidityLevel: -1,
    }).success,
  ).toBe(false);
  expect(
    createPlantSchema.safeParse({
      ...validCreatePlant,
      idealHumidityLevel: 101,
    }).success,
  ).toBe(false);
});

test('createPlantSchema requires a positive garden id', () => {
  expect(
    createPlantSchema.safeParse({
      ...validCreatePlant,
      gardenId: 0,
    }).success,
  ).toBe(false);
});

const tomato: Plant = {
  plantId: 1,
  plantName: 'Tomato',
  species: 'Solanum lycopersicum',
  plantType: 'vegetable',
  plantationDate: '2026-03-15T00:00:00.000Z',
  surfaceAreaRequired: 2,
  idealHumidityLevel: 70,
  gardenId: 1,
  createdAt: '2026-03-15T00:00:00.000Z',
  updatedAt: '2026-03-15T00:00:00.000Z',
};

const basil: Plant = {
  plantId: 2,
  plantName: 'Basil',
  species: 'Ocimum basilicum',
  plantType: 'vegetable',
  plantationDate: '2026-03-16T00:00:00.000Z',
  surfaceAreaRequired: 1,
  idealHumidityLevel: 60,
  gardenId: 1,
  createdAt: '2026-03-16T00:00:00.000Z',
  updatedAt: '2026-03-16T00:00:00.000Z',
};

test('upsertPlantInList appends a plant that is not in the list', () => {
  expect(upsertPlantInList([tomato], basil)).toEqual([tomato, basil]);
});

test('upsertPlantInList replaces a plant with the same id', () => {
  const renamed = { ...tomato, plantName: 'Cherry tomato' };

  expect(upsertPlantInList([tomato, basil], renamed)).toEqual([renamed, basil]);
});

test('upsertPlantInList uses the plant when the cache is empty', () => {
  expect(upsertPlantInList(undefined, basil)).toEqual([basil]);
  expect(upsertPlantInList([], basil)).toEqual([basil]);
});

test('removePlantFromList drops a plant by id', () => {
  expect(removePlantFromList([tomato, basil], 1)).toEqual([basil]);
});

test('removePlantFromList uses an empty list when the cache is empty', () => {
  expect(removePlantFromList(undefined, 1)).toEqual([]);
  expect(removePlantFromList([], 1)).toEqual([]);
});
