import React, { useState, useEffect } from "react";
import { Player } from "@/types/player";
import { PlayPreference } from "@/types/member";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
import { usePiggybackPairs } from "@/hooks/usePiggybackPairs";
import { DashboardContextType } from "./types";

interface DashboardProviderProps {
  children: React.ReactNode;
  value: DashboardContextType;
}

export function DashboardProviderLogic({ children }: { children: React.ReactNode }) {
  // State for managing active players
  const [nextGamePlayersState, setNextGamePlayers] = useState<Player[]>([]);
  const [queueState, setQueue] = useState<Player[]>([]);
  const [courtsState, setCourts] = useState<any[]>([]);

  // Piggyback pairs state with queue manipulation
  const {
    piggybackPairs,
    addPair,
    removePairByMaster,
    findPairOf,
    clearAllPairs
  } = usePiggybackPairs({
    getQueue: () => queueState,
    setQueue
  });

  // Main dashboard logic
  const {
    queue,
    nextGamePlayers,
    sortedCourts,
    endGameDialogOpen,
    currentCourtPlayers,
    addPlayerToQueue,
    removePlayerFromQueue,
    generateNextGame,
    assignToFreeCourt,
    handleEndGameClick,
    handlePlayerSelect,
    clearNextGame,
    setEndGameDialogOpen,
    finishEndGame,
    isNextGameReady,
    voidCourtAssignment,
    canVoidCourt,
    syncQueue
  } = useDashboardLogic({
    piggybackPairs,
    addPiggybackPair: addPair,
    removePiggybackPair: removePairByMaster,
    findPiggybackPair: findPairOf
  });

  // Sync state with hook values
  useEffect(() => {
    setNextGamePlayers(nextGamePlayers);
  }, [nextGamePlayers]);

  useEffect(() => {
    setQueue(queue);
  }, [queue]);

  useEffect(() => {
    setCourts(sortedCourts);
  }, [sortedCourts]);

  // Updated updateActivePlayerInfo function to handle ID-based updates
  const updateActivePlayerInfo = (updated: { 
    id?: number; 
    name: string; 
    gender?: "male" | "female"; 
    isGuest?: boolean; 
    playPreferences?: PlayPreference[] 
  }) => {
    console.log("DashboardContext: Updating active player info", updated);
    
    // Update player queue - use ID if available, fallback to name
    const updatedQueue = queueState.map(player => {
      const matches = updated.id ? player.id === updated.id : player.name === updated.name;
      return matches
        ? {
            ...player,
            name: updated.name,
            ...(updated.gender && { gender: updated.gender }),
            ...(typeof updated.isGuest === "boolean" && { isGuest: updated.isGuest }),
            ...(updated.playPreferences && { playPreferences: updated.playPreferences })
          }
        : player
    });
    
    setQueue(updatedQueue);
    
    // Update next game players - use ID if available, fallback to name
    const updatedNextGame = nextGamePlayersState.map(player => {
      const matches = updated.id ? player.id === updated.id : player.name === updated.name;
      return matches
        ? {
            ...player,
            name: updated.name,
            ...(updated.gender && { gender: updated.gender }),
            ...(typeof updated.isGuest === "boolean" && { isGuest: updated.isGuest }),
            ...(updated.playPreferences && { playPreferences: updated.playPreferences })
          }
        : player
    });
    
    setNextGamePlayers(updatedNextGame);
    
    // Update courts - use ID if available, fallback to name
    const updatedCourts = courtsState.map(court => ({
      ...court,
      players: court.players.map(player => {
        const matches = updated.id ? player.id === updated.id : player.name === updated.name;
        return matches
          ? {
              ...player,
              name: updated.name,
              ...(updated.gender && { gender: updated.gender }),
              ...(typeof updated.isGuest === "boolean" && { isGuest: updated.isGuest }),
              ...(updated.playPreferences && { playPreferences: updated.playPreferences })
            }
          : player
      })
    }));
    
    setCourts(updatedCourts);
  };

  // Toggle player rest status with smart repositioning
  const togglePlayerRest = (playerId: number) => {
    const currentPlayer = queueState.find(p => p.id === playerId);
    if (!currentPlayer) return;
    
    const willBeResting = !currentPlayer.isResting;
    const playerPoolSize = Number(localStorage.getItem("playerPoolSize")) || 8;
    
    // Count active players in pool before this change
    const activePlayers = queueState.filter(p => !p.isResting);
    let activeInPool = 0;
    let playerCurrentIndex = -1;
    
    for (let i = 0; i < queueState.length; i++) {
      if (queueState[i].id === playerId) {
        playerCurrentIndex = i;
      }
      if (!queueState[i].isResting && activeInPool < playerPoolSize) {
        activeInPool++;
        if (queueState[i].id === playerId) break;
      }
    }
    
    const isInPool = activeInPool <= playerPoolSize && activePlayers.some(p => p.id === playerId);
    
    let updatedQueue = [...queueState];
    
    if (willBeResting && isInPool) {
      // Player is in pool and wants to rest - move them just after the pool boundary
      // Remove player from current position first
      const [removedPlayer] = updatedQueue.splice(playerCurrentIndex, 1);
      removedPlayer.isResting = true;
      
      // Now find the pool boundary on the remaining queue
      let activeCount = 0;
      let poolBoundaryIndex = -1;
      for (let i = 0; i < updatedQueue.length; i++) {
        if (!updatedQueue[i].isResting) {
          activeCount++;
          if (activeCount === playerPoolSize) {
            poolBoundaryIndex = i;
            break;
          }
        }
      }
      
      // Insert just after the pool boundary
      const insertIndex = poolBoundaryIndex >= 0 ? poolBoundaryIndex + 1 : 0;
      updatedQueue.splice(insertIndex, 0, removedPlayer);
    } else {
      // Just toggle rest status without moving (for players outside pool or unresting)
      updatedQueue = updatedQueue.map(player => 
        player.id === playerId 
          ? { ...player, isResting: !player.isResting }
          : player
      );
    }
    
    // Update local state
    setQueue(updatedQueue);
    
    // Sync back to the queue hook to ensure consistency
    syncQueue(updatedQueue);
  };

  const value: DashboardContextType = {
    // Player queue
    queue: queueState,
    addPlayerToQueue,
    removePlayerFromQueue,
    togglePlayerRest,
    updateActivePlayerInfo,

    // Next game
    nextGamePlayers: nextGamePlayersState,
    generateNextGame,
    clearNextGame,
    isNextGameReady,

    // Courts
    sortedCourts: courtsState,
    assignToFreeCourt,
    handleEndGameClick,
    voidCourtAssignment,
    canVoidCourt,

    // Game management
    handlePlayerSelect,
    endGameDialogOpen,
    currentCourtPlayers,
    setEndGameDialogOpen,
    finishEndGame,

    // Piggyback pairs - map to expected interface names
    piggybackPairs,
    addPiggybackPair: addPair,
    removePiggybackPair: removePairByMaster,
    findPiggybackPair: findPairOf,
    clearPiggybackPairs: clearAllPairs
  };

  return (
    <DashboardProviderComponent value={value}>
      {children}
    </DashboardProviderComponent>
  );
}

// Simple provider component that just passes the value
function DashboardProviderComponent({ children, value }: DashboardProviderProps) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// We need to import the context here to avoid circular dependencies
import { DashboardContext } from "./context";