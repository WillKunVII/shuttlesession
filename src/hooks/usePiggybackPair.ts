
import { useState } from "react";

/**
 * Handles reading, setting, and clearing the "piggyback pair" in localStorage and state.
 * Always returns [piggybackPair, togglePiggybackPlayer, clearPiggyback]
 */
export function usePiggybackPair() {
  const [piggybackPair, setPiggybackPair] = useState<number[]>(() => {
    const saved = localStorage.getItem("piggybackPair");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length <= 2) return parsed;
      } catch {}
    }
    return [];
  });

  // persist piggyback pair to localStorage
  const savePiggybackPair = (pair: number[]) => {
    setPiggybackPair(pair);
    localStorage.setItem("piggybackPair", JSON.stringify(pair));
    console.log("Piggyback pair saved:", pair);
  };

  // Add or remove a player to piggyback pair
  const togglePiggybackPlayer = (playerId: number) => {
    console.log("togglePiggybackPlayer called with id:", playerId);
    if (piggybackPair.includes(playerId)) {
      const newPair = piggybackPair.filter(id => id !== playerId);
      savePiggybackPair(newPair);
    } else if (piggybackPair.length < 2) {
      savePiggybackPair([...piggybackPair, playerId]);
    } else {
      // If 2 already, replace the oldest
      savePiggybackPair([piggybackPair[1], playerId]);
    }
  };

  // Clear piggyback (e.g. after assignment)
  const clearPiggyback = () => {
    savePiggybackPair([]);
  };

  return {
    piggybackPair,
    togglePiggybackPlayer,
    clearPiggyback
  };
}
