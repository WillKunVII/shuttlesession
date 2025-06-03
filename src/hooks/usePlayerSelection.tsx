
import { Player } from "../types/player";
import { canFormValidGame, determineBestGameType, getPlayerPoolSize, findBestCombination } from "../utils/gameUtils";

/**
 * Hook containing logic for selecting players from the queue
 */
export function usePlayerSelection(queue: Player[]) {
  /**
   * Auto selects top players from the queue based on player pool size and preferences
   * Now prioritizes avoiding repeat games and minimizing player combinations that have played together
   */
  const autoSelectPlayers = (count: number = 4): Player[] => {
    // Check if player preferences are enabled
    const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
    
    // Get player pool size from settings
    const poolSize = getPlayerPoolSize();
    
    // Make sure we're working with a fresh copy of the queue
    const poolPlayers = [...queue].slice(0, Math.min(poolSize, queue.length));
    
    if (poolPlayers.length < count) {
      console.log("Not enough players in pool for auto-selection");
      return [];
    }
    
    if (!prefEnabled) {
      // If preferences are not enabled, use the new combination logic
      console.log("Preferences disabled, using combination logic for best selection");
      return findBestCombination(poolPlayers);
    } else {
      // If preferences are enabled, use the enhanced logic
      console.log("Preferences enabled, using enhanced selection logic");
      
      // Use the new combination-based approach that considers both preferences and history
      const bestCombination = findBestCombination(poolPlayers);
      
      if (bestCombination.length === 4) {
        console.log("Selected players:", bestCombination.map(p => p.name));
        return bestCombination;
      }
      
      // Fallback: if no valid combination found with the new logic, try simple approach
      console.log("No valid combination found with enhanced logic, trying fallback");
      const topFourPlayers = poolPlayers.slice(0, 4);
      const bestGameType = determineBestGameType(topFourPlayers);
      
      if (bestGameType) {
        console.log("Fallback succeeded with top 4 players");
        return topFourPlayers;
      }
      
      console.log("No valid game possible with current pool");
      return [];
    }
  };

  return { autoSelectPlayers };
}
