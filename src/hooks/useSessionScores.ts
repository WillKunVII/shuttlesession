
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
      const playersList: Player[] = Object.entries(sessionScores).map(([name, scores], index) => {
        const member = members.find(m => m.name === name);
        return {
          id: member?.id || index + 1000, // Use member ID if available, or generate one
          name,
          gender: member?.gender || "male",
          isGuest: member?.isGuest || false,
          waitingTime: 0, // Required property by Player interface
          wins: scores.wins,
          losses: scores.losses,
          sessionWins: scores.wins,
          sessionLosses: scores.losses
        };
      });

      // Ignore players who haven't played any games
      const playersWithGames = playersList.filter(player =>
        (player.wins ?? 0) + (player.losses ?? 0) > 0
      );

      if (playersWithGames.length === 0) {
        setHasScores(false);
        return;
      }

      // Calculate win rate, add winRate as a property (not in type, but for sorting)
      const playersWithWinRate = playersWithGames.map(player => {
        const wins = player.wins ?? 0;
        const losses = player.losses ?? 0;
        const gamesPlayed = wins + losses;
        const winRate = gamesPlayed > 0 ? wins / gamesPlayed : 0;
        return {
          ...player,
          winRate,
          gamesPlayed,
        };
      });

      // Sort by win rate descending, then by most games played (descending), then by wins (descending)
      const sortedPlayers = playersWithWinRate.sort((a, b) => {
        if (b.winRate !== a.winRate) {
          return b.winRate - a.winRate;
        }
        if (b.gamesPlayed !== a.gamesPlayed) {
          return b.gamesPlayed - a.gamesPlayed;
        }
        // Final tiebreak by wins
        return (b.wins ?? 0) - (a.wins ?? 0);
      });

      // Group players into Gold, Silver, Bronze based on win rate
      const gold: Player[] = [];
      const silver: Player[] = [];
      const bronze: Player[] = [];

      // Get the win rates for 1st, 2nd, and 3rd place
      // Only consider unique win rates
      const winRates = Array.from(new Set(sortedPlayers.map(p => p.winRate))).slice(0, 3);

      // Assign players to their respective medals
      sortedPlayers.forEach(player => {
        if (player.winRate === winRates[0]) {
          gold.push(player);
        } else if (winRates.length > 1 && player.winRate === winRates[1]) {
          silver.push(player);
        } else if (winRates.length > 2 && player.winRate === winRates[2]) {
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
