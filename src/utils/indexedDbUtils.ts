
/**
 * IndexedDB utilities for storing game history and player statistics
 * Now uses unique player IDs as the main tracking key. (2025/06/14)
 * 
 * Refactored into smaller modules for better maintainability.
 */

// Re-export types using 'export type' for isolatedModules compatibility
export type { GameRecord, PlayerStats } from './indexedDb/types';
export { GameHistoryDB } from './indexedDb/gameHistoryDB';

// Export singleton instance
import { GameHistoryDB } from './indexedDb/gameHistoryDB';
export const gameHistoryDB = new GameHistoryDB();
gameHistoryDB.init().catch(console.error);
