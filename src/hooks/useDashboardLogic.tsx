import { useState, useCallback, useMemo } from "react";
import { Player } from "@/types/player";
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { useGameAssignment } from "@/hooks/useGameAssignment";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { getSessionScores } from "@/utils/storageUtils";
import { recordGame } from "@/utils/gameUtils";

// ADD PROPS: piggybackPair state and handlers
type PiggybackPair = { master: number; partner: number };

type DashboardLogicArgs = {
  piggybackPairs: PiggybackPair[];
  addPiggybackPair: (master: number, partner: number) => void;
  removePiggybackPair: (master: number) => void;
  findPiggybackPair: (playerId: number) => PiggybackPair | undefined;
};

export function useDashboardLogic({
  piggybackPairs,
  addPiggybackPair,
  removePiggybackPair,
  findPiggybackPair
}: DashboardLogicArgs) {
  // Use our custom hooks, NOW PASS piggybackPairs!
  const {
    queue,
    addPlayerToQueue,
    removePlayerFromQueue,
    addPlayersToQueue,
    removePlayersFromQueue,
    autoSelectPlayers
  } = usePlayerQueue({ piggybackPairs }); // pass as piggybackPairs

  const {
    nextGamePlayers,
    setNextGame,
    clearNextGame: clearGamePlayers,
    isNextGameReady
  } = useGameAssignment();

  const {
    getSortedCourts,
    assignPlayersToCourtById,
    endGameOnCourt
  } = useCourtManagement();

  // State for end game dialog
  const [endGameDialogOpen, setEndGameDialogOpen] = useState(false);
  const [currentCourtPlayers, setCurrentCourtPlayers] = useState<{
    id: number;
    players: any[];
  }>({
    id: 0,
    players: []
  });

  // Use getSortedCourts directly as it's already a memoized array, not a function
  const sortedCourts = getSortedCourts;

  // Optimized generate next game with performance monitoring
  const generateNextGame = useCallback(async () => {
    if (queue.length >= 4) {
      const startTime = Date.now();
      console.log("useDashboardLogic: Starting auto-select for", queue.length, "players");
      
      try {
        const selectedPlayers = await autoSelectPlayers(4);
        const endTime = Date.now();
        console.log(`useDashboardLogic: Auto-select completed in ${endTime - startTime}ms`);
        
        if (selectedPlayers.length === 4) {
          console.log("useDashboardLogic: Auto-selected players:", selectedPlayers.map(p => ({ id: p.id, name: p.name })));
          setNextGame(selectedPlayers);
        } else {
          console.log("useDashboardLogic: Auto-select failed to find 4 valid players");
        }
      } catch (error) {
        console.error("useDashboardLogic: Error during auto-select:", error);
      }
    }
  }, [queue.length, autoSelectPlayers, setNextGame]);

  // Optimized court assignment with better error handling
  const assignToFreeCourt = useCallback(async (courtId: number) => {
    if (!isNextGameReady() || nextGamePlayers.length !== 4) {
      console.error("useDashboardLogic: Cannot assign - next game not ready");
      return;
    }

    console.log("useDashboardLogic: Assigning to court", courtId);
    
    const success = assignPlayersToCourtById(courtId, nextGamePlayers);
    if (success) {
      try {
        // Record the game in IndexedDB (non-blocking)
        recordGame(nextGamePlayers).catch(error => {
          console.error("useDashboardLogic: Error recording game:", error);
        });
        
        // Clear next game immediately for better UX
        clearGamePlayers();
        console.log("useDashboardLogic: Successfully assigned and cleared next game");
      } catch (error) {
        console.error("useDashboardLogic: Error in assignment flow:", error);
        clearGamePlayers(); // Still clear even if recording fails
      }
    } else {
      console.error("useDashboardLogic: Failed to assign players to court", courtId);
    }
  }, [isNextGameReady, nextGamePlayers, assignPlayersToCourtById, clearGamePlayers]);

  // Optimized end game click handler
  const handleEndGameClick = useCallback((courtId: number) => {
    const court = sortedCourts.find(court => court.id === courtId);
    const players = court?.players || [];
    
    console.log("useDashboardLogic: End game for court", courtId);
    
    if (players.length === 0) {
      console.error("useDashboardLogic: No players found on court", courtId);
      return;
    }

    const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") !== "false";
    if (isScoreKeepingEnabled) {
      setCurrentCourtPlayers({ id: courtId, players });
      setEndGameDialogOpen(true);
    } else {
      finishEndGame(courtId, []);
    }
  }, [sortedCourts]);

  // Optimized finish end game with batched operations
  const finishEndGame = useCallback((courtId: number, winnerNames: string[]) => {
    console.log("useDashboardLogic: Finishing end game for court", courtId);
    
    const releasedPlayers = endGameOnCourt(courtId);
    if (releasedPlayers.length === 0) {
      console.error("useDashboardLogic: No players released from court");
      setEndGameDialogOpen(false);
      return;
    }

    console.log("useDashboardLogic: Released players:", releasedPlayers.map(p => ({ id: p.id, name: p.name })));

    // Batch localStorage operations for better performance
    let members: any[] = [];
    const savedMembers = localStorage.getItem("members");
    if (savedMembers) {
      try {
        members = JSON.parse(savedMembers);
      } catch (e) {
        console.error("Error parsing members", e);
      }
    }

    const sessionScores = getSessionScores();

    // Create player objects with optimized member lookups
    const playerObjects: Player[] = releasedPlayers.map((player) => {
      const matchingMember = members.find(m => m.name === player.name);
      const playerId = player.id || matchingMember?.id || Date.now();
      const playerSessionScore = sessionScores[player.name] || { wins: 0, losses: 0 };
      
      return {
        id: playerId,
        name: player.name,
        gender: player.gender as "male" | "female",
        waitingTime: 0,
        isGuest: player.isGuest,
        wins: matchingMember?.wins || 0,
        losses: matchingMember?.losses || 0,
        sessionWins: playerSessionScore.wins,
        sessionLosses: playerSessionScore.losses
      };
    });
    
    // Add players back to queue
    addPlayersToQueue(playerObjects, false, winnerNames);
    setEndGameDialogOpen(false);
  }, [endGameOnCourt, addPlayersToQueue]);

  // Optimized player selection handler
  const handlePlayerSelect = useCallback((selectedPlayers: Player[]) => {
    if (selectedPlayers.length !== 4) {
      console.error("useDashboardLogic: Invalid selection, need 4 players");
      return;
    }

    console.log("useDashboardLogic: Manual player selection:", selectedPlayers.map(p => ({ id: p.id, name: p.name })));
    
    setNextGame(selectedPlayers);
    const playerIds = selectedPlayers.map(p => p.id);
    removePlayersFromQueue(playerIds);
  }, [setNextGame, removePlayersFromQueue]);

  // Optimized clear next game
  const clearNextGame = useCallback(() => {
    console.log("useDashboardLogic: Clearing next game");
    const players = clearGamePlayers();
    if (players.length > 0) {
      addPlayersToQueue(players, true); // Return to original positions
    }
  }, [clearGamePlayers, addPlayersToQueue]);

  return {
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
    piggybackPairs,
    addPiggybackPair,
    removePiggybackPair,
    findPiggybackPair,
  };
}
