
import React, { createContext, useContext } from "react";
import { Player } from "@/types/player";
import { Court } from "@/types/DashboardTypes";
import { PlayPreference } from "@/types/member";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
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

// Create the context object
export const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Use the hook with all logic
  const logic = useDashboardLogic();

  // updateActivePlayerInfo just updates the queue/courts with new member info
  const updateActivePlayerInfo = (memberUpdate: {
    name: string,
    gender?: "male" | "female",
    isGuest?: boolean,
    playPreferences?: PlayPreference[]
  }) => {
    // Attempt to update via props if present
    if (logic.updatePlayerInfo) {
      logic.updatePlayerInfo(memberUpdate);
    }
    if (logic.updateCourtPlayerInfo) {
      logic.updateCourtPlayerInfo(memberUpdate);
    }
  };

  // Expose everything expected by context
  return (
    <DashboardContext.Provider
      value={{
        ...logic,
        updateActivePlayerInfo,
        getPlayerPoolSize: logic.getPlayerPoolSize || (() => 0),
        canFormValidGame: logic.canFormValidGame || (() => false),
      }}
    >
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
