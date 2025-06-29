
import { Player } from "../types/player";

/**
 * Checks if a set of players can form a valid game based on preferences
 */
export const canFormValidGame = (players: Player[]): boolean => {
  if (players.length !== 4) return false;
  
  // Check if play preferences are enabled
  const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
  if (!prefEnabled) return true;
  
  // Determine the best possible game type for this combination
  const gameType = determineBestGameType(players);
  
  // If no valid game type can be determined, the game is invalid
  return gameType !== null;
};

/**
 * Checks if a player accepts a specific game type based on their preferences
 */
function playerAcceptsGameType(player: Player, gameType: string): boolean {
  const prefs = player.playPreferences || [];
  
  // If player has no preferences set, they accept all game types
  if (prefs.length === 0) return true;
  
  // If player has explicit preferences, they must include this game type
  return prefs.includes(gameType as any);
}

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
  
  // Check if all players accept each game type
  const allAcceptMixed = players.every(p => playerAcceptsGameType(p, "Mixed"));
  const allAcceptLadies = players.every(p => playerAcceptsGameType(p, "Ladies"));
  const allAcceptOpen = players.every(p => playerAcceptsGameType(p, "Open"));
  
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
  // But still respect what all players can accept
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
