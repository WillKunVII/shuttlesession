
import { Player } from "../types/player";
import { generateValidCombinations } from "./playerCombinations";
import { calculateRepeatPenalty } from "./gameHistory";
import { determineBestGameType } from "./gameValidation";

// Simplified cache for repeat penalties with memory management
const repeatPenaltyCache = new Map<string, { penalty: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

// Performance monitoring
let autoSelectStartTime = 0;
const PERFORMANCE_BUDGET = 2000; // 2 seconds max

/**
 * Optimized version that prioritizes speed over perfect selection
 */
export const findBestCombination = async (poolPlayers: Player[]): Promise<Player[]> => {
  if (poolPlayers.length < 4) return [];

  autoSelectStartTime = Date.now();
  console.log("Auto-select: Starting optimized selection with", poolPlayers.length, "players");

  // Always start with player #1 (first in queue)
  const anchorPlayer = poolPlayers[0];
  console.log("Auto-select: Starting with anchor player #1:", anchorPlayer.name);

  // Get anchor player's preferences (prioritize Mixed > Ladies > Open)
  const anchorPrefs = anchorPlayer.playPreferences || [];
  const preferenceOrder = anchorPrefs.length > 0 ? anchorPrefs : ["Mixed", "Ladies", "Open"];
  
  console.log("Auto-select: Anchor player preferences:", preferenceOrder);

  // Try each preference with optimized search
  for (const targetGameType of preferenceOrder) {
    const combination = await findCombinationForGameTypeOptimized(poolPlayers, anchorPlayer, targetGameType);
    if (combination.length === 4) {
      console.log(`Auto-select: Found ${targetGameType} game in ${Date.now() - autoSelectStartTime}ms`);
      return combination;
    }
    
    // Check performance budget
    if (Date.now() - autoSelectStartTime > PERFORMANCE_BUDGET) {
      console.log("Auto-select: Performance budget exceeded, using fallback");
      return findFastFallbackCombination(poolPlayers, anchorPlayer);
    }
  }

  // Fast fallback
  console.log("Auto-select: Using fast fallback");
  return findFastFallbackCombination(poolPlayers, anchorPlayer);
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
 * Clean up expired cache entries
 */
function cleanupCache() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  for (const [key, value] of repeatPenaltyCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => repeatPenaltyCache.delete(key));
  
  // Limit cache size
  if (repeatPenaltyCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(repeatPenaltyCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => repeatPenaltyCache.delete(key));
  }
}

/**
 * Get cached or calculate repeat penalty with performance optimization
 */
async function getCachedRepeatPenalty(combination: Player[]): Promise<number> {
  const cacheKey = getCacheKey(combination);
  const cached = repeatPenaltyCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.penalty;
  }
  
  // For performance, limit penalty calculation complexity
  const penalty = await calculateRepeatPenalty(combination);
  
  repeatPenaltyCache.set(cacheKey, {
    penalty,
    timestamp: Date.now()
  });
  
  return penalty;
}

/**
 * Optimized version with reduced combinations and faster exit
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
  
  if (eligiblePlayers.length < 4 || !eligiblePlayers.some(p => p.id === anchorPlayer.id)) {
    return [];
  }
  
  const otherEligiblePlayers = eligiblePlayers.filter(p => p.id !== anchorPlayer.id);
  
  // Reduced search space for better performance
  const maxCombinations = 10;
  let combinationsChecked = 0;
  let bestCombination: Player[] = [];
  let bestPenalty = Infinity;

  // Generate combinations with early exit and performance checks
  for (let i = 0; i < Math.min(otherEligiblePlayers.length - 2, 3); i++) {
    for (let j = i + 1; j < Math.min(otherEligiblePlayers.length - 1, 5); j++) {
      for (let k = j + 1; k < Math.min(otherEligiblePlayers.length, 7); k++) {
        // Performance check
        if (Date.now() - autoSelectStartTime > PERFORMANCE_BUDGET / 2) {
          console.log("Auto-select: Half-time performance check, returning best so far");
          return bestCombination.length === 4 ? bestCombination : [];
        }
        
        const combination = [anchorPlayer, otherEligiblePlayers[i], otherEligiblePlayers[j], otherEligiblePlayers[k]];
        
        // Check if this combination can actually form the target game type
        const actualGameType = determineBestGameType(combination);
        if (actualGameType === targetGameType) {
          combinationsChecked++;
          
          // Quick penalty check (simplified for performance)
          const repeatPenalty = await getCachedRepeatPenalty(combination);
          
          if (repeatPenalty < bestPenalty) {
            bestPenalty = repeatPenalty;
            bestCombination = combination;
            
            // Early exit for perfect combination
            if (repeatPenalty === 0) {
              console.log(`Auto-select: Found perfect ${targetGameType} combination`);
              return bestCombination;
            }
          }
          
          if (combinationsChecked >= maxCombinations) {
            console.log(`Auto-select: Max combinations checked (${maxCombinations})`);
            return bestCombination;
          }
        }
      }
    }
  }

  return bestCombination;
}

/**
 * Ultra-fast fallback that just takes first 4 valid players
 */
function findFastFallbackCombination(poolPlayers: Player[], anchorPlayer: Player): Player[] {
  const otherPlayers = poolPlayers.slice(1, 4); // Just take next 3 players
  const combination = [anchorPlayer, ...otherPlayers];
  
  if (combination.length === 4) {
    const gameType = determineBestGameType(combination);
    if (gameType) {
      const allAccept = combination.every(player => playerAcceptsGameType(player, gameType));
      if (allAccept) {
        console.log("Auto-select: Fast fallback successful");
        return combination;
      }
    }
  }
  
  return [];
}

// Clean up cache periodically
setInterval(() => {
  cleanupCache();
}, 30000); // Every 30 seconds
