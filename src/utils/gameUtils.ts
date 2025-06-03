import { Player } from "../types/player";
import { gameHistoryDB } from "./indexedDbUtils";

/**
 * Checks if a set of players can form a valid game based on preferences
 */
export const canFormValidGame = (players: Player[]): boolean => {
  if (players.length !== 4) return false;
  
  // Check if play preferences are enabled
  const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
  if (!prefEnabled) return true;
  
  // Count genders
  const maleCount = players.filter(p => p.gender === "male").length;
  const femaleCount = players.filter(p => p.gender === "female").length;
  
  // Check if Mixed game is possible 
  const isMixedPossible = maleCount === 2 && femaleCount === 2;
  
  // Check if Ladies game is possible
  const isLadiesPossible = femaleCount === 4;

  // Determine the game type based on player composition
  let possibleGameTypes = [];
  if (isMixedPossible) possibleGameTypes.push("Mixed");
  if (isLadiesPossible) possibleGameTypes.push("Ladies");
  possibleGameTypes.push("Open"); // Open is always technically possible
  
  // Check individual preferences - ALL players must be OK with the game type
  const playersOkWithMixed = players.every(p => 
    !p.playPreferences || 
    p.playPreferences.length === 0 || 
    p.playPreferences.includes("Mixed")
  );
  
  const playersOkWithLadies = players.every(p => 
    !p.playPreferences || 
    p.playPreferences.length === 0 || 
    p.playPreferences.includes("Ladies")
  );
  
  const playersOkWithOpen = players.every(p => 
    !p.playPreferences || 
    p.playPreferences.length === 0 || 
    p.playPreferences.includes("Open")
  );
  
  // Check if any valid game type is possible with EVERYONE'S preferences
  const acceptableGameTypes = [];
  if (isMixedPossible && playersOkWithMixed) acceptableGameTypes.push("Mixed");
  if (isLadiesPossible && playersOkWithLadies) acceptableGameTypes.push("Ladies");
  if (playersOkWithOpen) acceptableGameTypes.push("Open");
  
  return acceptableGameTypes.length > 0;
};

/**
 * Determines the best game type based on players and their preferences
 * Gives priority to preferences of players at the top of the queue
 */
export const determineBestGameType = (players: Player[]): "Mixed" | "Ladies" | "Open" | null => {
  if (players.length !== 4) return null;
  
  // Check if preference feature is enabled
  const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
  if (!prefEnabled) return "Open"; // Default when preferences aren't enabled
  
  // Count genders
  const maleCount = players.filter(p => p.gender === "male").length;
  const femaleCount = players.filter(p => p.gender === "female").length;
  
  // Determine physically possible game types
  const isMixedPossible = maleCount === 2 && femaleCount === 2;
  const isLadiesPossible = femaleCount === 4;
  
  // Get preferences of the highest priority player (top of queue)
  const topPlayerPrefs = players[0]?.playPreferences || [];
  
  // Check if all players are OK with each game type
  const allAcceptMixed = players.every(p => 
    !p.playPreferences?.length || p.playPreferences.includes("Mixed")
  );
  
  const allAcceptLadies = players.every(p => 
    !p.playPreferences?.length || p.playPreferences.includes("Ladies")
  );
  
  const allAcceptOpen = players.every(p => 
    !p.playPreferences?.length || p.playPreferences.includes("Open")
  );
  
  // Priority order: Try to match top player's preference first while ensuring all players accept it
  if (topPlayerPrefs.length > 0) {
    // Check each preference of the top player in order
    for (const pref of topPlayerPrefs) {
      if (pref === "Mixed" && isMixedPossible && allAcceptMixed) return "Mixed";
      if (pref === "Ladies" && isLadiesPossible && allAcceptLadies) return "Ladies";
      if (pref === "Open" && allAcceptOpen) return "Open";
    }
  }
  
  // If top player has no preferences or we couldn't satisfy them, use default priority
  if (isMixedPossible && allAcceptMixed) return "Mixed";
  if (isLadiesPossible && allAcceptLadies) return "Ladies";
  if (allAcceptOpen) return "Open";
  
  // If we couldn't form a valid game with everyone's preferences
  return null;
};

/**
 * Gets the configured player pool size from localStorage 
 */
export const getPlayerPoolSize = (): number => {
  return Number(localStorage.getItem("playerPoolSize")) || 8;
};

/**
 * Gets game history from IndexedDB (with fallback to localStorage)
 */
export const getGameHistory = async (): Promise<Array<{players: string[], timestamp: number}>> => {
  try {
    const games = await gameHistoryDB.getGameHistory(50);
    return games.map(game => ({
      players: game.players,
      timestamp: game.timestamp
    }));
  } catch (e) {
    console.error("Error loading game history from IndexedDB:", e);
    
    // Fallback to localStorage
    try {
      const history = localStorage.getItem("gameHistory");
      return history ? JSON.parse(history) : [];
    } catch (fallbackError) {
      console.error("Error loading game history from localStorage fallback:", fallbackError);
      return [];
    }
  }
};

/**
 * Records a new game in IndexedDB (with fallback to localStorage)
 */
export const recordGame = async (playerNames: string[]): Promise<void> => {
  try {
    await gameHistoryDB.addGame(playerNames);
    console.log("Game recorded in IndexedDB");
  } catch (e) {
    console.error("Error recording game to IndexedDB:", e);
    
    // Fallback to localStorage
    try {
      const history = await getGameHistory();
      const newGame = {
        players: [...playerNames].sort(),
        timestamp: Date.now()
      };
      
      const updatedHistory = [newGame, ...history].slice(0, 50);
      localStorage.setItem("gameHistory", JSON.stringify(updatedHistory));
      console.log("Game recorded in localStorage as fallback");
    } catch (fallbackError) {
      console.error("Error recording game to localStorage fallback:", fallbackError);
    }
  }
};

/**
 * Calculates how many times a group of players has played together
 */
export const getPlayedTogetherCount = async (playerNames: string[]): Promise<number> => {
  try {
    return await gameHistoryDB.getPlayedTogetherCount(playerNames);
  } catch (e) {
    console.error("Error getting played together count from IndexedDB:", e);
    
    // Fallback to localStorage
    const history = await getGameHistory();
    const sortedNames = [...playerNames].sort();
    
    return history.filter(game => {
      return game.players.length === sortedNames.length &&
             game.players.every(name => sortedNames.includes(name));
    }).length;
  }
};

/**
 * Calculates a penalty score for how often players have played together
 * Higher score = played together more often
 */
export const calculateRepeatPenalty = async (players: Player[]): Promise<number> => {
  const playerNames = players.map(p => p.name);
  
  // Check full group of 4
  const fullGroupCount = await getPlayedTogetherCount(playerNames);
  
  // Check all possible pairs within the group
  let pairPenalty = 0;
  for (let i = 0; i < playerNames.length; i++) {
    for (let j = i + 1; j < playerNames.length; j++) {
      const pairCount = await getPlayedTogetherCount([playerNames[i], playerNames[j]]);
      pairPenalty += pairCount;
    }
  }
  
  // Weight full group repetition more heavily than pair repetition
  return (fullGroupCount * 10) + (pairPenalty * 2);
};

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

// Migrate existing localStorage data to IndexedDB on app start
gameHistoryDB.migrateFromLocalStorage().catch(console.error);
