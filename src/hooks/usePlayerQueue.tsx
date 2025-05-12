
import { useState, useEffect } from "react";
import { Player } from "./useGameAssignment";

// Starting with no players in the queue
const initialPlayers: Player[] = [];

export function usePlayerQueue() {
  const [queue, setQueue] = useState<Player[]>(initialPlayers);
  const [removedPositions, setRemovedPositions] = useState<{id: number, position: number}[]>([]);

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
    // Clear any stored position for this player
    setRemovedPositions(removedPositions.filter(item => item.id !== playerId));
  };

  // Add multiple players to queue
  const addPlayersToQueue = (players: Player[]) => {
    // Check if any players have stored positions
    const playersToRestore = players.filter(p => 
      removedPositions.some(rp => rp.id === p.id)
    );
    
    const otherPlayers = players.filter(p => 
      !removedPositions.some(rp => rp.id === p.id)
    );
    
    // Create a new queue by restoring players to their positions
    if (playersToRestore.length > 0) {
      const newQueue = [...queue];
      
      // Sort removed positions to insert from highest index to lowest
      // to avoid shifting positions
      const sortedPositions = [...removedPositions]
        .filter(rp => playersToRestore.some(p => p.id === rp.id))
        .sort((a, b) => b.position - a.position);
        
      // Insert players back at their original positions
      sortedPositions.forEach(position => {
        const player = playersToRestore.find(p => p.id === position.id);
        if (player && position.position <= newQueue.length) {
          newQueue.splice(position.position, 0, player);
        } else if (player) {
          newQueue.push(player);
        }
      });
      
      // Add any players without stored positions at the end
      if (otherPlayers.length > 0) {
        newQueue.push(...otherPlayers);
      }
      
      setQueue(newQueue);
      
      // Clear restored positions
      setRemovedPositions(removedPositions.filter(rp => 
        !playersToRestore.some(p => p.id === rp.id)
      ));
    } else {
      // If no positions to restore, just add to the end
      setQueue([...queue, ...players]);
    }
  };

  // Remove multiple players from queue and return them
  const removePlayersFromQueue = (playerIds: number[]) => {
    // Store positions of removed players before removing them
    const positionsToStore = playerIds.map(id => {
      const index = queue.findIndex(p => p.id === id);
      return { id, position: index !== -1 ? index : queue.length };
    });
    
    // Add these positions to state
    setRemovedPositions([...removedPositions, ...positionsToStore]);
    
    const selectedPlayers = queue.filter(p => playerIds.includes(p.id));
    setQueue(queue.filter(p => !playerIds.includes(p.id)));
    return selectedPlayers;
  };

  // Auto select top players from the queue based on player pool size
  const autoSelectPlayers = (count: number = 4) => {
    // Get player pool size from settings or default to 8
    const poolSize = Number(localStorage.getItem("playerPoolSize")) || 8;
    const poolPlayers = queue.slice(0, Math.min(poolSize, queue.length));
    
    if (poolPlayers.length >= count) {
      // Only select from the player pool
      const selectedPlayers = poolPlayers.slice(0, count);
      const selectedIds = selectedPlayers.map(p => p.id);
      
      // Store positions before removing
      const positionsToStore = selectedIds.map(id => {
        const index = queue.findIndex(p => p.id === id);
        return { id, position: index };
      });
      
      setRemovedPositions([...removedPositions, ...positionsToStore]);
      
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
