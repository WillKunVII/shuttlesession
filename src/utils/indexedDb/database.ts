
/**
 * IndexedDB database initialization and management
 */

export class DatabaseManager {
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

  getDatabase(): IDBDatabase | null {
    return this.db;
  }

  async ensureInit(): Promise<IDBDatabase> {
    if (!this.db) await this.init();
    return this.db!;
  }
}
