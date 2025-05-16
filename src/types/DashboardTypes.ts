
import { Player } from "./player";

export type CourtPlayer = {
  name: string;
  gender: "male" | "female";
  isGuest?: boolean;
};

export type Court = {
  id: number;
  name: string;
  status: "available" | "occupied";
  players: CourtPlayer[];
  timeRemaining: number;
};

export type CurrentCourtPlayers = {
  id: number;
  players: CourtPlayer[];
};

export type DashboardContextType = {
  queue: Player[];
  nextGamePlayers: Player[];
  sortedCourts: Court[];
  endGameDialogOpen: boolean;
  currentCourtPlayers: CurrentCourtPlayers;
  addPlayerToQueue: (player: Omit<Player, "id" | "waitingTime">) => void;
  removePlayerFromQueue: (playerId: number) => void;
  generateNextGame: () => void;
  assignToFreeCourt: (courtId: number) => void;
  handleEndGameClick: (courtId: number) => void;
  handlePlayerSelect: (selectedPlayers: Player[]) => void;
  clearNextGame: () => void;
  setEndGameDialogOpen: (open: boolean) => void;
  finishEndGame: (courtId: number, winnerNames: string[]) => void;
  isNextGameReady: () => boolean;
};
