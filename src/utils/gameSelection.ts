
import { Player } from "../types/player";
import { generateValidCombinations } from "./playerCombinations";
import { calculateRepeatPenalty } from "./gameHistory";
import { determineBestGameType } from "./gameValidation";
import { sessionTracker } from "./sessionTracking";

// Simplified cache for repeat penalties with memory management
const repeatPenaltyCache = new Map<string, { penalty: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

// Performance monitoring
let autoSelectStartTime = 0;
const PERFORMANCE_BUDGET = 2000; // 2 seconds max

/**
 * Enhanced version with weighted selection and session-aware mixing
 */
export const findBestCombination = async (poolPlayers: Player[]): Promise<Player[]> => {
  if (poolPlayers.length < 4) return [];

  autoSelectStartTime = Date.now();
  console.log("Enhanced Auto-select: Starting with", poolPlayers.length, "players");

  // Phase 1: Try smart selection with full pool sampling
  const smartSelection = await findSmartCombination(poolPlayers);
  if (smartSelection.length === 4) {
    const elapsed = Date.now() - autoSelectStartTime;
    console.log(`Enhanced Auto-select: Found smart combination in ${elapsed}ms`);
    return smartSelection;
  }

  // Phase 2: Check performance budget for fallback
  if (Date.now() - autoSelectStartTime > PERFORMANCE_BUDGET) {
    console.log("Enhanced Auto-select: Using smart fallback due to time limit");
    return findSmartFallbackCombination(poolPlayers);
  }

  // Phase 3: Smart fallback
  console.log("Enhanced Auto-select: Using smart fallback");
  return findSmartFallbackCombination(poolPlayers);
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
 * Smart combination finder using weighted selection and full pool sampling
 */
async function findSmartCombination(poolPlayers: Player[]): Promise<Player[]> {
  // Get weighted starting players (top 3-4 with weighted probability)
  const startingCandidates = getWeightedStartingPlayers(poolPlayers);
  
  let bestCombination: Player[] = [];
  let bestScore = -Infinity;

  // Try each potential starting player
  for (const startingPlayer of startingCandidates) {
    // Generate random combinations from the full pool
    const combinations = generateRandomCombinations(poolPlayers, startingPlayer, 20);
    
    for (const combination of combinations) {
      // Performance check
      if (Date.now() - autoSelectStartTime > PERFORMANCE_BUDGET * 0.7) {
        console.log("Enhanced Auto-select: 70% time budget reached");
        return bestCombination.length === 4 ? bestCombination : [];
      }

      const score = await calculateEnhancedScore(combination);
      if (score > bestScore) {
        bestScore = score;
        bestCombination = combination;
        
        // Early exit for excellent combinations
        if (score > 50) {
          console.log("Enhanced Auto-select: Found excellent combination");
          return bestCombination;
        }
      }
    }
  }

  return bestCombination;
}

/**
 * Get weighted starting players instead of always choosing #1
 */
function getWeightedStartingPlayers(poolPlayers: Player[]): Player[] {
  const candidates = poolPlayers.slice(0, Math.min(4, poolPlayers.length));
  const weights = [0.4, 0.3, 0.2, 0.1]; // 40%, 30%, 20%, 10% probability
  
  // Apply session balance weighting
  const weightedCandidates = candidates.map((player, index) => {
    const baseWeight = weights[index] || 0.1;
    const sessionBonus = sessionTracker.getSessionBalanceScore(player.id) * 0.1;
    const coolingPenalty = sessionTracker.isInCoolingPeriod(player.id) ? -0.2 : 0;
    
    return {
      player,
      weight: Math.max(0.05, baseWeight + sessionBonus + coolingPenalty)
    };
  });

  // Sort by weight and return top candidates
  return weightedCandidates
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(wc => wc.player);
}

/**
 * Generate random combinations from the entire pool
 */
function generateRandomCombinations(poolPlayers: Player[], anchorPlayer: Player, count: number): Player[][] {
  const combinations: Player[][] = [];
  const otherPlayers = poolPlayers.filter(p => p.id !== anchorPlayer.id);
  
  if (otherPlayers.length < 3) return [];

  for (let i = 0; i < count && combinations.length < count; i++) {
    // Randomly select 3 other players
    const shuffled = [...otherPlayers].sort(() => Math.random() - 0.5);
    const selectedOthers = shuffled.slice(0, 3);
    const combination = [anchorPlayer, ...selectedOthers];
    
    // Check if this combination can form a valid game
    const gameType = determineBestGameType(combination);
    if (gameType) {
      const allAccept = combination.every(player => playerAcceptsGameType(player, gameType));
      if (allAccept) {
        combinations.push(combination);
      }
    }
  }

  return combinations;
}

/**
 * Calculate enhanced score combining multiple factors
 */
async function calculateEnhancedScore(combination: Player[]): Promise<number> {
  // Base score from repeat penalty (lower is better, so negate)
  const repeatPenalty = await getCachedRepeatPenalty(combination);
  const repeatScore = Math.max(0, 50 - repeatPenalty);

  // Session balance bonus (sum of individual player balance scores)
  const sessionBalanceBonus = combination.reduce((sum, player) => {
    return sum + sessionTracker.getSessionBalanceScore(player.id);
  }, 0) * 2;

  // Cooling period penalty
  const coolingPenalty = combination.reduce((penalty, player) => {
    return penalty + (sessionTracker.isInCoolingPeriod(player.id) ? 5 : 0);
  }, 0);

  // Variety bonus for new combinations
  const varietyBonus = sessionTracker.getVarietyBonus(combination);

  const totalScore = repeatScore + sessionBalanceBonus + varietyBonus - coolingPenalty;
  
  return totalScore;
}

/**
 * Smart fallback that considers session balance instead of just taking first 4
 */
function findSmartFallbackCombination(poolPlayers: Player[]): Player[] {
  // Sort players by session balance (players who need more games first)
  const sortedByBalance = [...poolPlayers].sort((a, b) => {
    const balanceA = sessionTracker.getSessionBalanceScore(a.id);
    const balanceB = sessionTracker.getSessionBalanceScore(b.id);
    
    // If balance is equal, prefer players not in cooling period
    if (Math.abs(balanceA - balanceB) < 0.1) {
      const coolingA = sessionTracker.isInCoolingPeriod(a.id) ? 1 : 0;
      const coolingB = sessionTracker.isInCoolingPeriod(b.id) ? 1 : 0;
      return coolingA - coolingB;
    }
    
    return balanceB - balanceA;
  });
  
  // Try combinations starting with the most balanced players
  for (let i = 0; i <= Math.max(0, sortedByBalance.length - 4); i++) {
    const combination = sortedByBalance.slice(i, i + 4);
    
    if (combination.length === 4) {
      const gameType = determineBestGameType(combination);
      if (gameType) {
        const allAccept = combination.every(player => playerAcceptsGameType(player, gameType));
        if (allAccept) {
          console.log("Enhanced Auto-select: Smart fallback successful");
          return combination;
        }
      }
    }
  }
  
  // Ultimate fallback - just take first 4 if nothing else works
  const combination = poolPlayers.slice(0, 4);
  if (combination.length === 4) {
    const gameType = determineBestGameType(combination);
    if (gameType) {
      console.log("Enhanced Auto-select: Ultimate fallback used");
      return combination;
    }
  }
  
  return [];
}

// Clean up cache periodically
setInterval(() => {
  cleanupCache();
}, 30000); // Every 30 seconds
