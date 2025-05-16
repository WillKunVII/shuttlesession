
import { useCallback } from "react";
import { useGameAssignment } from "@/hooks/useGameAssignment";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { Player } from "@/types/playerTypes";
import { toast } from "sonner";

export function usePlayerSelection() {
  const { setNextGame, clearNextGame } = useGameAssignment();
  const { 
    removePlayersFromQueue, 
    returnPlayersToOriginalPositions, 
    autoSelectPlayers, 
    queue 
  } = usePlayerQueue();

  // Handle player selection for next game
  const handlePlayerSelect = useCallback((selectedPlayers: Player[]) => {
    if (selectedPlayers.length === 4) {
      console.log("Selecting players for next game:", selectedPlayers);
      setNextGame(selectedPlayers);

      // Remove selected players from queue
      const playerIds = selectedPlayers.map(p => p.id);
      removePlayersFromQueue(playerIds);
    } else {
      console.log("Not enough players selected:", selectedPlayers.length);
    }
  }, [setNextGame, removePlayersFromQueue]);
  
  // Auto-select players from queue based on play history
  const generateNextGame = useCallback(() => {
    // Get current queue length - ensure it's using the latest state
    const currentQueueLength = queue.length;
    console.log(`Attempting to auto-select players from queue of length: ${currentQueueLength}`);
    
    if (!queue || currentQueueLength < 4) {
      toast.error(`Not enough players in queue (${currentQueueLength || 0}). Need at least 4.`);
      return false;
    }
    
    // Using the autoSelectPlayers function from usePlayerQueue
    const selectedPlayers = autoSelectPlayers(4);
    console.log("Auto-selected players:", selectedPlayers);
    
    if (selectedPlayers && selectedPlayers.length === 4) {
      // Set selected players as next game
      setNextGame(selectedPlayers);
      toast.success("Auto-selected players based on least played together");
      return true;
    } else {
      toast.error("Failed to select players for next game");
      return false;
    }
  }, [autoSelectPlayers, setNextGame, queue]);
  
  // Handle clearing the next game selection
  const handleClearNextGame = useCallback(() => {
    // Get the players from the next game before clearing it
    const playersToReturn = clearNextGame();
    console.log("Clearing next game, returning players:", playersToReturn);
    
    // Return players to their original positions in the queue
    returnPlayersToOriginalPositions(playersToReturn);
  }, [clearNextGame, returnPlayersToOriginalPositions]);

  return {
    handlePlayerSelect,
    handleClearNextGame,
    generateNextGame
  };
}
