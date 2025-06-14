import React, { createContext, useContext, useState } from "react";
import { Player } from "@/types/player";
import { Court } from "@/types/DashboardTypes";
import { PlayPreference } from "@/types/member";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { CurrentCourtPlayers } from "@/types/DashboardTypes";

interface DashboardContextType {
  queue: Player[];
  nextGamePlayers: Player[];
  sortedCourts: Court[];
  endGameDialogOpen: boolean;
  currentCourtPlayers: CurrentCourtPlayers;
  setCurrentCourtPlayers: React.Dispatch<React.SetStateAction<CurrentCourtPlayers>>;
  addPlayerToQueue: (player: Omit<Player, "id" | "waitingTime">) => void;
  removePlayerFromQueue: (playerId: number) => void;
  generateNextGame: () => Promise<void>;
  assignToFreeCourt: (courtId: number) => Promise<void>;
  handleEndGameClick: (courtId: number) => void;
  handlePlayerSelect: (selectedPlayers: Player[]) => void;
  clearNextGame: () => void;
  setEndGameDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  finishEndGame: (courtId: number, winnerNames: string[]) => void;
  isNextGameReady: () => boolean;
  updateActivePlayerInfo: (memberUpdate: {
    name: string;
    gender?: "male" | "female";
    isGuest?: boolean;
    playPreferences?: PlayPreference[];
  }) => void;
  getPlayerPoolSize: () => number;
  canFormValidGame: (players: Player[]) => boolean;
}

export const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const playerQueue = usePlayerQueue();
  const courtMgmt = useCourtManagement();

  // Add updateActivePlayerInfo for member edits
  const updateActivePlayerInfo = (memberUpdate: { name: string, gender?: "male" | "female", isGuest?: boolean, playPreferences?: any[] }) => {
    playerQueue.updatePlayerInfo(memberUpdate);
    courtMgmt.updateCourtPlayerInfo(memberUpdate);
  };

  // State for endGameDialog and for the court currently ending a game
  const [endGameDialogOpen, setEndGameDialogOpen] = useState(false);

  const initialCurrentCourtPlayers: CurrentCourtPlayers = { id: 0, players: [] };
  const [currentCourtPlayers, setCurrentCourtPlayers] = useState<CurrentCourtPlayers>(initialCurrentCourtPlayers);

  // NOTE: The rest of your hook composition for queue/courts/etc
  // The actual logic like handleEndGameClick, assignToFreeCourt, etc should now use setCurrentCourtPlayers when needed

  return (
    <DashboardContext.Provider value={{
      ...playerQueue,
      ...courtMgmt,
      currentCourtPlayers,
      setCurrentCourtPlayers,
      endGameDialogOpen,
      setEndGameDialogOpen,
      updateActivePlayerInfo,
      queue: playerQueue.queue,
      nextGamePlayers: [],
      sortedCourts: courtMgmt.getSortedCourts(),
      addPlayerToQueue: playerQueue.addPlayerToQueue,
      removePlayerFromQueue: playerQueue.removePlayerFromQueue,
      generateNextGame: async () => {},
      assignToFreeCourt: async (courtId: number) => {},
      handleEndGameClick: (courtId: number) => {},
      handlePlayerSelect: (selectedPlayers: Player[]) => {},
      clearNextGame: () => {},
      finishEndGame: (courtId: number, winnerNames: string[]) => {},
      isNextGameReady: () => false,
      getPlayerPoolSize: () => 0,
      canFormValidGame: (players: Player[]) => false,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
