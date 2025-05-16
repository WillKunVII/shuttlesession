import { useCallback } from "react";
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { toast } from "sonner";
import { Player } from "@/types/playerTypes";

export function useGameEnding() {
  const { endGameOnCourt, getSortedCourts } = useCourtManagement();
  const { addPlayersToQueue } = usePlayerQueue();

  // Function to handle end game button click
  const handleEndGameClick = useCallback((courtId: number) => {
    console.log("End game clicked for court:", courtId);
    const sortedCourts = getSortedCourts();
    const court = sortedCourts.find(court => court.id === courtId);
    const players = court?.players || [];
    
    if (players.length > 0) {
      // Check if score keeping is enabled
      const isScoreKeepingEnabled = localStorage.getItem("scoreKeeping") === "true";
      
      if (isScoreKeepingEnabled) {
        // Return the court and players to be handled by the GameEndingManager
        return { courtId, players };
      } else {
        // Just end the game normally without tracking scores
        finishEndGame(courtId, []);
        return { courtId: 0, players: [] };
      }
    }
    
    return { courtId: 0, players: [] };
  }, [getSortedCourts]);

  // Function to finish ending the game and update records
  const finishEndGame = useCallback((courtId: number, winnerNames: string[]) => {
    console.log("Finishing game end for court:", courtId, "Winners:", winnerNames);
    const releasedPlayers = endGameOnCourt(courtId);
    console.log("Released players:", releasedPlayers);
    
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
        localStorage.setItem("members", JSON.stringify(members));
      }
      
      // Add players to the end of the queue
      console.log("Adding players back to queue:", playerObjects);
      addPlayersToQueue(playerObjects);
      
      toast.success(`Game ended on Court ${courtId}`);
    }
  }, [endGameOnCourt, addPlayersToQueue]);

  return {
    handleEndGameClick,
    finishEndGame
  };
}
