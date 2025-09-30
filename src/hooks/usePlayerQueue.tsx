import { useState } from "react";
import { Player } from "../types/player";
import { PlayPreference } from "../types/member";
import { usePlayerSelection } from "./usePlayerSelection";
import { usePlayerPersistence } from "./usePlayerPersistence";
import { canFormValidGame, getPlayerPoolSize } from "../utils/gameUtils";
import { getSessionScores } from "../utils/storageUtils";
import { useQueueMutations } from "./useQueueMutations";

// Starting with no players in the queue
const initialPlayers: Player[] = [];

type PiggybackPair = { master: number; partner: number };
type UsePlayerQueueArgs = {
  piggybackPairs: PiggybackPair[];
  addPiggybackPair?: (master: number, partner: number) => void;
  removePiggybackPair?: (master: number) => void;
  findPiggybackPair?: (playerId: number) => PiggybackPair | undefined;
  clearPiggybackPairs?: () => void;
};

export function usePlayerQueue(args: UsePlayerQueueArgs) {
  const [queue, setQueue] = useState<Player[]>(initialPlayers);

  // Use the persistence hook for loading/saving player data
  usePlayerPersistence(queue, setQueue);

  // Piggyback from props/args
  const { piggybackPairs } = args;

  // Use the player selection hook for auto-selecting players, and pass piggybackPairs!
  const { autoSelectPlayers: selectPlayers } = usePlayerSelection(queue, { piggybackPairs });

  // Expose queue mutation helpers
  const {
    addPlayer,
    removePlayer,
    removePlayers,
    addPlayersWithOrder,
    updatePlayerInfo
  } = useQueueMutations();

  // Add player to queue
  const addPlayerToQueue = (player: Omit<Player, "id" | "waitingTime">) => {
    setQueue(prevQueue => addPlayer(prevQueue, player));
  };

  // Remove player from queue
  const removePlayerFromQueue = (playerId: number) => {
    setQueue(prevQueue => removePlayer(prevQueue, playerId));
  };

  // Add multiple players to queue with position control
  const addPlayersToQueue = (players: Player[], returnToOriginalPositions: boolean = false, winners: string[] = [], priorityInsert: boolean = false) => {
    setQueue(prevQueue => addPlayersWithOrder(prevQueue, players, returnToOriginalPositions, winners, priorityInsert));
  };

  // Remove multiple players from queue and return them
  const removePlayersFromQueue = (playerIds: number[]) => {
    // Save the current queue when removing players for possible future restoration
    localStorage.setItem("originalPlayerQueue", JSON.stringify(queue));
    const selectedPlayers = queue.filter(p => playerIds.includes(p.id));
    setQueue(prevQueue => prevQueue.filter(p => !playerIds.includes(p.id)));
    return selectedPlayers;
  };

  // Auto select top players from the queue - now async
  const autoSelectPlayers = async (count: number = 4): Promise<Player[]> => {
    const selectedPlayers = await selectPlayers(count);

    if (selectedPlayers.length === count) {
      localStorage.setItem("originalPlayerQueue", JSON.stringify(queue));
      const selectedIds = selectedPlayers.map(p => p.id);
      setQueue(prevQueue => prevQueue.filter(p => !selectedIds.includes(p.id)));
      return selectedPlayers;
    }

    return [];
  };

  // Update a player's info in queue (by name)
  const updatePlayer = (updated: { name: string, gender?: "male" | "female", isGuest?: boolean, playPreferences?: PlayPreference[] }) => {
    setQueue(prevQueue =>
      updatePlayerInfo(prevQueue, updated)
    );
  };

  // Sync external queue changes back to internal state
  const syncQueue = (externalQueue: Player[]) => {
    setQueue(externalQueue);
  };

  return {
    queue,
    addPlayerToQueue,
    removePlayerFromQueue,
    addPlayersToQueue,
    removePlayersFromQueue,
    autoSelectPlayers,
    getPlayerPoolSize,
    canFormValidGame,
    updatePlayerInfo: updatePlayer,
    piggybackPairs,
    syncQueue, // Expose sync function for external state updates
  };
}
