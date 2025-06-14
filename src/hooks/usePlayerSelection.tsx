import { Player } from "../types/player";
import { canFormValidGame, determineBestGameType, getPlayerPoolSize, findBestCombination } from "../utils/gameUtils";

// New option to accept a piggyback pair
type UsePlayerSelectionOptions = {
  piggybackPair?: number[];
};

/**
 * Hook containing logic for selecting players from the queue
 */
export function usePlayerSelection(queue: Player[], options?: UsePlayerSelectionOptions) {
  /**
   * Auto selects top players from the queue based on player pool size and piggyback pair.
   */
  const autoSelectPlayers = async (count: number = 4): Promise<Player[]> => {
    // Check for piggyback
    const piggybackPair = options?.piggybackPair ?? [];
    if (piggybackPair.length === 2) {
      // Try to form a group starting with these two players
      const poolSize = getPlayerPoolSize();
      const poolPlayers = [...queue].slice(0, Math.min(poolSize, queue.length));
      const [p1, p2] = piggybackPair.map(id => poolPlayers.find(p => p.id === id)).filter(Boolean) as Player[];
      if (p1 && p2) {
        // Get gender pattern and preferred game type
        let targetType: "Ladies" | "Mixed" | "Open" = "Open";
        if (p1.gender === "female" && p2.gender === "female") targetType = "Ladies";
        else if (p1.gender === "male" && p2.gender === "male") targetType = "Open"; // Could further specialize if desired
        else targetType = "Mixed";
        // Try to find valid combinations including both piggyback players and compatible with the type
        const candidates = poolPlayers.filter(p => p.id !== p1.id && p.id !== p2.id);
        // Try every combination of two not-in-pair
        for (let i = 0; i < candidates.length - 1; i++) {
          for (let j = i + 1; j < candidates.length; j++) {
            const combo = [p1, p2, candidates[i], candidates[j]];
            // Optionally, validate for the target type/gender
            const maleCount = combo.filter(p => p.gender === "male").length;
            const femaleCount = combo.filter(p => p.gender === "female").length;
            if (
              (targetType === "Ladies" && femaleCount === 4) ||
              (targetType === "Mixed" && maleCount === 2 && femaleCount === 2) ||
              (targetType === "Open")
            ) {
              if (canFormValidGame(combo)) {
                // Found a valid combo for piggyback
                return combo;
              }
            }
          }
        }
        // If no strict gender match, fallback to any valid 4 including both
        for (let i = 0; i < candidates.length - 1; i++) {
          for (let j = i + 1; j < candidates.length; j++) {
            const combo = [p1, p2, candidates[i], candidates[j]];
            if (canFormValidGame(combo)) {
              return combo;
            }
          }
        }
        // No combo found, return empty (or optionally fallback to normal)
        return [];
      }
    }
    // Fallback: normal logic
    // Check if player preferences are enabled
    const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
    const poolSize = getPlayerPoolSize();
    const poolPlayers = [...queue].slice(0, Math.min(poolSize, queue.length));
    if (poolPlayers.length < count) {
      console.log("Not enough players in pool for auto-selection");
      return [];
    }
    if (!prefEnabled) {
      // If preferences are not enabled, use the new combination logic
      console.log("Preferences disabled, using combination logic for best selection");
      return await findBestCombination(poolPlayers);
    } else {
      // If preferences are enabled, use the enhanced logic
      console.log("Preferences enabled, using enhanced selection logic");
      
      // Use the new combination-based approach that considers both preferences and history
      const bestCombination = await findBestCombination(poolPlayers);
      
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
