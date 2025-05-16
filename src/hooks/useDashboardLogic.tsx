
import { useState } from "react";
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { useGameAssignment } from "@/hooks/useGameAssignment";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { toast } from "sonner";
import { Player } from "@/types/playerTypes";

export function useDashboardLogic() {
  // Use our custom hooks
  const {
    queue,
    addPlayerToQueue,
    removePlayerFromQueue,
    addPlayersToQueue,
    removePlayersFromQueue,
    autoSelectPlayers,
    returnPlayersToOriginalPositions
  } = usePlayerQueue();
  
  const {
    nextGamePlayers,
    setNextGame,
    clearNextGame,
    isNextGameReady
  } = useGameAssignment();
  
  const {
    getSortedCourts,
    assignPlayersToCourtById,
    endGameOnCourt
  } = useCourtManagement();

  // Function to generate next game players (auto mode)
  const generateNextGame = () => {
    // Only attempt to generate a next game if there isn't one already
    if (nextGamePlayers.length === 0 && queue.length >= 4) {
      const selectedPlayers = autoSelectPlayers(4);
      if (selectedPlayers.length === 4) {
        setNextGame(selectedPlayers);
        toast("Auto-selected players based on least played together");
      }
    }
  };

  // Function to assign next game to a court
  const assignToFreeCourt = (courtId: number) => {
    if (isNextGameReady()) {
      // Make sure we're passing the actual player objects, not just IDs
      const success = assignPlayersToCourtById(courtId, [...nextGamePlayers]);
      if (success) {
        toast.success(`Game assigned to court ${courtId}`);
        clearNextGame();
      } else {
        toast.error("Failed to assign game to court");
      }
    } else {
      toast.error("No game ready to assign");
    }
  };

  // Function to handle end game button click
  const handleEndGameClick = (courtId: number) => {
    const sortedCourts = getSortedCourts();
    const players = sortedCourts.find(court => court.id === courtId)?.players || [];
    
    if (players.length > 0) {
      // Check if score keeping is enabled
      const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") === "true";
      
      if (isScoreKeepingEnabled) {
        // Return the players to be handled by the GameEndingManager
        return { courtId, players };
      } else {
        // Just end the game normally without tracking scores
        finishEndGame(courtId, []);
      }
    }
    
    return { courtId: 0, players: [] };
  };

  // Function to finish ending the game and update records
  const finishEndGame = (courtId: number, winnerNames: string[]) => {
    const releasedPlayers = endGameOnCourt(courtId);
    if (releasedPlayers.length > 0) {
      // Get all members to update win/loss records
      const savedMembers = localStorage.getItem("clubMembers");
      let members: any[] = [];
      if (savedMembers) {
        try {
          members = JSON.parse(savedMembers);
        } catch (e) {
          console.error("Error parsing members from localStorage", e);
        }
      }

      // Add players back to the queue with proper properties and update win/loss records
      const playerObjects: Player[] = releasedPlayers.map((player) => {
        // Find matching member to get their ID and record
        const matchingMember = members.find(m => m.name === player.name);
        const nanoid = window.crypto.randomUUID(); // Using built-in UUID as fallback

        // Update win/loss record if score keeping is enabled
        if (winnerNames.length === 2 && localStorage.getItem("scoreKeeping") === "true") {
          const isWinner = winnerNames.includes(player.name);

          // Update member record if it exists
          if (matchingMember) {
            if (isWinner) {
              matchingMember.wins = (matchingMember.wins || 0) + 1;
            } else {
              matchingMember.losses = (matchingMember.losses || 0) + 1;
            }
          }
          return {
            id: nanoid,
            name: player.name,
            gender: player.gender as "male" | "female",
            waitingTime: 0,
            isGuest: player.isGuest,
            wins: matchingMember?.wins || 0,
            losses: matchingMember?.losses || 0
          };
        }
        return {
          id: nanoid,
          name: player.name,
          gender: player.gender as "male" | "female",
          waitingTime: 0,
          isGuest: player.isGuest,
          wins: matchingMember?.wins || 0,
          losses: matchingMember?.losses || 0
        };
      });

      // Save updated member records
      if (winnerNames.length === 2 && localStorage.getItem("scoreKeeping") === "true") {
        localStorage.setItem("clubMembers", JSON.stringify(members));
      }
      addPlayersToQueue(playerObjects);
    }
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
  
  // Handle clearing the next game selection
  const handleClearNextGame = () => {
    // Get the players from the next game before clearing it
    const playersToReturn = clearNextGame();
    
    // Return players to their original positions in the queue
    returnPlayersToOriginalPositions(playersToReturn);
  };

  return {
    queue,
    nextGamePlayers,
    getSortedCourts,
    isNextGameReady,
    addPlayerToQueue,
    removePlayerFromQueue,
    generateNextGame,
    assignToFreeCourt,
    handleEndGameClick,
    finishEndGame,
    handlePlayerSelect,
    handleClearNextGame,
  };
}
