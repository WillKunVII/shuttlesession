import { useState, useEffect } from "react";
import { Player } from "./useGameAssignment";
import { getStorageItem, setStorageItem } from "@/utils/storageUtils";
import { nanoid } from "nanoid";

// Starting with no players in the queue
const initialPlayers: Player[] = [];

// Interface to track play history
interface PlayHistory {
  [playerPair: string]: number; // Key is player1Id-player2Id, value is count
}

export function usePlayerQueue() {
  const [queue, setQueue] = useState<Player[]>(initialPlayers);
  const [playHistory, setPlayHistory] = useState<PlayHistory>({});
  
  // Load queue from localStorage on component mount
  useEffect(() => {
    const savedQueue = localStorage.getItem("playerQueue");
    if (savedQueue) {
      try {
        const queueData = JSON.parse(savedQueue);
        
        // Load win/loss records if score keeping is enabled
        if (localStorage.getItem("scoreKeeping") === "true") {
          const membersData = localStorage.getItem("members");
          if (membersData) {
            try {
              const members = JSON.parse(membersData);
              
              // Update queue players with win/loss data from members
              const updatedQueue = queueData.map((player: Player) => {
                const member = members.find((m: any) => m.name === player.name);
                if (member) {
                  return {
                    ...player,
                    wins: member.wins || 0,
                    losses: member.losses || 0
                  };
                }
                return player;
              });
              
              setQueue(updatedQueue);
              return;
            } catch (e) {
              console.error("Error loading members data for win/loss records", e);
            }
          }
        }
        
        // If score keeping is disabled or members data couldn't be loaded
        setQueue(queueData);
      } catch (e) {
        console.error("Error parsing queue from localStorage", e);
      }
    }
    
    // Load play history from localStorage
    const savedPlayHistory = localStorage.getItem("playHistory");
    if (savedPlayHistory) {
      try {
        const historyData = JSON.parse(savedPlayHistory);
        setPlayHistory(historyData);
      } catch (e) {
        console.error("Error parsing play history from localStorage", e);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("playerQueue", JSON.stringify(queue));
  }, [queue]);
  
  // Save play history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("playHistory", JSON.stringify(playHistory));
  }, [playHistory]);

  // Helper function to get play count between two players
  const getPlayCount = (player1Id: string, player2Id: string): number => {
    // Sort IDs to ensure consistent key regardless of order
    const [id1, id2] = [player1Id, player2Id].sort();
    const key = `${id1}-${id2}`;
    return playHistory[key] || 0;
  };
  
  // Helper function to update play history when players are selected for a game
  const updatePlayHistory = (selectedPlayerIds: string[]) => {
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
    
    setPlayHistory(newHistory);
  };

  // Add player to queue
  const addPlayerToQueue = (player: Omit<Player, "id" | "waitingTime">) => {
    const newPlayer: Player = {
      id: nanoid(),
      name: player.name,
      gender: player.gender,
      isGuest: player.isGuest,
      waitingTime: 0
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
          }
        } catch (e) {
          console.error("Error getting member win/loss data", e);
        }
      }
    }
    
    setQueue([...queue, newPlayer]);
  };

  // Remove player from queue
  const removePlayerFromQueue = (playerId: string) => {
    setQueue(queue.filter(player => player.id !== playerId));
  };

  // Add multiple players to queue - always at the end now to ensure fair rotation
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
    
    // Get the current player pool size
    const poolSize = Number(localStorage.getItem("playerPoolSize")) || 8;
    
    // Create a new queue by merging the returned players with the existing queue
    // Try to maintain original order by sorting by ID (nanoid doesn't have inherent ordering)
    // Instead of sorting by ID, just add them back in the order they were created
    const mergedPlayers = [...queue, ...players];
    
    setQueue(mergedPlayers);
  };

  // Auto select top players from the queue based on player pool size and play history
  const autoSelectPlayers = (count: number = 4) => {
    // Get player pool size from settings or default to 8
    const poolSize = Number(localStorage.getItem("playerPoolSize")) || 8;
    
    // Get the available players from the pool
    const poolPlayers = queue.slice(0, Math.min(poolSize, queue.length));
    
    if (poolPlayers.length >= count) {
      // Always select the first player in queue to prioritize waiting time
      const firstPlayer = poolPlayers[0];
      const selectedPlayers = [firstPlayer];
      const selectedIds = [firstPlayer.id];
      const remainingPoolPlayers = poolPlayers.slice(1);
      
      // For each remaining spot, find the player who has played least with those already selected
      while (selectedPlayers.length < count) {
        let leastPlayedWithIndex = 0;
        let minTotalPlayCount = Infinity;
        
        // For each remaining player, calculate total play count with already selected players
        for (let i = 0; i < remainingPoolPlayers.length; i++) {
          const candidate = remainingPoolPlayers[i];
          let totalPlayCount = 0;
          
          // Sum up play count with each already selected player
          for (const selectedId of selectedIds) {
            totalPlayCount += getPlayCount(candidate.id, selectedId);
          }
          
          // If this player has played less with the selected ones, choose them
          if (totalPlayCount < minTotalPlayCount) {
            minTotalPlayCount = totalPlayCount;
            leastPlayedWithIndex = i;
          }
        }
        
        // Add the player with the least play history with selected players
        const nextPlayer = remainingPoolPlayers[leastPlayedWithIndex];
        selectedPlayers.push(nextPlayer);
        selectedIds.push(nextPlayer.id);
        
        // Remove this player from consideration
        remainingPoolPlayers.splice(leastPlayedWithIndex, 1);
      }
      
      // Update play history for the new game
      updatePlayHistory(selectedIds);
      
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
