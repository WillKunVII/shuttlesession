
import { Player } from "../types/player";
import { canFormValidGame } from "./gameValidation";

/**
 * Generates all valid 4-player combinations from the player pool
 */
export const generateValidCombinations = (poolPlayers: Player[]): Player[][] => {
  const combinations: Player[][] = [];
  
  // Generate all possible 4-player combinations
  for (let i = 0; i < poolPlayers.length - 3; i++) {
    for (let j = i + 1; j < poolPlayers.length - 2; j++) {
      for (let k = j + 1; k < poolPlayers.length - 1; k++) {
        for (let l = k + 1; l < poolPlayers.length; l++) {
          const combination = [poolPlayers[i], poolPlayers[j], poolPlayers[k], poolPlayers[l]];
          if (canFormValidGame(combination)) {
            combinations.push(combination);
          }
        }
      }
    }
  }
  
  return combinations;
};
