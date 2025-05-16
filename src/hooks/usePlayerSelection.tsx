
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
    
    // Make sure we're working with a fresh copy of the queue
    const poolPlayers = [...queue].slice(0, Math.min(poolSize, queue.length));
    
    if (poolPlayers.length >= count) {
      if (!prefEnabled) {
        // If preferences are not enabled, just select the top players
        return poolPlayers.slice(0, count);
      } else {
        // Try to find a valid game based on preferences
        
        // First attempt: look for a Mixed game
        const mixedMales = poolPlayers.filter(p => 
          p.gender === "male" && 
          (p.playPreferences?.includes("Mixed") || !p.playPreferences || p.playPreferences.length === 0)
        );
        
        const mixedFemales = poolPlayers.filter(p => 
          p.gender === "female" && 
          (p.playPreferences?.includes("Mixed") || !p.playPreferences || p.playPreferences.length === 0)
        );
        
        if (mixedMales.length >= 2 && mixedFemales.length >= 2) {
          return [...mixedMales.slice(0, 2), ...mixedFemales.slice(0, 2)];
        }
        
        // Second attempt: look for a Ladies game
        const ladiesPlayers = poolPlayers.filter(
          p => p.gender === "female" && 
          (p.playPreferences?.includes("Ladies") || !p.playPreferences || p.playPreferences.length === 0)
        );
        
        if (ladiesPlayers.length >= 4) {
          return ladiesPlayers.slice(0, 4);
        }
        
        // Third attempt: look for an Open game
        // Only include players who either explicitly want Open games or have no preferences
        const openPlayers = poolPlayers.filter(p => 
          p.playPreferences?.includes("Open") || 
          !p.playPreferences || 
          p.playPreferences.length === 0
        );
        
        if (openPlayers.length >= 4) {
          return openPlayers.slice(0, 4);
        }
        
        // If we couldn't find a valid game with preferences, default to no selection
        return [];
      }
    }
    
    return [];
  };

  return { autoSelectPlayers };
}
