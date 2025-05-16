import { useState } from "react";
import { Player } from "../types/player";
import { PlayPreference } from "../types/member";
import { usePlayerSelection } from "./usePlayerSelection";
import { usePlayerPersistence } from "./usePlayerPersistence";
import { canFormValidGame, getPlayerPoolSize } from "../utils/gameUtils";

// Starting with no players in the queue
const initialPlayers: Player[] = [];

export function usePlayerQueue() {
  const [queue, setQueue] = useState<Player[]>(initialPlayers);
  
  // Use the persistence hook for loading/saving player data
  usePlayerPersistence(queue, setQueue);
  
  // Use the player selection hook for auto-selecting players
  const { autoSelectPlayers: selectPlayers } = usePlayerSelection(queue);

  // Add player to queue
  const addPlayerToQueue = (player: Omit<Player, "id" | "waitingTime">) => {
    const newPlayer: Player = {
      id: Date.now(),
      name: player.name,
      gender: player.gender,
      isGuest: player.isGuest,
      waitingTime: 0,
      playPreferences: player.playPreferences || []
    };
    
    // If score keeping is enabled, try to get win/loss record
    if (localStorage.getItem("scoreKeeping") === "true") {
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
    
    setQueue([...queue, newPlayer]);
  };

  // Remove player from queue
  const removePlayerFromQueue = (playerId: number) => {
    setQueue(queue.filter(player => player.id !== playerId));
  };

  // Add multiple players to queue - always at the end now to ensure fair rotation
  const addPlayersToQueue = (players: Player[]) => {
    // Always add players to the end of the queue for fair rotation
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
    const selectedPlayers = selectPlayers(count);
    
    if (selectedPlayers.length === count) {
      // Remove selected players from queue
      const selectedIds = selectedPlayers.map(p => p.id);
      setQueue(queue.filter(p => !selectedIds.includes(p.id)));
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
    autoSelectPlayers,
    getPlayerPoolSize,
    canFormValidGame
  };
}
