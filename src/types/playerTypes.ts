
// Player type definitions for queue management
export interface Player {
  id: string;
  name: string;
  waitingTime: number;
  gender: "male" | "female";
  isGuest?: boolean;
  wins?: number;
  losses?: number;
}

// Interface to track play history
export interface PlayHistory {
  [playerPair: string]: number; // Key is player1Id-player2Id, value is count
}
