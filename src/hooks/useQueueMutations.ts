
import { Player } from "../types/player";
import { PlayPreference } from "../types/member";
import { getSessionScores } from "../utils/storageUtils";
import { generatePlayerId } from "../utils/playerIdGenerator";

// Cache for member lookups to avoid repeated localStorage reads
let memberCache: any[] = [];
let memberCacheTimestamp = 0;
const MEMBER_CACHE_TTL = 5000; // 5 seconds

function getMembersFromCache(): any[] {
  const now = Date.now();
  if (now - memberCacheTimestamp > MEMBER_CACHE_TTL) {
    try {
      const membersData = localStorage.getItem("members");
      memberCache = membersData ? JSON.parse(membersData) : [];
      memberCacheTimestamp = now;
    } catch (e) {
      console.error("Error caching members data", e);
      memberCache = [];
    }
  }
  return memberCache;
}

/**
 * Returns a set of mutation helpers for the player queue.
 * Each function receives the current queue and returns a new queue.
 */
export function useQueueMutations() {
  // Add player to queue (optimized with caching)
  function addPlayer(prevQueue: Player[], player: Omit<Player, "id" | "waitingTime">): Player[] {
    const sessionScores = getSessionScores();
    const sessionScore = sessionScores[player.name] || { wins: 0, losses: 0 };

    // Try to get existing member ID from cache
    let playerId = generatePlayerId();
    const members = getMembersFromCache();
    const existingMember = members.find((m: any) => m.name === player.name);
    if (existingMember && existingMember.id) {
      playerId = existingMember.id;
    }

    console.log("useQueueMutations: Adding player with ID", playerId, "name:", player.name);

    const newPlayer: Player = {
      id: playerId,
      name: player.name,
      gender: player.gender,
      isGuest: player.isGuest,
      waitingTime: 0,
      sessionWins: sessionScore.wins,
      sessionLosses: sessionScore.losses,
      playPreferences: player.playPreferences || []
    };

    // Pull score keeping and member record
    if (localStorage.getItem("scoreKeeping") !== "false") {
      if (existingMember) {
        newPlayer.wins = existingMember.wins || 0;
        newPlayer.losses = existingMember.losses || 0;
        newPlayer.playPreferences = existingMember.playPreferences || [];
        newPlayer.rating = existingMember.rating || 1000;
      }
    }
    
    return [...prevQueue, newPlayer];
  }

  // Remove single player (optimized)
  function removePlayer(prevQueue: Player[], playerId: number): Player[] {
    return prevQueue.filter(player => player.id !== playerId);
  }

  // Remove multiple players, returning them as selected
  function removePlayers(queue: Player[], playerIds: number[]): Player[] {
    return queue.filter(p => playerIds.includes(p.id));
  }

  // Add multiple players to queue with proper order (optimized)
  function addPlayersWithOrder(prevQueue: Player[], players: Player[], returnToOriginalPositions: boolean = false, winners: string[] = []) {
    if (returnToOriginalPositions) {
      const originalQueueStr = localStorage.getItem("originalPlayerQueue");
      if (!originalQueueStr) {
        return [...prevQueue, ...players];
      }
      try {
        const originalQueue: Player[] = JSON.parse(originalQueueStr);
        const originalPositions = new Map<string, number>();
        originalQueue.forEach((player, index) => {
          originalPositions.set(player.name, index);
        });
        
        // Optimized sorting and insertion
        const sortedReturningPlayers = [...players].sort((a, b) => {
          const posA = originalPositions.get(a.name) ?? Infinity;
          const posB = originalPositions.get(b.name) ?? Infinity;
          return posA - posB;
        });
        
        let newQueue = [...prevQueue];
        for (const player of sortedReturningPlayers) {
          const originalPos = originalPositions.get(player.name);
          if (originalPos !== undefined) {
            const insertionIndex = Math.min(originalPos, newQueue.length);
            newQueue.splice(insertionIndex, 0, player);
          } else {
            newQueue.push(player);
          }
        }
        return newQueue;
      } catch (err) {
        console.error("Error restoring players to original positions:", err);
        return [...prevQueue, ...players];
      }
    } else if (winners && winners.length > 0) {
      const winningPlayers = players.filter(p => winners.includes(p.name));
      const losingPlayers = players.filter(p => !winners.includes(p.name));
      return [...prevQueue, ...winningPlayers, ...losingPlayers];
    } else {
      return [...prevQueue, ...players];
    }
  }

  // Update player info by ID (optimized with reduced object spreading)
  function updatePlayerInfo(prevQueue: Player[], updated: { 
    id?: number; 
    name: string; 
    gender?: "male" | "female"; 
    isGuest?: boolean; 
    playPreferences?: PlayPreference[] 
  }) {
    return prevQueue.map(player => {
      const matches = updated.id ? player.id === updated.id : player.name === updated.name;
      
      if (!matches) return player;
      
      // Optimized update with minimal object creation
      const updatedPlayer = { ...player, name: updated.name };
      if (updated.gender !== undefined) updatedPlayer.gender = updated.gender;
      if (updated.isGuest !== undefined) updatedPlayer.isGuest = updated.isGuest;
      if (updated.playPreferences !== undefined) updatedPlayer.playPreferences = updated.playPreferences;
      
      return updatedPlayer;
    });
  }

  return {
    addPlayer,
    removePlayer,
    removePlayers,
    addPlayersWithOrder,
    updatePlayerInfo
  };
}
