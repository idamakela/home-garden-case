import { createGardenSchema } from '../../app/queries/gardens';

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
