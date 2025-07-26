/**
 * Tournament database manager for IndexedDB operations
 */

import { DatabaseManager } from './database';
import { Tournament, TournamentMatch, HandicapRecord } from '@/types/tournament';

export class TournamentDB {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * Save tournament to IndexedDB
   */
  async saveTournament(tournament: Tournament): Promise<void> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['tournaments'], 'readwrite');
    const store = transaction.objectStore('tournaments');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(tournament);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get tournament by ID
   */
  async getTournament(tournamentId: string): Promise<Tournament | null> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['tournaments'], 'readonly');
    const store = transaction.objectStore('tournaments');
    
    return new Promise<Tournament | null>((resolve, reject) => {
      const request = store.get(tournamentId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all tournaments
   */
  async getAllTournaments(): Promise<Tournament[]> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['tournaments'], 'readonly');
    const store = transaction.objectStore('tournaments');
    
    return new Promise<Tournament[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete tournament
   */
  async deleteTournament(tournamentId: string): Promise<void> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['tournaments'], 'readwrite');
    const store = transaction.objectStore('tournaments');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(tournamentId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save match result
   */
  async saveMatch(match: TournamentMatch): Promise<void> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['tournamentMatches'], 'readwrite');
    const store = transaction.objectStore('tournamentMatches');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(match);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get matches for a tournament
   */
  async getTournamentMatches(tournamentId: string): Promise<TournamentMatch[]> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['tournamentMatches'], 'readonly');
    const store = transaction.objectStore('tournamentMatches');
    const index = store.index('tournamentId');
    
    return new Promise<TournamentMatch[]>((resolve, reject) => {
      const request = index.getAll(tournamentId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save player handicap
   */
  async saveHandicap(handicap: HandicapRecord): Promise<void> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['playerHandicaps'], 'readwrite');
    const store = transaction.objectStore('playerHandicaps');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(handicap);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get player handicap
   */
  async getHandicap(playerId: number): Promise<HandicapRecord | null> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['playerHandicaps'], 'readonly');
    const store = transaction.objectStore('playerHandicaps');
    
    return new Promise<HandicapRecord | null>((resolve, reject) => {
      const request = store.get(playerId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all handicaps
   */
  async getAllHandicaps(): Promise<HandicapRecord[]> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['playerHandicaps'], 'readonly');
    const store = transaction.objectStore('playerHandicaps');
    
    return new Promise<HandicapRecord[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all tournament data
   */
  async clearAllTournamentData(): Promise<void> {
    const db = await this.dbManager.ensureInit();
    const transaction = db.transaction(['tournaments', 'tournamentMatches'], 'readwrite');
    
    const tournamentStore = transaction.objectStore('tournaments');
    const matchStore = transaction.objectStore('tournamentMatches');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = tournamentStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = matchStore.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ]);
  }
}