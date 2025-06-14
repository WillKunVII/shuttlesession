import { useState } from "react";
import { Player } from "../types/player";
import { PlayPreference } from "../types/member";
import { usePlayerSelection } from "./usePlayerSelection";
import { usePlayerPersistence } from "./usePlayerPersistence";
import { canFormValidGame, getPlayerPoolSize } from "../utils/gameUtils";
import { getSessionScores } from "../utils/storageUtils";

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
    // Get session scores
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
    
    // If score keeping is enabled, try to get win/loss record
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
    
    setQueue(prevQueue => [...prevQueue, newPlayer]);
  };

  // Remove player from queue
  const removePlayerFromQueue = (playerId: number) => {
    setQueue(prevQueue => prevQueue.filter(player => player.id !== playerId));
  };

  // Add multiple players to queue with position control
  const addPlayersToQueue = (players: Player[], returnToOriginalPositions: boolean = false, winners: string[] = []) => {
    if (returnToOriginalPositions) {
      // For clearing selection - return players to their original positions
      setQueue(prevQueue => {
        // Get the original queue state that was saved when players were selected
        const originalQueueStr = localStorage.getItem("originalPlayerQueue");
        if (!originalQueueStr) {
          // If we don't have original positions, just add to the end
          console.log("No original queue positions found, adding to end");
          return [...prevQueue, ...players];
        }
        
        try {
          // Parse the original queue
          const originalQueue: Player[] = JSON.parse(originalQueueStr);
          
          // Create a map of player names to their original positions
          const originalPositions = new Map<string, number>();
          originalQueue.forEach((player, index) => {
            originalPositions.set(player.name, index);
          });
          
          // Sort returning players based on their original positions
          const sortedReturningPlayers = [...players].sort((a, b) => {
            const posA = originalPositions.get(a.name);
            const posB = originalPositions.get(b.name);
            
            // If both players are in the original positions map, sort by position
            if (posA !== undefined && posB !== undefined) {
              return posA - posB;
            }
            // If only player A is in the map, they should come first
            if (posA !== undefined) {
              return -1;
            }
            // If only player B is in the map, they should come first
            if (posB !== undefined) {
              return 1;
            }
            // If neither player is in the map, maintain their current order
            return 0;
          });
          
          // Create a merged queue by inserting returning players at their original positions
          let newQueue = [...prevQueue];
          for (const player of sortedReturningPlayers) {
            const originalPos = originalPositions.get(player.name);
            if (originalPos !== undefined) {
              // Find insertion index - limited by current queue length
              const insertionIndex = Math.min(originalPos, newQueue.length);
              newQueue.splice(insertionIndex, 0, player);
            } else {
              // If player wasn't in original queue, add to end
              newQueue.push(player);
            }
          }
          
          return newQueue;
        } catch (error) {
          console.error("Error restoring players to original positions:", error);
          // Fallback: just add to end of queue
          return [...prevQueue, ...players];
        }
      });
    } else if (winners && winners.length > 0) {
      // Game ended with winners - add all players to end of queue, with winners above losers
      setQueue(prevQueue => {
        // Separate players into winners and losers
        const winningPlayers = players.filter(p => winners.includes(p.name));
        const losingPlayers = players.filter(p => !winners.includes(p.name));
        
        // Add all players to end of queue, winners first then losers
        return [...prevQueue, ...winningPlayers, ...losingPlayers];
      });
    } else {
      // Simply add players to the end of queue (for game ended without winners)
      setQueue(prevQueue => [...prevQueue, ...players]);
    }
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
      // Save original queue state before removing the selected players
      localStorage.setItem("originalPlayerQueue", JSON.stringify(queue));
      
      // Remove selected players from queue
      const selectedIds = selectedPlayers.map(p => p.id);
      setQueue(prevQueue => prevQueue.filter(p => !selectedIds.includes(p.id)));
      return selectedPlayers;
    }
    
    return [];
  };

  // Update a player's info in queue (by name)
  const updatePlayerInfo = (updated: { name: string, gender?: "male" | "female", isGuest?: boolean, playPreferences?: PlayPreference[] }) => {
    setQueue(prevQueue =>
      prevQueue.map(player =>
        player.name === updated.name
          ? {
              ...player,
              ...(updated.gender && { gender: updated.gender }),
              ...(typeof updated.isGuest === "boolean" && { isGuest: updated.isGuest }),
              ...(updated.playPreferences && { playPreferences: updated.playPreferences })
            }
          : player
      )
    );
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
    updatePlayerInfo // <--- Expose updater
  };
}
