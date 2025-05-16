
import { Player } from "../types/player";
import { canFormValidGame, determineBestGameType, getPlayerPoolSize } from "../utils/gameUtils";

/**
 * Hook containing logic for selecting players from the queue
 */
export function usePlayerSelection(queue: Player[]) {
  /**
   * Auto selects top players from the queue based on player pool size and preferences
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
        // If preferences are enabled, try to find a valid game with more focus on top players' preferences
        
        // First approach: Start with the highest priority players
        // Take the top player and try to build a game around them
        const topPlayer = poolPlayers[0];
        const topPlayerPrefs = topPlayer?.playPreferences || [];
        
        // Try each game type in preferential order
        const gameTypesToTry = topPlayerPrefs.length > 0 
          ? [...topPlayerPrefs, "Mixed", "Ladies", "Open"] // Try top player's preferences first, then default order
          : ["Mixed", "Ladies", "Open"]; // Default priority if top player has no preferences
          
        // Remove duplicates from the gameTypesToTry array
        const uniqueGameTypes = [...new Set(gameTypesToTry)];
                
        for (const gameType of uniqueGameTypes) {
          let candidatePlayers: Player[] = [];
          
          if (gameType === "Mixed") {
            // For mixed games, we need 2 males and 2 females who accept Mixed games
            const eligibleMales = poolPlayers.filter(p => 
              p.gender === "male" && 
              (!p.playPreferences?.length || p.playPreferences.includes("Mixed"))
            );
            
            const eligibleFemales = poolPlayers.filter(p => 
              p.gender === "female" && 
              (!p.playPreferences?.length || p.playPreferences.includes("Mixed"))
            );
            
            if (eligibleMales.length >= 2 && eligibleFemales.length >= 2) {
              candidatePlayers = [
                ...eligibleMales.slice(0, 2),
                ...eligibleFemales.slice(0, 2)
              ];
            }
          } else if (gameType === "Ladies") {
            // For ladies games, we need 4 females who accept Ladies games
            const eligibleFemales = poolPlayers.filter(p => 
              p.gender === "female" && 
              (!p.playPreferences?.length || p.playPreferences.includes("Ladies"))
            );
            
            if (eligibleFemales.length >= 4) {
              candidatePlayers = eligibleFemales.slice(0, 4);
            }
          } else if (gameType === "Open") {
            // For open games, we need 4 players who accept Open games
            const eligiblePlayers = poolPlayers.filter(p => 
              !p.playPreferences?.length || p.playPreferences.includes("Open")
            );
            
            if (eligiblePlayers.length >= 4) {
              candidatePlayers = eligiblePlayers.slice(0, 4);
            }
          }
          
          // If we found candidates, verify they make a valid game
          if (candidatePlayers.length === 4 && canFormValidGame(candidatePlayers)) {
            // Ensure the top player is included
            if (candidatePlayers.some(p => p.id === topPlayer.id)) {
              return candidatePlayers;
            } else {
              // If top player isn't included, try to add them
              if (gameType === "Mixed") {
                // For Mixed, replace a player of the same gender
                const sameGenderIndex = candidatePlayers.findIndex(p => p.gender === topPlayer.gender);
                if (sameGenderIndex !== -1) {
                  candidatePlayers[sameGenderIndex] = topPlayer;
                  return canFormValidGame(candidatePlayers) ? candidatePlayers : [];
                }
              } else {
                // For Open or Ladies, just replace the last player
                candidatePlayers[3] = topPlayer;
                return canFormValidGame(candidatePlayers) ? candidatePlayers : [];
              }
            }
          }
        }
        
        // If we couldn't form a game with strict preferences, try one more approach:
        // Take the top 4 players and check if they can form any valid game
        const topFourPlayers = poolPlayers.slice(0, 4);
        const bestGameType = determineBestGameType(topFourPlayers);
        
        if (bestGameType) {
          return topFourPlayers;
        }
        
        // If we still couldn't form a valid game, return empty array
        return [];
      }
    }
    
    return [];
  };

  return { autoSelectPlayers };
}
