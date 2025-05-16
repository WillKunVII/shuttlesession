
import { Player } from "../types/player";
import { getPlayerPoolSize } from "../utils/gameUtils";

/**
 * Hook containing logic for selecting players from the queue
 */
export function usePlayerSelection(queue: Player[]) {
  /**
   * Auto selects top players from the queue based on player pool size
   */
  const autoSelectPlayers = (count: number = 4): Player[] => {
    // Check if player preferences are enabled
    const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
    
    // Get player pool size from settings
    const poolSize = getPlayerPoolSize();
    const poolPlayers = queue.slice(0, Math.min(poolSize, queue.length));
    
    if (poolPlayers.length >= count) {
      if (!prefEnabled) {
        // If preferences are not enabled, just select the top players
        return poolPlayers.slice(0, count);
      } else {
        // Try to find a valid game based on preferences
        // First attempt: look for a Mixed game
        const males = poolPlayers.filter(p => p.gender === "male" && (p.playPreferences?.includes("Mixed") || p.playPreferences?.length === 0));
        const females = poolPlayers.filter(p => p.gender === "female" && (p.playPreferences?.includes("Mixed") || p.playPreferences?.length === 0));
        
        if (males.length >= 2 && females.length >= 2) {
          return [...males.slice(0, 2), ...females.slice(0, 2)];
        }
        
        // Second attempt: look for a Ladies game
        const ladiesPlayers = poolPlayers.filter(
          p => p.gender === "female" && (p.playPreferences?.includes("Ladies") || p.playPreferences?.length === 0)
        );
        
        if (ladiesPlayers.length >= 4) {
          return ladiesPlayers.slice(0, 4);
        }
        
        // Third attempt: look for an Open game
        const openPlayers = poolPlayers.filter(
          p => p.playPreferences?.includes("Open") || p.playPreferences?.length === 0
        );
        
        if (openPlayers.length >= 4) {
          return openPlayers.slice(0, 4);
        }
      }
    }
    
    return [];
  };

  return { autoSelectPlayers };
}
