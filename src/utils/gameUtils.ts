
// Re-export all functions from the refactored modules for backward compatibility
export { canFormValidGame, determineBestGameType, getPlayerPoolSize } from "./gameValidation";
export { getGameHistory, recordGame, getPlayedTogetherCount, calculateRepeatPenalty } from "./gameHistory";
export { generateValidCombinations } from "./playerCombinations";
export { findBestCombination } from "./gameSelection";

// Migrate existing localStorage data to IndexedDB on app start
import { gameHistoryDB } from "./indexedDbUtils";
gameHistoryDB.migrateFromLocalStorage().catch(console.error);
