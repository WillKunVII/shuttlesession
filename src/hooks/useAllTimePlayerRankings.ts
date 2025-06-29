
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
      console.log("useAllTimePlayerRankings: Starting to load rankings");
      
      // Get members WITH ids for lookup (id is now required)
      const members: Player[] = getMembers();
      console.log("useAllTimePlayerRankings: Found members", members.map(m => ({ id: m.id, name: m.name })));

      // Get all stats in a single scan (using all IDs seen in games)
      const allGames = await gameHistoryDB.getGameHistory(500);
      console.log("useAllTimePlayerRankings: Found games", allGames.length);
      
      const allIdsSet = new Set<number>();
      allGames.forEach(game => {
        if (Array.isArray(game.playerIds)) {
          game.playerIds.forEach((id: number) => allIdsSet.add(id));
        }
      });
      const allIds = Array.from(allIdsSet);
      console.log("useAllTimePlayerRankings: Found unique player IDs in games", allIds);

      const playerStats = await Promise.all(
        allIds.map(async id => {
          const stats: any = await gameHistoryDB.getPlayerStats(id);
          if (!stats) {
            console.log(`useAllTimePlayerRankings: No stats found for player ID ${id}`);
            return null;
          }
          console.log(`useAllTimePlayerRankings: Stats for player ID ${id}:`, stats);
          return { ...stats, playerId: id };
        })
      );

      console.log("useAllTimePlayerRankings: All player stats loaded:", playerStats);

      // Remove nulls and players with no recorded games (require at least 1 game)
      const eligibleStats = playerStats.filter(
        stats =>
          stats &&
          typeof stats.gamesPlayed === "number" &&
          stats.gamesPlayed >= 1 &&
          typeof stats.wins === "number" &&
          typeof stats.losses === "number"
      );

      console.log("useAllTimePlayerRankings: Eligible stats for Player of Month:", eligibleStats);

      if (eligibleStats.length === 0) {
        console.log("useAllTimePlayerRankings: No eligible players found");
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
        
        const player = {
          id: stats.playerId,
          name: member?.name || stats.name || `Player ${stats.playerId}`,
          gender: member?.gender || "male" as const,
          isGuest: member?.isGuest || false,
          waitingTime: 0,
          wins,
          losses,
          gamesPlayed,
          winRate: gamesPlayed > 0 ? wins / gamesPlayed : 0,
        };
        
        console.log(`useAllTimePlayerRankings: Processed player ${player.name}:`, {
          wins: player.wins,
          losses: player.losses,
          gamesPlayed: player.gamesPlayed,
          winRate: player.winRate
        });
        
        return player;
      });

      // Sort by win rate descending, then by most games played, then by wins
      const sorted = [...playersForRanking].sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
        return b.wins - a.wins;
      });

      console.log("useAllTimePlayerRankings: Sorted players:", sorted.map(p => ({
        name: p.name,
        wins: p.wins,
        losses: p.losses,
        winRate: p.winRate
      })));

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
      
      console.log("useAllTimePlayerRankings: Medal distribution:", {
        gold: gold.map(p => p.name),
        silver: silver.map(p => p.name),
        bronze: bronze.map(p => p.name)
      });
      
      setTopPlayers([gold, silver, bronze]);
      setHasScores(true);
    } catch (e) {
      console.error("useAllTimePlayerRankings: Error loading all time stats", e);
      setHasScores(false);
      setTopPlayers([[], [], []]);
    }
  };

  return { topPlayers, hasScores };
}
