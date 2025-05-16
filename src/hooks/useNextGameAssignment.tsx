
import { useCallback } from "react";
import { useCourtManagement } from "@/hooks/useCourtManagement";
import { useGameAssignment } from "@/hooks/useGameAssignment";
import { toast } from "sonner";

export function useNextGameAssignment() {
  const { assignPlayersToCourtById } = useCourtManagement();
  const { nextGamePlayers, clearNextGame, isNextGameReady } = useGameAssignment();

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
    assignToFreeCourt
  };
}
