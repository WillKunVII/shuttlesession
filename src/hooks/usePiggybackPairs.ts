
import { useState } from "react";

// Each pair has a master and a partner; one player can only be in one pair.
export type PiggybackPair = { master: number; partner: number };

function getInitialPairs(): PiggybackPair[] {
  const saved = localStorage.getItem("piggybackPairs");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (p: any) =>
            typeof p.master === "number" && typeof p.partner === "number" && p.master !== p.partner
        );
      }
    } catch {}
  }
  return [];
}

export function usePiggybackPairs() {
  const [piggybackPairs, setPiggybackPairs] = useState<PiggybackPair[]>(getInitialPairs);

  const persist = (pairs: PiggybackPair[]) => {
    setPiggybackPairs(pairs);
    localStorage.setItem("piggybackPairs", JSON.stringify(pairs));
  };

  // Add a new pair, removing the players from any previous pairs
  function addPair(master: number, partner: number) {
    // Remove both if they exist elsewhere
    let newPairs = piggybackPairs.filter(pair =>
      pair.master !== master &&
      pair.partner !== master &&
      pair.master !== partner &&
      pair.partner !== partner
    );
    newPairs.push({ master, partner });
    persist(newPairs);
  }

  // Remove a pair if player is the master
  function removePairByMaster(master: number) {
    persist(piggybackPairs.filter(pair => pair.master !== master));
  }

  // Utility: find a pair involving a player
  function findPairOf(playerId: number): PiggybackPair | undefined {
    return piggybackPairs.find(pair => pair.master === playerId || pair.partner === playerId);
  }
  // Is master or not
  function isMaster(playerId: number) {
    return piggybackPairs.some(pair => pair.master === playerId);
  }
  // Is partner or not
  function isPartner(playerId: number) {
    return piggybackPairs.some(pair => pair.partner === playerId);
  }

  // Clear all pairs (for example after user action)
  function clearAllPairs() {
    persist([]);
  }

  return {
    piggybackPairs,
    addPair,
    removePairByMaster,
    findPairOf,
    isMaster,
    isPartner,
    clearAllPairs
  };
}
