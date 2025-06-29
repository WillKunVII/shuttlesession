
/**
 * Migration utilities for IndexedDB
 */

import { DatabaseManager } from './database';
import { GameRecordsManager } from './gameRecords';

export class MigrationManager {
  constructor(
    private dbManager: DatabaseManager,
    private gameRecordsManager: GameRecordsManager
  ) {}

  async migrateFromLocalStorage(): Promise<void> {
    // Migrate existing localStorage game history to IndexedDB (IDs may not be available)
    try {
      const existingHistory = localStorage.getItem('gameHistory');
      if (existingHistory) {
        const games = JSON.parse(existingHistory);

        // For legacy: try to map player names to IDs from localStorage members
        const memberLookup: Record<string, number> = {};
        try {
          const members = JSON.parse(localStorage.getItem("clubMembers") || "[]");
          members.forEach((mem: {id: number, name: string}) => {
            memberLookup[mem.name] = mem.id;
          });
        } catch {}

        for (const game of games) {
          const playerIds = (game.players || []).map((name: string) => memberLookup[name] || 0).filter(id => id);
          await this.gameRecordsManager.addGame(
            playerIds.map((id: number) => {
              const name = Object.keys(memberLookup).find(key => memberLookup[key] === id) || "";
              return { id, name };
            }),
            undefined,
            undefined,
            []
          );
        }
        console.log(`Migrated ${games.length} games from localStorage to IndexedDB`);
      }
    } catch (error) {
      console.error('Error migrating game history from localStorage:', error);
    }
  }
}
