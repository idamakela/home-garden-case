export function formatHumidityLevel(
  minHumidity: number | null | undefined,
  maxHumidity: number | null | undefined,
): string {
  const min = minHumidity == null ? 0 : minHumidity;
  const max = maxHumidity == null ? 100 : maxHumidity;

  return `${min}% - ${max}%`;
}
