
/**
 * Game records management for IndexedDB
 */

import { GameRecord } from './types';
import { DatabaseManager } from './database';

export class GameRecordsManager {
  constructor(private dbManager: DatabaseManager) {}

  /**
   * Adds a game record using player IDs. (Legacy: accepts names only if needed)
   */
  async addGame(
    players: { id: number; name: string }[], // [{id, name}, ...] from Player[]
    gameType?: string,
    courtId?: number,
    winnerIds?: number[]
  ): Promise<void> {
    const db = await this.dbManager.ensureInit();

    const transaction = db.transaction(['gameHistory'], 'readwrite');
    const gameStore = transaction.objectStore('gameHistory');

    // Map player objects to their IDs and names for stats
    const playerIds = players.map(p => p.id);
    const playerNames = players.map(p => p.name);

    const game: GameRecord = {
      playerIds,
      timestamp: Date.now(),
      gameType,
      courtId,
      winners: winnerIds,
      // For legacy support:
      players: playerNames,
      legacyWinners: undefined, // no longer used
    };

    // Add game record
    await new Promise((resolve, reject) => {
      const request = gameStore.add(game);
      request.onsuccess = () => {
        console.log("IndexedDB: Added game record (IDs)", game);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Returns recent games using player IDs.
   */
  async getGameHistory(limit: number = 50): Promise<GameRecord[]> {
    const db = await this.dbManager.ensureInit();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['gameHistory'], 'readonly');
      const store = transaction.objectStore('gameHistory');
      const index = store.index('timestamp');

      const request = index.openCursor(null, 'prev');
      const games: GameRecord[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < limit) {
          games.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(games);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getGamesWithPlayerIds(playerIds: number[]): Promise<GameRecord[]> {
    const allGames = await this.getGameHistory(200);
    const sortedIds = [...playerIds].sort();

    return allGames.filter(game => {
      // Support both legacy (names) and id-based records
      // Logic: match if all playerIds included
      if (Array.isArray(game.playerIds)) {
        return (
          game.playerIds.length === sortedIds.length &&
          game.playerIds.every((id: number) => sortedIds.includes(id))
        );
      }
      return false; // Only match on new-style records
    });
  }

  async getPlayedTogetherCount(playerIds: number[]): Promise<number> {
    const games = await this.getGamesWithPlayerIds(playerIds);
    return games.length;
  }

  async clearOldGames(keepDays: number = 30): Promise<void> {
    const db = await this.dbManager.ensureInit();

    const cutoffTime = Date.now() - keepDays * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['gameHistory'], 'readwrite');
      const store = transaction.objectStore('gameHistory');
      const index = store.index('timestamp');

      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}
