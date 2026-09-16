import { formatHumidityLevel } from '../../app/lib/garden-humidity';

test('formatHumidityLevel shows a percent range when both values are set', () => {
  expect(formatHumidityLevel(40, 60)).toBe('40% - 60%');
});

test('formatHumidityLevel defaults missing bounds to 0 and 100', () => {
  expect(formatHumidityLevel(null, null)).toBe('0% - 100%');
  expect(formatHumidityLevel(undefined, undefined)).toBe('0% - 100%');
  expect(formatHumidityLevel(40, null)).toBe('40% - 100%');
  expect(formatHumidityLevel(null, 60)).toBe('0% - 60%');
});
