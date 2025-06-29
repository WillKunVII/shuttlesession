import { useState } from "react";
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

  // Get sorted courts
  const sortedCourts = getSortedCourts();

  // Function to generate next game players (auto mode) - now async with better error handling
  const generateNextGame = async () => {
    if (queue.length >= 4) {
      console.log("useDashboardLogic: Attempting to auto-select players from queue:", queue.map(p => ({ id: p.id, name: p.name })));
      try {
        const selectedPlayers = await autoSelectPlayers(4);
        console.log("useDashboardLogic: Auto-selected players:", selectedPlayers.map(p => ({ id: p.id, name: p.name })));
        if (selectedPlayers.length === 4) {
          setNextGame(selectedPlayers);
        } else {
          console.log("useDashboardLogic: Auto-select failed to find 4 valid players");
        }
      } catch (error) {
        console.error("useDashboardLogic: Error during auto-select:", error);
      }
    }
  };

  // Function to assign next game to a court - improved with better state management
  const assignToFreeCourt = async (courtId: number) => {
    if (isNextGameReady() && nextGamePlayers.length === 4) {
      console.log("useDashboardLogic: Assigning next game to court", courtId, "players:", nextGamePlayers.map(p => ({ id: p.id, name: p.name })));
      
      const success = assignPlayersToCourtById(courtId, nextGamePlayers);
      if (success) {
        try {
          // Record the game in IndexedDB
          await recordGame(nextGamePlayers);
          console.log("useDashboardLogic: Successfully recorded game and assigned to court");
          
          // Clear next game only after successful assignment
          clearGamePlayers();
        } catch (error) {
          console.error("useDashboardLogic: Error recording game:", error);
          // Still clear the next game even if recording fails
          clearGamePlayers();
        }
      } else {
        console.error("useDashboardLogic: Failed to assign players to court", courtId);
      }
    } else {
      console.error("useDashboardLogic: Cannot assign - next game not ready or invalid player count");
    }
  };

  // Function to handle end game button click - improved logging
  const handleEndGameClick = (courtId: number) => {
    const court = sortedCourts.find(court => court.id === courtId);
    const players = court?.players || [];
    
    console.log("useDashboardLogic: End game clicked for court", courtId, "players:", players.map(p => ({ id: p.id, name: p.name })));
    
    if (players.length > 0) {
      // Check if score keeping is enabled
      const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") !== "false";
      if (isScoreKeepingEnabled) {
        // Open dialog to select winners - ensure we pass the actual court players with IDs
        setCurrentCourtPlayers({
          id: courtId,
          players: players // These should already have IDs from court assignment
        });
        setEndGameDialogOpen(true);
      } else {
        // Just end the game normally without tracking scores
        finishEndGame(courtId, []);
      }
    } else {
      console.error("useDashboardLogic: No players found on court", courtId);
    }
  };

  // Function to finish ending the game and update records - improved player handling
  const finishEndGame = (courtId: number, winnerNames: string[]) => {
    console.log("useDashboardLogic: Finishing end game for court", courtId, "winners:", winnerNames);
    
    const releasedPlayers = endGameOnCourt(courtId);
    console.log("useDashboardLogic: Released players from court:", releasedPlayers.map(p => ({ id: p.id, name: p.name })));
    
    if (releasedPlayers.length > 0) {
      // Get all members to update win/loss records
      const savedMembers = localStorage.getItem("members");
      let members: any[] = [];
      if (savedMembers) {
        try {
          members = JSON.parse(savedMembers);
        } catch (e) {
          console.error("Error parsing members from localStorage", e);
        }
      }

      // Get session scores
      const sessionScores = getSessionScores();

      // Add players back to the queue with proper properties - preserve IDs!
      const playerObjects: Player[] = releasedPlayers.map((player) => {
        // Find matching member to get their record
        const matchingMember = members.find(m => m.name === player.name);
        
        // Use the player's existing ID from the court (should be preserved)
        const playerId = player.id || matchingMember?.id || Date.now();
        
        console.log("useDashboardLogic: Creating player object for queue", { 
          originalId: player.id, 
          matchingMemberId: matchingMember?.id,
          finalId: playerId,
          name: player.name 
        });

        // Get the latest session scores for this player (already updated in EndGameDialog)
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
      
      // Add players back to the queue, with winners at the end but above losers
      addPlayersToQueue(playerObjects, false, winnerNames);
    }

    // Close dialog if it was open
    setEndGameDialogOpen(false);
  };

  // Handle player selection for next game - improved validation
  const handlePlayerSelect = (selectedPlayers: Player[]) => {
    console.log("useDashboardLogic: Player selection requested:", selectedPlayers.map(p => ({ id: p.id, name: p.name })));
    
    if (selectedPlayers.length === 4) {
      setNextGame(selectedPlayers);

      // Remove selected players from queue
      const playerIds = selectedPlayers.map(p => p.id);
      console.log("useDashboardLogic: Removing player IDs from queue:", playerIds);
      removePlayersFromQueue(playerIds);
    } else {
      console.error("useDashboardLogic: Invalid player selection - need exactly 4 players, got", selectedPlayers.length);
    }
  };

  // Clear next game and return players to queue - improved state management
  const clearNextGame = () => {
    console.log("useDashboardLogic: Clearing next game, returning players to queue");
    // Put players back in the queue in their original positions
    const players = clearGamePlayers();
    console.log("useDashboardLogic: Players to return to queue:", players.map(p => ({ id: p.id, name: p.name })));
    // Return to original positions when clearing selection
    addPlayersToQueue(players, true);
  };

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
