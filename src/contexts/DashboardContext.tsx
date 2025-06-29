
import React, { createContext, useContext, useState, useEffect } from "react";
import { Player } from "@/types/player";
import { PlayPreference } from "@/types/member";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
import { usePiggybackPairs } from "@/hooks/usePiggybackPairs";

interface DashboardContextType {
  // Player queue
  queue: Player[];
  addPlayerToQueue: (player: Omit<Player, "id" | "waitingTime">) => void;
  removePlayerFromQueue: (playerId: number) => void;
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

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Piggyback pairs state
  const {
    piggybackPairs,
    addPair,
    removePairByMaster,
    findPairOf,
    clearAllPairs
  } = usePiggybackPairs();

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
    isNextGameReady
  } = useDashboardLogic({
    piggybackPairs,
    addPiggybackPair: addPair,
    removePiggybackPair: removePairByMaster,
    findPiggybackPair: findPairOf
  });

  // State for managing active players
  const [nextGamePlayersState, setNextGamePlayers] = useState<Player[]>(nextGamePlayers);
  const [queueState, setQueue] = useState<Player[]>(queue);
  const [courtsState, setCourts] = useState<any[]>(sortedCourts);

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

  const value: DashboardContextType = {
    // Player queue
    queue: queueState,
    addPlayerToQueue,
    removePlayerFromQueue,
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
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
