
/**
 * IndexedDB utilities for storing game history and player statistics
 * Now uses unique player IDs as the main tracking key. (2025/06/14)
 */

interface GameRecord {
  id?: number;
  playerIds: number[];
  timestamp: number;
  gameType?: string;
  courtId?: number;
  winners?: number[]; // Now tracks winner IDs instead of names
  // Legacy support:
  players?: string[];
  legacyWinners?: string[];
}

interface PlayerStats {
  playerId: number;
  name: string;
  gamesPlayed: number;
  lastPlayed: number;
  partners: Record<number, number>; // partnerId -> times played together
  wins: number;
  losses: number;
}

class GameHistoryDB {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'ShuttleSessionDB';
  private readonly version = 2; // bump version for store upgrade

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create/upgrade game history store
        if (!db.objectStoreNames.contains('gameHistory')) {
          const gameStore = db.createObjectStore('gameHistory', {
            keyPath: 'id',
            autoIncrement: true
          });
          gameStore.createIndex('timestamp', 'timestamp', { unique: false });
          gameStore.createIndex('playerIds', 'playerIds', { unique: false, multiEntry: true });
        } else {
          // For v2+ migration: add missing index on playerIds if needed
          const gameStore = (event.target as IDBOpenDBRequest).transaction?.objectStore('gameHistory');
          if (gameStore && !gameStore.indexNames.contains('playerIds')) {
            gameStore.createIndex('playerIds', 'playerIds', { unique: false, multiEntry: true });
          }
        }

        // Create/upgrade player stats store
        if (!db.objectStoreNames.contains('playerStats')) {
          const statsStore = db.createObjectStore('playerStats', {
            keyPath: 'playerId'
          });
          statsStore.createIndex('gamesPlayed', 'gamesPlayed', { unique: false });
          statsStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
        }
      };
    });
  }

  /**
   * Adds a game record using player IDs. (Legacy: accepts names only if needed)
   */
  async addGame(
    players: { id: number; name: string }[], // [{id, name}, ...] from Player[]
    gameType?: string,
    courtId?: number,
    winnerIds?: number[]
  ): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['gameHistory', 'playerStats'], 'readwrite');
    const gameStore = transaction.objectStore('gameHistory');
    const statsStore = transaction.objectStore('playerStats');

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

    // Update player stats (by ID!)
    for (const player of players) {
      const stats = (await this.getPlayerStats(player.id)) || {
        playerId: player.id,
        name: player.name,
        gamesPlayed: 0,
        lastPlayed: 0,
        partners: {},
        wins: 0,
        losses: 0
      };

      stats.gamesPlayed += 1;
      stats.lastPlayed = Date.now();

      // Update partner counts
      for (const partner of players) {
        if (partner.id !== player.id) {
          stats.partners[partner.id] = (stats.partners[partner.id] || 0) + 1;
        }
      }

      // If this is a win/loss record, update accordingly
      if (winnerIds && Array.isArray(winnerIds)) {
        if (winnerIds.includes(player.id)) {
          stats.wins += 1;
        } else {
          stats.losses += 1;
        }
      }
      await new Promise((resolve, reject) => {
        const request = statsStore.put(stats);
        request.onsuccess = () => {
          console.log(`IndexedDB: Updated playerStats for playerId=${player.id}`, stats);
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    }
  }

  /**
   * Returns recent games using player IDs.
   */
  async getGameHistory(limit: number = 50): Promise<GameRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameHistory'], 'readonly');
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
    if (!this.db) await this.init();

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

  /**
   * Get PlayerStats by playerId (preferred). For legacy support, can fallback to name.
   */
  async getPlayerStats(playerId: number): Promise<PlayerStats | null> {
    if (!this.db) await this.init();

    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['playerStats'], 'readonly');
      const store = transaction.objectStore('playerStats');
      const request = store.get(playerId);

      request.onsuccess = async () => {
        if (request.result) {
          // Found in playerStats
          resolve(request.result);
        } else {
          // Not found – try to reconstruct from gameHistory by ID
          console.log(`[PATCH] playerStats for ID ${playerId} missing, rebuilding...`);
          try {
            const allGames: GameRecord[] = await this.getGameHistory(10000);
            let gamesPlayed = 0;
            let wins = 0;
            let losses = 0;
            let lastPlayed = 0;
            const partners: Record<number, number> = {};
            // To get a player's name for stats
            let playerName = "";
            for (const game of allGames) {
              if (
                Array.isArray(game.playerIds) &&
                game.playerIds.includes(playerId)
              ) {
                gamesPlayed += 1;
                lastPlayed = Math.max(lastPlayed, game.timestamp);

                // Lookup name for legacy games or just copy from first match
                if (!playerName && Array.isArray(game.players) && Array.isArray(game.playerIds)) {
                  const idx = game.playerIds.findIndex((id) => id === playerId);
                  if (idx >= 0 && game.players && game.players[idx]) {
                    playerName = game.players[idx];
                  }
                }

                // Add partner counts
                for (const id of game.playerIds) {
                  if (id !== playerId) {
                    partners[id] = (partners[id] || 0) + 1;
                  }
                }
                // Score win/loss if info available
                if ('winners' in game && Array.isArray(game.winners)) {
                  if (game.winners.includes(playerId)) wins++;
                  else losses++;
                }
                // Fallback: legacy games, match by index in winners (not implemented - all modern games should use IDs)
              }
            }
            if (gamesPlayed === 0) {
              resolve(null);
              return;
            }
            const stats: PlayerStats = {
              playerId,
              name: playerName,
              gamesPlayed,
              lastPlayed,
              partners,
              wins,
              losses,
            };
            // Save for future
            const writeTxn = this.db!.transaction(['playerStats'], 'readwrite');
            const writeStore = writeTxn.objectStore('playerStats');
            const putReq = writeStore.put(stats);
            putReq.onsuccess = () => {
              console.log(`[PATCH] playerStats for playerId=${playerId} rebuilt`, stats);
              resolve(stats);
            };
            putReq.onerror = () => {
              console.error(`[PATCH] Failed to save rebuilt playerStats for ID`, playerId, putReq.error);
              resolve(stats);
            };
          } catch (err) {
            console.error(`[PATCH] Error rebuilding stats for ID ${playerId}:`, err);
            resolve(null);
          }
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPlayedTogetherCount(playerIds: number[]): Promise<number> {
    const games = await this.getGamesWithPlayerIds(playerIds);
    return games.length;
  }

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
          await this.addGame(
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

  async clearOldGames(keepDays: number = 30): Promise<void> {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - keepDays * 24 * 60 * 60 * 1000;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameHistory'], 'readwrite');
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

  // Reset all player stats
  async clearAllPlayerStats(): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playerStats'], 'readwrite');
      const statsStore = transaction.objectStore('playerStats');
      const req = statsStore.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

// Export singleton instance
export const gameHistoryDB = new GameHistoryDB();
gameHistoryDB.init().catch(console.error);

