import React, { createContext, useContext } from "react";
import { Player } from "@/types/player";
import { Court } from "@/types/DashboardTypes";
import { PlayPreference } from "@/types/member";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
import { CurrentCourtPlayers } from "@/types/DashboardTypes";

import { DashboardContextType } from "@/types/DashboardTypes";

export const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const logic = useDashboardLogic();

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
  // ERROR HERE: logic may not have setCurrentCourtPlayers; use fallback if not present!
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

  // These helpers may not exist in logic
  const getPlayerPoolSize = (logic as any).getPlayerPoolSize ?? noopReturnNumber;
  const canFormValidGame = (logic as any).canFormValidGame ?? noopCanFormValidGame;

  // updateActivePlayerInfo updates both queue/courts for the member if possible
  const updateActivePlayerInfo = (memberUpdate: {
    name: string;
    gender?: "male" | "female";
    isGuest?: boolean;
    playPreferences?: any[];
  }) => {
    // The following calls may exist in logic, but do not need to be provided via context
    const updatePlayerInfo = (logic as any).updatePlayerInfo ?? (() => {});
    const updateCourtPlayerInfo = (logic as any).updateCourtPlayerInfo ?? (() => {});
    updatePlayerInfo(memberUpdate);
    updateCourtPlayerInfo(memberUpdate);
  };

  // Piggyback integration
  const piggybackPair = (logic as any).piggybackPair ?? [];
  const togglePiggybackPlayer = (logic as any).togglePiggybackPlayer ?? noop;
  const clearPiggyback = (logic as any).clearPiggyback ?? noop;

  return (
    <DashboardContext.Provider
      value={{
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
        // Piggyback additions
        piggybackPair,
        togglePiggybackPlayer,
        clearPiggyback,
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
