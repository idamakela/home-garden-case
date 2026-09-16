const ignoredIncomingIds = new Set<number>();
const ignoredOutgoingIds = new Set<number>();

export function ignoreIncomingGarden(gardenId: number) {
  ignoredIncomingIds.add(gardenId);
}

export function consumeIgnoredIncomingGarden(gardenId: number) {
  if (!ignoredIncomingIds.has(gardenId)) {
    return false;
  }

  ignoredIncomingIds.delete(gardenId);
  return true;
}

export function ignoreOutgoingGarden(gardenId: number) {
  ignoredOutgoingIds.add(gardenId);
}

export function consumeIgnoredOutgoingGarden(gardenId: number) {
  if (!ignoredOutgoingIds.has(gardenId)) {
    return false;
  }

  ignoredOutgoingIds.delete(gardenId);
  return true;
}
