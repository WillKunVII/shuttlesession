
import { Player } from "../types/player";
import { canFormValidGame, determineBestGameType, getPlayerPoolSize } from "../utils/gameUtils";
import { findBestCombination } from "../utils/gameSelection";
import { PiggybackPair } from "./usePiggybackPairs";

type UsePlayerSelectionOptions = {
  piggybackPairs?: PiggybackPair[];
};

export function usePlayerSelection(queue: Player[], options?: UsePlayerSelectionOptions) {
  const autoSelectPlayers = async (count: number = 4): Promise<Player[]> => {
    const piggybackPairs = options?.piggybackPairs || [];
    const poolSize = getPlayerPoolSize();
    
    // Filter out resting players first, then apply pool size limit
    const activeQueue = queue.filter(player => !player.isResting);
    let poolPlayers = [...activeQueue].slice(0, Math.min(poolSize, activeQueue.length));

    console.log("Auto-select: Starting with pool of", poolPlayers.length, "active players");
    console.log("Auto-select: Piggyback pairs:", piggybackPairs);

    // Handle piggyback pairs - if #1 player is in a pair, include their partner
    if (piggybackPairs.length > 0 && poolPlayers.length > 0) {
      const anchorPlayer = poolPlayers[0];
      const anchorPair = piggybackPairs.find(p => p.master === anchorPlayer.id || p.partner === anchorPlayer.id);
      
      if (anchorPair) {
        console.log("Auto-select: Anchor player is in piggyback pair");
        const partnerId = anchorPair.master === anchorPlayer.id ? anchorPair.partner : anchorPair.master;
        const partner = poolPlayers.find(p => p.id === partnerId);
        
        if (partner) {
          // Ensure both piggyback players are at the start of the pool
          poolPlayers = poolPlayers.filter(p => p.id !== partnerId);
          poolPlayers = [anchorPlayer, partner, ...poolPlayers.slice(1)];
          console.log("Auto-select: Rearranged pool to include piggyback pair at front");
        }
      }
    }

    // Use the new selection logic that prioritizes #1 player
    const selectedPlayers = await findBestCombination(poolPlayers);

    if (selectedPlayers.length === 4) {
      console.log("Auto-select: Successfully selected 4 players:", selectedPlayers.map(p => p.name));
      return selectedPlayers;
    }

    console.log("Auto-select: Failed to find valid combination");
    return [];
  };

  return { autoSelectPlayers };
}
