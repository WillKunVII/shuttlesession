
import { useState, useEffect } from "react";
import { Player } from "./useGameAssignment";
import { getStorageItem, setStorageItem } from "@/utils/storageUtils";

// Starting with no players in the queue
const initialPlayers: Player[] = [];

export function usePlayerQueue() {
  const [queue, setQueue] = useState<Player[]>(initialPlayers);
  
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
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("playerQueue", JSON.stringify(queue));
  }, [queue]);

  // Add player to queue
  const addPlayerToQueue = (player: Omit<Player, "id" | "waitingTime">) => {
    const newPlayer: Player = {
      id: Date.now(),
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

  // Auto select top players from the queue based on player pool size
  const autoSelectPlayers = (count: number = 4) => {
    // Get player pool size from settings or default to 8
    const poolSize = Number(localStorage.getItem("playerPoolSize")) || 8;
    
    // Always prioritize players at the top of the queue
    const poolPlayers = queue.slice(0, Math.min(poolSize, queue.length));
    
    if (poolPlayers.length >= count) {
      // Always select the first player in queue to prioritize waiting time
      const firstPlayer = poolPlayers[0];
      
      // For the remaining players, select randomly from the pool (excluding first player)
      const remainingPoolPlayers = poolPlayers.slice(1);
      const shuffledRemaining = [...remainingPoolPlayers]
        .sort(() => Math.random() - 0.5)
        .slice(0, count - 1);
      
      // Combine first player with randomly selected others
      const selectedPlayers = [firstPlayer, ...shuffledRemaining];
      const selectedIds = selectedPlayers.map(p => p.id);
      
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
    getPlayerPoolSize
  };
}
