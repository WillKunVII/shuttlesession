
import { Player } from "../types/player";

/**
 * Checks if a set of players can form a valid game based on preferences
 */
export const canFormValidGame = (players: Player[]): boolean => {
  if (players.length !== 4) return false;
  
  // Check if play preferences are enabled
  const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
  if (!prefEnabled) return true;
  
  // Get all preferences
  const allPreferences = players.flatMap(p => p.playPreferences || []);
  
  // Check if Mixed game is possible and preferred
  const isMixedPossible = 
    players.filter(p => p.gender === "male").length === 2 && 
    players.filter(p => p.gender === "female").length === 2;
  
  const hasMixedPreference = allPreferences.includes("Mixed");
  
  // Check if Ladies game is possible and preferred
  const isLadiesPossible = 
    players.filter(p => p.gender === "female").length === 4;
  
  const hasLadiesPreference = allPreferences.includes("Ladies");
  
  // Check if any game type is possible
  const hasOpenPreference = allPreferences.includes("Open");
  
  // If Mixed is possible and preferred, or Ladies is possible and preferred,
  // or if Open play is allowed, then we can form a valid game
  return (isMixedPossible && hasMixedPreference) || 
         (isLadiesPossible && hasLadiesPreference) || 
         hasOpenPreference || 
         !prefEnabled;
};

/**
 * Gets the configured player pool size from localStorage 
 */
export const getPlayerPoolSize = (): number => {
  return Number(localStorage.getItem("playerPoolSize")) || 8;
};
