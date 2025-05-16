
import { Player } from "@/types/playerTypes";

// Auto select top players from the queue based on player pool size and play history
export function selectPlayersFromPool(
  queue: Player[], 
  count: number = 4, 
  poolSize: number = 8, 
  playHistoryLookup: (player1Id: string, player2Id: string) => number
): Player[] {
  console.log(`selectPlayersFromPool called with ${queue.length} players in queue, selecting ${count} from max pool of ${poolSize}`);
  
  if (!queue || !Array.isArray(queue)) {
    console.error("Queue is not a valid array:", queue);
    return [];
  }
  
  // Get the available players from the pool
  const poolPlayers = queue.slice(0, Math.min(poolSize, queue.length));
  console.log(`Actual pool size: ${poolPlayers.length} players`);
  
  if (poolPlayers.length >= count) {
    // Always select the first player in queue to prioritize waiting time
    const firstPlayer = poolPlayers[0];
    const selectedPlayers = [firstPlayer];
    const selectedIds = [firstPlayer.id];
    const remainingPoolPlayers = poolPlayers.slice(1);
    
    // For each remaining spot, find the player who has played least with those already selected
    while (selectedPlayers.length < count) {
      if (remainingPoolPlayers.length === 0) {
        console.error("Not enough remaining players to complete selection");
        break; // Ensure we don't get stuck in an endless loop
      }
      
      let leastPlayedWithIndex = 0;
      let minTotalPlayCount = Infinity;
      
      // For each remaining player, calculate total play count with already selected players
      for (let i = 0; i < remainingPoolPlayers.length; i++) {
        const candidate = remainingPoolPlayers[i];
        let totalPlayCount = 0;
        
        // Sum up play count with each already selected player
        for (const selectedId of selectedIds) {
          totalPlayCount += playHistoryLookup(candidate.id, selectedId);
        }
        
        // If this player has played less with the selected ones, choose them
        if (totalPlayCount < minTotalPlayCount) {
          minTotalPlayCount = totalPlayCount;
          leastPlayedWithIndex = i;
        }
      }
      
      // Add the player with the least play history with selected players
      const nextPlayer = remainingPoolPlayers[leastPlayedWithIndex];
      selectedPlayers.push(nextPlayer);
      selectedIds.push(nextPlayer.id);
      
      // Remove this player from consideration
      remainingPoolPlayers.splice(leastPlayedWithIndex, 1);
    }
    
    // If we weren't able to get exactly 'count' players, return empty array
    if (selectedPlayers.length !== count) {
      console.error(`Could only select ${selectedPlayers.length} players, needed ${count}`);
      return [];
    }
    
    return selectedPlayers;
  }
  
  console.error(`Pool size ${poolPlayers.length} is less than required count ${count}`);
  return [];
}
