
import { Player } from "../types/player";
import { canFormValidGame, determineBestGameType, getPlayerPoolSize, findBestCombination } from "../utils/gameUtils";

type UsePlayerSelectionOptions = {
  piggybackPairs?: { master: number; partner: number }[];
};

export function usePlayerSelection(queue: Player[], options?: UsePlayerSelectionOptions) {
  const autoSelectPlayers = async (count: number = 4): Promise<Player[]> => {
    // Piggyback support: find pairs, treat each as a block
    const piggybackPairs = options?.piggybackPairs || [];
    let poolPlayers = [...queue].slice(0, Math.min(getPlayerPoolSize(), queue.length));
    let pairBlocks: Player[][] = [];

    // Build pair blocks and exclude them from solo considerations
    const pairedIds = new Set(piggybackPairs.flatMap(p => [p.master, p.partner]));
    for (const pair of piggybackPairs) {
      const master = poolPlayers.find(p => p.id === pair.master);
      const partner = poolPlayers.find(p => p.id === pair.partner);
      if (master && partner) {
        pairBlocks.push([master, partner]);
      }
    }
    // Remove paired IDs from pool for solo
    const soloPlayers = poolPlayers.filter(p => !pairedIds.has(p.id));

    // Now, try every grouping of pairs + solos that totals exactly 4
    // Try all combinations: ([pair1]+solos), ([pair1, pair2]), (no pairs)
    // Only include a pair if BOTH are present in queue!
    const allCombos: Player[][] = [];

    function combine(blocks: Player[][], curr: Player[], needed: number) {
      if (needed === 0) { allCombos.push(curr); return; }
      // Try next pair block (if it fits)
      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].length <= needed) {
          const rest = blocks.slice(i + 1);
          combine(rest, curr.concat(blocks[i]), needed - blocks[i].length);
        }
      }
      // If no pair fits, fill with solos
      if (needed <= soloPlayers.length) {
        allCombos.push(curr.concat(soloPlayers.slice(0, needed)));
      }
    }
    combine(pairBlocks, [], count);

    // Now, pick the first valid combination we find
    for (const combo of allCombos) {
      if (combo.length === 4 && canFormValidGame(combo)) {
        return combo;
      }
    }
    // Fallback: try normal selection for now
    return [];
  };

  return { autoSelectPlayers };
}
