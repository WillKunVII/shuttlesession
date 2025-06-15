
import { useEffect, useState } from "react";
import { Player } from "@/types/player";
import { gameHistoryDB } from "@/utils/indexedDbUtils";
import { getMembers } from "@/utils/storageUtils";

/**
 * Stats stored in IndexedDB playerStats: {playerId, ...}
 * All lookups/merges now use playerId for safety
 */
interface AllTimeRankingPlayer extends Player {
  gamesPlayed: number;
  winRate: number;
  wins: number;
  losses: number;
}

export function useAllTimePlayerRankings(isOpen: boolean) {
  const [topPlayers, setTopPlayers] = useState<Array<AllTimeRankingPlayer[]>>([[], [], []]);
  const [hasScores, setHasScores] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllTimeRankings();
    }
  }, [isOpen]);

  const loadAllTimeRankings = async () => {
    try {
      // Get members WITH ids for lookup (id is now required)
      const members: Player[] = getMembers();

      // Get all stats in a single scan (using all IDs seen in games)
      const allGames = await gameHistoryDB.getGameHistory(500);
      const allIdsSet = new Set<number>();
      allGames.forEach(game => (game.playerIds || []).forEach((id: number) => allIdsSet.add(id)));
      const allIds = Array.from(allIdsSet);

      const playerStats = await Promise.all(
        allIds.map(async id => {
          const stats: any = await gameHistoryDB.getPlayerStats(id);
          if (!stats) return null;
          return { ...stats, playerId: id };
        })
      );

      // [DEBUG] Print all stats regardless of eligibility
      console.log("All playerStats objects found:", playerStats);

      // Remove nulls and players with no recorded games (REMOVED the 3+ games restriction)
      const eligibleStats = playerStats.filter(
        stats =>
          stats &&
          typeof stats.gamesPlayed === "number" &&
          stats.gamesPlayed >= 1 && // only require at least 1 game played for eligibility now
          typeof stats.wins === "number" &&
          typeof stats.losses === "number"
      );

      // [DEBUG] Print players that are eligible (should have >=1 games now)
      console.log("Eligible stats for Player of Month:", eligibleStats);

      if (eligibleStats.length === 0) {
        setHasScores(false);
        setTopPlayers([[], [], []]);
        return;
      }

      // Merge metadata for display
      const playersForRanking: AllTimeRankingPlayer[] = eligibleStats.map((stats, i) => {
        const member = members.find(m => m.id === stats.playerId);
        const gamesPlayed = stats.gamesPlayed;
        const wins = stats.wins;
        const losses = stats.losses;
        return {
          id: stats.playerId,
          name: member?.name || stats.name || `Player ${stats.playerId}`,
          gender: member?.gender || "male",
          isGuest: member?.isGuest || false,
          waitingTime: 0,
          wins,
          losses,
          gamesPlayed,
          winRate: gamesPlayed > 0 ? wins / gamesPlayed : 0,
        };
      });

      // Sort by win rate descending, then by most games played, then by wins
      const sorted = [...playersForRanking].sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
        return b.wins - a.wins;
      });

      // Unique win rates, medals
      const winRates = Array.from(new Set(sorted.map(p => p.winRate))).slice(0, 3);
      const gold: AllTimeRankingPlayer[] = [];
      const silver: AllTimeRankingPlayer[] = [];
      const bronze: AllTimeRankingPlayer[] = [];
      sorted.forEach(player => {
        if (player.winRate === winRates[0]) gold.push(player);
        else if (winRates.length > 1 && player.winRate === winRates[1]) silver.push(player);
        else if (winRates.length > 2 && player.winRate === winRates[2]) bronze.push(player);
      });
      setTopPlayers([gold, silver, bronze]);
      setHasScores(true);
    } catch (e) {
      setHasScores(false);
      setTopPlayers([[], [], []]);
      console.error("All time stats error", e);
    }
  };

  return { topPlayers, hasScores };
}
