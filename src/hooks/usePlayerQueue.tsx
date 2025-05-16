
import { useState, useEffect } from "react";
import { Player } from "./useGameAssignment";
import { PlayPreference } from "@/types/member";

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
                    losses: member.losses || 0,
                    playPreferences: member.playPreferences || []
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

  // Check if players can form a valid game based on preferences
  const canFormValidGame = (players: Player[]): boolean => {
    if (players.length !== 4) return false;
    
    // Check if play preferences are enabled
    const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
    if (!prefEnabled) return true;
    
    // Get all preferences
    const allPreferences = players.flatMap(p => p.playPreferences || []);
    
    // Check if Mixed game is possible and preferred
    const isMixedPossible = 
      players.filter(p => p.gender === "male").length === 2 && 
      players.filter(p => p.gender === "female").length === 2;
    
    const hasMixedPreference = allPreferences.includes("Mixed");
    
    // Check if Ladies game is possible and preferred
    const isLadiesPossible = 
      players.filter(p => p.gender === "female").length === 4;
    
    const hasLadiesPreference = allPreferences.includes("Ladies");
    
    // Check if any game type is possible
    const hasOpenPreference = allPreferences.includes("Open");
    
    // If Mixed is possible and preferred, or Ladies is possible and preferred,
    // or if Open play is allowed, then we can form a valid game
    return (isMixedPossible && hasMixedPreference) || 
           (isLadiesPossible && hasLadiesPreference) || 
           hasOpenPreference || 
           !prefEnabled;
  };

  // Auto select top players from the queue based on player pool size
  const autoSelectPlayers = (count: number = 4) => {
    // Check if player preferences are enabled
    const prefEnabled = localStorage.getItem("enablePlayerPreferences") === "true";
    
    // Get player pool size from settings or default to 8
    const poolSize = Number(localStorage.getItem("playerPoolSize")) || 8;
    const poolPlayers = queue.slice(0, Math.min(poolSize, queue.length));
    
    if (poolPlayers.length >= count) {
      if (!prefEnabled) {
        // If preferences are not enabled, just select the top players
        const selectedPlayers = poolPlayers.slice(0, count);
        const selectedIds = selectedPlayers.map(p => p.id);
        
        // Remove selected players from queue
        setQueue(queue.filter(p => !selectedIds.includes(p.id)));
        
        return selectedPlayers;
      } else {
        // Try to find a valid game based on preferences
        // First attempt: look for a Mixed game
        const males = poolPlayers.filter(p => p.gender === "male" && (p.playPreferences?.includes("Mixed") || p.playPreferences?.length === 0));
        const females = poolPlayers.filter(p => p.gender === "female" && (p.playPreferences?.includes("Mixed") || p.playPreferences?.length === 0));
        
        if (males.length >= 2 && females.length >= 2) {
          const selectedPlayers = [...males.slice(0, 2), ...females.slice(0, 2)];
          const selectedIds = selectedPlayers.map(p => p.id);
          
          // Remove selected players from queue
          setQueue(queue.filter(p => !selectedIds.includes(p.id)));
          
          return selectedPlayers;
        }
        
        // Second attempt: look for a Ladies game
        const ladiesPlayers = poolPlayers.filter(
          p => p.gender === "female" && (p.playPreferences?.includes("Ladies") || p.playPreferences?.length === 0)
        );
        
        if (ladiesPlayers.length >= 4) {
          const selectedPlayers = ladiesPlayers.slice(0, 4);
          const selectedIds = selectedPlayers.map(p => p.id);
          
          // Remove selected players from queue
          setQueue(queue.filter(p => !selectedIds.includes(p.id)));
          
          return selectedPlayers;
        }
        
        // Third attempt: look for an Open game
        const openPlayers = poolPlayers.filter(
          p => p.playPreferences?.includes("Open") || p.playPreferences?.length === 0
        );
        
        if (openPlayers.length >= 4) {
          const selectedPlayers = openPlayers.slice(0, 4);
          const selectedIds = selectedPlayers.map(p => p.id);
          
          // Remove selected players from queue
          setQueue(queue.filter(p => !selectedIds.includes(p.id)));
          
          return selectedPlayers;
        }
        
        // If no valid game can be formed based on preferences, return empty array
        return [];
      }
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
    canFormValidGame
  };
}
