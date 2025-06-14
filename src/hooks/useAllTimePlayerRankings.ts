
import { useEffect, useState } from "react";
import { Player } from "@/types/player";
import { gameHistoryDB } from "@/utils/indexedDbUtils";
import { getMembers } from "@/utils/storageUtils";

// Stats stored in IndexedDB playerStats: {name, gamesPlayed, lastPlayed, partners, wins, losses}
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
    // Get playerStats from IndexedDB
    try {
      // Get all members for metadata (gender, guest, etc)
      const members: Player[] = getMembers();

      // Get all playerStats from indexedDB (players that have played at any time)
      // We'll use a little trick: get recent games, extract all player names, then load their stats
      const allGames = await gameHistoryDB.getGameHistory(500);
      const allNamesSet = new Set<string>();
      allGames.forEach(game => {
        game.players.forEach(name => allNamesSet.add(name));
      });
      const allNames = Array.from(allNamesSet);

      const playerStats = await Promise.all(
        allNames.map(async name => {
          // We'll extend playerStats to store wins/losses directly. 
          // Fallback: count wins/losses by parsing games if needed.
          // We expect gameHistoryDB.getPlayerStats to have .wins and .losses (see below).
          const stats: any = await gameHistoryDB.getPlayerStats(name);
          if (!stats) return null;
          return { ...stats, name };
        })
      );

      // Remove nulls and players < 3 games
      const eligibleStats = playerStats
        .filter(
          stats =>
            stats &&
            typeof stats.gamesPlayed === "number" &&
            stats.gamesPlayed >= 3 &&
            typeof stats.wins === "number" &&
            typeof stats.losses === "number"
        );

      if (eligibleStats.length === 0) {
        setHasScores(false);
        setTopPlayers([[], [], []]);
        return;
      }

      // Merge metadata for display
      const playersForRanking: AllTimeRankingPlayer[] = eligibleStats.map((stats, i) => {
        const member = members.find(m => m.name === stats.name);
        const gamesPlayed = stats.gamesPlayed;
        const wins = stats.wins;
        const losses = stats.losses;
        return {
          id: member?.id || i + 1000,
          name: stats.name,
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
