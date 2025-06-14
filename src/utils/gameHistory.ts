
// All references now use IDs exclusively for stats/game records

import { gameHistoryDB } from "./indexedDbUtils";
import { Player } from "../types/player";

/**
 * Gets game history from IndexedDB (returns array of GameRecord objects with IDs)
 */
export const getGameHistory = async (): Promise<any[]> => {
  try {
    const games = await gameHistoryDB.getGameHistory(50);
    return games;
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
 * Records a new game in IndexedDB (with fallback). Now expects complete player objects (with ID)
 */
export const recordGame = async (players: Player[], winnerIds?: number[]): Promise<void> => {
  try {
    await gameHistoryDB.addGame(players, undefined, undefined, winnerIds);
    console.log("Game recorded in IndexedDB (IDs)");
  } catch (e) {
    console.error("Error recording game to IndexedDB:", e);

    // Fallback to localStorage
    try {
      const history = await getGameHistory();
      const newGame = {
        playerIds: players.map(p => p.id),
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
 * Calculates how many times a group of players has played together by IDs
 */
export const getPlayedTogetherCount = async (playerIds: number[]): Promise<number> => {
  try {
    return await gameHistoryDB.getPlayedTogetherCount(playerIds);
  } catch (e) {
    console.error("Error getting played together count by ID from IndexedDB:", e);
    // Fallback to localStorage
    const history = await getGameHistory();
    const sortedIds = [...playerIds].sort();
    return history.filter(game => {
      return game.playerIds &&
        game.playerIds.length === sortedIds.length &&
        game.playerIds.every((id: number) => sortedIds.includes(id));
    }).length;
  }
};

/**
 * Calculates a penalty score for how often players have played together.
 * Higher score = played together more often. IDs only!
 */
export const calculateRepeatPenalty = async (players: Player[]): Promise<number> => {
  const playerIds = players.map(p => p.id);
  const fullGroupCount = await getPlayedTogetherCount(playerIds);
  let pairPenalty = 0;
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const pairCount = await getPlayedTogetherCount([playerIds[i], playerIds[j]]);
      pairPenalty += pairCount;
    }
  }
  return (fullGroupCount * 10) + (pairPenalty * 2);
};
