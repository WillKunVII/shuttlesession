import { Player } from "../types/player";
import { PlayPreference } from "../types/member";
import { getSessionScores } from "../utils/storageUtils";

/**
 * Returns a set of mutation helpers for the player queue.
 * Each function receives the current queue and returns a new queue.
 */
export function useQueueMutations() {
  // Add player to queue (expect where 'id' and 'waitingTime' are auto-assigned)
  function addPlayer(prevQueue: Player[], player: Omit<Player, "id" | "waitingTime">): Player[] {
    const sessionScores = getSessionScores();
    const sessionScore = sessionScores[player.name] || { wins: 0, losses: 0 };

    const newPlayer: Player = {
      id: Date.now(),
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
      const membersData = localStorage.getItem("members");
      if (membersData) {
        try {
          const members = JSON.parse(membersData);
          const member = members.find((m: any) => m.name === player.name);
          if (member) {
            newPlayer.wins = member.wins || 0;
            newPlayer.losses = member.losses || 0;
            newPlayer.playPreferences = member.playPreferences || [];
          }
        } catch (e) {
          console.error("Error getting member win/loss data", e);
        }
      }
    }
    return [...prevQueue, newPlayer];
  }

  // Remove single player
  function removePlayer(prevQueue: Player[], playerId: number): Player[] {
    return prevQueue.filter(player => player.id !== playerId);
  }

  // Remove multiple players, returning them as selected
  function removePlayers(queue: Player[], playerIds: number[]): Player[] {
    return queue.filter(p => playerIds.includes(p.id));
  }

  // Add multiple players to queue with proper order
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
        const sortedReturningPlayers = [...players].sort((a, b) => {
          const posA = originalPositions.get(a.name);
          const posB = originalPositions.get(b.name);
          if (posA !== undefined && posB !== undefined) return posA - posB;
          if (posA !== undefined) return -1;
          if (posB !== undefined) return 1;
          return 0;
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

  // Update player info by name
  function updatePlayerInfo(prevQueue: Player[], updated: { name: string, gender?: "male" | "female", isGuest?: boolean, playPreferences?: PlayPreference[] }) {
    return prevQueue.map(player => (
      player.name === updated.name
        ? {
            ...player,
            ...(updated.gender && { gender: updated.gender }),
            ...(typeof updated.isGuest === "boolean" && { isGuest: updated.isGuest }),
            ...(updated.playPreferences && { playPreferences: updated.playPreferences })
          }
        : player
    ));
  }

  return {
    addPlayer,
    removePlayer,
    removePlayers,
    addPlayersWithOrder,
    updatePlayerInfo
  };
}
