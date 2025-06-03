
import { gameHistoryDB } from "./indexedDbUtils";

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
export const calculateRepeatPenalty = async (players: import("../types/player").Player[]): Promise<number> => {
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
