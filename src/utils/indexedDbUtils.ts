/**
 * IndexedDB utilities for storing game history and player statistics
 * Provides better performance and larger storage capacity than localStorage
 */

interface GameRecord {
  id?: number;
  players: string[];
  timestamp: number;
  gameType?: string;
  courtId?: number;
}

interface PlayerStats {
  name: string;
  gamesPlayed: number;
  lastPlayed: number;
  partners: Record<string, number>; // partner name -> times played together
  wins: number;
  losses: number;
}

class GameHistoryDB {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'ShuttleSessionDB';
  private readonly version = 1;

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

        // Create game history store
        if (!db.objectStoreNames.contains('gameHistory')) {
          const gameStore = db.createObjectStore('gameHistory', {
            keyPath: 'id',
            autoIncrement: true
          });
          gameStore.createIndex('timestamp', 'timestamp', { unique: false });
          gameStore.createIndex('players', 'players', { unique: false, multiEntry: true });
        }

        // Create player stats store
        if (!db.objectStoreNames.contains('playerStats')) {
          const statsStore = db.createObjectStore('playerStats', {
            keyPath: 'name'
          });
          statsStore.createIndex('gamesPlayed', 'gamesPlayed', { unique: false });
          statsStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
        }
      };
    });
  }

  async addGame(playerNames: string[], gameType?: string, courtId?: number, winners?: string[]): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['gameHistory', 'playerStats'], 'readwrite');
    const gameStore = transaction.objectStore('gameHistory');
    const statsStore = transaction.objectStore('playerStats');

    const game: GameRecord = {
      players: [...playerNames].sort(),
      timestamp: Date.now(),
      gameType,
      courtId
    };

    // Add game record
    await new Promise((resolve, reject) => {
      const request = gameStore.add(game);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Update player stats (always increment gamesPlayed, and update win/loss if provided)
    for (const playerName of playerNames) {
      const stats = await this.getPlayerStats(playerName) || {
        name: playerName,
        gamesPlayed: 0,
        lastPlayed: 0,
        partners: {},
        wins: 0,
        losses: 0
      };

      stats.gamesPlayed += 1;
      stats.lastPlayed = Date.now();

      // Initialize wins/losses if not present
      stats.wins = stats.wins || 0;
      stats.losses = stats.losses || 0;
      // If this is a win/loss record, update accordingly (optional, for extension)
      // --- not supplied in most contexts, so we can't determine win/loss from just player list ---

      // Update partner counts
      for (const partner of playerNames) {
        if (partner !== playerName) {
          stats.partners[partner] = (stats.partners[partner] || 0) + 1;
        }
      }

      await new Promise((resolve, reject) => {
        const request = statsStore.put(stats);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getGameHistory(limit: number = 50): Promise<GameRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameHistory'], 'readonly');
      const store = transaction.objectStore('gameHistory');
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'prev'); // Get newest first
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

  async getGamesWithPlayers(playerNames: string[]): Promise<GameRecord[]> {
    if (!this.db) await this.init();

    const allGames = await this.getGameHistory(200); // Get more games for analysis
    const sortedNames = [...playerNames].sort();

    return allGames.filter(game => {
      return game.players.length === sortedNames.length &&
             game.players.every(name => sortedNames.includes(name));
    });
  }

  async getPlayerStats(playerName: string): Promise<PlayerStats | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playerStats'], 'readonly');
      const store = transaction.objectStore('playerStats');
      const request = store.get(playerName);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getPlayedTogetherCount(playerNames: string[]): Promise<number> {
    const games = await this.getGamesWithPlayers(playerNames);
    return games.length;
  }

  async migrateFromLocalStorage(): Promise<void> {
    // Migrate existing localStorage game history to IndexedDB
    try {
      const existingHistory = localStorage.getItem('gameHistory');
      if (existingHistory) {
        const games = JSON.parse(existingHistory);
        
        for (const game of games) {
          await this.addGame(game.players, undefined, undefined);
        }
        
        console.log(`Migrated ${games.length} games from localStorage to IndexedDB`);
        
        // Keep localStorage as backup for now, but clear it eventually
        // localStorage.removeItem('gameHistory');
      }
    } catch (error) {
      console.error('Error migrating game history from localStorage:', error);
    }
  }

  async clearOldGames(keepDays: number = 30): Promise<void> {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - (keepDays * 24 * 60 * 60 * 1000);
    
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

  // Add: Clear all playerStats (reset all-time wins/losses)
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

// Initialize on first import
gameHistoryDB.init().catch(console.error);
