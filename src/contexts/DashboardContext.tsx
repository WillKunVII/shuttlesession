
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
  updatePlayerInfo?: (memberUpdate: {
    name: string;
    gender?: "male" | "female";
    isGuest?: boolean;
    playPreferences?: PlayPreference[];
  }) => void;
  updateCourtPlayerInfo?: (memberUpdate: {
    name: string;
    gender?: "male" | "female";
    isGuest?: boolean;
    playPreferences?: PlayPreference[];
  }) => void;
}

export const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Use the central logic hook which should expose all needed properties
  const logic = useDashboardLogic();

  // Provide no-op fallbacks for any optional or missing functions
  const noop = () => {};

  // Ensure all required context props are present, using logic or fallback if needed
  const {
    queue,
    nextGamePlayers,
    sortedCourts,
    endGameDialogOpen,
    setEndGameDialogOpen,
    currentCourtPlayers,
    setCurrentCourtPlayers,
    addPlayerToQueue,
    removePlayerFromQueue,
    generateNextGame,
    assignToFreeCourt,
    handleEndGameClick,
    handlePlayerSelect,
    clearNextGame,
    finishEndGame,
    isNextGameReady,
    getPlayerPoolSize,
    canFormValidGame,
    updatePlayerInfo,
    updateCourtPlayerInfo
  } = {
    ...logic,
    // Fallbacks for required values not present in logic
    getPlayerPoolSize: logic.getPlayerPoolSize || (() => 0),
    canFormValidGame: logic.canFormValidGame || (() => false),
    updatePlayerInfo: logic.updatePlayerInfo || noop,
    updateCourtPlayerInfo: logic.updateCourtPlayerInfo || noop,
    setCurrentCourtPlayers: logic.setCurrentCourtPlayers || noop,
  };

  // updateActivePlayerInfo updates both queue/courts for the member if possible
  const updateActivePlayerInfo = (memberUpdate: {
    name: string;
    gender?: "male" | "female";
    isGuest?: boolean;
    playPreferences?: PlayPreference[];
  }) => {
    if (updatePlayerInfo) {
      updatePlayerInfo(memberUpdate);
    }
    if (updateCourtPlayerInfo) {
      updateCourtPlayerInfo(memberUpdate);
    }
  };

  // Provide context to children
  return (
    <DashboardContext.Provider
      value={{
        queue,
        nextGamePlayers,
        sortedCourts,
        endGameDialogOpen,
        setEndGameDialogOpen,
        currentCourtPlayers,
        setCurrentCourtPlayers,
        addPlayerToQueue,
        removePlayerFromQueue,
        generateNextGame,
        assignToFreeCourt,
        handleEndGameClick,
        handlePlayerSelect,
        clearNextGame,
        finishEndGame,
        isNextGameReady,
        updateActivePlayerInfo,
        getPlayerPoolSize,
        canFormValidGame,
        updatePlayerInfo,
        updateCourtPlayerInfo
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

