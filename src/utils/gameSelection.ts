
import { Player } from "../types/player";
import { generateValidCombinations } from "./playerCombinations";
import { calculateRepeatPenalty } from "./gameHistory";
import { determineBestGameType, determineBestGameTypeWithPiggyback, inferPiggybackGameTypePreference } from "./gameValidation";
import { sessionTracker } from "./sessionTracking";

// Simplified cache for repeat penalties with memory management
const repeatPenaltyCache = new Map<string, { penalty: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

// Performance monitoring
let autoSelectStartTime = 0;
const PERFORMANCE_BUDGET = 2000; // 2 seconds max

/**
 * Validates that no piggyback pairs are split in the given combination
 */
function validatePiggybackIntegrity(
  combination: Player[], 
  piggybackPairs?: Array<{ master: number; partner: number }>
): boolean {
  if (!piggybackPairs || piggybackPairs.length === 0) return true;
  
  const playerIds = new Set(combination.map(p => p.id));
  
  for (const pair of piggybackPairs) {
    const hasMaster = playerIds.has(pair.master);
    const hasPartner = playerIds.has(pair.partner);
    
    // If one player from a pair is selected, the other must also be selected
    if (hasMaster && !hasPartner) {
      console.log(`Piggyback integrity violation: Master ${pair.master} selected without partner ${pair.partner}`);
      return false;
    }
    if (hasPartner && !hasMaster) {
      console.log(`Piggyback integrity violation: Partner ${pair.partner} selected without master ${pair.master}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Enhanced version with weighted selection and session-aware mixing
 * Now supports piggyback pair awareness
 */
export const findBestCombination = async (
  poolPlayers: Player[], 
  piggybackPairs?: Array<{ master: number; partner: number }>
): Promise<Player[]> => {
  if (poolPlayers.length < 4) return [];

  autoSelectStartTime = Date.now();
  console.log("Enhanced Auto-select: Starting with", poolPlayers.length, "players");

  // Phase 1: Try smart selection with full pool sampling and piggyback awareness
  const smartSelection = await findSmartCombination(poolPlayers, piggybackPairs);
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

  // Phase 3: Smart fallback with piggyback awareness
  console.log("Enhanced Auto-select: Using smart fallback");
  return findSmartFallbackCombination(poolPlayers, piggybackPairs);
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
 * Enhanced with piggyback pair awareness
 */
async function findSmartCombination(
  poolPlayers: Player[], 
  piggybackPairs?: Array<{ master: number; partner: number }>
): Promise<Player[]> {
  // Get weighted starting players (top 3-4 with weighted probability)
  const startingCandidates = getWeightedStartingPlayers(poolPlayers);
  
  let bestCombination: Player[] = [];
  let bestScore = -Infinity;

  // Try each potential starting player
  for (const startingPlayer of startingCandidates) {
    // Generate random combinations from the full pool with piggyback awareness
    const combinations = generateRandomCombinations(poolPlayers, startingPlayer, 20, piggybackPairs);
    
    for (const combination of combinations) {
      // Performance check
      if (Date.now() - autoSelectStartTime > PERFORMANCE_BUDGET * 0.7) {
        console.log("Enhanced Auto-select: 70% time budget reached");
        return bestCombination.length === 4 ? bestCombination : [];
      }

      // Early validation of piggyback integrity
      if (!validatePiggybackIntegrity(combination, piggybackPairs)) {
        console.log("Enhanced Auto-select: Skipping combination due to piggyback violation");
        continue;
      }

      const score = await calculateEnhancedScore(combination, piggybackPairs);
      if (score > bestScore) {
        bestScore = score;
        bestCombination = combination;
        
        // Early exit for excellent combinations with piggyback bonus
        const piggybackBonus = getPiggybackMatchBonus(combination, piggybackPairs);
        if (score > 50 || piggybackBonus > 10) {
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
 * Generate random combinations from the entire pool with piggyback awareness
 */
function generateRandomCombinations(
  poolPlayers: Player[], 
  anchorPlayer: Player, 
  count: number,
  piggybackPairs?: Array<{ master: number; partner: number }>
): Player[][] {
  const combinations: Player[][] = [];
  const otherPlayers = poolPlayers.filter(p => p.id !== anchorPlayer.id);
  
  if (otherPlayers.length < 3) return [];

  let attempts = 0;
  const maxAttempts = count * 3; // Safety counter to prevent infinite loops

  for (let i = 0; i < count && combinations.length < count && attempts < maxAttempts; attempts++) {
    let selectedOthers: Player[];
    
    // Check if anchor player is in a piggyback pair
    const anchorPair = piggybackPairs?.find(p => p.master === anchorPlayer.id || p.partner === anchorPlayer.id);
    
    if (anchorPair) {
      // If anchor is piggybacked, must include their partner
      const partnerId = anchorPair.master === anchorPlayer.id ? anchorPair.partner : anchorPair.master;
      const partner = otherPlayers.find(p => p.id === partnerId);
      
      if (partner) {
        const remainingOthers = otherPlayers.filter(p => p.id !== partnerId);
        if (remainingOthers.length >= 2) {
          const shuffled = [...remainingOthers].sort(() => Math.random() - 0.5);
          selectedOthers = [partner, ...shuffled.slice(0, 2)];
        } else {
          continue; // Skip if not enough players
        }
      } else {
        continue; // Skip if partner not in pool
      }
    } else {
      // Standard random selection with piggyback validation
      const shuffled = [...otherPlayers].sort(() => Math.random() - 0.5);
      selectedOthers = shuffled.slice(0, 3);
    }
    
    const combination = [anchorPlayer, ...selectedOthers];
    
    // Validate piggyback integrity before checking game type
    if (!validatePiggybackIntegrity(combination, piggybackPairs)) {
      console.log("Generate combinations: Rejecting combination due to piggyback violation");
      continue;
    }
    
    // Check if this combination can form a valid game with piggyback awareness
    const gameType = determineBestGameTypeWithPiggyback(combination, piggybackPairs);
    if (gameType) {
      const allAccept = combination.every(player => playerAcceptsGameType(player, gameType));
      if (allAccept) {
        combinations.push(combination);
        i++; // Only increment when we successfully add a combination
      }
    }
  }

  return combinations;
}

/**
 * Calculate enhanced score combining multiple factors including piggyback bonuses
 */
async function calculateEnhancedScore(
  combination: Player[], 
  piggybackPairs?: Array<{ master: number; partner: number }>
): Promise<number> {
  // Early validation - immediately reject if piggyback pairs are split
  if (!validatePiggybackIntegrity(combination, piggybackPairs)) {
    return -Infinity;
  }

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
  
  // Piggyback pair satisfaction bonus
  const piggybackBonus = getPiggybackMatchBonus(combination, piggybackPairs);

  const totalScore = repeatScore + sessionBalanceBonus + varietyBonus + piggybackBonus - coolingPenalty;
  
  return totalScore;
}

/**
 * Calculates bonus score for piggyback pair satisfaction
 */
function getPiggybackMatchBonus(
  combination: Player[], 
  piggybackPairs?: Array<{ master: number; partner: number }>
): number {
  if (!piggybackPairs || piggybackPairs.length === 0) return 0;
  
  let bonus = 0;
  
  for (const pair of piggybackPairs) {
    const hasMaster = combination.some(p => p.id === pair.master);
    const hasPartner = combination.some(p => p.id === pair.partner);
    
    // Big bonus for including a complete piggyback pair
    if (hasMaster && hasPartner) {
      bonus += 15;
      
      // Extra bonus if the game type matches their implied preference
      const masterPlayer = combination.find(p => p.id === pair.master);
      const partnerPlayer = combination.find(p => p.id === pair.partner);
      
      if (masterPlayer && partnerPlayer) {
        const gameType = determineBestGameTypeWithPiggyback(combination, piggybackPairs);
        const impliedPreference = inferPiggybackGameTypePreference(masterPlayer, partnerPlayer);
        
        if (gameType === impliedPreference) {
          bonus += 10; // Extra bonus for matching implied game type
        }
      }
    }
  }
  
  return bonus;
}

/**
 * Smart fallback that considers session balance and piggyback pairs
 */
function findSmartFallbackCombination(
  poolPlayers: Player[], 
  piggybackPairs?: Array<{ master: number; partner: number }>
): Player[] {
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
  
  // Prioritize combinations with piggyback pairs
  if (piggybackPairs && piggybackPairs.length > 0) {
    for (const pair of piggybackPairs) {
      const masterPlayer = poolPlayers.find(p => p.id === pair.master);
      const partnerPlayer = poolPlayers.find(p => p.id === pair.partner);
      
      if (masterPlayer && partnerPlayer) {
        // Try to build a combination around this piggyback pair
        const otherPlayers = poolPlayers.filter(p => p.id !== pair.master && p.id !== pair.partner);
        
        for (let i = 0; i < otherPlayers.length - 1; i++) {
          for (let j = i + 1; j < otherPlayers.length; j++) {
            const combination = [masterPlayer, partnerPlayer, otherPlayers[i], otherPlayers[j]];
            const gameType = determineBestGameTypeWithPiggyback(combination, piggybackPairs);
            
            if (gameType) {
              const allAccept = combination.every(player => playerAcceptsGameType(player, gameType));
              if (allAccept) {
                console.log("Enhanced Auto-select: Piggyback-prioritized fallback successful");
                return combination;
              }
            }
          }
        }
      }
    }
  }

  // Try combinations starting with the most balanced players with piggyback validation
  for (let i = 0; i <= Math.max(0, sortedByBalance.length - 4); i++) {
    const combination = sortedByBalance.slice(i, i + 4);
    
    if (combination.length === 4) {
      // Validate piggyback integrity before checking game type
      if (!validatePiggybackIntegrity(combination, piggybackPairs)) {
        console.log("Smart fallback: Skipping combination due to piggyback violation");
        continue;
      }
      
      const gameType = determineBestGameTypeWithPiggyback(combination, piggybackPairs);
      if (gameType) {
        const allAccept = combination.every(player => playerAcceptsGameType(player, gameType));
        if (allAccept) {
          console.log("Enhanced Auto-select: Smart fallback successful");
          return combination;
        }
      }
    }
  }
  
  // Ultimate fallback - piggyback-aware selection
  return findPiggybackAwareFallback(poolPlayers, piggybackPairs);
}

/**
 * Ultimate fallback that tries to respect piggyback pairs even in last resort
 */
function findPiggybackAwareFallback(
  poolPlayers: Player[], 
  piggybackPairs?: Array<{ master: number; partner: number }>
): Player[] {
  // Try different starting positions to find a valid combination
  for (let start = 0; start <= Math.max(0, poolPlayers.length - 4); start++) {
    const combination = poolPlayers.slice(start, start + 4);
    
    if (combination.length === 4) {
      // Check piggyback integrity
      if (validatePiggybackIntegrity(combination, piggybackPairs)) {
        const gameType = determineBestGameTypeWithPiggyback(combination, piggybackPairs);
        if (gameType) {
          // CRITICAL: Validate that all players accept the determined game type
          const allAccept = combination.every(player => playerAcceptsGameType(player, gameType));
          if (allAccept) {
            console.log("Enhanced Auto-select: Piggyback-aware ultimate fallback used");
            return combination;
          } else {
            console.log(`Ultimate fallback: Rejecting combination - not all players accept ${gameType} game type`);
          }
        }
      } else {
        console.log("Ultimate fallback: Skipping combination due to piggyback violation");
      }
    }
  }
  
  // If all else fails, return empty array rather than split piggyback pairs
  console.log("Enhanced Auto-select: No valid combination found that respects piggyback pairs");
  return [];
  
  return [];
}

// Clean up cache periodically
setInterval(() => {
  cleanupCache();
}, 30000); // Every 30 seconds
