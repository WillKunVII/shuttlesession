import React, { createContext, useContext } from "react";
import { Player } from "@/types/player";
import { Court } from "@/types/DashboardTypes";
import { PlayPreference } from "@/types/member";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { useCourtManagement } from "@/hooks/useCourtManagement";

interface DashboardContextType {
  queue: Player[];
  nextGamePlayers: Player[];
  sortedCourts: Court[];
  endGameDialogOpen: boolean;
  currentCourtPlayers: { id: number; players: any[] };
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

export const DashboardContext = createContext<any>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const playerQueue = usePlayerQueue();
  const courtMgmt = useCourtManagement();

  // Add updateActivePlayerInfo for member edits
  const updateActivePlayerInfo = (memberUpdate: { name: string, gender?: "male" | "female", isGuest?: boolean, playPreferences?: any[] }) => {
    playerQueue.updatePlayerInfo(memberUpdate);
    courtMgmt.updateCourtPlayerInfo(memberUpdate);
  };

  return (
    <DashboardContext.Provider value={{
      ...playerQueue,
      ...courtMgmt,
      updateActivePlayerInfo,
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
