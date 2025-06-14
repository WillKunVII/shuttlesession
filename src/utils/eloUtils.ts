
/**
 * ELO utilities for updating hidden player ratings.
 * Simple implementation, can be swapped for Glicko/TrueSkill later.
 * Hidden from UI for now.
 */

export function calculateElo(
  winnerRating: number,
  loserRating: number,
  k: number = 32
): { winnerNew: number; loserNew: number } {
  // Standard ELO formula
  const expectedWin = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLose = 1 - expectedWin;
  return {
    winnerNew: Math.round(winnerRating + k * (1 - expectedWin)),
    loserNew: Math.round(loserRating + k * (0 - expectedLose))
  };
}

/**
 * Given all players and a list of winner names, returns updated
 * players with new ratings (does not mutate original).
 */
export function updatePlayersElo(
  players: { name: string; rating?: number }[],
  winnerNames: string[],
  k: number = 32
): { name: string; rating: number }[] {
  // For doubles, two winners, two losers
  if (players.length !== 4) return players.map(p => ({ ...p, rating: p.rating ?? 1000 }));

  const playerDict: Record<string, number> = {};
  players.forEach(p => (playerDict[p.name] = typeof p.rating === "number" ? p.rating : 1000));

  const winners = players.filter(p => winnerNames.includes(p.name));
  const losers = players.filter(p => !winnerNames.includes(p.name));

  let [w1, w2] = winners;
  let [l1, l2] = losers;

  // Calculate new ratings for each winner vs each loser (pairwise, same as 2v2 chess ELO)
  const { winnerNew: w1_v_l1, loserNew: l1_v_w1 } = calculateElo(playerDict[w1.name], playerDict[l1.name], k);
  const { winnerNew: w1_v_l2, loserNew: l2_v_w1 } = calculateElo(playerDict[w1.name], playerDict[l2.name], k);
  const { winnerNew: w2_v_l1, loserNew: l1_v_w2 } = calculateElo(playerDict[w2.name], playerDict[l1.name], k);
  const { winnerNew: w2_v_l2, loserNew: l2_v_w2 } = calculateElo(playerDict[w2.name], playerDict[l2.name], k);

  // Average all for each player (each plays 2 pairs)
  const winner1New = Math.round((w1_v_l1 + w1_v_l2) / 2);
  const winner2New = Math.round((w2_v_l1 + w2_v_l2) / 2);
  const loser1New = Math.round((l1_v_w1 + l1_v_w2) / 2);
  const loser2New = Math.round((l2_v_w1 + l2_v_w2) / 2);

  return players.map(p => {
    if (p.name === w1.name) return { name: p.name, rating: winner1New };
    if (p.name === w2.name) return { name: p.name, rating: winner2New };
    if (p.name === l1.name) return { name: p.name, rating: loser1New };
    if (p.name === l2.name) return { name: p.name, rating: loser2New };
    // default:
    return { ...p, rating: typeof p.rating === "number" ? p.rating : 1000 };
  });
}
