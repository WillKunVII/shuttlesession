
import { useEffect } from "react";
import { Player } from "../types/player";
import { getStorageItem, getSessionScores } from "@/utils/storageUtils";

/**
 * Hook for loading/saving player data to localStorage
 */
export function usePlayerPersistence(queue: Player[], setQueue: React.Dispatch<React.SetStateAction<Player[]>>) {
  // Load queue from localStorage on component mount
  useEffect(() => {
    const savedQueue = localStorage.getItem("playerQueue");
    if (savedQueue) {
      try {
        const queueData = JSON.parse(savedQueue);
        
        // Load win/loss records if score keeping is enabled
        if (localStorage.getItem("scoreKeeping") !== "false") {
          const membersData = localStorage.getItem("members");
          const sessionScores = getSessionScores();
          
          if (membersData) {
            try {
              const members = JSON.parse(membersData);
              
              // Update queue players with win/loss data from members and session scores
              const updatedQueue = queueData.map((player: Player) => {
                const member = members.find((m: any) => m.name === player.name);
                const sessionScore = sessionScores[player.name] || { wins: 0, losses: 0 };
                
                if (member) {
                  return {
                    ...player,
                    wins: member.wins || 0,
                    losses: member.losses || 0,
                    sessionWins: sessionScore.wins || 0,
                    sessionLosses: sessionScore.losses || 0,
                    playPreferences: member.playPreferences || []
                  };
                }
                return {
                  ...player,
                  sessionWins: sessionScore.wins || 0,
                  sessionLosses: sessionScore.losses || 0
                };
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
  }, [setQueue]);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("playerQueue", JSON.stringify(queue));
  }, [queue]);
}
