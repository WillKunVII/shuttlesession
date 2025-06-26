
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
    // Always show dialog, even if there are no session scores.
    // No early returns.

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

      // Create player list from session scores OR from all members if scores are empty
      let playersList: Player[];
      if (Object.keys(sessionScores).length > 0) {
        playersList = Object.entries(sessionScores).map(([name, scores], index) => {
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
      } else {
        // If sessionScores are empty, use members
        playersList = members.map((member, i) => ({
          id: member.id ?? i + 1000,
          name: member.name,
          gender: member.gender ?? "male",
          isGuest: !!member.isGuest,
          waitingTime: 0,
          wins: 0,
          losses: 0,
          sessionWins: 0,
          sessionLosses: 0
        }));
      }

      // Calculate total wins (wins - losses) for all players
      const playersWithTotalWins = playersList.map(player => {
        const wins = player.wins ?? 0;
        const losses = player.losses ?? 0;
        const totalWins = wins - losses; // This can be negative
        const gamesPlayed = wins + losses;
        return {
          ...player,
          totalWins,
          gamesPlayed,
        };
      });

      // Sort by total wins descending, then by most games played (descending), then by wins (descending)
      const sortedPlayers = playersWithTotalWins.sort((a, b) => {
        if (b.totalWins !== a.totalWins) {
          return b.totalWins - a.totalWins;
        }
        if (b.gamesPlayed !== a.gamesPlayed) {
          return b.gamesPlayed - a.gamesPlayed;
        }
        // Final tiebreak by wins
        return (b.wins ?? 0) - (a.wins ?? 0);
      });

      // Group players into Gold, Silver, Bronze based on total wins
      const gold: Player[] = [];
      const silver: Player[] = [];
      const bronze: Player[] = [];

      // Get the total wins for 1st, 2nd, and 3rd place
      // Only consider unique total wins values
      const totalWinsValues = Array.from(new Set(sortedPlayers.map(p => p.totalWins))).slice(0, 3);

      // Assign players to their respective medals
      sortedPlayers.forEach(player => {
        if (player.totalWins === totalWinsValues[0]) {
          gold.push(player);
        } else if (totalWinsValues.length > 1 && player.totalWins === totalWinsValues[1]) {
          silver.push(player);
        } else if (totalWinsValues.length > 2 && player.totalWins === totalWinsValues[2]) {
          bronze.push(player);
        }
      });

      setTopPlayers([gold, silver, bronze]);
      setHasScores(true); // Always set to true to always open dialog
    } catch (e) {
      console.error("Error processing session player scores", e);
      setTopPlayers([[], [], []]);
      setHasScores(true); // Still force dialog open in error case
    }
  };

  return { topPlayers, hasScores };
}
