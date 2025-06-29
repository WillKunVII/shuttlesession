
import { Player } from "../types/player";
import { generateValidCombinations } from "./playerCombinations";
import { calculateRepeatPenalty } from "./gameHistory";
import { determineBestGameType } from "./gameValidation";

// Cache for repeat penalty calculations to avoid redundant DB calls
const repeatPenaltyCache = new Map<string, number>();

/**
 * Finds the best player combination always starting with the #1 player in queue
 * and using their preferences to drive game selection.
 */
export const findBestCombination = async (poolPlayers: Player[]): Promise<Player[]> => {
  if (poolPlayers.length < 4) return [];

  console.log("Auto-select: Starting optimization with", poolPlayers.length, "players");

  // Always start with player #1 (first in queue)
  const anchorPlayer = poolPlayers[0];
  console.log("Auto-select: Starting with anchor player #1:", anchorPlayer.name);

  // Get anchor player's preferences (prioritize Mixed > Ladies > Open)
  const anchorPrefs = anchorPlayer.playPreferences || [];
  const preferenceOrder = anchorPrefs.length > 0 ? anchorPrefs : ["Mixed", "Ladies", "Open"];
  
  console.log("Auto-select: Anchor player preferences:", preferenceOrder);

  // Try each preference in order with optimized search
  for (const targetGameType of preferenceOrder) {
    console.log(`Auto-select: Trying to form ${targetGameType} game with anchor player`);
    
    const combination = await findCombinationForGameTypeOptimized(poolPlayers, anchorPlayer, targetGameType);
    if (combination.length === 4) {
      console.log(`Auto-select: Found ${targetGameType} game:`, combination.map(p => p.name));
      return combination;
    }
  }

  // If no preference-based combination worked, find any valid combination with anchor player
  console.log("Auto-select: Falling back to any valid game with anchor player");
  return await findAnyCombinationWithAnchorOptimized(poolPlayers, anchorPlayer);
};

/**
 * Checks if a player accepts a specific game type based on their preferences
 */
function playerAcceptsGameType(player: Player, gameType: string): boolean {
  const prefs = player.playPreferences || [];
  if (prefs.length === 0) return true;
  return prefs.includes(gameType as any);
}

/**
 * Generate cache key for repeat penalty calculation
 */
function getCacheKey(combination: Player[]): string {
  return combination.map(p => p.id).sort().join('-');
}

/**
 * Optimized version that reduces database calls and uses early exit
 */
async function findCombinationForGameTypeOptimized(
  poolPlayers: Player[], 
  anchorPlayer: Player, 
  targetGameType: string
): Promise<Player[]> {
  // Filter players who would accept this game type
  const eligiblePlayers = poolPlayers.filter(player => 
    playerAcceptsGameType(player, targetGameType)
  );
  
  console.log(`Auto-select: Found ${eligiblePlayers.length} players who accept ${targetGameType} games`);
  
  if (eligiblePlayers.length < 4 || !eligiblePlayers.some(p => p.id === anchorPlayer.id)) {
    return [];
  }
  
  const otherEligiblePlayers = eligiblePlayers.filter(p => p.id !== anchorPlayer.id);
  
  // Limit search to first reasonable combinations to avoid lag
  const maxCombinations = 20;
  let combinationsChecked = 0;
  let bestCombination: Player[] = [];
  let bestPenalty = Infinity;

  // Generate combinations with early exit
  for (let i = 0; i < otherEligiblePlayers.length - 2 && combinationsChecked < maxCombinations; i++) {
    for (let j = i + 1; j < otherEligiblePlayers.length - 1 && combinationsChecked < maxCombinations; j++) {
      for (let k = j + 1; k < otherEligiblePlayers.length && combinationsChecked < maxCombinations; k++) {
        const combination = [anchorPlayer, otherEligiblePlayers[i], otherEligiblePlayers[j], otherEligiblePlayers[k]];
        
        // Check if this combination can actually form the target game type
        const actualGameType = determineBestGameType(combination);
        if (actualGameType === targetGameType) {
          combinationsChecked++;
          
          // Use cached penalty or calculate new one
          const cacheKey = getCacheKey(combination);
          let repeatPenalty = repeatPenaltyCache.get(cacheKey);
          
          if (repeatPenalty === undefined) {
            repeatPenalty = await calculateRepeatPenalty(combination);
            repeatPenaltyCache.set(cacheKey, repeatPenalty);
          }
          
          if (repeatPenalty < bestPenalty) {
            bestPenalty = repeatPenalty;
            bestCombination = combination;
            
            // Early exit if we find a perfect combination (no repeats)
            if (repeatPenalty === 0) {
              console.log(`Auto-select: Found perfect ${targetGameType} combination with no repeats`);
              return bestCombination;
            }
          }
        }
      }
    }
  }

  if (bestCombination.length === 4) {
    console.log(`Auto-select: Found ${targetGameType} combination with penalty: ${bestPenalty}`);
  }

  return bestCombination;
}

/**
 * Optimized fallback search with early exit
 */
async function findAnyCombinationWithAnchorOptimized(poolPlayers: Player[], anchorPlayer: Player): Promise<Player[]> {
  const otherPlayers = poolPlayers.slice(1);
  const maxCombinations = 15;
  let combinationsChecked = 0;
  let bestCombination: Player[] = [];
  let bestPenalty = Infinity;

  // Generate combinations with early exit
  for (let i = 0; i < otherPlayers.length - 2 && combinationsChecked < maxCombinations; i++) {
    for (let j = i + 1; j < otherPlayers.length - 1 && combinationsChecked < maxCombinations; j++) {
      for (let k = j + 1; k < otherPlayers.length && combinationsChecked < maxCombinations; k++) {
        const combination = [anchorPlayer, otherPlayers[i], otherPlayers[j], otherPlayers[k]];
        
        // Check if this is a valid game and all players accept it
        const gameType = determineBestGameType(combination);
        if (gameType) {
          const allAccept = combination.every(player => playerAcceptsGameType(player, gameType));
          if (allAccept) {
            combinationsChecked++;
            
            // Use cached penalty or calculate new one
            const cacheKey = getCacheKey(combination);
            let repeatPenalty = repeatPenaltyCache.get(cacheKey);
            
            if (repeatPenalty === undefined) {
              repeatPenalty = await calculateRepeatPenalty(combination);
              repeatPenaltyCache.set(cacheKey, repeatPenalty);
            }
            
            if (repeatPenalty < bestPenalty) {
              bestPenalty = repeatPenalty;
              bestCombination = combination;
              
              // Early exit for perfect combination
              if (repeatPenalty === 0) {
                console.log(`Auto-select: Found perfect fallback combination with no repeats`);
                return bestCombination;
              }
            }
          }
        }
      }
    }
  }

  if (bestCombination.length === 4) {
    console.log(`Auto-select: Fallback found combination with penalty: ${bestPenalty}`);
  }

  return bestCombination;
}

// Clear cache periodically to prevent memory leaks
setInterval(() => {
  if (repeatPenaltyCache.size > 100) {
    console.log("Auto-select: Clearing repeat penalty cache");
    repeatPenaltyCache.clear();
  }
}, 60000); // Clear every minute if cache gets too large
