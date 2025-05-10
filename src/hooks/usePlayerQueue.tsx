
import { useState } from "react";
import { Player } from "./useGameAssignment";

// Starting with no players in the queue
const initialPlayers: Player[] = [];

export function usePlayerQueue() {
  const [queue, setQueue] = useState<Player[]>(initialPlayers);

  // Add player to queue
  const addPlayerToQueue = (player: Omit<Player, "id" | "skill" | "waitingTime">) => {
    const newPlayer: Player = {
      id: Date.now(),
      name: player.name,
      gender: player.gender,
      isGuest: player.isGuest,
      skill: "intermediate", // Default skill level
      waitingTime: 0
    };
    
    setQueue([...queue, newPlayer]);
  };

  // Remove player from queue
  const removePlayerFromQueue = (playerId: number) => {
    setQueue(queue.filter(player => player.id !== playerId));
  };

  // Add multiple players to queue
  const addPlayersToQueue = (players: Player[]) => {
    setQueue([...queue, ...players]);
  };

  // Remove multiple players from queue and return them
  const removePlayersFromQueue = (playerIds: number[]) => {
    const selectedPlayers = queue.filter(p => playerIds.includes(p.id));
    setQueue(queue.filter(p => !playerIds.includes(p.id)));
    return selectedPlayers;
  };

  // Auto select top players from the queue
  const autoSelectPlayers = (count: number = 4) => {
    if (queue.length >= count) {
      const selectedPlayers = queue.slice(0, count);
      setQueue(queue.slice(count));
      return selectedPlayers;
    }
    return [];
  };

  return {
    queue,
    addPlayerToQueue,
    removePlayerFromQueue,
    addPlayersToQueue,
    removePlayersFromQueue,
    autoSelectPlayers
  };
}
