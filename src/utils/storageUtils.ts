
/**
 * Utility functions for working with localStorage
 * Centralizes storage operations and adds error handling
 */

// Generic get function with type safety
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error retrieving ${key} from localStorage:`, e);
    return defaultValue;
  }
}

// Generic set function with error handling
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Helper for boolean settings
export function getSettingEnabled(key: string, defaultValue = false): boolean {
  return localStorage.getItem(key) === "true" || defaultValue;
}

// Common application settings
export function getPlayerPoolSize(): number {
  return Number(localStorage.getItem("playerPoolSize")) || 8;
}

export function getCourtCount(): number {
  return Number(localStorage.getItem("courtCount")) || 4; // Default to 4 courts
}

export function isScoreKeepingEnabled(): boolean {
  // Changed to return true by default when no value is set
  return localStorage.getItem("scoreKeeping") !== "false";
}

// Session-specific score tracking
export function getSessionScores(): Record<string, {wins: number, losses: number}> {
  return getStorageItem("sessionScores", {});
}

export function setSessionScores(scores: Record<string, {wins: number, losses: number}>): void {
  setStorageItem("sessionScores", scores);
}

export function clearSessionScores(): void {
  localStorage.removeItem("sessionScores");
}

// Specific data getters/setters
export function getQueue() {
  return getStorageItem("playerQueue", []);
}

export function setQueue(queue: any[]) {
  setStorageItem("playerQueue", queue);
}

export function getNextGamePlayers() {
  return getStorageItem("nextGamePlayers", []);
}

export function setNextGamePlayers(players: any[]) {
  setStorageItem("nextGamePlayers", players);
}

export function getCourts() {
  return getStorageItem("courts", []);
}

export function setCourts(courts: any[]) {
  setStorageItem("courts", courts);
}

export function getMembers() {
  return getStorageItem("members", []);
}

export function setMembers(members: any[]) {
  setStorageItem("members", members);
}

// NEW: Piggyback enabled setting - DEFAULT TO DISABLED
export function getPiggybackEnabled(): boolean {
  const val = localStorage.getItem("piggybackEnabled");
  // Default: false (disabled)
  return val === null ? false : val === "true";
}
export function setPiggybackEnabled(enabled: boolean): void {
  localStorage.setItem("piggybackEnabled", enabled ? "true" : "false");
}
