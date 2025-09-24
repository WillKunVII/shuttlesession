
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
    
    // Filter out resting players first
    const activeQueue = queue.filter(player => !player.isResting);
    
    console.log("Auto-select: Starting with", activeQueue.length, "active players");
    console.log("Auto-select: Piggyback pairs:", piggybackPairs);

    // Apply fair piggyback positioning and create pool
    const poolPlayers = getFairPiggybackPool(activeQueue, piggybackPairs, poolSize);
    
    console.log("Auto-select: Fair pool size:", poolPlayers.length);

    // Use the enhanced selection logic with piggyback awareness
    const selectedPlayers = await findBestCombination(poolPlayers, piggybackPairs);

    if (selectedPlayers.length === 4) {
      console.log("Auto-select: Successfully selected 4 players:", selectedPlayers.map(p => p.name));
      return selectedPlayers;
    }

    console.log("Auto-select: Failed to find valid combination");
    return [];
  };

  return { autoSelectPlayers };
}

/**
 * Gets fair pool positioning for piggyback pairs
 * Both players in a pair are positioned at the lower player's queue position
 */
function getFairPiggybackPool(activeQueue: Player[], piggybackPairs: PiggybackPair[], poolSize: number): Player[] {
  if (piggybackPairs.length === 0) {
    return activeQueue.slice(0, Math.min(poolSize, activeQueue.length));
  }

  // Calculate effective positions for all players
  const playerPositions = new Map<number, number>();
  
  activeQueue.forEach((player, index) => {
    const pair = piggybackPairs.find(p => p.master === player.id || p.partner === player.id);
    
    if (pair) {
      // Find both players in the pair
      const masterIndex = activeQueue.findIndex(p => p.id === pair.master);
      const partnerIndex = activeQueue.findIndex(p => p.id === pair.partner);
      
      if (masterIndex !== -1 && partnerIndex !== -1) {
        // Both players get positioned at the lower (higher index) position
        const effectivePosition = Math.max(masterIndex, partnerIndex);
        playerPositions.set(pair.master, effectivePosition);
        playerPositions.set(pair.partner, effectivePosition);
      } else {
        // If partner not found, use original position
        playerPositions.set(player.id, index);
      }
    } else {
      // Non-piggybacked player keeps original position
      playerPositions.set(player.id, index);
    }
  });

  // Sort players by their effective positions
  const sortedPlayers = [...activeQueue].sort((a, b) => {
    const posA = playerPositions.get(a.id) ?? activeQueue.findIndex(p => p.id === a.id);
    const posB = playerPositions.get(b.id) ?? activeQueue.findIndex(p => p.id === b.id);
    return posA - posB;
  });

  // Apply pool size limit to fairly positioned players
  return sortedPlayers.slice(0, Math.min(poolSize, sortedPlayers.length));
}
