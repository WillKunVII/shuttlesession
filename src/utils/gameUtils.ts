
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
  
  // Check individual preferences
  const playersWantMixed = players.filter(p => 
    !p.playPreferences || 
    p.playPreferences.length === 0 || 
    p.playPreferences.includes("Mixed")
  ).length === 4;
  
  const playersWantLadies = players.filter(p => 
    !p.playPreferences || 
    p.playPreferences.length === 0 || 
    p.playPreferences.includes("Ladies")
  ).length === 4;
  
  const playersWantOpen = players.filter(p => 
    !p.playPreferences || 
    p.playPreferences.length === 0 || 
    p.playPreferences.includes("Open")
  ).length === 4;
  
  // Check if any valid game type is possible
  return (isMixedPossible && playersWantMixed) || 
         (isLadiesPossible && playersWantLadies) || 
         playersWantOpen;
};

/**
 * Gets the configured player pool size from localStorage 
 */
export const getPlayerPoolSize = (): number => {
  return Number(localStorage.getItem("playerPoolSize")) || 8;
};
