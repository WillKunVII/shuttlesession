import { useState } from "react";
import { Player } from "@/types/player";
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { useGameAssignment } from "@/hooks/useGameAssignment";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { getSessionScores } from "@/utils/storageUtils";
import { recordGame } from "@/utils/gameUtils";

export function useDashboardLogic() {
  // Use our custom hooks
  const {
    queue,
    addPlayerToQueue,
    removePlayerFromQueue,
    addPlayersToQueue,
    removePlayersFromQueue,
    autoSelectPlayers
  } = usePlayerQueue();
  
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
  const [queueUpdated, setQueueUpdated] = useState(0); // Counter to track queue updates

  // Get sorted courts
  const sortedCourts = getSortedCourts();

  // Function to generate next game players (auto mode) - now async
  const generateNextGame = async () => {
    if (queue.length >= 4) {
      console.log("Attempting to auto-select players from queue:", queue);
      const selectedPlayers = await autoSelectPlayers(4);
      console.log("Auto-selected players:", selectedPlayers);
      if (selectedPlayers.length === 4) {
        setNextGame(selectedPlayers);
      }
    }
  };

  // Function to assign next game to a court
  const assignToFreeCourt = async (courtId: number) => {
    if (isNextGameReady()) {
      const success = assignPlayersToCourtById(courtId, nextGamePlayers);
      if (success) {
        // Record the game in IndexedDB
        await recordGame(nextGamePlayers);
        
        clearGamePlayers();
      }
    }
  };

  // Function to handle end game button click
  const handleEndGameClick = (courtId: number) => {
    const players = sortedCourts.find(court => court.id === courtId)?.players || [];
    if (players.length > 0) {
      // Check if score keeping is enabled
      const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") !== "false";
      if (isScoreKeepingEnabled) {
        // Open dialog to select winners
        setCurrentCourtPlayers({
          id: courtId,
          players
        });
        setEndGameDialogOpen(true);
      } else {
        // Just end the game normally without tracking scores
        finishEndGame(courtId, []);
      }
    }
  };

  // Function to finish ending the game and update records
  const finishEndGame = (courtId: number, winnerNames: string[]) => {
    const releasedPlayers = endGameOnCourt(courtId);
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

      // Add players back to the queue with proper properties
      const playerObjects: Player[] = releasedPlayers.map((player, idx) => {
        // Find matching member to get their ID and record
        const matchingMember = members.find(m => m.name === player.name);
        const playerId = matchingMember?.id || Date.now() + idx;

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
      
      // Force refresh our queue state after players are added back
      setQueueUpdated(prev => prev + 1);
    }

    // Close dialog if it was open
    setEndGameDialogOpen(false);
  };

  // Handle player selection for next game
  const handlePlayerSelect = (selectedPlayers: Player[]) => {
    if (selectedPlayers.length === 4) {
      setNextGame(selectedPlayers);

      // Remove selected players from queue
      const playerIds = selectedPlayers.map(p => p.id);
      removePlayersFromQueue(playerIds);
    }
  };

  // Clear next game and return players to queue
  const clearNextGame = () => {
    // Put players back in the queue in their original positions
    const players = clearGamePlayers();
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
  };
}
