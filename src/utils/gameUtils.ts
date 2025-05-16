
import { Player } from "../types/player";

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
