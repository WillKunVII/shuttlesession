
import { Player } from "@/types/player";
import { PlayPreference } from "@/types/member";

export interface DashboardContextType {
  // Player queue
  queue: Player[];
  addPlayerToQueue: (player: Omit<Player, "id" | "waitingTime">) => void;
  removePlayerFromQueue: (playerId: number) => void;
  togglePlayerRest: (playerId: number) => void;
  updateActivePlayerInfo: (updated: { 
    id?: number; 
    name: string; 
    gender?: "male" | "female"; 
    isGuest?: boolean; 
    playPreferences?: PlayPreference[] 
  }) => void;

  // Next game
  nextGamePlayers: Player[];
  generateNextGame: () => Promise<void>;
  clearNextGame: () => void;
  isNextGameReady: () => boolean;

  // Courts
  sortedCourts: any[];
  assignToFreeCourt: (courtId: number) => Promise<void>;
  handleEndGameClick: (courtId: number) => void;

  // Game management
  handlePlayerSelect: (selectedPlayers: Player[]) => void;
  endGameDialogOpen: boolean;
  currentCourtPlayers: { id: number; players: any[] };
  setEndGameDialogOpen: (open: boolean) => void;
  finishEndGame: (courtId: number, winnerNames: string[]) => void;

  // Piggyback pairs
  piggybackPairs: { master: number; partner: number }[];
  addPiggybackPair: (master: number, partner: number) => void;
  removePiggybackPair: (master: number) => void;
  findPiggybackPair: (playerId: number) => { master: number; partner: number } | undefined;
  clearPiggybackPairs: () => void;
}
