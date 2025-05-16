
import { useCallback } from "react";
import { useGameAssignment } from "@/hooks/useGameAssignment";
import { usePlayerQueue } from "@/hooks/usePlayerQueue";
import { Player } from "@/types/playerTypes";

export function usePlayerSelection() {
  const { setNextGame, clearNextGame } = useGameAssignment();
  const { removePlayersFromQueue, returnPlayersToOriginalPositions, autoSelectPlayers } = usePlayerQueue();

  // Handle player selection for next game
  const handlePlayerSelect = useCallback((selectedPlayers: Player[]) => {
    if (selectedPlayers.length === 4) {
      setNextGame(selectedPlayers);

      // Remove selected players from queue
      const playerIds = selectedPlayers.map(p => p.id);
      removePlayersFromQueue(playerIds);
    }
  }, [setNextGame, removePlayersFromQueue]);
  
  // Auto-select players from queue based on play history
  const generateNextGame = useCallback(() => {
    const selectedPlayers = autoSelectPlayers(4);
    if (selectedPlayers.length === 4) {
      // Set selected players as next game
      setNextGame(selectedPlayers);
      return true;
    }
    return false;
  }, [autoSelectPlayers, setNextGame]);
  
  // Handle clearing the next game selection
  const handleClearNextGame = useCallback(() => {
    // Get the players from the next game before clearing it
    const playersToReturn = clearNextGame();
    
    // Return players to their original positions in the queue
    returnPlayersToOriginalPositions(playersToReturn);
  }, [clearNextGame, returnPlayersToOriginalPositions]);

  return {
    handlePlayerSelect,
    handleClearNextGame,
    generateNextGame
  };
}
