
/**
 * TypeScript interfaces for IndexedDB game history and player statistics
 */

export interface GameRecord {
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

export interface PlayerStats {
  playerId: number;
  name: string;
  gamesPlayed: number;
  lastPlayed: number;
  partners: Record<number, number>; // partnerId -> times played together
  wins: number;
  losses: number;
}
