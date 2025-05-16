
import { PlayHistory } from "@/types/playerTypes";
import { getStorageItem, setStorageItem } from "./storageUtils";

// Get play history from localStorage
export function getPlayHistory(): PlayHistory {
  return getStorageItem<PlayHistory>("playHistory", {});
}

// Save play history to localStorage
export function setPlayHistory(history: PlayHistory): void {
  setStorageItem("playHistory", history);
}

// Helper function to get play count between two players
export function getPlayCount(playHistory: PlayHistory, player1Id: string, player2Id: string): number {
  // Sort IDs to ensure consistent key regardless of order
  const [id1, id2] = [player1Id, player2Id].sort();
  const key = `${id1}-${id2}`;
  return playHistory[key] || 0;
}

// Helper function to update play history when players are selected for a game
export function updatePlayHistory(playHistory: PlayHistory, selectedPlayerIds: string[]): PlayHistory {
  const newHistory = { ...playHistory };
  
  // For each unique pair of players, increment their play count
  for (let i = 0; i < selectedPlayerIds.length; i++) {
    for (let j = i + 1; j < selectedPlayerIds.length; j++) {
      // Sort IDs to ensure consistent key regardless of order
      const [id1, id2] = [selectedPlayerIds[i], selectedPlayerIds[j]].sort();
      const key = `${id1}-${id2}`;
      
      newHistory[key] = (newHistory[key] || 0) + 1;
    }
  }
  
  return newHistory;
}
