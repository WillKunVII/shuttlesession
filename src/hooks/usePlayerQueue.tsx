
import { useState, useEffect } from "react";
import { Player, PlayHistory } from "@/types/playerTypes";
import { getStorageItem, setStorageItem } from "@/utils/storageUtils";
import { getPlayHistory, setPlayHistory, getPlayCount, updatePlayHistory } from "@/utils/playHistoryUtils";
import { selectPlayersFromPool } from "@/utils/playerSelectionUtils";
import { createNewPlayer, loadPlayerRecords } from "@/utils/queueOperations";

// Starting with no players in the queue
const initialPlayers: Player[] = [];

export function usePlayerQueue() {
  const [queue, setQueue] = useState<Player[]>(initialPlayers);
  const [playHistory, setPlayHistoryState] = useState<PlayHistory>({});
  
  // Load queue from localStorage on component mount
  useEffect(() => {
    const savedQueue = localStorage.getItem("playerQueue");
    if (savedQueue) {
      try {
        const queueData = JSON.parse(savedQueue);
        const updatedQueue = loadPlayerRecords(queueData);
        setQueue(updatedQueue);
      } catch (e) {
        console.error("Error parsing queue from localStorage", e);
      }
    }
    
    // Load play history from localStorage
    const historyData = getPlayHistory();
    setPlayHistoryState(historyData);
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("playerQueue", JSON.stringify(queue));
  }, [queue]);
  
  // Save play history to localStorage whenever it changes
  useEffect(() => {
    setPlayHistory(playHistory);
  }, [playHistory]);

  // Helper function for player play count lookup
  const playCountLookup = (player1Id: string, player2Id: string): number => {
    return getPlayCount(playHistory, player1Id, player2Id);
  };

  // Add player to queue
  const addPlayerToQueue = (player: Omit<Player, "id" | "waitingTime">) => {
    const newPlayer = createNewPlayer(player);
    setQueue([...queue, newPlayer]);
  };

  // Remove player from queue
  const removePlayerFromQueue = (playerId: string) => {
    setQueue(queue.filter(player => player.id !== playerId));
  };

  // Add multiple players to queue
  const addPlayersToQueue = (players: Player[]) => {
    // Always add players to the end of the queue for fair rotation
    setQueue([...queue, ...players]);
  };

  // Remove multiple players from queue and return them
  const removePlayersFromQueue = (playerIds: string[]) => {
    const selectedPlayers = queue.filter(p => playerIds.includes(p.id));
    setQueue(queue.filter(p => !playerIds.includes(p.id)));
    return selectedPlayers;
  };

  // Return players to their original positions in the queue
  const returnPlayersToOriginalPositions = (players: Player[]) => {
    if (players.length === 0) return;
    
    // Prepare the players to be reinserted with original positions preserved
    const playersToReinsert = [...players].map(player => ({
      ...player,
      // Reset waiting time for returned players
      waitingTime: 0
    }));
    
    // Add them to the front of the queue to ensure they have priority
    setQueue([...playersToReinsert, ...queue]);
  };

  // Auto select top players from the queue
  const autoSelectPlayers = (count: number = 4) => {
    // Get player pool size from settings or default to 8
    const poolSize = Number(localStorage.getItem("playerPoolSize")) || 8;
    
    const selectedPlayers = selectPlayersFromPool(queue, count, poolSize, playCountLookup);
    
    if (selectedPlayers.length === count) {
      // Update play history for the new game
      const selectedIds = selectedPlayers.map(player => player.id);
      const newHistory = updatePlayHistory(playHistory, selectedIds);
      setPlayHistoryState(newHistory);
      
      // Remove selected players from queue
      setQueue(queue.filter(p => !selectedIds.includes(p.id)));
      
      return selectedPlayers;
    }
    return [];
  };

  // Get the current player pool size setting
  const getPlayerPoolSize = () => {
    return Number(localStorage.getItem("playerPoolSize")) || 8;
  };

  return {
    queue,
    addPlayerToQueue,
    removePlayerFromQueue,
    addPlayersToQueue,
    removePlayersFromQueue,
    autoSelectPlayers,
    getPlayerPoolSize,
    returnPlayersToOriginalPositions
  };
}
