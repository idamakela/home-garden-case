export function parseGardenId(value: string | undefined): number | undefined {
  if (value == null || !/^[1-9]\d*$/.test(value)) {
    return undefined;
  }

  return Number(value);
}
