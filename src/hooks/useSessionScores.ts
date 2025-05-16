
import { useState, useEffect } from "react";
import { Player } from "@/types/player";
import { getStorageItem } from "@/utils/storageUtils";

interface SessionScore {
  wins: number;
  losses: number;
}

export function useSessionScores(isOpen: boolean) {
  const [topPlayers, setTopPlayers] = useState<Array<Player[]>>([[], [], []]);
  const [hasScores, setHasScores] = useState(false);

  // Load and rank players when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAndRankPlayers();
    }
  }, [isOpen]);

  const loadAndRankPlayers = () => {
    // Get session scores
    const sessionScores = getStorageItem<Record<string, SessionScore>>("sessionScores", {});
    
    if (Object.keys(sessionScores).length === 0) {
      setHasScores(false);
      return;
    }

    try {
      // Get all members to get player metadata
      const membersData = localStorage.getItem("members");
      let members: Player[] = [];
      
      if (membersData) {
        try {
          members = JSON.parse(membersData);
        } catch (e) {
          console.error("Error parsing members data", e);
        }
      }
      
      // Create player list from session scores
      const playersList: Player[] = Object.entries(sessionScores).map(([name, scores]) => {
        const member = members.find(m => m.name === name);
        return {
          name,
          gender: member?.gender || "male",
          isGuest: member?.isGuest || false,
          wins: scores.wins,
          losses: scores.losses
        };
      });
      
      // Filter players with wins
      const playersWithWins = playersList.filter(player => player.wins && player.wins > 0);
      
      // Sort players by wins (descending) and then by losses (ascending)
      const sortedPlayers = playersWithWins.sort((a, b) => {
        const winsA = a.wins || 0;
        const winsB = b.wins || 0;
        const lossesA = a.losses || 0;
        const lossesB = b.losses || 0;
        
        if (winsB !== winsA) {
          return winsB - winsA; // Sort by wins descending
        }
        return lossesA - lossesB; // If same wins, sort by losses ascending
      });
      
      if (sortedPlayers.length === 0) {
        setHasScores(false);
        return;
      }
      
      // Group players into Gold, Silver, Bronze based on wins
      const gold: Player[] = [];
      const silver: Player[] = [];
      const bronze: Player[] = [];
      
      // Get the win counts for 1st, 2nd, and 3rd place
      const winCounts = Array.from(new Set(sortedPlayers.map(p => p.wins))).slice(0, 3);
      
      // Assign players to their respective medals
      sortedPlayers.forEach(player => {
        const playerWins = player.wins || 0;
        
        if (playerWins === winCounts[0]) {
          gold.push(player);
        } else if (winCounts.length > 1 && playerWins === winCounts[1]) {
          silver.push(player);
        } else if (winCounts.length > 2 && playerWins === winCounts[2]) {
          bronze.push(player);
        }
      });
      
      setTopPlayers([gold, silver, bronze]);
      setHasScores(true);
    } catch (e) {
      console.error("Error processing session player scores", e);
      setHasScores(false);
    }
  };

  return { topPlayers, hasScores };
}
