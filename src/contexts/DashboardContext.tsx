import React, { createContext, useContext } from "react";
import { Player } from "@/types/player";
import { Court } from "@/types/DashboardTypes";
import { PlayPreference } from "@/types/member";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
import { CurrentCourtPlayers } from "@/types/DashboardTypes";
import { DashboardContextType } from "@/types/DashboardTypes";
import { usePiggybackPairs } from "@/hooks/usePiggybackPairs";

export const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Piggyback pairs hook!
  const piggyback = usePiggybackPairs();

  // Pass piggybackPairs and handlers down
  const logic = useDashboardLogic({
    piggybackPairs: piggyback.piggybackPairs,
    addPiggybackPair: piggyback.addPair,
    removePiggybackPair: piggyback.removePairByMaster,
    findPiggybackPair: piggyback.findPairOf,
  });

  // fallback no-ops
  const noop = () => {};
  const noopSet: React.Dispatch<React.SetStateAction<any>> = () => {};
  const noopReturnNumber = () => 0;
  const noopReturnBool = () => false;
  const noopCanFormValidGame = (_players: Player[]) => false;

  // Provide context values, preferring logic or fallbacks
  const queue = logic.queue ?? [];
  const nextGamePlayers = logic.nextGamePlayers ?? [];
  const sortedCourts = logic.sortedCourts ?? [];
  const endGameDialogOpen = logic.endGameDialogOpen ?? false;
  const setEndGameDialogOpen = logic.setEndGameDialogOpen ?? noopSet;
  const currentCourtPlayers = logic.currentCourtPlayers ?? { id: 0, players: [] };
  const setCurrentCourtPlayers = (logic as any).setCurrentCourtPlayers ?? noopSet;

  const addPlayerToQueue = logic.addPlayerToQueue ?? noop;
  const removePlayerFromQueue = logic.removePlayerFromQueue ?? noop;
  const generateNextGame = logic.generateNextGame ?? (async () => {});
  const assignToFreeCourt = logic.assignToFreeCourt ?? (async () => {});
  const handleEndGameClick = logic.handleEndGameClick ?? noop;
  const handlePlayerSelect = logic.handlePlayerSelect ?? noop;
  const clearNextGame = logic.clearNextGame ?? noop;
  const finishEndGame = logic.finishEndGame ?? noop;
  const isNextGameReady = logic.isNextGameReady ?? noopReturnBool;
  const getPlayerPoolSize = (logic as any).getPlayerPoolSize ?? noopReturnNumber;
  const canFormValidGame = (logic as any).canFormValidGame ?? noopCanFormValidGame;

  const updateActivePlayerInfo = (memberUpdate: {
    name: string;
    gender?: "male" | "female";
    isGuest?: boolean;
    playPreferences?: any[];
  }) => {
    const updatePlayerInfo = (logic as any).updatePlayerInfo ?? (() => {});
    const updateCourtPlayerInfo = (logic as any).updateCourtPlayerInfo ?? (() => {});
    updatePlayerInfo(memberUpdate);
    updateCourtPlayerInfo(memberUpdate);
  };

  // In your value, provide piggyback state & handlers:
  const value: DashboardContextType = {
    queue,
    nextGamePlayers,
    sortedCourts,
    endGameDialogOpen,
    setEndGameDialogOpen,
    currentCourtPlayers,
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
    // fixed: use piggybackPairs array for multi-pair support
    piggybackPairs: piggyback.piggybackPairs,
    addPiggybackPair: piggyback.addPair,
    removePiggybackPair: piggyback.removePairByMaster,
    findPiggybackPair: piggyback.findPairOf,
    clearPiggybackPairs: piggyback.clearAllPairs,
  };

  return (
    <DashboardContext.Provider value={value}>
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
