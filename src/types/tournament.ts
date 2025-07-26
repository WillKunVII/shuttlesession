/**
 * Tournament feature types for group stage + knockout tournament format
 */

export interface TournamentPlayer {
  id: number;
  name: string;
  handicap: number; // Individual player handicap value
}

export interface TournamentPair {
  id: string;
  player1: TournamentPlayer;
  player2: TournamentPlayer;
  pairHandicap: number; // Sum of both players' handicaps
  groupId?: string;
}

export interface TournamentMatch {
  id: string;
  pair1: TournamentPair;
  pair2: TournamentPair;
  stage: 'group' | 'knockout';
  roundName?: string; // e.g., "Group A", "Quarter Final"
  
  // Match results
  isCompleted: boolean;
  pair1Score?: number;
  pair2Score?: number;
  pair1AdjustedScore?: number; // Score after handicap adjustment
  pair2AdjustedScore?: number;
  winnerId?: string; // Winning pair ID
  
  // Handicap override
  handicapOverride?: {
    pair1Handicap: number;
    pair2Handicap: number;
  };
  
  timestamp?: number;
}

export interface TournamentGroup {
  id: string;
  name: string; // e.g., "Group A"
  pairs: TournamentPair[];
  matches: TournamentMatch[];
  standings?: GroupStanding[];
}

export interface GroupStanding {
  pairId: string;
  pair: TournamentPair;
  matchesPlayed: number;
  wins: number;
  losses: number;
  pointsScored: number;
  pointsConceded: number;
  pointDifferential: number;
  position: number;
}

export interface KnockoutMatch extends TournamentMatch {
  stage: 'knockout';
  round: 'round-of-16' | 'quarter-final' | 'semi-final' | 'final';
  nextMatchId?: string; // ID of next match for winner
}

export interface TournamentBracket {
  rounds: {
    name: string;
    matches: KnockoutMatch[];
  }[];
  winner?: TournamentPair;
}

export interface Tournament {
  id: string;
  name: string;
  status: 'setup' | 'group-stage' | 'knockout-stage' | 'completed' | 'cancelled';
  
  // Tournament configuration
  numberOfGroups: number;
  pairs: TournamentPair[];
  groups: TournamentGroup[];
  bracket?: TournamentBracket;
  
  // Tournament metadata
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  currentStage: 'setup' | 'groups' | 'knockouts' | 'finished';
}

export interface HandicapRecord {
  playerId: number;
  playerName: string;
  handicap: number;
  lastUpdated: number;
}