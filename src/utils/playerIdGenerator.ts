
// Optimized ID generation with better performance
let currentId = Date.now();
const generatedIds = new Set<number>();

export function generatePlayerId(): number {
  let newId;
  do {
    newId = ++currentId;
  } while (generatedIds.has(newId));
  
  generatedIds.add(newId);
  
  // Clean up old IDs periodically to prevent memory leaks
  if (generatedIds.size > 1000) {
    const idsArray = Array.from(generatedIds);
    const keepCount = 500;
    const toKeep = idsArray.slice(-keepCount);
    generatedIds.clear();
    toKeep.forEach(id => generatedIds.add(id));
  }
  
  return newId;
}

export function generatePlayerIdFromTimestamp(timestamp?: number): number {
  if (timestamp) {
    currentId = Math.max(currentId, timestamp);
  }
  return generatePlayerId();
}

// Batch ID generation for better performance when adding multiple players
export function generatePlayerIds(count: number): number[] {
  const ids: number[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(generatePlayerId());
  }
  return ids;
}
