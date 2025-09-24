
import { useState } from "react";
import { Player } from "../types/player";

// Each pair has a master and a partner; one player can only be in one pair.
export type PiggybackPair = { master: number; partner: number };

// Original position storage for masters
const ORIGINAL_POSITIONS_KEY = "piggybackOriginalPositions";

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

function getOriginalPositions(): Record<number, number> {
  const saved = localStorage.getItem(ORIGINAL_POSITIONS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  return {};
}

function saveOriginalPositions(positions: Record<number, number>) {
  localStorage.setItem(ORIGINAL_POSITIONS_KEY, JSON.stringify(positions));
}

export function usePiggybackPairs(queueManipulation?: {
  getQueue: () => Player[];
  setQueue: (updater: (prev: Player[]) => Player[]) => void;
}) {
  const [piggybackPairs, setPiggybackPairs] = useState<PiggybackPair[]>(getInitialPairs);

  const persist = (pairs: PiggybackPair[]) => {
    setPiggybackPairs(pairs);
    localStorage.setItem("piggybackPairs", JSON.stringify(pairs));
  };

  // Add a new pair, removing the players from any previous pairs
  function addPair(master: number, partner: number) {
    // Store original position of master if queue manipulation is available
    if (queueManipulation) {
      const currentQueue = queueManipulation.getQueue();
      const masterIndex = currentQueue.findIndex(p => p.id === master);
      const partnerIndex = currentQueue.findIndex(p => p.id === partner);
      
      if (masterIndex !== -1 && partnerIndex !== -1) {
        // Store master's original position
        const originalPositions = getOriginalPositions();
        originalPositions[master] = masterIndex;
        saveOriginalPositions(originalPositions);
        
        // Move master to be just above partner (partner position - 1)
        const targetPosition = Math.max(0, partnerIndex);
        
        queueManipulation.setQueue(prevQueue => {
          const newQueue = [...prevQueue];
          const masterPlayer = newQueue[masterIndex];
          
          // Remove master from current position
          newQueue.splice(masterIndex, 1);
          
          // Adjust target position if master was before partner
          const adjustedTarget = masterIndex < partnerIndex ? targetPosition - 1 : targetPosition;
          
          // Insert master at target position
          newQueue.splice(adjustedTarget, 0, masterPlayer);
          
          return newQueue;
        });
      }
    }
    
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
    // Restore master's original position if available
    if (queueManipulation) {
      const originalPositions = getOriginalPositions();
      const originalPosition = originalPositions[master];
      
      if (typeof originalPosition === 'number') {
        const currentQueue = queueManipulation.getQueue();
        const currentMasterIndex = currentQueue.findIndex(p => p.id === master);
        
        if (currentMasterIndex !== -1) {
          queueManipulation.setQueue(prevQueue => {
            const newQueue = [...prevQueue];
            const masterPlayer = newQueue[currentMasterIndex];
            
            // Remove master from current position
            newQueue.splice(currentMasterIndex, 1);
            
            // Find best position to restore (original or next best available)
            const targetPosition = Math.min(originalPosition, newQueue.length);
            
            // Insert master at target position
            newQueue.splice(targetPosition, 0, masterPlayer);
            
            return newQueue;
          });
        }
        
        // Clean up stored position
        delete originalPositions[master];
        saveOriginalPositions(originalPositions);
      }
    }
    
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
    // Clear stored original positions
    localStorage.removeItem(ORIGINAL_POSITIONS_KEY);
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
