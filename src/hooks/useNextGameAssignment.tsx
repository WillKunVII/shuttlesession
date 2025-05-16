
import { useCallback } from "react";
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { useGameAssignment } from "@/hooks/useGameAssignment";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { toast } from "sonner";

export function useNextGameAssignment() {
  const { assignPlayersToCourtById } = useCourtManagement();
  const { nextGamePlayers, clearNextGame, isNextGameReady, setNextGame } = useGameAssignment();
  const { queue, autoSelectPlayers } = usePlayerQueue();

  // Function to generate next game players (auto mode)
  const generateNextGame = useCallback(() => {
    // Only attempt to generate a next game if there isn't one already
    if (nextGamePlayers.length === 0 && queue.length >= 4) {
      const selectedPlayers = autoSelectPlayers(4);
      if (selectedPlayers.length === 4) {
        setNextGame(selectedPlayers);
        toast.success("Auto-selected players based on least played together");
      }
    }
  }, [nextGamePlayers.length, queue.length, autoSelectPlayers, setNextGame]);

  // Function to assign next game to a court
  const assignToFreeCourt = useCallback((courtId: number) => {
    if (isNextGameReady()) {
      // Log before assignment to verify data
      console.log("Assigning players to court:", courtId);
      console.log("Players to assign:", nextGamePlayers);
      
      // Create a deep copy to prevent reference issues
      const playersToCourt = [...nextGamePlayers].map(player => ({...player}));
      
      // Attempt assignment
      const success = assignPlayersToCourtById(courtId, playersToCourt);
      
      if (success) {
        toast.success(`Game assigned to court ${courtId}`);
        clearNextGame();
      } else {
        toast.error("Failed to assign game to court");
      }
    } else {
      toast.error("No game ready to assign");
    }
  }, [nextGamePlayers, isNextGameReady, assignPlayersToCourtById, clearNextGame]);

  return {
    nextGamePlayers,
    isNextGameReady,
    generateNextGame,
    assignToFreeCourt
  };
}
