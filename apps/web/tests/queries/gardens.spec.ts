import {
  createGardenSchema,
  removeGardenFromList,
  upsertGardenInList,
  type Garden,
} from '../../app/queries/gardens';

const validGarden = {
  gardenName: 'Backyard',
  totalSurfaceArea: 20,
  locationDescription: null,
  latitude: null,
  longitude: null,
};

test('createGardenSchema requires a name', () => {
  const result = createGardenSchema.safeParse({
    ...validGarden,
    gardenName: '',
  });
  expect(result.success).toBe(false);
});

test('createGardenSchema requires a surface area', () => {
  const result = createGardenSchema.safeParse({
    gardenName: 'Backyard',
  });
  expect(result.success).toBe(false);
});

test('createGardenSchema rejects a negative surface area', () => {
  const result = createGardenSchema.safeParse({
    ...validGarden,
    totalSurfaceArea: -1,
  });
  expect(result.success).toBe(false);
});

test('createGardenSchema rejects a surface area of 0', () => {
  const result = createGardenSchema.safeParse({
    ...validGarden,
    totalSurfaceArea: 0,
  });
  expect(result.success).toBe(false);
});

test('createGardenSchema requires latitude and longitude together', () => {
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      latitude: 52,
    }).success,
  ).toBe(false);
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      longitude: 4,
    }).success,
  ).toBe(false);
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      latitude: 52,
      longitude: 4,
    }).success,
  ).toBe(true);
});

test('createGardenSchema rejects out-of-range coordinates', () => {
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      latitude: 91,
      longitude: 4,
    }).success,
  ).toBe(false);
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      latitude: 52,
      longitude: 181,
    }).success,
  ).toBe(false);
});

test('createGardenSchema rejects humidity outside 0–100', () => {
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      minHumidity: -1,
      maxHumidity: 50,
    }).success,
  ).toBe(false);
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      minHumidity: 50,
      maxHumidity: 101,
    }).success,
  ).toBe(false);
});

test('createGardenSchema rejects min humidity above max humidity', () => {
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      minHumidity: 80,
      maxHumidity: 20,
    }).success,
  ).toBe(false);
});

test('createGardenSchema requires min and max humidity together', () => {
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      minHumidity: 40,
    }).success,
  ).toBe(false);
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      maxHumidity: 60,
    }).success,
  ).toBe(false);
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      minHumidity: 40,
      maxHumidity: 60,
    }).success,
  ).toBe(true);
  expect(
    createGardenSchema.safeParse({
      ...validGarden,
      minHumidity: 50,
      maxHumidity: 50,
    }).success,
  ).toBe(true);
  expect(createGardenSchema.safeParse(validGarden).success).toBe(true);
});

const frontYard: Garden = {
  gardenId: 1,
  gardenName: 'Front yard',
  totalSurfaceArea: 12,
  locationDescription: null,
  latitude: null,
  longitude: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const backyard: Garden = {
  gardenId: 2,
  gardenName: 'Backyard',
  totalSurfaceArea: 20,
  locationDescription: null,
  latitude: null,
  longitude: null,
  createdAt: '2026-01-02T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

test('upsertGardenInList appends a garden that is not in the list', () => {
  expect(upsertGardenInList([frontYard], backyard)).toEqual([frontYard, backyard]);
});

test('upsertGardenInList replaces a garden with the same id', () => {
  const renamed = { ...frontYard, gardenName: 'Side yard' };

  expect(upsertGardenInList([frontYard, backyard], renamed)).toEqual([renamed, backyard]);
});

test('upsertGardenInList uses the garden when the cache is empty', () => {
  expect(upsertGardenInList(undefined, backyard)).toEqual([backyard]);
  expect(upsertGardenInList([], backyard)).toEqual([backyard]);
});

test('removeGardenFromList drops a garden by id', () => {
  expect(removeGardenFromList([frontYard, backyard], 1)).toEqual([backyard]);
});

test('removeGardenFromList uses an empty list when the cache is empty', () => {
  expect(removeGardenFromList(undefined, 1)).toEqual([]);
  expect(removeGardenFromList([], 1)).toEqual([]);
});
