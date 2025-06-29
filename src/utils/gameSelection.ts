
import { Player } from "../types/player";
import { generateValidCombinations } from "./playerCombinations";
import { calculateRepeatPenalty } from "./gameHistory";
import { determineBestGameType } from "./gameValidation";

/**
 * Finds the best player combination always starting with the #1 player in queue
 * and using their preferences to drive game selection.
 */
export const findBestCombination = async (poolPlayers: Player[]): Promise<Player[]> => {
  if (poolPlayers.length < 4) return [];

  // Always start with player #1 (first in queue)
  const anchorPlayer = poolPlayers[0];
  console.log("Auto-select: Starting with anchor player #1:", anchorPlayer.name);

  // Get anchor player's preferences (prioritize Mixed > Ladies > Open)
  const anchorPrefs = anchorPlayer.playPreferences || [];
  const preferenceOrder = anchorPrefs.length > 0 ? anchorPrefs : ["Mixed", "Ladies", "Open"];
  
  console.log("Auto-select: Anchor player preferences:", preferenceOrder);

  // Try each preference in order
  for (const targetGameType of preferenceOrder) {
    console.log(`Auto-select: Trying to form ${targetGameType} game with anchor player`);
    
    const combination = await findCombinationForGameType(poolPlayers, anchorPlayer, targetGameType);
    if (combination.length === 4) {
      console.log(`Auto-select: Found ${targetGameType} game:`, combination.map(p => p.name));
      return combination;
    }
  }

  // If no preference-based combination worked, find any valid combination with anchor player
  console.log("Auto-select: Falling back to any valid game with anchor player");
  return await findAnyCombinationWithAnchor(poolPlayers, anchorPlayer);
};

/**
 * Checks if a player accepts a specific game type based on their preferences
 */
function playerAcceptsGameType(player: Player, gameType: string): boolean {
  const prefs = player.playPreferences || [];
  
  // If player has no preferences set, they accept all game types
  if (prefs.length === 0) return true;
  
  // If player has explicit preferences, they must include this game type
  return prefs.includes(gameType as any);
}

/**
 * Finds the best combination for a specific game type with the anchor player
 */
async function findCombinationForGameType(
  poolPlayers: Player[], 
  anchorPlayer: Player, 
  targetGameType: string
): Promise<Player[]> {
  // First, filter players who would accept this game type
  const eligiblePlayers = poolPlayers.filter(player => 
    playerAcceptsGameType(player, targetGameType)
  );
  
  console.log(`Auto-select: Found ${eligiblePlayers.length} players who accept ${targetGameType} games`);
  
  if (eligiblePlayers.length < 4) {
    console.log(`Auto-select: Not enough players accept ${targetGameType} games`);
    return [];
  }
  
  // Ensure anchor player is in the eligible list
  if (!eligiblePlayers.some(p => p.id === anchorPlayer.id)) {
    console.log(`Auto-select: Anchor player doesn't accept ${targetGameType} games`);
    return [];
  }
  
  const otherEligiblePlayers = eligiblePlayers.filter(p => p.id !== anchorPlayer.id);
  const combinations: Player[][] = [];

  // Generate all possible 3-player combinations from remaining eligible players
  for (let i = 0; i < otherEligiblePlayers.length - 2; i++) {
    for (let j = i + 1; j < otherEligiblePlayers.length - 1; j++) {
      for (let k = j + 1; k < otherEligiblePlayers.length; k++) {
        const combination = [anchorPlayer, otherEligiblePlayers[i], otherEligiblePlayers[j], otherEligiblePlayers[k]];
        
        // Check if this combination can actually form the target game type
        const actualGameType = determineBestGameType(combination);
        if (actualGameType === targetGameType) {
          combinations.push(combination);
        }
      }
    }
  }

  if (combinations.length === 0) {
    console.log(`Auto-select: No valid ${targetGameType} combinations found with eligible players`);
    return [];
  }

  // Score combinations by repeat penalty (lower is better)
  const scoredCombinations = await Promise.all(
    combinations.map(async combo => {
      const repeatPenalty = await calculateRepeatPenalty(combo);
      return { combination: combo, repeatPenalty };
    })
  );

  // Sort by repeat penalty (ascending - less repeats first)
  scoredCombinations.sort((a, b) => a.repeatPenalty - b.repeatPenalty);

  console.log(`Auto-select: Found ${combinations.length} ${targetGameType} combinations, best penalty: ${scoredCombinations[0].repeatPenalty}`);

  return scoredCombinations[0].combination;
}

/**
 * Finds any valid combination with the anchor player as fallback
 */
async function findAnyCombinationWithAnchor(poolPlayers: Player[], anchorPlayer: Player): Promise<Player[]> {
  const otherPlayers = poolPlayers.slice(1);
  const combinations: { combination: Player[], gameType: string }[] = [];

  // Generate all possible 3-player combinations from remaining players
  for (let i = 0; i < otherPlayers.length - 2; i++) {
    for (let j = i + 1; j < otherPlayers.length - 1; j++) {
      for (let k = j + 1; k < otherPlayers.length; k++) {
        const combination = [anchorPlayer, otherPlayers[i], otherPlayers[j], otherPlayers[k]];
        
        // Check if this is a valid game and all players accept it
        const gameType = determineBestGameType(combination);
        if (gameType) {
          // Verify all players in this combination accept this game type
          const allAccept = combination.every(player => playerAcceptsGameType(player, gameType));
          if (allAccept) {
            combinations.push({ combination, gameType });
          }
        }
      }
    }
  }

  if (combinations.length === 0) {
    console.log("Auto-select: No valid combinations found that respect all player preferences");
    return [];
  }

  // Score by repeat penalty and pick the best
  const scoredCombinations = await Promise.all(
    combinations.map(async ({ combination, gameType }) => {
      const repeatPenalty = await calculateRepeatPenalty(combination);
      return { combination, repeatPenalty, gameType };
    })
  );

  scoredCombinations.sort((a, b) => a.repeatPenalty - b.repeatPenalty);

  console.log(`Auto-select: Fallback found ${combinations.length} valid combinations, selected ${scoredCombinations[0].gameType} game with penalty: ${scoredCombinations[0].repeatPenalty}`);

  return scoredCombinations[0].combination;
}
