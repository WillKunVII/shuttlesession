
import { Player } from "@/types/player";
import { getSessionScores, setSessionScores } from "@/utils/storageUtils";
import { updatePlayersElo } from "@/utils/eloUtils";
import { recordGame } from "@/utils/gameUtils";

export async function saveGameResults(
  players: Player[],
  selectedWinners: string[]
): Promise<void> {
  console.log("GameResultsHandler: Starting to save game results", { players, selectedWinners });

  // 1. Load the full list of members from localStorage
  const membersData = localStorage.getItem("members");
  let members: any[] = [];
  if (membersData) {
    try {
      members = JSON.parse(membersData);
    } catch (e) {
      console.error("Error parsing members data", e);
    }
  }

  // 2. Session score tracking (localStorage)
  const sessionScores = getSessionScores();

  // 3. ELO calculation and sync
  const prevRatingsLookup: Record<string, number> = {};
  players.forEach((player) => {
    const memberRating =
      members.find((m: any) => m.name === player.name)?.rating ??
      (player.rating ?? 1000);
    prevRatingsLookup[player.name] = memberRating;
  });

  const updated = updatePlayersElo(
    players.map((p) => ({
      name: p.name,
      rating: prevRatingsLookup[p.name],
    })),
    selectedWinners
  );
  for (const upd of updated) {
    const idx = members.findIndex((m: any) => m.name === upd.name);
    if (idx !== -1) members[idx].rating = upd.rating;
  }

  // 4. Update wins/losses for players in the full members array
  players.forEach((player) => {
    const playerName = player.name;
    const isWinner = selectedWinners.includes(playerName);

    // Update session scores
    if (!sessionScores[playerName]) {
      sessionScores[playerName] = { wins: 0, losses: 0 };
    }
    if (isWinner) {
      sessionScores[playerName].wins += 1;
    } else {
      sessionScores[playerName].losses += 1;
    }

    // Update full member record
    const memberIndex = members.findIndex((m) => m.name === playerName);
    if (memberIndex !== -1) {
      if (isWinner) {
        members[memberIndex].wins = (members[memberIndex].wins || 0) + 1;
      } else {
        members[memberIndex].losses = (members[memberIndex].losses || 0) + 1;
      }
      if (typeof player.gender === "string")
        members[memberIndex].gender = player.gender;
      if (typeof player.isGuest === "boolean")
        members[memberIndex].isGuest = player.isGuest;
    } else {
      // Add new if doesn't exist
      members.push({
        id: player.id || Date.now(),
        name: playerName,
        gender: player.gender,
        isGuest: player.isGuest,
        wins: isWinner ? 1 : 0,
        losses: isWinner ? 0 : 1,
        rating: prevRatingsLookup[playerName] || 1000,
      });
    }
  });

  // 5. Save to localStorage
  setSessionScores(sessionScores);
  localStorage.setItem("members", JSON.stringify(members));
  localStorage.setItem("clubMembers", JSON.stringify(members));

  // 6. Record game to IndexedDB with proper winner IDs
  try {
    // Convert winner names to winner IDs
    const winnerIds = selectedWinners
      .map(winnerName => {
        const player = players.find(p => p.name === winnerName);
        return player?.id;
      })
      .filter((id): id is number => typeof id === "number");

    console.log("GameResultsHandler: Recording game to IndexedDB", { 
      playerNames: players.map(p => p.name),
      playerIds: players.map(p => p.id),
      winnerNames: selectedWinners,
      winnerIds 
    });

    // Record the game with full player objects and winner IDs
    await recordGame(players, winnerIds);
    console.log("GameResultsHandler: Successfully recorded game to IndexedDB");
  } catch (error) {
    console.error("GameResultsHandler: Failed to record game to IndexedDB", error);
    // Don't fail the entire operation if IndexedDB write fails
  }
}
