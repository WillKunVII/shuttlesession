import { useEffect } from "react";
import { Player } from "../types/player";
import { getStorageItem, getSessionScores } from "@/utils/storageUtils";

/**
 * Hook for loading/saving player data to localStorage
 */
export function usePlayerPersistence(queue: Player[], setQueue: React.Dispatch<React.SetStateAction<Player[]>>) {
  useEffect(() => {
    const savedQueue = localStorage.getItem("playerQueue");
    if (savedQueue) {
      try {
        const queueData = JSON.parse(savedQueue);
        if (localStorage.getItem("scoreKeeping") !== "false") {
          const membersData = localStorage.getItem("members");
          const sessionScores = getSessionScores();
          if (membersData) {
            try {
              const members = JSON.parse(membersData);
              const updatedQueue = queueData.map((player: Player) => {
                const member = members.find((m: any) => m.name === player.name);
                const sessionScore = sessionScores[player.name] || { wins: 0, losses: 0 };
                return {
                  ...player,
                  wins: member?.wins || 0,
                  losses: member?.losses || 0,
                  playPreferences: member?.playPreferences || [],
                  sessionWins: sessionScore.wins || 0,
                  sessionLosses: sessionScore.losses || 0,
                  rating:
                    typeof member?.rating === "number"
                      ? member.rating
                      : typeof player.rating === "number"
                      ? player.rating
                      : 1000
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
        setQueue(
          queueData.map((player: Player) => ({
            ...player,
            rating: typeof player.rating === "number" ? player.rating : 1000
          }))
        );
      } catch (e) {
        console.error("Error parsing queue from localStorage", e);
      }
    }
  }, [setQueue]);

  useEffect(() => {
    localStorage.setItem("playerQueue", JSON.stringify(queue));
  }, [queue]);
}
