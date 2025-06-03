
import { Player } from "../types/player";
import { generateValidCombinations } from "./playerCombinations";
import { calculateRepeatPenalty } from "./gameHistory";

/**
 * Finds the best player combination prioritizing the first player and minimizing repeats
 */
export const findBestCombination = async (poolPlayers: Player[]): Promise<Player[]> => {
  if (poolPlayers.length < 4) return [];
  
  const topPlayer = poolPlayers[0];
  
  // Find all valid combinations that include the top player
  const validCombinations = generateValidCombinations(poolPlayers)
    .filter(combo => combo.some(p => p.id === topPlayer.id));
  
  if (validCombinations.length === 0) return [];
  
  // Score each combination based on:
  // 1. Position of non-top players in queue (lower position = better)
  // 2. Repeat penalty (fewer repeats = better)
  const scoredCombinations = await Promise.all(validCombinations.map(async combo => {
    // Calculate position penalty (sum of queue positions for non-top players)
    const positionPenalty = combo
      .filter(p => p.id !== topPlayer.id)
      .reduce((sum, player) => {
        const position = poolPlayers.findIndex(pp => pp.id === player.id);
        return sum + position;
      }, 0);
    
    // Calculate repeat penalty
    const repeatPenalty = await calculateRepeatPenalty(combo);
    
    // Total score (lower is better)
    // Weight repeat penalty more heavily to prioritize avoiding repeats
    const totalScore = positionPenalty + (repeatPenalty * 5);
    
    return {
      combination: combo,
      score: totalScore,
      positionPenalty,
      repeatPenalty
    };
  }));
  
  // Sort by score (lower is better) and return the best combination
  scoredCombinations.sort((a, b) => a.score - b.score);
  
  console.log("Top 3 combinations considered:", scoredCombinations.slice(0, 3).map(sc => ({
    players: sc.combination.map(p => p.name),
    score: sc.score,
    positionPenalty: sc.positionPenalty,
    repeatPenalty: sc.repeatPenalty
  })));
  
  return scoredCombinations[0].combination;
};
