
import { Player } from "../types/player";
import { generateValidCombinations } from "./playerCombinations";
import { calculateRepeatPenalty } from "./gameHistory";

/**
 * Finds a varied best player combination prioritizing those who have played together the least,
 * but with some randomness for variety.
 */
export const findBestCombination = async (poolPlayers: Player[]): Promise<Player[]> => {
  if (poolPlayers.length < 4) return [];

  // Find all valid combinations
  const validCombinations = generateValidCombinations(poolPlayers);

  if (validCombinations.length === 0) return [];

  // Score each combination by repeat penalty (played together score)
  const scoredCombinations = await Promise.all(
    validCombinations.map(async combo => {
      const repeatPenalty = await calculateRepeatPenalty(combo);
      return {
        combination: combo,
        repeatPenalty,
      };
    })
  );

  // Sort combinations by repeatPenalty ascending (least repeats come first)
  scoredCombinations.sort((a, b) => a.repeatPenalty - b.repeatPenalty);

  // Find the lowest penalty
  const lowestPenalty = scoredCombinations[0].repeatPenalty;

  // From top-N best penalty combinations, randomly pick one for variety
  // N is max 5, or less if fewer with minimal penalties
  const topN = 5;
  const topBest = scoredCombinations.filter(
    c => c.repeatPenalty === lowestPenalty
  );
  let candidates = topBest;
  if (topBest.length < topN) {
    // If fewer than N best, include next best scores to fill up to N
    const allTopN = scoredCombinations.slice(0, topN);
    candidates = allTopN;
  }

  // Randomly select one candidate
  const picked = candidates[Math.floor(Math.random() * candidates.length)];

  console.log("Randomly picking from top candidates:", candidates.map(c => ({
    players: c.combination.map(p => p.name),
    repeatPenalty: c.repeatPenalty
  })));

  return picked.combination;
};
