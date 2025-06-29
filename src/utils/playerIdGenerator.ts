
let currentId = Date.now();

export function generatePlayerId(): number {
  return ++currentId;
}

export function generatePlayerIdFromTimestamp(timestamp?: number): number {
  if (timestamp) {
    currentId = Math.max(currentId, timestamp);
  }
  return ++currentId;
}
