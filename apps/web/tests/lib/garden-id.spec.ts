import { parseGardenId } from '../../app/lib/garden-id';

test('parseGardenId accepts positive integer strings', () => {
  expect(parseGardenId('1')).toBe(1);
  expect(parseGardenId('42')).toBe(42);
});

test('parseGardenId rejects invalid ids', () => {
  expect(parseGardenId(undefined)).toBeUndefined();
  expect(parseGardenId('')).toBeUndefined();
  expect(parseGardenId('0')).toBeUndefined();
  expect(parseGardenId('01')).toBeUndefined();
  expect(parseGardenId('abc')).toBeUndefined();
  expect(parseGardenId('-1')).toBeUndefined();
});
